var map, control;

function init() {
    map = new OpenLayers.Map('map');

    var wmsLayer = new OpenLayers.Layer.WMS( "OpenLayers WMS",
        "http://vmap0.tiles.osgeo.org/wms/vmap0?", {layers: 'basic'});

    var pointLayer = new OpenLayers.Layer.Vector("Point Layer");
    map.addLayers([wmsLayer, pointLayer]);

    control = new OpenLayers.Control.ArcIntersection(pointLayer);
    map.addControl(control);
    control.activate();

    map.setCenter(new OpenLayers.LonLat(0, 0), 3);

    update();
}

function toggleControl(element) {
    if (element.checked) {
        control.activate();
    }
    else {
        control.deactivate();
    }
}

function update() {
    var radius1 = parseFloat(document.getElementById("radius1").value);
    control.setRadius(0, radius1);
    var radius2 = parseFloat(document.getElementById("radius2").value);
    control.setRadius(1, radius2);
}
