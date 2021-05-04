// To use the same syntax as in "\tests"
var t = {
    count: 0,
    plan: function(n) {
        var out = document.getElementById("out"); 
        out.innerHTML += "<hr><b>Plan = " + n + "</b><br>";
        t.count = 0;
    },
    eq: function(a, b, msg) {
        t.count += 1;
        var out = document.getElementById("out"); 
        if (a == b) {
            out.innerHTML += t.count + ": ok " + msg + "<br>";
        } else {
            out.innerHTML += t.count + ": <span style=\"color:red\">Fail (" + a + " not eq " + b + "): " + msg + "<span><br>";
        }   
    },
    ok: function(a, msg) {
        t.count += 1;
        var out = document.getElementById("out"); 
        if (a) {
            out.innerHTML += t.count + ": ok " + msg + "<br>";
        } else {
            out.innerHTML += t.count + ": <span style=\"color:red\">Fail: " + msg + "<span><br>";
        }   
    }
};

// Tests
function test_Popup_maxminSize(t) {
    if (OpenLayers.Util.getScrollbarWidth() == 0) {
        t.plan(0);
        return;
    }
    t.plan(6);
    var map = new OpenLayers.Map('map');
    map.addLayer(new OpenLayers.Layer('name', {'isBaseLayer':true}));
    map.zoomToMaxExtent();
    
    var pAutoCls = OpenLayers.Class(OpenLayers.Popup, {
            autoSize: true
    });
    
    // Test width
    var pWidthCls = OpenLayers.Class(OpenLayers.Popup, {
            minSize: new OpenLayers.Size(30, 0),
            autoSize: true
    });
    var pWidthMinMaxCls = OpenLayers.Class(OpenLayers.Popup, {
            minSize: new OpenLayers.Size(30,    0),
            maxSize: new OpenLayers.Size(34, 1000),
            autoSize: true
    });
    var html29w = "<div style='width:   29px; height: 500px; background-color:#aff'></div>";
    var pAutow = new pAutoCls("pAutow", new OpenLayers.LonLat(-150, 80), null, html29w);
    map.addPopup(pAutow);
    var pWidth = new pWidthCls("pWidth", new OpenLayers.LonLat(-100, 80), null, html29w);
    map.addPopup(pWidth);
    var pWidthMinMax = new pWidthMinMaxCls("pWidthMinMax", new OpenLayers.LonLat(-50, 80), null, html29w);
    map.addPopup(pWidthMinMax);
    t.ok(pWidth.size.w >= pAutow.size.w,
        "Width: with minimum is not less that without minimum: " + pWidth.size.w + ">=" + pAutow.size.w);
    t.ok(pWidth.size.w >= pWidth.minSize.w ,
        "Width is greater than minimum: " + pWidth.size.w + ">=" + pWidth.minSize.w);
    t.eq(pWidthMinMax.size.w, pWidthMinMax.maxSize.w,
        "Width is equal to the maximum: " + pWidthMinMax.size.w + "==" + pWidthMinMax.maxSize.w);
    
    // Test height
    var pHeightCls = OpenLayers.Class(OpenLayers.Popup, {
            minSize: new OpenLayers.Size(0, 35),
            autoSize: true
    });
    var pHeightMinMaxCls = OpenLayers.Class(OpenLayers.Popup, {
            minSize: new OpenLayers.Size(0,    35),
            maxSize: new OpenLayers.Size(1000, 39),
            autoSize: true
    });
    var html34h = "<div style='width: 1000px; height:  34px; background-color:#aff'></div>";
    var pAutoh = new pAutoCls("pAutoh", new OpenLayers.LonLat(150,80), null, html34h);
    map.addPopup(pAutoh);
    var pHeight = new pHeightCls("pHeight", new OpenLayers.LonLat(150,40), null, html34h);
    map.addPopup(pHeight);
    var pHeightMinMax = new pHeightMinMaxCls("pHeightMinMax", new OpenLayers.LonLat(150, 0), null, html34h);
    map.addPopup(pHeightMinMax);
    t.ok(pHeight.size.h >= pAutoh.size.h,
        "Height: with minimum is not less that without minimum: " + pHeight.size.h + ">=" + pAutoh.size.h);
    t.ok(pHeight.size.h >= pHeight.minSize.h,
        "Height is greater than minimum: " + pHeight.size.h + ">=" + pHeight.minSize.h);
    t.eq(pHeightMinMax.size.h, pHeightMinMax.maxSize.h,
        "Height is equal to the maximum: " + pHeightMinMax.size.h + "==" + pHeightMinMax.maxSize.h);

    //map.destroy();
}
    
// Start tests
test_Popup_maxminSize(t);
