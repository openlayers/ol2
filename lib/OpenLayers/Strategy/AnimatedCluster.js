/* Copyright (c) 2012 by Antonio Santiago <asantiagop_at_gmail_dot_com>
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met: 
 * 
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer. 
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution. 
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * The views and conclusions contained in the software and documentation are those
 * of the authors and should not be interpreted as representing official policies, 
 * either expressed or implied, of OpenLayers Contributors.
 */

/**
 * @requires OpenLayers/Strategy/Cluster
 */

/**
 * Class: OpenLayers.Strategy.AnimatedCluster
 * Cluster strategy for vector layers with animations.
 *
 * Inherits from:
 *  - <OpenLayers.Strategy.Cluster>
 */
OpenLayers.Strategy.AnimatedCluster = OpenLayers.Class(OpenLayers.Strategy.Cluster, {
    
    /**
     * APIProperty: animationMethod
     * {<OpenLayers.Easing>(Function)} Easing equation used for the animation
     *     Defaultly set to OpenLayers.Easing.Expo.easeOut
     */
    animationMethod: OpenLayers.Easing.Expo.easeOut,
    /**
     * APIProperty: animationDuration
     * {Integer} The number of steps to be passed to the OpenLayers.Tween.start() 
     * method when the clusters are animated.
     * Default is 20.
     */
    animationDuration: 20,
    
    /**
     * Property: animationTween
     * {OpenLayers.Tween} Animated panning tween object.
     */
    animationTween: null,
    /**
     * Property: previousResolution
     * {Float} The previous resolution of the map.
     */
    previousResolution: null,
    /**
     * Property: previousResolution
     * {Array(<OpenLayers.Feature.Vector>)} Clusters of features at previous
     * resolution.
     */
    previousClusters: null,
    /**
     * Property: animating
     * {Boolean} Indicates if we are in the process of clusters animation.
     */
    animating: false,
    /**
     * Property: animating
     * {Boolean} Indicates if we are zooming in our zoomin out.
     */
    zoomIn: true,

    /**
     * Constructor: OpenLayers.Strategy.AnimatedCluster
     *  Create a new animation clustering strategy.
     *
     * Parameters:
     * options - {Object} Optional object whose properties will be set on the
     *     instance.
     */
    initialize: function(options) {
        OpenLayers.Strategy.Cluster.prototype.initialize.apply(this, arguments);
        
        if(options.animationMethod) {
            this.animationMethod = options.animationMethod;
        }
    },
    
    /**
     * Method: destroy
     * Free resources.
     */
    destroy: function() {
        if(this.animationTween) {
            this.animationTween.stop();
            this.animationTween = null;
        }
    },
    
    /**
     * Method: cluster
     * Cluster features based on some threshold distance.
     *
     * Parameters:
     * event - {Object} The event received when cluster is called as a
     *     result of a moveend event.
     */
    cluster: function(event) {
        
        var resolution = this.layer.map.getResolution();
        
        // Each time clusters are animated we need to call layer.redraw to show
        // position changes. This produces layer will be redrawn and a call to 
        // cluster is made.
        // Because this, ff we are animating clusters and zoom didn't changed, simply return.
        if(this.animating && (resolution == this.resolution)) {
            return;
        }
        
        if((!event || event.zoomChanged) && this.features) {
            if(resolution != this.resolution || !this.clustersExist()) { 
                if(resolution != this.resolution) {
                    this.zoomIn = (!this.resolution || (resolution <= this.resolution));
                }
                this.previousResolution = this.resolution;
                this.previousClusters = this.clusters;
                this.resolution = resolution;
                var clusters = [];
                var feature, clustered, cluster;
                for(var i=0; i<this.features.length; ++i) {
                    feature = this.features[i];
                    if(feature.geometry) {
                        // Cluster for the current resolution
                        clustered = false;
                        for(var j=clusters.length-1; j>=0; --j) {
                            cluster = clusters[j];
                            if(this.shouldCluster(cluster, feature)) {
                                this.addToCluster(cluster, feature);
                                clustered = true;
                                break;
                            }
                        }
                        if(!clustered) {
                            clusters.push(this.createCluster(this.features[i]));
                        }
                    }
                }                
                // Apply threshold for cluster at current resolution
                if(clusters.length > 0) {
                    if(this.threshold > 1) {
                        var clone = clusters.slice();
                        clusters = [];
                        var candidate;
                        for(var i=0, len=clone.length; i<len; ++i) {
                            candidate = clone[i];
                            if(candidate.attributes.count < this.threshold) {
                                Array.prototype.push.apply(clusters, candidate.cluster);
                            } else {
                                clusters.push(candidate);
                            }
                        }
                    }
                }
                this.clusters = clusters;
                
                this.clustering = true;
                // Add clusters features to the layer
                this.layer.removeAllFeatures();
                // A legitimate feature addition could occur during this
                // addFeatures call.  For clustering to behave well, features
                // should be removed from a layer before requesting a new batch.
                if(this.zoomIn || !this.previousClusters) {
                    this.layer.addFeatures(this.clusters);
                } else {
                    this.layer.addFeatures(this.previousClusters);
                }
                this.clustering = false;
                
                // Get the initial and final position of each cluster required
                // make the animation
                if(this.clusters.length > 0 && this.previousClusters) {
                    var clustersA, clustersB;
                    if(this.zoomIn) {
                        clustersA = this.clusters;
                        clustersB = this.previousClusters;
                    } else {
                        clustersA = this.previousClusters;
                        clustersB = this.clusters;
                    }
                    for(var i=0; i< clustersA.length; i++) {
                        var ca = clustersA[i];
                        var cb = this.findFeaturesInClusters(ca.cluster, clustersB);
                        if(cb) {
                            ca._geometry = {};
                            if(this.zoomIn) {
                                ca._geometry.origx = cb.geometry.x;
                                ca._geometry.origy = cb.geometry.y;
                                ca._geometry.destx = ca.geometry.x;
                                ca._geometry.desty = ca.geometry.y;
                                ca.geometry.x = ca._geometry.origx;
                                ca.geometry.y = ca._geometry.origy;
                            } else {
                                ca._geometry.origx = ca.geometry.x;
                                ca._geometry.origy = ca.geometry.y;
                                ca._geometry.destx = cb.geometry.x;
                                ca._geometry.desty = cb.geometry.y;
                            }
                        }
                    }
                    
                    // Make animation
                    if(!this.animationTween) {
                        this.animationTween = new OpenLayers.Tween(this.animationMethod);
                    }
                    this.animationTween.stop();
                    this.animating = true;
                    this.animationTween.start({
                        x: 0.0, 
                        y: 0.0
                    }, {
                        x: 1.0, 
                        y: 1.0
                    }, this.animationDuration, {
                        callbacks: {
                            eachStep: OpenLayers.Function.bind(this.animate, this),
                            done: OpenLayers.Function.bind(function(delta){
                                this.animate(delta);

                                // Remove the temporal attributes
                                var clusters = this.zoomIn ? this.clusters : this.previousClusters;
                                for(var i=0; i< clusters.length; i++) {
                                    delete clusters[i].cluster._geometry;
                                }

                                // If zooming out then remove the previous cluster and
                                // and the current one
                                if(!this.zoomIn) {
                                    this.clustering = true;
                                    this.layer.removeFeatures(this.previousClusters);
                                    this.layer.addFeatures(this.clusters);
                                    this.clustering = false;
                                    
                                }
                                this.animating = false;
                            }, this)
                        }
                    });
                }
            }
        }
    },
    
    /**
     * Method: findFeaturesInClusters
     * Given a set of features and an array of clusters returns the cluster
     * where the features are located.
     *
     * Parameters:
     * features - {Array} An array of <OpenLayers.Feature.Vector>.
     * clusters - A cluster as an array of <OpenLayers.Feature.Vector>.
     *
     * Returns:
     * {<OpenLayers.Feature.Vector>} The cluster where the first feature of 
     * the feature array is found.
     */
    findFeaturesInClusters: function(features, clusters) {
        for(var i=0; i<features.length; i++) {
            var feature = features[i];
            for(var j=0; j<clusters.length; j++) {
                var cluster = clusters[j];
                var clusterFeatures = clusters[j].cluster;
                for(var k=0; k<clusterFeatures.length; k++) {
                    if(feature.id == clusterFeatures[k].id) {
                        return cluster;
                    }
                }
            }
        }
        return null;
    },
    /** 
     * APIMethod: animate
     * Animates the clusters changing its position.
     * 
     * Parameters:
     * delta - {Object} Object with x-y values with the new increments to 
     * be applied.
     */
    animate: function(delta) { 
        var clusters = this.zoomIn ? this.clusters : this.previousClusters;
        for(var i=0; i<clusters.length; i++) {
            var dx = (clusters[i]._geometry.destx - clusters[i]._geometry.origx) * delta.x;
            var dy = (clusters[i]._geometry.desty - clusters[i]._geometry.origy) * delta.y;
                    
            clusters[i].geometry.x = clusters[i]._geometry.origx + dx;
            clusters[i].geometry.y = clusters[i]._geometry.origy + dy; 
        }
        this.layer.redraw();
    },    
    
    /**
     * Method: shouldCluster
     * Determine whether to include a feature in a given cluster.
     *
     * Parameters:
     * cluster - {<OpenLayers.Feature.Vector>} A cluster.
     * feature - {<OpenLayers.Feature.Vector>} A feature.
     * previousResolution - {Boolean} Indicates if the check must be made with
     * the current or previous resolution value.
     *
     * Returns:
     * {Boolean} The feature should be included in the cluster.
     */
    shouldCluster: function(cluster, feature, previousResolution) {
        var res = previousResolution ? this.previousResolution : this.resolution;
        var cc = cluster.geometry.getBounds().getCenterLonLat();
        var fc = feature.geometry.getBounds().getCenterLonLat();
        var distance = (
            Math.sqrt(
                Math.pow((cc.lon - fc.lon), 2) + Math.pow((cc.lat - fc.lat), 2)
                ) / res
            );
        return (distance <= this.distance);
    },


    CLASS_NAME: "OpenLayers.Strategy.AnimatedCluster" 
});
