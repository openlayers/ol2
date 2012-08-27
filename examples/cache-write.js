// Use proxy to get same origin URLs for tiles that don't support CORS.
OpenLayers.ProxyHost = "proxy.cgi?url=";

var map, cacheWrite;

function init() {
    map = new OpenLayers.Map({
        div: "map",
        projection: "EPSG:900913",
        layers: [
            new OpenLayers.Layer.WMS("OSGeo", "http://vmap0.tiles.osgeo.org/wms/vmap0", {
                layers: "basic"
            }, {
                eventListeners: {
                    tileloaded: updateStatus
                }
            })
        ],
        center: [0, 0],
        zoom: 1
    });
    
    var cacheMap = {
        "Local Storage": new OpenLayers.Control.Cache.LocalStorage(),
        "Session Storage": new OpenLayers.Control.Cache.SessionStorage(),
        "IndexDB": new OpenLayers.Control.Cache.IndexDB(),
        "WebSQL": new OpenLayers.Control.Cache.WebSQL()
    };
    
    cacheWrite = new OpenLayers.Control.CacheWrite({
        autoActivate: true,
        imageFormat: "image/jpeg",
        cacheControl: cacheMap["Local Storage"],
        eventListeners: {
            cachefull: function() { status.innerHTML = "Cache full."; }
        }
    });
    map.addControl(cacheWrite);

    

    // User interface
    var status = document.getElementById("status");
    document.getElementById("clear").onclick = function() {
        cacheWrite.clearCache();
        updateStatus();
    };

    // update the number of cached tiles and detect local storage support
    function updateStatus() {
        if (cacheWrite.cacheControl.isAvailable()) {
            cacheWrite.cacheControl.length(function(num) {
                status.innerHTML = num + " entries in cache.";
            });
        } else {
            status.innerHTML = cacheWrite.cacheControl.CLASS_NAME + " not supported. Try a different browser.";
        }
    }
    
    var cacheType = document.getElementById("cacheType");
    cacheType.onchange = function(e) {
        var type = cacheType.value;
        cacheWrite.cacheControl = cacheMap[type];
        updateStatus();
    };
}