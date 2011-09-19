
// alias for operations
var op = OpenLayers.Raster.Operation;

// operation for converting rgb values to hsl values
var rgb2hsl = op.create(function(rgb) {
    var r = rgb[0] / 255,
        g = rgb[1] / 255,
        b = rgb[2] / 255;
    var max = Math.max(r, g, b), 
        min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if (max == min) {
        h = s = 0; // achromatic
    } else {
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return [h, s, l, rgb[3]];
});

// helper function for hsl2rgb operation
function hue2rgb(p, q, t) {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
}

// operation for converting hsl values to rgb values
var hsl2rgb = op.create(function(hsl) {
    var r, g, b;
    var h = hsl[0],
        s = hsl[1],
        l = hsl[2];

    if (s == 0) {
        r = g = b = l; // achromatic
    } else {
        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return [r * 255, g * 255, b * 255, hsl[3]];
});

var adjustments = {
    hue: 0,
    saturation: 0,
    lightness: 0
};

var adjust = op.create(function(hsl, deltas) {
    var h = (hsl[0] + deltas.hue) % 1;
    if (h < 0) {
        h += 1;
    }
    var s = Math.max(0 , Math.min(hsl[1] + deltas.saturation, 1));
    var l = Math.max(0 , Math.min(hsl[2] + deltas.lightness, 1));
    return [h, s, l, hsl[3]];
});

var marble = new OpenLayers.Layer.WMS(
    "Blue Marble",
    "/geoserver/gwc/service/wms",
    {layers: "topp:bluemarble", format: "image/png"}
);

var data = OpenLayers.Raster.Composite.fromLayer(marble);
var adjusted = hsl2rgb(adjust(rgb2hsl(data), adjustments));

var raster = new OpenLayers.Layer.Raster({
    name: "Adjusted Blue Marble",
    data: adjusted
});

var map = new OpenLayers.Map({
    div: "map",
    theme: null,
    controls: [
        new OpenLayers.Control.Attribution(),
        new OpenLayers.Control.Navigation(),
        new OpenLayers.Control.ZoomPanel(),
        new OpenLayers.Control.LayerSwitcher()
    ],
    layers: [
        marble, raster
    ],
    center: new OpenLayers.LonLat(0, 0),
    zoom: 1
});

// add hsl sliders that modify properties of the adjustments object and update data
$("#hue-slider").slider({
    step: 2,
    value: 50,
    stop: function(event, ui) {
        adjustments.hue = (ui.value / 100) - 0.5;
        adjusted.events.triggerEvent("update");
    }
});
$("#sat-slider").slider({
    step: 2,
    value: 50,
    stop: function(event, ui) {
        adjustments.saturation = (2 * ui.value / 100) - 1;
        adjusted.events.triggerEvent("update");
    }
});
$("#lit-slider").slider({
    step: 2,
    value: 50,
    stop: function(event, ui) {
        adjustments.lightness = (2 * ui.value / 100) - 1;
        adjusted.events.triggerEvent("update");
    }
});
$("#reset").button();
$("#reset").click(function() {
    $("#hue-slider").slider("value", 50);
    adjustments.hue = 0;
    $("#sat-slider").slider("value", 50);
    adjustments.saturation = 0;
    $("#lit-slider").slider("value", 50);
    adjustments.lightness = 0;
    adjusted.events.triggerEvent("update");
});
