var marble = new OpenLayers.Layer.WMS(
    "Blue Marble",
    "/geoserver/wms",
    {layers: "topp:bluemarble", format: "image/png"}
);

var data = OpenLayers.Raster.Composite.fromLayer(marble);

var map = new OpenLayers.Map({
    div: "map",
    theme: null,
    layers: [marble],
    center: new OpenLayers.LonLat(0, 0),
    zoom: 1
});

var link = document.getElementById("pdf-link");

link.onmouseover = function() {
    var title = document.getElementById("map-title").value;
    var doc = new jsPDF("landscape");
    doc.text(20, 20, title);

    var imgData = data.toDataURL("image/jpeg").slice("data:image/jpeg;base64,".length);
    doc.addImage(atob(imgData), "JPEG", 20, 30, 256, 128);

    link.href = doc.output("datauristring");
}
