
var osm = new OpenLayers.Layer.OSM();
var veg = new OpenLayers.Layer.WMS(
    "Vegetation",
    "/geoserver/gwc/service/wms",
    {layers: "za:za_vegetation", format: "image/png8", transparent: "TRUE"},
    {isBaseLayer: false, opacity: 0.5}
);

var vegData = OpenLayers.Raster.Composite.fromLayer(veg);

var pixelValues;
var Click = OpenLayers.Class(OpenLayers.Control, {
    autoActivate: true,
    initialize: function(options) {
        OpenLayers.Control.prototype.initialize.apply(this, arguments); 
        this.handler = new OpenLayers.Handler.Click(this, {click: this.trigger});
    }, 
    trigger: function(event) {
        var pixel = event.xy;
        pixelValues = vegData.getValue(pixel.x, pixel.y);
        selected.events.triggerEvent("update");
    }
});

function close(a, b) {
    return Math.abs(a - b) < 15;
}
var query = OpenLayers.Raster.Operation.create(function(vegValues) {
    var rgba = [0, 0, 0, 0];
    if (pixelValues) {
        if (close(vegValues[0], pixelValues[0]) && close(vegValues[1], pixelValues[1]) &&
            close(vegValues[2], pixelValues[2]) && close(vegValues[3], pixelValues[3])) {
            rgba[3] = 150;
        }
    }
    return rgba;
});

var selected = query(vegData);

var map = new OpenLayers.Map({
    div: "map",
    theme: null,
    projection: "EPSG:900913",
    units: "m",
    maxExtent: new OpenLayers.Bounds(-20037508, -20037508, 20037508, 20037508),
    maxResolution: 156543.0339,
    controls: [
        new OpenLayers.Control.Attribution(),
        new OpenLayers.Control.Navigation(),
        new OpenLayers.Control.ZoomPanel(),
        new OpenLayers.Control.LayerSwitcher(),
        new Click()
    ],
    layers: [
        osm, veg, new OpenLayers.Layer.Raster({name: "Selected", data: selected})
    ],
    center: new OpenLayers.LonLat(2622095, -3512434),
    zoom: 5
});

selected.events.on({
    update: function() {
        if (pixelValues) {
            document.getElementById("output").innerHTML = "[" + pixelValues.join(", ") + "]";
            window.setTimeout(updateStats, 0);
        }
    }
})

function updateStats() {
    var count = 0;
    selected.forEach(function(value) {
        if (value[3] > 0) {
            ++count;
        }
    });
    var res = map.getResolution();
    var area = (count * res * res / 10e6).toFixed(0);
    
    document.getElementById("stats").innerHTML = area + " km<sup>2</sup>";
}