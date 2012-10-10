var callback = function(infoLookup) {
    var msg = "";
    if (infoLookup) {
        var info;
        for (var idx in infoLookup) {
            // idx can be used to retrieve layer from map.layers[idx]
            info = infoLookup[idx];
            if (info && info.data) {
                msg += "[" + info.id + "] <strong>" + info.data.name + "</strong>" ;
            }
        }
    }
    document.getElementById("attrs").innerHTML = msg;
};

var map = new OpenLayers.Map({
    div: 'map',
    projection: 'EPSG:21781',
    maxExtent: [420000, 30000, 900000, 350000],
    center: [600000, 200000],
    zoom: 0
});

var control = new OpenLayers.Control.UTFGrid({
    callback: callback,
    handlerMode: 'move'
});

map.addControl(control);

var format = new OpenLayers.Format.WMTSCapabilities();
OpenLayers.Request.GET({
    url: 'https://s3-eu-west-1.amazonaws.com/utfgrid/tiles/capabilities.xml',
    success: function(request) {
        var capabilities = format.read(request.responseXML || request.responseText);
        map.addLayer(format.createLayer(capabilities, {
            layer: 'mapnik',
            isBaseLayer: true
        }));
        map.addLayer(format.createLayer(capabilities, {
            layer: 'grid',
            isBaseLayer: false,
            tileClass: OpenLayers.Tile.UTFGrid,
            tileOptions: {
                utfgridResolution: 4
            }
        }));

    }
});