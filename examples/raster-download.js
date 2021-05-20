var marble = new OpenLayers.Layer.WMS(
    "Blue Marble",
    "http://demo.opengeo.org/geoserver/wms",
    {layers: "nasa:bluemarble", format: "image/png"},
    {tileOptions: {crossOriginKeyword: "anonymous"}}
);

var data = OpenLayers.Raster.Composite.fromLayer(marble);

var map = new OpenLayers.Map({
    div: "map",
    theme: null,
    layers: [marble],
    center: new OpenLayers.LonLat(0, 0),
    zoom: 1
});

var types = {
    png: "image/png",
    jpg: "image/jpeg",
    gif: "image/gif"
};

for (var type in types) {
    var link = document.getElementById(type + "-link");
    link.onmouseover = (function(link, type) {return function() {
        link.href = data.toDataURL(types[type]);
    }})(link, type);
}

