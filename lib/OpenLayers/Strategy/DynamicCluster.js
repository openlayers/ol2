/* Copyright (c) 2006-2013 by OpenLayers Contributors (see authors.txt for
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

/**
 * @requires OpenLayers/Strategy.js
 */

/**
 * Class: OpenLayers.Strategy.DynamicCluster
 * Strategy for dynamically clustering vector features. Efficiently
 *     recalculates clusters when any individual feature is added, removed
 *     or moved (modified).
 *
 * Inherits from:
 *  - <OpenLayers.Strategy>
 */
OpenLayers.Strategy.DynamicCluster = OpenLayers.Class(OpenLayers.Strategy, {

    /**
     * APIProperty: distance
     * {Integer} Pixel distance between features that should be considered a
     *     single cluster.  Default is 20 pixels.
     */
    distance: 20,

    /**
     * APIProperty: threshold
     * {Integer} Optional threshold below which original features will be
     *     added to the layer instead of clusters.  For example, a threshold
     *     of 3 would mean that any time there are 2 or fewer features in
     *     a cluster, those features will be added directly to the layer instead
     *     of a cluster representing those features.  Default is null (which is
     *     equivalent to 1 - meaning that clusters may contain just one feature).
     */
    threshold: null,

    /**
     * Property: features
     * {Array(<OpenLayers.Feature.Vector>)} Cached features. Features in this
     *     strategy will have a "inCluster" extra property, storing
     *     a reference to the cluster containing the feature. The cluster
     *     might be a candidate with less than threshold features inside.
     */
    features: [],

    /**
     * Property: clusters
     * {Array(<OpenLayers.Feature.Vector>)} Calculated clusters, and cluster
     *     candidates.
     */
    clusters: [],

    /**
     * Property: clustering
     * {Boolean} The strategy is currently clustering features, and ignoring
     *     addFeature/removeFeature events.
     */
    clustering: false,

    /**
     * Property: resolution
     * {Float} The resolution (map units per pixel) of the current cluster set.
     */
    resolution: null,

    /**
     * Constructor: OpenLayers.Strategy.Cluster
     * Create a new clustering strategy.
     *
     * Parameters:
     * options - {Object} Optional object whose properties will be set on the
     *     instance.
     */

    /**
     * APIMethod: activate
     * Activate the strategy.  Register any listeners, do appropriate setup.
     *
     * Returns:
     * {Boolean} The strategy was successfully activated.
     */
    activate: function() {
        var activated = OpenLayers.Strategy.prototype.activate.call(this);
        if(activated) {
            this.layer.events.on({
                "beforefeatureadded":    this.addFeature,
                "beforefeatureremoved":  this.removeFeature,
                "beforefeaturedrawn":    this.modifyFeature,
                "moveend": this.cluster,
                scope: this
            });
        }
        return activated;
    },

    /**
     * APIMethod: deactivate
     * Deactivate the strategy.  Unregister any listeners, do appropriate
     *     tear-down.
     *
     * Returns:
     * {Boolean} The strategy was successfully deactivated.
     */
    deactivate: function() {
        /// FIXME: Sync with the activate() code.
        /// FIXME: Uncluster everything.
        var deactivated = OpenLayers.Strategy.prototype.deactivate.call(this);
        if(deactivated) {
            this.layer.events.un({
                "beforefeatureadded":    this.addFeature,   /// Return false if clustered
                "beforefeatureremoved":  this.removeFeature,
                "beforefeaturedrawn":    this.modifyFeature,
                "moveend": this.cluster,
                scope: this
            });
        }
        return deactivated;
    },

    /**
     * Method: cluster
     * Cluster all features inside the viewport based on some threshold distance.
     *
     * Parameters:
     * event - {Object} The event received when cluster is called as a
     *     result of a moveend event.
     */
    cluster: function(event) {
        this.resolution = this.layer.map.getResolution();
        this.clustering = true;
        // Clear the existing clusters only on zoom change. If the map is being
        //   panned, the existing candidates can be reused.
        if (event.zoomChanged) {
            this.layer.removeFeatures(this.clusters);
            this.clusters = [];
            for(var i=0; i<this.features.length; ++i) {
                this.features[i].inCluster = null;
            }
        }
        var extent = this.layer.map.getExtent();
        for(var i=0; i<this.features.length; ++i) {
            var feature = this.features[i];
            if(feature.geometry &&
               extent.contains(feature.geometry.x,feature.geometry.y) &&
               feature.inCluster === null) {
                for(var j=this.clusters.length-1; j>=0; --j) {
                    var cluster = this.clusters[j];
                    if(this.shouldCluster(cluster, feature)) {
                        this.addToCluster(cluster, feature);
                        break;
                    }
                }
                if (!feature.inCluster) {
                    this.createCluster(feature);
                }
            }
        }
        // Display previously clustered features, now visible.
        for(var i=0; i<this.features.length; ++i) {
            var feature = this.features[i];
            if (feature.inCluster) {
                if (feature.inCluster.attributes.count < this.threshold) {
                    if (OpenLayers.Util.indexOf(this.layer.features,feature) === -1) {
                        this.layer.addFeatures([feature]);
                    }
                }
            }
        }
        this.clustering = false;
    },

    /**
     * Method: addFeature
     * Add a feature to the cache, check if it fits inside any
     *     existing candidate cluster, add to cluster/candidate or create
     *     a new candidate as appropiate.
     *
     * Parameters:
     * ev - an event containing an {<OpenLayers.Feature.Vector>}, the feature to be added.
     *
     * Returns:
     * {Boolean} True if the feature is visible after clustering it.
     */
    addFeature: function(ev) {
        var feature = ev.feature;
        if (this.clustering) {
            return;
        }
        if (feature.isCluster || feature.inCluster) {
            // The addFeature event also catches adding the clusters
            // themselves, and unclustered features, so skip them.
            return true;
        }
        feature.inCluster = null;
        this.features.push(feature);
        if (!feature.geometry) {
            return true;
        }
        for(var j=this.clusters.length-1; j>=0; --j) {
            var cluster = this.clusters[j];
            if(this.shouldCluster(cluster, feature)) {
                this.addToCluster(cluster, feature);
                break;
            }
        }
        if (!feature.inCluster) {
            this.createCluster(feature);
        }
        if (feature.inCluster.attributes.count >= this.threshold){
            return false;
        };
        return true;
    },

    /**
     * Method: addFeature
     * Removes a feature from the cache, and from its containing cluster
     *
     * Parameters:
     * ev - an event containing an {<OpenLayers.Feature.Vector>}, the feature to be removed.
     */
    removeFeature: function(ev) {
        var feature = ev.feature;
        if (this.clustering) {
            return;
        }
        if (feature.isCluster) {
            // The addFeature event also catches removing the clusters
            // themselves, so skip them.
            return true;
        }
        var cluster = feature.inCluster;
        if (cluster) {
            this.removeFromCluster(cluster, feature);
            if (cluster.attributes.count <= 0) {
                this.layer.removeFeatures([cluster]);
            }
        }
        var i = OpenLayers.Util.indexOf(this.features,feature);
        this.features.splice(i, 1);
        return true;
    },

    /**
     * Method: modifyFeature
     * When a feature is modified, check if it still belongs to its cluster,
     *     then check if it belongs to any new cluster. The main reason for
     *     this is when the feature's geometry has changed (feature has
     *     moved).
     *
     * Parameters:
     * ev - an event containing an {<OpenLayers.Feature.Vector>}, the feature to be modified.
     */
    modifyFeature: function(ev) {
        var feature = ev.feature;
        if (!feature) {
            return false;
        }
        var cluster = feature.inCluster;

        if (this.clustering || feature.isCluster) {
            return true;
        }

        // Check if the feature has moved outside of its current cluster
        if (cluster) {
            if (!this.shouldCluster(cluster, feature)) {
                this.removeFromCluster(cluster, feature);
            }
        }

        // Check if the feature has moved inside an existing cluster
        if (!feature.inCluster) {
            for(var j=this.clusters.length-1; j>=0; --j) {
                cluster = this.clusters[j];
                if(this.shouldCluster(cluster, feature)) {
                    this.addToCluster(cluster, feature);
                    break;
                }
            }
        }

        // When the feature moves into somewhere without a candidate, create one
        if (!feature.inCluster) {
            this.createCluster(feature);
        }

        var visible = feature.inCluster.attributes.count < this.threshold;
        if (visible && OpenLayers.Util.indexOf(this.layer.features,feature) === -1) {
            this.clustering = true;
            this.layer.addFeatures([feature]);
            this.clustering = false;
        }
        return visible;
    },

    /**
     * Method: shouldCluster
     * Determine whether to include a feature in a given cluster.
     *
     * Parameters:
     * cluster - {<OpenLayers.Feature.Vector>} A cluster.
     * feature - {<OpenLayers.Feature.Vector>} A feature.
     *
     * Returns:
     * {Boolean} The feature should be included in the cluster.
     */
    shouldCluster: function(cluster, feature) {
        var cc = cluster.geometry.getBounds().getCenterLonLat();
        var fc = feature.geometry.getBounds().getCenterLonLat();
        var distance = (
            Math.sqrt(
                Math.pow((cc.lon - fc.lon), 2) + Math.pow((cc.lat - fc.lat), 2)
            ) / this.resolution
        );
        return (distance <= this.distance);
    },

    /**
     * Method: addToCluster
     * Add a feature to a cluster.
     *
     * Parameters:
     * cluster - {<OpenLayers.Feature.Vector>} A cluster.
     * feature - {<OpenLayers.Feature.Vector>} A feature.
     */
    addToCluster: function(cluster, feature) {
        if (feature.isCluster){
            return;
        }
        cluster.cluster.push(feature);
        feature.inCluster = cluster;
        cluster.attributes.count += 1;

        // Add the cluster to the layer, even if it's already in there.
        if (cluster.attributes.count == this.threshold) {
            this.clustering = true;
            this.layer.addFeatures([cluster]);
            this.layer.removeFeatures(cluster.cluster);
            this.clustering = false;
        } else if (cluster.attributes.count > this.threshold) {
            this.clustering = true;
            this.layer.removeFeatures([feature]);
            this.clustering = false;
            // The cluster has been updated, and maybe its style has
            //   changed.
            this.layer.drawFeature(cluster);
        }
    },

    /**
     * Method: removeFromCluster
     * Remove a feature from a cluster.
     *
     * Parameters:
     * cluster - {<OpenLayers.Feature.Vector>} A cluster.
     * feature - {<OpenLayers.Feature.Vector>} A feature.
     *
     * Returns:
     * {Boolean} True if the feature was removed, false if it was not found.
     */
    removeFromCluster: function(cluster, feature) {
        if (!cluster) {
            return false;
        }

        if (!OpenLayers.Util.isArray(cluster.cluster)) {
            return false;
        }

        var i = OpenLayers.Util.indexOf(cluster.cluster,feature);
        if (i !== -1) {
            cluster.cluster.splice(i, 1)
            feature.inCluster = null;
            cluster.attributes.count -= 1;

            this.clustering = true;
            if (cluster.attributes.count == this.threshold-1 ) {
                // This feature has just split the cluster up.
                this.clustering = true;
                this.layer.removeFeatures([cluster]);
                this.layer.addFeatures(cluster.cluster);
                this.layer.addFeatures([feature]);
                this.clustering = false;
            } else if (cluster.attributes.count >= this.threshold) {
                // The cluster has been updated, and maybe its style has
                //   changed.
                this.layer.drawFeature(cluster);
            }

            // Destroy empty candidates
            if (cluster.attributes.count === 0) {
                this.layer.removeFeatures([cluster]);
                var j = OpenLayers.Util.indexOf(this.clusters,cluster);
                this.clusters.splice(j,1);
            }
            this.clustering = false;
            return true;
        }
        return false;
    },

    /**
     * Method: createCluster
     * Given a feature, create a cluster.
     *
     * Parameters:
     * feature - {<OpenLayers.Feature.Vector>}
     *
     * Returns:
     * {<OpenLayers.Feature.Vector>} A cluster.
     */
    createCluster: function(feature) {

        if (feature.isCluster){
            return feature;
        }

        var center = feature.geometry.getBounds().getCenterLonLat();
        var cluster = new OpenLayers.Feature.Vector(
            new OpenLayers.Geometry.Point(center.lon, center.lat),
                {count: 1}
        );
        cluster.cluster = [feature];
        feature.inCluster = cluster;
        cluster.isCluster = true;
        if (this.threshold <= 1) {
            this.layer.addFeatures([cluster]);
        }
        this.clusters.push(cluster);
        return cluster;
    },

    CLASS_NAME: "OpenLayers.Strategy.DynamicCluster"
});
