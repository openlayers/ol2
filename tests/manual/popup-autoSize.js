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
        }
        else {
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
function test_Popup_autoSize(t) {
    t.plan(3);
    var map = new OpenLayers.Map('map');
    map.addLayer(new OpenLayers.Layer('name', {'isBaseLayer':true}));
    map.zoomToMaxExtent();
    
    var popupAutoSize = OpenLayers.Class(OpenLayers.Popup, {
            contentDisplayClass: "paddind20",
            autoSize: true
    });
    popup = new popupAutoSize(
        null, 
        new OpenLayers.LonLat(-100,50),
        new OpenLayers.Size(100,100),
        "<div style='width: 100px; height: 50px; background-color:#aff'>a b c</div>",
        null, true
    );
    map.addPopup(popup);
    var pPadd = popup.getContentDivPadding();
    t.ok(pPadd.equals(new OpenLayers.Bounds(20,20,20,20)),"{padding:20px} is correctly calculated: (" + popup.getContentDivPadding() + ")");
    
    //map.destroy();
}
    
// Start tests
test_Popup_autoSize(t);
