var map, control, lineLayer;

function init() {
    map = new OpenLayers.Map('map');

    var wmsLayer = new OpenLayers.Layer.WMS( "OpenLayers WMS",
        "http://vmap0.tiles.osgeo.org/wms/vmap0?", {layers: 'basic'});

    lineLayer = new OpenLayers.Layer.Vector("Line Layer");
    map.addLayers([wmsLayer, lineLayer]);

    control = new OpenLayers.Control.OrthogonalLines(lineLayer);
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
    var abscissa = parseFloat(document.getElementById("abscissa").value);
    control.setAbscissa(abscissa);
    var ordinate = parseFloat(document.getElementById("ordinate").value);
    control.setOrdinate(ordinate);
}
