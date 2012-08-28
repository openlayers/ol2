var map = new OpenLayers.Map('map');
var wms = new OpenLayers.Layer.WMS( "OpenLayers WMS",
    "http://vmap0.tiles.osgeo.org/wms/vmap0?", {layers: 'basic'});

var vectors = new OpenLayers.Layer.Vector("Vector Layer");

var zones = OpenLayers.Raster.Composite.fromLayer(vectors, {
    mapping: function(feature) {
        return [255, 255, 255, 150];
    }
});

map.addLayers([wms, vectors]);
map.addControl(new OpenLayers.Control.LayerSwitcher());

var controls = {
    polygon: new OpenLayers.Control.DrawFeature(vectors,
                OpenLayers.Handler.Polygon),
    drag: new OpenLayers.Control.DragFeature(vectors)
};

for(var key in controls) {
    map.addControl(controls[key]);
}

map.setCenter(new OpenLayers.LonLat(0, 0), 3);
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
