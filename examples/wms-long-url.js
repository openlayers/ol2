// a long text that we set as dummy param (makeTheUrlLong) to make the url long
var longText = new Array(205).join("1234567890");

var map = new OpenLayers.Map( 'map' );
var base = new OpenLayers.Layer.WMS( "OpenLayers WMS",
    "http://vmap0.tiles.osgeo.org/wms/vmap0",
    {layers: 'basic', makeTheUrlLong: longText},
    {tileOptions: {maxGetUrlLength: 2048}, transitionEffect: 'resize'}
);
var overlay = new OpenLayers.Layer.WMS("Overlay",
    "http://demo.boundlessgeo.com/geoserver/wms",
    {layers: "topp:states", transparent: true, makeTheUrlLong: longText},
    {ratio: 1, singleTile: true, tileOptions: {maxGetUrlLength: 2048}, transitionEffect: 'resize'}
);
var overlay2 = new OpenLayers.Layer.WMS("Overlay with gutter",
    "http://demo.boundlessgeo.com/geoserver/wms",
    {layers: "topp:states", transparent: true, makeTheUrlLong: longText},
    {tileOptions: {maxGetUrlLength: 2048}, transitionEffect: 'resize', opacity: 0.5, gutter: 32}
);
map.addLayers([base, overlay, overlay2]);
map.zoomToMaxExtent();

// add behavior to dom elements
document.getElementById("longurl").onclick = function() {
    base.mergeNewParams({makeTheUrlLong: longText});
    overlay.mergeNewParams({makeTheUrlLong: longText});
    overlay2.mergeNewParams({makeTheUrlLong: longText});
};
document.getElementById("shorturl").onclick = function() {
    base.mergeNewParams({makeTheUrlLong: null});
    overlay.mergeNewParams({makeTheUrlLong: null});
    overlay2.mergeNewParams({makeTheUrlLong: null});
};
