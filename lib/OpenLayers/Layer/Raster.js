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
            this.data.forEach(function(value, index) {
                var offset = 4 * index;
                if (!value.length) {
                    value = [value, value, value];
                }
                data[offset + 0] = value[0]; // red
                data[offset + 1] = value[1]; // green
                data[offset + 2] = value[2]; // blue
                if (value.length > 3) {
                    data[offset + 3] = value[3]; // opacity
                } else {
                    data[offset + 3] = 255; // assume opaque
                }
            });
            this.context.putImageData(imageData, 0, 0);
            this.needsUpdate = false;
        }
    },
    
    CLASS_NAME: "OpenLayers.Layer.Raster"
    
});
