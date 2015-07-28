var map;
OpenLayers.ProxyHost = "proxy.cgi?url=";

function init() {
    // allow testing of specific renderers via "?renderer=Canvas", etc
    var renderer = OpenLayers.Util.getParameters(window.location.href).renderer;
    renderer = (renderer) ? [renderer] : OpenLayers.Layer.Vector.prototype.renderers;

    map = new OpenLayers.Map({
        div: "map",
        layers: [
            new OpenLayers.Layer.WMS("OpenLayers WMS",
                "http://vmap0.tiles.osgeo.org/wms/vmap0",
                {layers: "basic"} 
            ),
            new OpenLayers.Layer.WMS("States WMS",
                "http://demo.boundlessgeo.com/geoserver/wms",
                {layers: "topp:states", format: "image/png", transparent: true},
                {maxScale: 15000000}
            ),
            new OpenLayers.Layer.Vector("States", {
                minScale: 15000000,
                strategies: [new OpenLayers.Strategy.BBOX()],
                protocol: new OpenLayers.Protocol.WFS({
                    url: "http://demo.boundlessgeo.com/geoserver/wfs",
                    featureType: "states",
                    featureNS: "http://www.openplans.org/topp"
                }),
                renderers: renderer
            })
        ],
        center: [-95.8506355, 37.163851],
        zoom: 3
    });
}
