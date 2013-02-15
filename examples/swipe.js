var map = new OpenLayers.Map("map");

var ol_wms = new OpenLayers.Layer.WMS(
    "OpenLayers WMS",
    "http://vmap0.tiles.osgeo.org/wms/vmap0",
    {layers: "basic"}
);

var swisstopo = new OpenLayers.Layer.WMS(
    "City boundaries",
    "https://wms.geo.admin.ch/",
    {
        layers: "ch.swisstopo.swissboundaries3d-gemeinde-flaeche.fill",
        transparent: "true",
        format: "image/png"
    },
    {isBaseLayer: false, visibility: true, singleTile: true, ratio: 1}
);

map.addLayers([ol_wms, swisstopo]);
var swipe = new OpenLayers.Control.Swipe({map: map});
map.addControls([new OpenLayers.Control.LayerSwitcher(),swipe]);
swipe.activate();
map.setCenter(new OpenLayers.LonLat(6.9708273326976,46.893766885624), 10);
