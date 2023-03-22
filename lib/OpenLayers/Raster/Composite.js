/**
 * @requires OpenLayers/Raster/Grid.js
 * @requires OpenLayers/Renderer/Canvas.js
 */

OpenLayers.Raster.Composite = OpenLayers.Class(OpenLayers.Raster.Grid, (function() {
    
    var grids;

    return {

        /**
         * Constructor: OpenLayers.Raster.Composite
         */
        initialize: function(config) {
            if (config.grids) {
                grids = config.grids;
                delete config.grids;
            }
            OpenLayers.Raster.Grid.prototype.initialize.apply(this, [config]);
            if (grids) {
                for (var i=0, ii=grids.length; i<ii; ++i) {
                    grids[i].events.register("update", this, function() {
                        this.events.triggerEvent("update");
                    });
                }
            }
        },

        numCols: function() {
            return grids && grids[0] && grids[0].numCols();
        },
        numRows: function() {
            return grids && grids[0] && grids[0].numRows();
        },
        getCount: function() {
            return grids && grids.length;
        },

        getValue: function(col, row) {
            var count = grids.length;
            var values = new Array(count);
            for (var c=0; c<count; ++c) {
                values[c] = grids[c].getValue(col, row);
            }
            return values;
        },

        getGrid: function(index) {
            if (typeof index !== "number" || isNaN(index) || index < 0 || index >= this.getCount()) {
                throw new Error("Bad grid index.")
            }
            var composite = this;
            return new OpenLayers.Raster.Grid({
                numCols: function() {
                    return composite.numCols();
                },
                numRows: function() {
                    return composite.numRows();
                },
                getValue: function(col, row) {
                    return composite.getValue(col, row)[index];
                }
            });
        },


        CLASS_NAME: "OpenLayers.Raster.Composite"
    };

})());

OpenLayers.Raster.Composite.fromLayer = function(layer, options) {
    var composite;
    if (layer instanceof OpenLayers.Layer.Grid) {
        composite = OpenLayers.Raster.Composite.fromGridLayer(layer);
    } else if (layer instanceof OpenLayers.Layer.Vector) {
        composite = OpenLayers.Raster.Composite.fromVectorLayer(layer, options);
    } else {
        throw new Error("Only Grid or Vector type layers can be used to create a raster");
    }
    return composite;
};

OpenLayers.Raster.Composite.fromVectorLayer = function(layer, options) {

    var mapping = options && options.mapping || function(feature) {
        return [255, 255, 255, 255]
    };

    var container = document.createElement("div");
    var renderer = new OpenLayers.Renderer.Canvas(container, {
        hitDetection: false
    });

    var canvas = renderer.root;
    var context = renderer.canvas;

    var composite = new OpenLayers.Raster.Composite({
        numCols: function() {
            return canvas.width;
        },
        numRows: function() {
            return canvas.height;
        },
        getCount: function() {
            return 4;
        },
        getValue: function(col, row) {
            var pixelArray = getPixelArray();
            var cols = canvas.width;
            var offset = 4 * (col + (row * cols));
            return Array.prototype.slice.apply(pixelArray, [offset, offset+4]);
        },
        toDataURL: function() {
            return canvas.toDataURL.apply(canvas, arguments);
        }
    });

    var cache = {};
    function getPixelArray() {
        if (!cache.pixelArray) {
            var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            cache.pixelArray = imageData.data;
        }
        return cache.pixelArray;
    }

    function hex(value) {
        value = Math.max(0, Math.min(255, value));
        return (3840 + value).toString(16).substring(1);
    }

    var style = new OpenLayers.Style({
        stroke: false,
        fillColor: "${getColor}",
        fillOpacity: "${getOpacity}"
    }, {context: {
        getColor: function(feature) {
            var rgba = mapping(feature);
            return "#" +
                hex(rgba[0]) +
                hex(rgba[1]) +
                hex(rgba[2]);
        },
        getOpacity: function(feature) {
            var rgba = mapping(feature);
            return rgba[3] / 255;
        }
    }});

    var clone = new OpenLayers.Layer.Vector(null, {
        styleMap: new OpenLayers.StyleMap(style),
        renderer: renderer
    });

    function triggerUpdate() {
        cache = {};
        window.setTimeout(function() {
            composite.events.triggerEvent("update");
        }, 0);
    }

    function addFeatures(event) {
        var features = event.features;
        clone.addFeatures(features, {silent: true});

        // features can only be added to one layer
        // work around this by reassigning to original
        for (var i=0, ii=features.length; i<ii; ++i) {
            features[i].layer = layer;
        }
        triggerUpdate();
    }

    function removeFeatures(event) {
        var features = event.features;
        clone.removeFeatures(features, {silent: true});
        triggerUpdate();
    }

    function modifyFeature(event) {
        clone.drawFeature(event.feature);
        triggerUpdate();
    }

    addFeatures({features: layer.features});
    layer.events.on({
        featuresadded: addFeatures,
        featuresremoved: removeFeatures,
        featuremodified: modifyFeature
    });

    function update() {
        cache = {};
        clone.moveTo(layer.map.getExtent(), true, false);
    }

    if (layer.map) {
        clone.setMap(layer.map);
        layer.map.events.register("moveend", null, update);
    } else {
        layer.events.register("added", null, function() {
            clone.setMap(layer.map);
            layer.map.events.register("moveend", null, update);
        });
    }

    return composite;
};

OpenLayers.Raster.Composite.fromGridLayer = function(layer) {
    
    var canvas = document.createElement("canvas");
    var context = canvas.getContext("2d");

    var composite = new OpenLayers.Raster.Composite({
        numCols: function() {
            return canvas.width;
        },
        numRows: function() {
            return canvas.height;
        },
        getCount: function() {
            return 4;
        },
        getValue: function() {
            return 0;
        },
        toDataURL: function() {
            return canvas.toDataURL.apply(canvas, arguments);
        }
    });

    function deferredUpdate() {
        window.setTimeout(update, 0);
    }

    function update() {
        if (layer.numLoadingTiles == 0) {
            var map = layer.map;
            var tileSize = layer.tileSize;
            var mapSize = map.getSize();
            canvas.width = mapSize.w;
            canvas.height = mapSize.h;
            var mapBounds = map.getExtent();
            var tiles = layer.grid;
            var array, tile, tileBounds, img, cornerLocation, cornerPixel;
            for (var i=0, ii=tiles.length; i<ii; ++i) {
                array = tiles[i];
                for (var j=0, jj=array.length; j<jj; ++j) {
                    tile = array[j];
                    tileBounds = tile.bounds;
                    img = tile.imgDiv
                    if (img && img.style.display !== "none" && mapBounds.intersectsBounds(tileBounds)) {
                        cornerLocation = new OpenLayers.LonLat(tileBounds.left, tileBounds.top);
                        cornerPixel = map.getPixelFromLonLat(cornerLocation);
                                                
                        var underwritex = cornerPixel.x < 0 ? -cornerPixel.x : 0;
                        var underwritey = cornerPixel.y < 0 ? -cornerPixel.y : 0;
                        
                        var overwritex = cornerPixel.x + tileSize.w > canvas.width ? cornerPixel.x + tileSize.w - canvas.width : 0;
                        var overwritey = cornerPixel.y + tileSize.h > canvas.height ? cornerPixel.y + tileSize.h - canvas.height : 0;
                        
                        // only draw tile if it overlaps canvas...
                        if ((underwritex + overwritex) < tileSize.w && (underwritey + overwritey) < tileSize.h) {
                            
                            // adjust source and destination values based on image overlap of canvas (required for IE 9)
                            var sx = underwritex;
                            var sy = underwritey;
                            var sw = tileSize.w - underwritex - overwritex;
                            var sh = tileSize.h - underwritey - overwritey;
                            var dx = underwritex > 0 ? 0 : cornerPixel.x;
                            var dy = underwritey > 0 ? 0 : cornerPixel.y;
                            var dw = tileSize.w - underwritex - overwritex;
                            var dh = tileSize.h - underwritey - overwritey;
                            
                            context.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
                        }
                    }
                }
            }
            
            // defer context.getImageData call until needed...
            composite.getValue = function(col, row) {
                var width = canvas.width;
                var data8 = context.getImageData(0, 0, width, canvas.height).data;
                var accessor;
                // generate closure with array access optimized dependent on broswer capability
                
                // avoiding per-call array instantiation is an important optimization.
                // given *current* architecture this is safe.
                var pixel = [0,0,0,0];
                accessor = function(col, row) {
                        var offset = (col + (row * width)) << 2;
                        pixel[3] = data8[offset + 3];
                        pixel[2] = data8[offset + 2];
                        pixel[1] = data8[offset + 1];
                        pixel[0] = data8[offset];
                        return pixel;
                }
                /*
                // The accessors below are exclusive to the implementation above.
                // While significantly faster, the conversion of the pipeline from
                // pixels as Uint8[] to Uint32 breaks backwards compatibility.
                // NOTE: symetric implementation in OpenLayers.Layer.Raster
                if (data8.buffer) {
                    var data32 = new Uint32Array(data8.buffer);
                    accessor = function(col, row) {
                        var offset = (col + (row * width));
                        return data32[offset];
                    }
                } else {
                    accessor = function(col, row) {
                        var offset = (col + (row * width)) << 2;
                        return data8[offset + 3] << 24 |
                               data8[offset + 2] << 16 |
                               data8[offset + 1] << 8  |
                               data8[offset];
                    }
                }
                */
                // replace current function with optimized accessor
                composite.getValue = accessor;
                return accessor(col, row);
            }
            composite.events.triggerEvent("update");
        }
    }
    
    if (layer.map) {
        layer.map.events.register("moveend", null, deferredUpdate);
    } else {
        layer.events.register("added", null, function() {
            layer.map.events.register("moveend", null, deferredUpdate);
        });
    }
    layer.events.register("loadend", null, deferredUpdate);
        
    return composite;
    
};
