var marble = new OpenLayers.Layer.WMS(
    "Blue Marble",
    "http://demo.opengeo.org/geoserver/wms",
    {layers: "nasa:bluemarble", format: "image/png"},
    {tileOptions: {crossOriginKeyword: "anonymous"}}
);

var vector = new OpenLayers.Layer.Vector("Vector Features");

var composite = OpenLayers.Raster.Composite.fromLayer(vector, {
    mapping: function(feature) {
        // return a 4 element array based on feature
        return [255, 255, 255, 150];
    }
});

var raster = new OpenLayers.Layer.Raster({
    name: "Rasterized Features",
    data: composite
});

var map = new OpenLayers.Map({
    div: "map",
    layers: [marble, vector, raster],
    center: [0, 0],
    zoom: 1
});

map.addControl(new OpenLayers.Control.LayerSwitcher());

var controls = {
    polygon: new OpenLayers.Control.DrawFeature(vector,
                OpenLayers.Handler.Polygon),
    drag: new OpenLayers.Control.DragFeature(vector)
};

for(var key in controls) {
    map.addControl(controls[key]);
}

document.getElementById('noneToggle').checked = true;

function toggleControl(element) {
    for(key in controls) {
        var control = controls[key];
        if(element.value == key && element.checked) {
            control.activate();
        } else {
            control.deactivate();
        }
    }
}
