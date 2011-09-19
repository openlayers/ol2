var cols = 256;
var rows = 4;

var array = new Array(rows);
var values = new Array(cols);
for (var i=0; i<cols; ++i) {
    values[i] = i * 2 * Math.PI / cols; 
}
// fill all rows with same
for (var j=0; j<rows; ++j) {
    array[j] = values;
}

var data = OpenLayers.Raster.Grid.fromArray(array);

var color = OpenLayers.Raster.Operation.create(function(value, offset) {
    return (Math.cos(value + offset) + 1) * 255 / 2;
});

var red = color(data, -Math.PI / 4);
var green = color(data, -3 * Math.PI / 4);
var blue = color(data, 3 * Math.PI / 4);

var raster = new OpenLayers.Layer.Raster({
    name: "Colors",
    data: new OpenLayers.Raster.Composite({grids: [red, green, blue]}),
    isBaseLayer: true
});

var map = new OpenLayers.Map({
    div: "map",
    theme: null,
    controls: [
        new OpenLayers.Control.Attribution(),
        new OpenLayers.Control.Navigation({
            dragPanOptions: {
                enableKinetic: true
            }
        }),
        new OpenLayers.Control.ZoomPanel()
    ],
    layers: [raster],
    center: new OpenLayers.LonLat(0, 0),
    zoom: 1
});

// add a slider for color control
var originalValues = values.slice();
$("#slider").slider({
    step: 2,
    slide: function(event, ui) {
        var offset = 2 * Math.PI * (ui.value / 100);
        for (var i=0; i<cols; ++i) {
            values[i] = originalValues[i] + offset;
        }
        data.events.triggerEvent("update");
    }
});

