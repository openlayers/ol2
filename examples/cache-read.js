var map, cacheRead;
function init() {
    map = new OpenLayers.Map({
        div: "map",
        projection: "EPSG:900913",
        layers: [
            new OpenLayers.Layer.WMS("OSGeo", "http://vmap0.tiles.osgeo.org/wms/vmap0", {
                layers: "basic"
            }, {
                eventListeners: {
                    tileloaded: updateHits
                }
            })
        ],
        center: [0, 0],
        zoom: 1
    });
    
    var currentCacheControl = "Local Storage";
    var cacheMap = {
        "Local Storage": new OpenLayers.Control.Cache.LocalStorage(),
        "Session Storage": new OpenLayers.Control.Cache.SessionStorage(),
        "IndexDB": new OpenLayers.Control.Cache.IndexDB(),
        "WebSQL": new OpenLayers.Control.Cache.WebSQL()
    };
    var cacheHits = {
        "Local Storage": 0,
        "Session Storage": 0,
        "IndexDB": 0,
        "WebSQL": 0
    };
    
    cacheRead = new OpenLayers.Control.CacheRead({
        autoActivate: true,
        cacheControl: cacheMap[currentCacheControl]
    });
    map.addControl(cacheRead);

    

    // User interface
    var status = document.getElementById("status"),
        hits = 0;

    // update the number of cached tiles and detect local storage support
    function updateHits(evt) {
        //console.log(evt.tile.url);
        if (evt) {
            cacheHits[currentCacheControl] += evt.tile.url.substr(0, 5) === "data:";
        }
        if (cacheRead.cacheControl.isAvailable()) {
            status.innerHTML = cacheHits[currentCacheControl] + " cache hits.";
        } else {
            status.innerHTML = cacheRead.cacheControl.CLASS_NAME + " not supported. Try a different browser.";
        }
    }
    
    var cacheType = document.getElementById("cacheType");
    cacheType.onchange = function(e) {
        currentCacheControl = cacheType.value;
        cacheRead.cacheControl = cacheMap[currentCacheControl];
        updateHits();
    };
}