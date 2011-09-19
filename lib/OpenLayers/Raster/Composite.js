/**
 * @requires OpenLayers/Raster/Grid.js
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

OpenLayers.Raster.Composite.fromLayer = function(layer) {
    
    if (!(layer instanceof OpenLayers.Layer.Grid)) {
        throw new Error("Only OpenLayers.Layer.Grid type layers can be used to create a raster");
    }
    
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
        getValue: function(col, row) {
            var pixelArray = getPixelArray();
            var cols = canvas.width;
            var offset = 4 * (col + (row * cols));
            return Array.prototype.slice.apply(pixelArray, [offset, offset+4]);
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

    function update() {
        cache = {};
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
                    context.drawImage(img, cornerPixel.x, cornerPixel.y, tileSize.w, tileSize.h);
                }
            }
        }
        composite.events.triggerEvent("update");
    }
    
    if (layer.map) {
        layer.map.events.register("moveend", null, update);
    } else {
        layer.events.register("added", null, function() {
            layer.map.events.register("moveend", null, update);
        });
    }
    layer.events.register("tileloaded", null, update);
        
    return composite;
    
};
