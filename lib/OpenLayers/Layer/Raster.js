/**
 * @requires OpenLayers/Layer.js
 * @requires OpenLayers/Raster/Composite.js
 */

/**
 * Class: OpenLayers.Layer.Raster
 *
 * Inherits from:
 *  - <OpenLayers.Layer>
 */
OpenLayers.Layer.Raster = OpenLayers.Class(OpenLayers.Layer, {
    
    needsUpdate: false,
    
    initialize: function(config) {
        config = config || {};
        var data = config.data;
        delete config.data;
        OpenLayers.Layer.prototype.initialize.apply(this, [config.name, config]);
        
        this.canvas = document.createElement("canvas");
        this.canvas.style.position = "absolute";
        this.div.appendChild(this.canvas);        
        this.context = this.canvas.getContext("2d");
        if (data) {
            this.setData(data);
        }
        
    },
    
    setData: function(data) {
        this.clearData();
        this.data = data;
        data.events.register("update", this, this.onDataUpdate);
    },
    
    clearData: function() {
        if (this.data) {
            this.data.events.unregister("update", this, this.onDataUpdate);
            delete this.data;
        }
    },
    
    moveTo: function() {
        this.needsUpdate = true;
        OpenLayers.Layer.prototype.moveTo.apply(this, arguments);
        window.setTimeout(OpenLayers.Function.bind(this.afterMoveTo, this), 0);
    },
    
    afterMoveTo: function() {
        if (this.needsUpdate) {
            this.onDataUpdate();
        }
    },
    
    onDataUpdate: function() {
        var map = this.map;
        if (map) {
            var size = map.getSize();
            var cols = this.data.numCols();
            var rows = this.data.numRows();
            var style = map.layerContainerDiv.style;
            this.canvas.width = cols;
            this.canvas.height = rows;
            this.canvas.style.top = (-parseInt(style.top)) + "px";
            this.canvas.style.left = (-parseInt(style.left)) + "px";
            this.canvas.style.width = size.w + "px";
            this.canvas.style.height = size.h + "px";

            var imageData = this.context.createImageData(cols, rows);
            var data = imageData.data;
            
            var mutator;
            var mutatorTest = this.data.getValue(0,0);
            if (!mutatorTest.length) {
                mutator = function(value, i, j) {
                    var offset = (j * cols + i) << 2;
                    data[offset + 0] = value; // red
                    data[offset + 1] = value; // green
                    data[offset + 2] = value; // blue
                    data[offset + 3] = 255;   // alpha
                }
            } else if (mutatorTest.length == 3) {
                mutator = function(value, i, j) {
                    var offset = (j * cols + i) << 2;
                    data[offset + 0] = value[0]  // red
                    data[offset + 1] = value[1]; // green
                    data[offset + 2] = value[2]; // blue
                    data[offset + 3] = 255; // alpha
                }
            } else {
                mutator = function(value, i, j) {
                    var offset = (j * cols + i) << 2;
                    data[offset + 0] = value[0]  // red
                    data[offset + 1] = value[1]; // green
                    data[offset + 2] = value[2]; // blue
                    data[offset + 3] = value[3]; // alpha
                }
            }
            /*
            // The mutators below are exclusive to the implementations above.
            // While significantly faster, the conversion of the pipeline from
            // pixels as Uint8[] to Uint32 breaks backwards compatibility.
            // NOTE: symetric implementation in OpenLayers.Raster.Composite
//            if (data.buffer) {
//                var dataBuffer = new ArrayBuffer(data.length);
//                var data8 = new Uint8ClampedArray(dataBuffer);
//                var data32 = new Uint32Array(dataBuffer);
//                mutator = function(value, i, j) {
//                      data32[j* cols + i] = value;
//                });
//                data.set(data8);
//            } else {
//                mutator = function(value, i, j) {
//                    var offset = (j * cols + i) << 2;
//                    data[offset + 0] = ( value         & 0xff); // red
//                    data[offset + 1] = ((value >>  8 ) & 0xff); // green
//                    data[offset + 2] = ((value >>  16) & 0xff); // blue
//                    data[offset + 3] = ((value >>> 24));        // alpha
//                });
//            }
            */
            this.data.forEach(mutator);
            this.context.putImageData(imageData, 0, 0);
            this.needsUpdate = false;
        }
    },
    
    CLASS_NAME: "OpenLayers.Layer.Raster"
    
});
