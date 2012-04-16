
// create some sample features
var Feature = OpenLayers.Feature.Vector;
var Geometry = OpenLayers.Geometry;
var features = [
    new Feature(
        new Geometry.Point(-80, 0),
        {cls: "one"}
    ),
    new Feature(
        new Geometry.Point(80, 0),
        {cls: "two"}
    )  
];

// create rule based styles
var Rule = OpenLayers.Rule;
var Filter = OpenLayers.Filter;
var style = new OpenLayers.Style({
    pointRadius: 250,
    strokeWidth: 3,
    strokeOpacity: 0.7,
    strokeColor: "navy",
    fillColor: "#ffcc66",
    fillOpacity: 1
}, {
    rules: [
        new Rule({
            filter: new Filter.Comparison({
                type: "==",
                property: "cls",
                value: "one"
            }),
            symbolizer: {
                externalGraphic: "img/widelong.jpg",
                cacheExternalGraphic: false
            }
        }),
        new Rule({
            filter: new Filter.Comparison({
                type: "==",
                property: "cls",
                value: "two"
            }),
            symbolizer: {
                externalGraphic: "img/widelong.jpg",
                cacheExternalGraphic: true
            }
        })
    ]
});

var layer = new OpenLayers.Layer.Vector(null, {
    styleMap: new OpenLayers.StyleMap({
        "default": style
    }),
    isBaseLayer: true,
    renderers: ["Canvas"]
});
layer.addFeatures(features);

var map = new OpenLayers.Map({
    div: "map",
    layers: [layer],
    center: new OpenLayers.LonLat(0, 0),
    zoom: 1
});

