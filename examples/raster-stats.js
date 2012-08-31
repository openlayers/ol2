var nlcd = new OpenLayers.Layer.WMS(
    "Land Cover",
    "/geoserver/wms",
    {layers: "usgs:nlcd", format: "image/png8"}
);

var data = OpenLayers.Raster.Composite.fromLayer(nlcd);

var pending;
function deferredStats() {
    if (pending) {
        window.clearTimeout(pending);
    }
    pending = window.setTimeout(generateStats, 900);
}

var stats = {};
function generateStats() {
    stats = {};
    data.forEach(function(pixel) {
        var rgb = pixel.slice(0, 3).join(",");
        if (rgb in stats) {
            stats[rgb] += 1;
        } else {
            stats[rgb] = 0;
        }
    });
    var txt = "RGB\tCount\n";
    for (var rgb in stats) {
        txt += rgb + "\t" + stats[rgb] + "\n";
    }
    document.getElementById("stats").value = txt;
}

data.events.on({update: deferredStats});

var map = new OpenLayers.Map({
    div: "map",
    projection: "EPSG:900913",
    layers: [nlcd],
    center: [-8606289, 4714070],
    zoom: 11
});

