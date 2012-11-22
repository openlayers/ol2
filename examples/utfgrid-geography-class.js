var osm = new OpenLayers.Layer.XYZ(
    "MapQuest OSM", 
    [
        "http://otile1.mqcdn.com/tiles/1.0.0/osm/${z}/${x}/${y}.png",
        "http://otile2.mqcdn.com/tiles/1.0.0/osm/${z}/${x}/${y}.png",
        "http://otile3.mqcdn.com/tiles/1.0.0/osm/${z}/${x}/${y}.png",
        "http://otile4.mqcdn.com/tiles/1.0.0/osm/${z}/${x}/${y}.png"
    ],
    {transitionEffect: "resize", wrapDateLine: true}
);

var utfgrid = new OpenLayers.Layer.UTFGrid({
    url: [
        "http://a.tiles.mapbox.com/v3/mapbox.geography-class/${z}/${x}/${y}.grid.json",
        "http://b.tiles.mapbox.com/v3/mapbox.geography-class/${z}/${x}/${y}.grid.json",
        "http://c.tiles.mapbox.com/v3/mapbox.geography-class/${z}/${x}/${y}.grid.json"
    ],
    utfgridResolution: 4, // default is 2
    useJSONP: true,
    displayInLayerSwitcher: false,
    numZoomLevels: 9
});

var map = new OpenLayers.Map({
    div: "map", 
    projection: "EPSG:900913",
    layers: [osm, utfgrid],
    controls: [
        new OpenLayers.Control.Navigation({
            dragPanOptions: {
                enableKinetic: true
            }
        }),
        new OpenLayers.Control.Zoom()
    ],
    center: [0, 0],
    zoom: 1
});

var output = document.getElementById("output");
var flag = document.getElementById("flag");

var callback = function(infoLookup, loc, pixel) {
    var msg = "";
    if (infoLookup) {
        var info;
        for (var idx in infoLookup) {
            // idx can be used to retrieve layer from map.layers[idx]
            info = infoLookup[idx];
            if (info && info.data) {
                output.innerHTML = info.data.admin;
                flag.innerHTML = "<img src='data:image/png;base64," + info.data.flag_png + "'>";
                flag.style.left = (pixel.x + 15) + "px";
                flag.style.top = (pixel.y + 15) + "px";
            } else {
                output.innerHTML = flag.innerHTML = "&nbsp;";
            }
        }
    }
};
    
var control = new OpenLayers.Control.UTFGrid({
    callback: callback,
    handlerMode: "move"
});

map.addControl(control);
