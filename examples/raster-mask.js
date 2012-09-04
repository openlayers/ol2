var fromLayer = OpenLayers.Raster.Composite.fromLayer;
var op = OpenLayers.Raster.Operation;

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


var nlcd = new OpenLayers.Layer.WMS(
    "Land Cover",
    "/geoserver/wms",
    {layers: "usgs:nlcd", format: "image/png8"},
    {singleTile: true, isBaseLayer: false}
);


var tracts = new OpenLayers.Layer.Vector("Census Tracts", {
    strategies: [new OpenLayers.Strategy.BBOX()],
    projection: new OpenLayers.Projection("EPSG:900913"),
    protocol: new OpenLayers.Protocol.WFS({
        url: "/geoserver/wfs",
        version: "1.1.0",
        featureNS: "http://www.usgs.gov/#opengeo",
        srsName: "EPSG:900913",
        featureType: "tracts"
    }),
    styleMap: new OpenLayers.StyleMap({
        "default": new OpenLayers.Style({
            stroke: false,
            fillOpacity: 0.01
        }),
        "select": new OpenLayers.Style({
            fillColor: "#66ccff",
            fillOpacity: 0.5,
            stroke: true,
            strokeColor: "#3399ff",
            strokeWidth: 2
        })
    })
});

var select = new OpenLayers.Control.SelectFeature(tracts, {
    autoActivate: true,
    toggle: true,
    multipleKey: "shiftKey"
});

var getIds = op.create(function(pixel) {
    var id = null;
    if (!!pixel[3]) {
        id = (256 * 256 * pixel[2]) + ((256 * pixel[1]) + pixel[0]);
    }
    return [id];
});

var rasterTracts = fromLayer(tracts, {
    mapping: function(feature) {
        // TODO: handle this mapping in the factory
        var id = Number(feature.fid.split(".").pop());
        var r = id % 256;
        var g = Math.floor(id / 256) % 256;
        var b = Math.floor(id / (256 * 256));
        if (b > 255) {
            throw new Error("Id overflow");
        }
        return [r, g, b, 255];
    }
});

var tractIds = getIds(rasterTracts);

var map = new OpenLayers.Map({
    div: "map",
    projection: "EPSG:900913",
    layers: [streets, imagery, nlcd, tracts],
    controls: [
        select, 
        new OpenLayers.Control.Zoom(),
        new OpenLayers.Control.Navigation(),
        new OpenLayers.Control.LayerSwitcher()
    ],
    center: [-8606289, 4714070],
    zoom: 11
});

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
    return [classes[rgb] || rgb];
});

var landcover = getCover(fromLayer(nlcd));

function generateStats() {
    var stats = {};
    var area = Math.pow(map.getResolution(), 2);
    var selected = {};
    var some = false;
    for (var i=0, ii=tracts.selectedFeatures.length; i<ii; ++i) {
        var id = tracts.selectedFeatures[i].fid.split(".").pop();
        selected[id] = true;
        some = true;
    }
    if (some) {
        landcover.forEach(function(pixel, i, j) {
            var cover = pixel[0];
            if (cover) {
                var id = tractIds.getValue(i, j);
                if (id in selected) {
                    if (cover in stats) {
                        stats[cover] += area;
                    } else {
                        stats[cover] = area;
                    }
                }
            }
        });
    }
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
    entries.sort(function(a, b) {
        return b.area - a.area;
    });
    target.innerHTML = "";
    template.process({
        context: {entries: entries},
        clone: true,
        parent: target
    });
}

// landcover.events.on({
//     update: generateStats
// });
tracts.events.on({
    featureselected: function() {
        window.setTimeout(generateStats, 10);
    },
    featureunselected: function() {
        window.setTimeout(generateStats, 10);
    }
});



