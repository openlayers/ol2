var map, control, pointLayer;

function init() {
    map = new OpenLayers.Map('map');

    var wmsLayer = new OpenLayers.Layer.WMS( "OpenLayers WMS",
        "http://vmap0.tiles.osgeo.org/wms/vmap0?", {layers: 'basic'});

    pointLayer = new OpenLayers.Layer.Vector("Point Layer");
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

// snap to grid example
var snappingLayer = null;
var snappingControl = null;

function toggleSnapping(element) {
    if (element.checked) {
        if (snappingLayer == null) {
            // create snapping layer
            snappingLayer = new OpenLayers.Layer.PointGrid({
                name: "Snap Grid",
                dx: 3, dy: 3,
                styleMap: new OpenLayers.StyleMap({
                    pointRadius: 1,
                    strokeColor: "#3333ff",
                    strokeWidth: 1,
                    fillOpacity: 1,
                    fillColor: "#ffffff",
                    graphicName: "square"
                })
            });
        }
        if (snappingControl == null) {
            // create snapping control
            snappingControl = new OpenLayers.Control.Snapping({
                layer: pointLayer,
                targets: [{
                    layer: snappingLayer,
                    tolerance: 15
                }]
            });
        }
        map.addLayer(snappingLayer);
        snappingLayer.setMaxFeatures(200);
        snappingControl.activate();
    }
    else {
        if (snappingControl != null) {
            snappingControl.deactivate();
        }
        if (snappingLayer != null) {
            map.removeLayer(snappingLayer);
        }
    }
}
