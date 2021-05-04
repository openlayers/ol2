/* Copyright (c) 2006-2013 by OpenLayers Contributors (see authors.txt for
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

/**
 * @requires OpenLayers/Strategy.js
 */

/**
 * Class: OpenLayers.Strategy.DynamicCluster
 * Strategy for vector feature clustering where lines and polygons
 * are clustered depending on size and options.
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
     * APIProperty: disableDynamicClustering
     * {Boolean} If true, disable default behaviour which is to turn small
     * polygons and lines into cluster, but leaving larger ones from clustering.
     */
    disableDynamicClustering: false,

    /**
     * APIProperty: clusterPointsOnly
     * {Boolean} If true, skip lines and polygons during clustering. The option
     * "disableDynamicClustering" must be set for this option to take effect.
     */
    clusterPointsOnly: false,
    
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
                "beforefeaturesadded": this.beforeFeaturesAdded,
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
        var deactivated = OpenLayers.Strategy.prototype.deactivate.call(this);
        if(deactivated) {
            this.layer.events.un({
                "beforefeaturesadded": this.beforeFeaturesAdded,
                "moveend": this.cluster,
                scope: this
            });
        }
        return deactivated;
    },
    
    /**
     * Method: beforeFeaturesAdded
     * Cluster the features before adding them to the layer
     *
     * Parameters:
     * event - {Object} The event that this was listening for.  This will come
     *     with a batch of features to be clustered.
     *     
     * Returns:
     * {Boolean} False to stop features from being added to the layer.
     */
    beforeFeaturesAdded: function(event) {
        var propagate = true;
        
        // The computation of "needToCluster" is to prevent
        // never ending loop. Strategies following this one might
        // perform modifications on the features and then call
        // "addFeatures" again, triggering this function to re-enter.
        var needToCluster = false;
        if( event 
         && event.features 
         && event.features.length ){
        	for(var i=0,e=event.features.length; i<e; ++i){
        		var f = event.features[i];
        		if( f.cluster ){
        			// No need to cluster, already clustered
        		} else if( this._isEligibleFeature(f) ) {
        			needToCluster = true;
        		};
        	};
        };
        
        if( needToCluster ) {
            this.cluster(null,event.features);
            propagate = false;
        }
        return propagate;
    },
    
    /**
     * Method: cluster
     * Cluster features based on some threshold distance.
     *
     * Parameters:
     * event - {Object} The event received when cluster is called as a
     *     result of a moveend event.
     * newFeatures - {Array} The features being added to the layer.
     */
    cluster: function(event, newFeatures) {
    	// Compute the feature set
    	var features = [];
    	if( newFeatures ){
    		for(var i=0,e=newFeatures.length; i<e; ++i) {
    			features[features.length] = newFeatures[i];
    		};
    	};
    	for(var i=0,e=this.layer.features.length; i<e; ++i){
    		var feature = this.layer.features[i];
    		if( feature.cluster ){
    			for(var j=0,k=feature.cluster.length; j<k; ++j){
    				features[features.length] = feature.cluster[j];
    			};
    		} else {
    			features[features.length] = feature;
    		};
    	};
    	
        if((!event || event.zoomChanged) && features) {
            var resolution = this.layer.map.getResolution();
            this.resolution = resolution;
            var clusters = [];
            var featuresToAdd = [];
            var feature, clustered, cluster;
            for(var i=0; i<features.length; ++i) {
                feature = features[i];
                if( !this._isEligibleFeature(feature) ){
                	featuresToAdd.push(feature);
                	
                } else if(feature.geometry) {
                    clustered = false;
                    for(var j=clusters.length-1; j>=0; --j) {
                        cluster = clusters[j];
                        if(this.shouldCluster(cluster, feature)) {
                            this.addToCluster(cluster, feature);
                            clustered = true;
                            break;
                        };
                    };
                    if(!clustered) {
                    	var c = this.createCluster(feature);
                        clusters.push(c);
                        featuresToAdd.push(c);
                    };
                };
            };
            this.layer.removeAllFeatures();
            
            if(featuresToAdd.length > 0) {
                if(this.threshold > 1) {
                    var clone = featuresToAdd.slice();
                    featuresToAdd = [];
                    var candidate;
                    for(var i=0, len=clone.length; i<len; ++i) {
                        candidate = clone[i];
                        if( candidate.cluster 
                         && candidate.cluster.length < this.threshold ) {
                            Array.prototype.push.apply(featuresToAdd, candidate.cluster);
                        } else {
                        	featuresToAdd.push(candidate);
                        };
                    };
                };

                // A legitimate feature addition could occur during this
                // addFeatures call.  For clustering to behave well, features
                // should be removed from a layer before requesting a new batch.
                this.layer.addFeatures(featuresToAdd);
            };
        };
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
        cluster.cluster.push(feature);
        cluster.attributes.count += 1;
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
        var center = feature.geometry.getBounds().getCenterLonLat();
        var cluster = new OpenLayers.Feature.Vector(
            new OpenLayers.Geometry.Point(center.lon, center.lat),
            {count: 1}
        );
        cluster.cluster = [feature];
        return cluster;
    },
    
    /**
     * Method: _isEligibleFeature
     * Returns true if a feature should be clustered
     *
     * Returns:
     * {Boolean} True if the feature should be considered for clusters
     */
    _isEligibleFeature: function(feature) {
    	// By default, cluster everything
        var eligible = true;
        
        if( !this.disableDynamicClustering ) {
        	// Dynamic Clustering
        	// Small polygons and lines are turned into a cluster
        	eligible = false;
        	if( feature.geometry.CLASS_NAME.indexOf('Point') >= 0 ){
        		eligible = true;
        	} else {
        		var bounds = feature.geometry.getBounds();
        		var xLen = (bounds.right - bounds.left) / this.resolution;
        		var yLen = (bounds.top - bounds.bottom) / this.resolution;
        		if( (xLen/2) <= this.distance
            	 && (yLen/2) <= this.distance ) {
        			eligible = true;
        		};
        	};
        	
        } else if( this.clusterPointsOnly ){
        	// Cluster Point Only
        	// Do not cluster polygons and lines
        	eligible = false;
        	if( feature.geometry.CLASS_NAME.indexOf('Point') >= 0 ){
        		eligible = true;
        	};
        };
        
        return eligible;
    },

    CLASS_NAME: "OpenLayers.Strategy.DynamicCluster" 
});
