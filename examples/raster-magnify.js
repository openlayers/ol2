var marble = new OpenLayers.Layer.WMS(
    "Blue Marble",
    "/geoserver/gwc/service/wms",
    {layers: "topp:bluemarble", format: "image/png"}
);

var data = OpenLayers.Raster.Composite.fromLayer(marble);

var focus = [256, 128];
var radius = 50;
var magnification = 2.5;

var magnified = new OpenLayers.Raster.Composite({
    numRows: function() {
        return data.numRows();
    },
    numCols: function() {
        return data.numCols();
    },
    getCount: function() {
        return data.getCount();
    },
    getValue: function(col, row) {
        var dx = focus[0] - col;
        var dy = focus[1] - row;
        var d = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
        var value;
        if (d < radius) {
            value = data.getValue(
                Math.round(col + (dx / magnification)),
                Math.round(row + (dy / magnification))
            );
        } else {
            value = [0, 0, 0, 0];
        }
        return value;
    }
});

data.events.on({
    update: function() {
        magnified.events.triggerEvent("update");
    }
});

var raster = new OpenLayers.Layer.Raster({
    name: "Magnified Blue Marble",
    data: magnified
});

var map = new OpenLayers.Map({
    div: "map",
    theme: null,
    controls: [
        new OpenLayers.Control.Attribution(),
        new OpenLayers.Control.Navigation(),
        new OpenLayers.Control.ZoomPanel(),
        new OpenLayers.Control.LayerSwitcher(),
    ],
    layers: [
        marble, raster
    ],
    center: new OpenLayers.LonLat(0, 0),
    zoom: 1
});

map.events.on({
    mousemove: function(event) {
        if (!map.dragging) {
            var pixel = event.xy;
            focus = [pixel.x, pixel.y];
            magnified.events.triggerEvent("update");
        }
    }
});
