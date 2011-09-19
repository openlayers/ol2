
var luminance = OpenLayers.Raster.Operation.create(function(rgba) {
    var lum = Math.min(255, 30 + (0.299 * rgba[0]) + (0.587 * rgba[1]) + (0.114 * rgba[2]));
    return [lum, lum, lum, rgba[3]];
});

var marble = new OpenLayers.Layer.WMS(
    "Blue Marble",
    "/geoserver/gwc/service/wms",
    {layers: "topp:bluemarble", format: "image/png"}
);

var raster = new OpenLayers.Layer.Raster({
    name: "Luminance",
    data: luminance(OpenLayers.Raster.Composite.fromLayer(marble)),
    isBaseLayer: true
});

var map = new OpenLayers.Map({
    div: "map",
    theme: null,
    controls: [
        new OpenLayers.Control.Attribution(),
        new OpenLayers.Control.Navigation(),
        new OpenLayers.Control.ZoomPanel()
    ],
    layers: [
        marble
    ],
    center: new OpenLayers.LonLat(0, 0),
    zoom: 1
});

var view = new OpenLayers.Map({
    div: "view",
    theme: null,
    controls: [],
    layers: [
        raster
    ],
    center: new OpenLayers.LonLat(0, 0),
    zoom: 1
});

