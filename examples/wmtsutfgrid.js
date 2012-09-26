
OpenLayers.ProxyHost = "proxy.cgi?url=";

var callback = function(infoLookup) {
    var msg = "";
    if (infoLookup) {
        var info;
        for (var idx in infoLookup) {
            // idx can be used to retrieve layer from map.layers[idx]
            info = infoLookup[idx];
            if (info && info.data) {
                msg += "[" + info.id + "] <strong>" +
                    info.data.name + "</strong>";
            }
        }
    }
    document.getElementById("attrs").innerHTML = msg;
};

map = new OpenLayers.Map({
    div: "map",
    projection: "EPSG:21781",
    controls: [
        new OpenLayers.Control.Navigation(),
        new OpenLayers.Control.Zoom(),
        new OpenLayers.Control.MousePosition(),
        new OpenLayers.Control.UTFGrid({
            callback: callback,
            handlerMode: "hover",
            handlerOptions: {
                'delay': 0,
                'pixelTolerance': 0
            },
            reset: function() {}
        })
    ],
    center: [600000, 200000],
    zoom: 0
});

var format = new OpenLayers.Format.WMTSCapabilities();
OpenLayers.Request.GET({
    url: "https://s3-eu-west-1.amazonaws.com/utfgrid/tiles/capabilities.xml",
    success: function(request) {
        var doc = request.responseXML;
        if (!doc || !doc.documentElement) {
            doc = request.responseText;
        }
        var capabilities = format.read(doc);
        map.addLayer(format.createLayer(capabilities, {
            layer: "mapnik",
            isBaseLayer: true
        }));
        map.addLayer(format.createLayer(capabilities, {
            layer: "grid",
            isBaseLayer: false,
            utfgridResolution: 4
        }));
    },
    failure: function() {
        alert("Trouble getting capabilities doc");
        OpenLayers.Console.error.apply(OpenLayers.Console, arguments);
    }
});
