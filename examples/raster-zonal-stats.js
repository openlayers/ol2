var op = OpenLayers.Raster.Operation;
var fromLayer = OpenLayers.Raster.Composite.fromLayer;

var streets = new OpenLayers.Layer.XYZ(
    "OpenStreetMap", 
    [
        "http://otile1.mqcdn.com/tiles/1.0.0/osm/${z}/${x}/${y}.png",
        "http://otile2.mqcdn.com/tiles/1.0.0/osm/${z}/${x}/${y}.png",
        "http://otile3.mqcdn.com/tiles/1.0.0/osm/${z}/${x}/${y}.png",
        "http://otile4.mqcdn.com/tiles/1.0.0/osm/${z}/${x}/${y}.png"
    ],
    {
        attribution: "Tiles by <a href='http://www.mapquest.com/'  target='_blank'>MapQuest</a>, <a href='http://www.openstreetmap.org/' target='_blank'>Open Street Map</a> and contributors, <a href='http://creativecommons.org/licenses/by-sa/2.0/' target='_blank'>CC-BY-SA</a>  <img src='http://developer.mapquest.com/content/osm/mq_logo.png' border='0'>",
        transitionEffect: "resize"
    }
);

var imagery = new OpenLayers.Layer.XYZ(
    "Imagery",
    [
        "http://oatile1.mqcdn.com/naip/${z}/${x}/${y}.png",
        "http://oatile2.mqcdn.com/naip/${z}/${x}/${y}.png",
        "http://oatile3.mqcdn.com/naip/${z}/${x}/${y}.png",
        "http://oatile4.mqcdn.com/naip/${z}/${x}/${y}.png"
    ],
    {
        attribution: "Tiles by <a href='http://open.mapquest.co.uk/' target='_blank'>MapQuest</a> <img src='http://developer.mapquest.com/content/osm/mq_logo.png' border='0'>",
        transitionEffect: "resize"
    }
);


var ned = new OpenLayers.Layer.WMS(
    "Elevation",
    "/geoserver/wms",
    {layers: "usgs:ned", format: "image/png", transparent: true},
    {singleTile: true, isBaseLayer: false, opacity: 0, displayInLayerSwitcher: false}
);

var nlcd = new OpenLayers.Layer.WMS(
    "Land Cover",
    "/geoserver/wms",
    {layers: "usgs:nlcd", format: "image/png8", transparent: true},
    {singleTile: true, isBaseLayer: false, opacity: 0, displayInLayerSwitcher: false}
);

var map = new OpenLayers.Map({
    div: "map",
    projection: "EPSG:900913",
    layers: [streets, imagery, ned, nlcd],
    center: [-8690522, 4714451],
    restrictedExtent: [-8732354, 4647019, -8492897, 4782306],
    zoom: 11
});

/**
 * The NED dataset is symbolized by a color ramp that maps the following
 * elevations to corresponding RGB values.  This operation is used to
 * invert the mapping - returning elevations in meters for a pixel RGB array.
 *
 *  -20m : 0, 0, 0
 *  400m : 0, 0, 255
 *  820m : 0, 255, 255
 * 1240m : 255, 255, 255
 *
 * Transparent pixels are areas of no data (grid value will be NaN).
 */
var getElevation = op.create(function(pixel) {
    var elevation = NaN,
        delta = 420,
        min = -20;

    if (pixel[3] == 255) {
        elevation = (delta * (pixel[0] + pixel[1] + pixel[2]) / 255) + min;
    }
    return [elevation];
});

/**
 * This operation is used to transform an elevation grid into a grid
 * with values representing an elevation zone.
 * 
 * 0: e < 150m
 * 1: 150m <= e < 400m
 * 2: e >= 400m
 *
 * Areas of no data will have NaN value.
 */
var getZone = op.create(function(pixel) {
    var elevation = pixel[0],
        zone = NaN;
    if (!isNaN(elevation)) {
        if (elevation < 150) {
            zone = 0;
        } else if (elevation < 400) {
            zone = 1;
        } else {
            zone = 2;
        }
    }
    return [zone];
});

var zones = getZone(getElevation(fromLayer(ned)));

/**
 * The NLCD dataset is symbolized according to landcover type.  The mapping below
 * links RGB values to landcover type.
 */
var classes = {
    "255,255,255": null,
    "0,0,0": null, // 0
    "73,109,163": "Open Water", // 11
    "224,204,204": "Developed, Open Space", // 21
    "219,153,130": "Developed, Low Intensity", // 22
    "242,0,0": "Developed, Medium Intensity", // 23
    "170,0,0": "Developed, High Intensity", // 24
    "181,175,163": "Barren Land (Rock/Sand/Clay)", // 31
    "107,170,102": "Deciduous Forest", // 41
    "28,102,51": "Evergreen Forest", // 42
    "186,204,145": "Mixed Forest", // 43
    "165,140,48": "Dwarf Scrub", // 51
    "209,186,130": "Shrub/Scrub", // 52
    "229,229,193": "Grassland/Herbaceous", // 71
    "201,201,119": "Sedge/Herbaceous", // 72
    "221,216,60": "Pasture/Hay", // 81
    "173,112,40": "Cultivated Crops", // 82
    "186,216,237": "Woody Wetlands", // 90
    "112,163,191": "Emergent Herbaceous Wetlands" // 95
};

var getCover = op.create(function(pixel) {
    var rgb = pixel.slice(0, 3).join(",");
    return [classes[rgb]];
});

var landcover = getCover(fromLayer(nlcd));

var getZoneCover = op.create(function(zonesPixel, coverPixel) {
    return [zonesPixel[0], coverPixel[0]];
});

var zoneCover = getZoneCover(zones, landcover);

var pending = null;
function deferredStats() {
    if (pending != null) {
        window.clearTimeout(pending);
        pending = null;
    }
    pending = window.setTimeout(generateStats, 500);
}

function generateStats() {
    var stats = {};
    var area = Math.pow(map.getResolution(), 2);
    zoneCover.forEach(function(pixel) {
        var zone = pixel[0];
        var cover = pixel[1];
        if (!isNaN(zone) && cover) {
            if (!(cover in stats)) {
                stats[cover] = [];
            }
            var sums = stats[cover];
            if (zone in sums) {
                sums[zone] += area;
            } else {
                sums[zone] = area;
            }
        }
    });
    displayStats(stats);
}

var template = new jugl.Template("template");
var target = document.getElementById("stats");
function displayStats(stats) {    
    var entries = [];
    for (var cover in stats) {
        entries.push({
            cover: cover,
            area: stats[cover]
        });
    }
    function sum(area) {
        return (area[0] || 0) + (area[1] || 0) + (area[2] || 0);
    }
    entries.sort(function(a, b) {
        return sum(b.area) - sum(a.area);
    });
    target.innerHTML = "";
    template.process({
        context: {entries: entries},
        clone: true,
        parent: target
    });
}

zoneCover.events.on({update: deferredStats});

map.addControl(new OpenLayers.Control.LayerSwitcher());


// allow toggling of nlcd visibility
document.getElementById("show-nlcd").onclick = function() {
    nlcd.setOpacity(this.checked ? 1 : 0);
};


// allow toggling of nlcd visibility
document.getElementById("show-ned").onclick = function() {
    ned.setOpacity(this.checked ? 1 : 0);
};
