var map = new OpenLayers.Map({
    div: "map",
    layers: [new OpenLayers.Layer.OSM("OSM", [
        'http://a.tile.openstreetmap.org/${z}/${x}/${y}.png',
        'http://b.tile.openstreetmap.org/${z}/${x}/${y}.png',
        'http://c.tile.openstreetmap.org/${z}/${x}/${y}.png'
    ], { transitionEffect: 'resize' })],
    controls: [
        new OpenLayers.Control.Navigation(),
        new OpenLayers.Control.Attribution(),
        new OpenLayers.Control.ZoomBar()
    ],
    center: [0, 0],
    zoom: 1
});

var map2 = new OpenLayers.Map({
    div: "map2",
    layers: [new OpenLayers.Layer.OSM("OSM", [
        'http://a.tile.openstreetmap.org/${z}/${x}/${y}.png',
        'http://b.tile.openstreetmap.org/${z}/${x}/${y}.png',
        'http://c.tile.openstreetmap.org/${z}/${x}/${y}.png'
    ], { transitionEffect: 'resize' })],
    controls: [
        new OpenLayers.Control.Navigation(),
        new OpenLayers.Control.Attribution()
    ],
    center: [0, 0],
    zoom: 1
});
// test to build the zoombar after sets the baselayer
map2.addControl(new OpenLayers.Control.ZoomBar({ sliderText: '' }));
