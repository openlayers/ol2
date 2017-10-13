/* Copyright (c) 2006-2012 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

/**
 * @requires OpenLayers/Strategy/Cluster.js
 */

/**
 * Class: OpenLayers.Strategy.DynamicCluster
 * Strategy for vector feature dynamic clustering .
 *
 * Inherits from:
 *  - <OpenLayers.Strategy.Cluster>
 */
OpenLayers.Strategy.DynamicCluster = OpenLayers.Class(OpenLayers.Strategy.Cluster, {
	/**
	 * Property: CLASS_NAME
	 * 
	 * Class name, for CSS.
	 *
	 **/

	CLASS_NAME : "OpenLayers.Strategy.DynamicCluster",

	/**
     	 * Property: layers
	 *
	 * {Array(<OpenLayers.Layer.Vector>)} Cached layers.
	 *
	 **/

	layers: [],

	/**
     	 * Property: features
     	 * {Array(<OpenLayers.Feature.Vector>)} Cached features.
     	 */
	features: [],

	/**
     	 * APIMethod: activate
     	 * Activate the strategy.  Register any listeners, do appropriate setup.
    	 * 
    	 * Returns:
    	 * {Boolean} The strategy was successfully activated.
    	 */

	activate: function(evt){
    		if(evt != null){
			evt.layer.events.on({
        	        	"beforefeaturesadded": this.cacheFeatures,
        	        	"beforefeaturesremoved": this.cacheRemoveFeatures,
		                "moveend": this.cluster,
        		        scope: this
        	    	});
    		}
    	},

	/**
    	 * APIMethod: deactivate
    	 * Nothing because it's redefined on removed event layer.
    	 */

    	deactivate: function(){},

	/**
    	 * Method: cacheFeatures
   	 * Cache features before they are added to the layer.
    	 *
    	 * Parameters:
    	 * event - {Object} The event that this was listening for.  This will come
    	 *     with a batch of features to be clustered.
     	 *     
    	 * Returns:
    	 * {Boolean} False to stop features from being added to the layer.
    	 */
	
	cacheFeatures: function(evt) {
        	var propagate = true;
    		if(evt.features.length>0 && evt.features[0].geometry instanceof OpenLayers.Geometry.Point){
    			if(!this.clustering) {
        		        if(this.features == null){
        		        	this.features = [];
        		        }
        		        for(var i=0; i<evt.features.length; i++){
        		        	this.features.push(evt.features[i]);
        		        }
                		this.layer.addFeatures(evt.features);
                		this.cluster();
                		propagate = false;
            		}
    		}	
        	return propagate;
    	},

	/**
     	 * Method: cacheRemoveFeatures
    	 * Cache features before they are removed to the layer.
   	 *
    	 * Parameters:
    	 * event - {Object} The event that this was listening for.  This will come
    	 *     with a batch of features to be clustered.
    	 *     
    	 * Returns:
    	 * {Boolean} False to stop features from being removed to the layer.
    	 */
    	cacheRemoveFeatures: function(evt){
    		var propagate = true;
       		if(!this.clustering) {
            		if(this.features != null){
            			for(var i=0; i<evt.features.length; i++){
            				OpenLayers.Util.removeItem(this.features, evt.features[i]);
                		}
                		this.layer.removeFeatures(evt.features);
                		this.cluster();
                		propagate = false;
            		}
        	}
        	return propagate;
    	},
	
	/**
    	 * Method: cluster
     	 * Cluster features based on some threshold distance.
     	 *
     	 * Parameters:
     	 * event - {Object} The event received when cluster is called as a
     	 * result of a moveend event.
     	 */
	cluster: function(evt) {
        if((!evt || evt.zoomChanged || (evt && evt.recluster)) && this.features) {
            var resolution = this.layer.map.getResolution();
            if(resolution != this.resolution || !this.clustersExist() || (evt && evt.recluster)) {
                this.resolution = resolution;
                var clusters = [];
                var feature, clustered, cluster;
                for(var i=0; i<this.features.length; ++i) {
                    feature = this.features[i];
                    if(feature.geometry) {
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
                this.layer.removeAllFeatures();
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
                    this.clustering = true;
                    // A legitimate feature addition could occur during this
                    //features addFeatures call.  For clustering to behave well, features
                    // should be removed from a layer before requesting a new batch.
                    this.layer.addFeatures(clusters);
                    this.clustering = false;
                }
                this.clusters = clusters;
            }
        }
    },

	/**
	 * Method: recluster
    	 * User-callable function to recluster features
    	 * Useful for instances where a clustering attribute (distance, threshold, ...)
    	 * has changed
    	 */
    	recluster: function(){
        	var evt={"recluster":true};
        	this.cluster(evt);
    	},

	/**
     	 * Method: addLayerToCluster
     	 * Add layer to the layers array if the layer hasn't been added before.
    	 *
    	 * Parameters:
    	 * layer - {<OpenLayers.Layer.Vector>}
    	 */
    	addLayerToCluster: function(layer){
    		if(OpenLayers.Util.indexOf(this.layers, layer) == -1){
    			layer.events.on({
        		        "added": this.activate,
        		        "removed": this.removeAllFromCluster,
        		        scope: this
        		});
    			this.layers.push(layer);
    		}
    	},

	/**
    	 * Method: removeAllFromCluster
    	 * Remove layer from layers array and its asociated features. 
    	 * Call cacheCluster to refresh.
    	 *
    	 * Parameters:
    	 * layer - {<OpenLayers.Layer.Vector>}
    	 */
	removeAllFromCluster: function(layer){
    		if(OpenLayers.Util.indexOf(this.layers, layer) != -1){
    	   		for(var i=0; i<layer.features.length; i++){
    				this.features = OpenLayers.Util.removeItem(this.features, layer.features[i]);
    		    			for(var j=0; j<this.clusters.length; j++){
    						this.removeFromCluster(this.clusters[j], layer.features[i]);
    					}
    			}
    			OpenLayers.Util.removeItem(this.layers, layer);
    		}
    	},
    
	/**
    	 * Method: removeFromCluster
    	 * Remove layer feature from clusters array and decrement its count.
    	 *
    	 * Parameters:
    	 * cluster - {<OpenLayers.Feature.Vector>} A cluster.
    	 * feature - {<OpenLayers.Feature.Vector>} A feature.
    	 */
    	removeFromCluster: function(cluster, feature){
    		var length = 0;
    		for(var c=0; c<cluster.length; c++){
    			length = cluster.cluster.length;
    			cluster.cluster = OpenLayers.Util.removeItem(cluster.cluster, feature);
    			if(length != cluster.cluster.length){
    				cluster.attributes.count -= 1;
    			}
    		}
    	},	
});
