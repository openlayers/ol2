// Use proxy to get same origin URLs for tiles that don't support CORS.
// OpenLayers.ProxyHost = "proxy.cgi?url=";
OpenLayers.ProxyHost = "/cgi-bin/proxy.py?url=";

var map, cacheRead, cacheWrite;
function init() {
    
    var currentCacheControl = "Local Storage";
    var cacheMap = {
        "Local Storage": new OpenLayers.Control.Cache.LocalStorage(),
        "Session Storage": new OpenLayers.Control.Cache.SessionStorage(),
        "IndexDB": new OpenLayers.Control.Cache.IndexDB(),
        "WebSQL": new OpenLayers.Control.Cache.WebSQL()
    };
   
    cacheRead = new OpenLayers.Control.CacheRead({
        autoActivate: true,
        cacheControl: cacheMap[currentCacheControl]
    });

    cacheWrite = new OpenLayers.Control.CacheWrite({
        autoActivate: true,
        imageFormat: "image/jpeg",
        cacheControl: cacheMap["Local Storage"],
        eventListeners: {
            cachefull: function() { status.innerHTML = "Cache full."; }
        }
    });
    
    map = new OpenLayers.Map({
        div: "map",
        projection: "EPSG:900913",
        layers: [
            new OpenLayers.Layer.WMS("OSGeo", "http://vmap0.tiles.osgeo.org/wms/vmap0", {
                layers: "basic"
            })
        ],
        center: [0, 0],
        zoom: 1,
        controls: [
            new OpenLayers.Control.Navigation(),
            new OpenLayers.Control.Zoom(),
            new OpenLayers.Control.ArgParser(),
            new OpenLayers.Control.Attribution(),
            cacheRead, cacheWrite
        ]
    });

    var cacheType = document.getElementById("cacheType");
    cacheType.onchange = function(e) {
        currentCacheControl = cacheType.value;
        cacheRead.cacheControl = cacheMap[currentCacheControl];
        cacheWrite.cacheControl = cacheMap[currentCacheControl];
    };
}