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
    }
};

// Tests
function test_Popup_autoSize(t) {
    t.plan(5);
    var map = new OpenLayers.Map('map');
    map.addLayer(new OpenLayers.Layer('name', {'isBaseLayer':true}));
    map.zoomToMaxExtent();
    
    var popupAutoSize = OpenLayers.Class(OpenLayers.Popup, {
            contentDisplayClass: "paddingChk",
            autoSize: true
    });
    popup = new popupAutoSize(
        null, 
        new OpenLayers.LonLat(-100,50),
        new OpenLayers.Size(44,55),
        "<div style='width: 100px; height: 50px; background-color:#aff'>a b c</div>",
        null, true
    );
    map.addPopup(popup);
    t.eq(OpenLayers.Element.getStyle(popup.div,"width"),"118px","Width is correctly calculated");
    t.eq(OpenLayers.Element.getStyle(popup.div,"height"),"70px","Height is correctly calculated");
    t.eq(popup.contentSize.w,100,"Width popup.contentSize is correctly set");
    t.eq(popup.contentSize.h,50,"Height popup.contentSize is correctly set");
    
    //map.destroy();
}
    
// Start tests
test_Popup_autoSize(t);
