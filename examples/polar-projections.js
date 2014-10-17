var map, layer, overlay;

OpenLayers.Projection.defaults['EPSG:3574'] = { 
    maxExtent: [-5505054, -5505054, 5505054, 5505054],
    worldExtent: [-180.0, 0.0, 180.0, 90.0]
};
OpenLayers.Projection.defaults['EPSG:3576'] = { 
    maxExtent: [-5505054, -5505054, 5505054, 5505054],
    worldExtent: [-180.0, 0.0, 180.0, 90.0]
};
OpenLayers.Projection.defaults['EPSG:3571'] = { 
    maxExtent: [-5505054, -5505054, 5505054, 5505054],
    worldExtent: [-180.0, 0.0, 180.0, 90.0]
};
OpenLayers.Projection.defaults['EPSG:3573'] = { 
    maxExtent: [-5505054, -5505054, 5505054, 5505054],
    worldExtent: [-180.0, 0.0, 180.0, 90.0]
};

function setProjection() {
    projCode = this.innerHTML;
    var oldCenter = map.getCenter();
    var oldProjection = map.getProjectionObject();

    // the base layer controls the map projection
    layer.addOptions({projection: projCode});

    // with the base layer updated, the map has the new projection now
    var newProjection = map.getProjectionObject();
    
    // transform the center of the old projection, not the extent
    map.setCenter(oldCenter.transform(oldProjection, newProjection));

    // update overlay layers here
    overlay.addOptions({projection: newProjection});

    // re-fetch images for all layers
    layer.redraw();
    overlay.redraw();
}

function init() {
    layer = new OpenLayers.Layer.WMS(
        'countries',
        'http://suite.opengeo.org/geoserver/wms',
        {layers: 'opengeo:borders', version: '1.1.1'},
        {projection: 'EPSG:3574', displayOutsideMaxExtent: true}
    );
    overlay = new OpenLayers.Layer.WMS(
        'cities',
        'http://suite.opengeo.org/geoserver/wms',
        {layers: 'opengeo:cities', version: '1.1.1', transparent: true},
        {projection: 'EPSG:3574', displayOutsideMaxExtent: true,
                isBaseLayer: false}
    );
    map = new OpenLayers.Map('map', {
        center: [25000, 25000],
        zoom: 1,
        layers: [layer, overlay]
    });
    map.addControl(new OpenLayers.Control.Graticule());

    // add behaviour to dom elements
    document.getElementById('epsg3574').onclick = setProjection;
    document.getElementById('epsg3576').onclick = setProjection;
    document.getElementById('epsg3571').onclick = setProjection;
    document.getElementById('epsg3573').onclick = setProjection;
}
