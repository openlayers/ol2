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

// snapping example
var snappingLayers = [];
var snappingControl = null;

function toggleSnapping(element) {
    if (element.checked) {
        if (snappingLayers.length == 0) {
            var styleMap = new OpenLayers.StyleMap({
                pointRadius: 1,
                strokeColor: "#3333ff",
                strokeWidth: 1,
                fillOpacity: 0.5,
                fillColor: "#6666ff",
                graphicName: "square"
            });

            // create snapping layers
            snappingLayers.push(new OpenLayers.Layer.Vector("polygons", {
                strategies: [new OpenLayers.Strategy.Fixed()],
                protocol: new OpenLayers.Protocol.HTTP({
                    url: "data/poly.json",
                    format: new OpenLayers.Format.GeoJSON()
                }),
                styleMap: styleMap
            }));
            snappingLayers.push(new OpenLayers.Layer.Vector("lines", {
                strategies: [new OpenLayers.Strategy.Fixed()],
                protocol: new OpenLayers.Protocol.HTTP({
                    url: "data/line.json",
                    format: new OpenLayers.Format.GeoJSON()
                }),
                styleMap: styleMap
            }));
            snappingLayers.push(new OpenLayers.Layer.Vector("points", {
                strategies: [new OpenLayers.Strategy.Fixed()],
                protocol: new OpenLayers.Protocol.HTTP({
                    url: "data/point.json",
                    format: new OpenLayers.Format.GeoJSON()
                }),
                styleMap: styleMap
            }));
        }
        if (snappingControl == null) {
            // create snapping control
            snappingControl = new OpenLayers.Control.Snapping({
                layer: lineLayer,
                targets: snappingLayers,
                greedy: false
            });
        }
        map.addLayers(snappingLayers);
        snappingControl.activate();
        map.setCenter(new OpenLayers.LonLat(0, 0), 1);
    }
    else {
        if (snappingControl != null) {
            snappingControl.deactivate();
        }
        if (snappingLayers.length > 0) {
            for (var i=0; i<snappingLayers.length; i++) {
                map.removeLayer(snappingLayers[i]);
            }
            snappingLayers = [];
        }
    }
}
