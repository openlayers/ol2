/* Copyright (c) 2006-2012 by OpenLayers Contributors (see authors.txt for
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

/**
 * @requires OpenLayers/Util/vendorPrefix.js
 * @requires OpenLayers/Handler/Pinch.js
 */

/**
 * Class: OpenLayers.Control.PinchZoom
 *
 * Inherits:
 *  - <OpenLayers.Control>
 */
OpenLayers.Control.PinchZoom = OpenLayers.Class(OpenLayers.Control, {

    /** 
     * Property: type
     * {OpenLayers.Control.TYPES}
     */
    type: OpenLayers.Control.TYPE_TOOL,

    /**
     * Property: pinchOrigin
     * {Object} Cached object representing the pinch start (in pixels).
     */
    pinchOrigin: null,    
    
    /**
     * Property: currentCenter
     * {Object} Cached object representing the latest pinch center (in pixels).
     */
    currentCenter: null,    

    /**
     * APIProperty: autoActivate
     * {Boolean} Activate the control when it is added to a map.  Default is
     *     true.
     */
    autoActivate: true,

    /**
     * APIProperty: preserveCenter
     * {Boolean} Force the map center to stay in place. Default is false.
     */
    preserveCenter: false,
    
    /**
     * APIProperty: handlerOptions
     * {Object} Used to set non-default properties on the pinch handler
     */

    /**
     * Constructor: OpenLayers.Control.PinchZoom
     * Create a control for zooming with pinch gestures.  This works on devices
     *     with multi-touch support.
     *
     * Parameters:
     * options - {Object} An optional object whose properties will be set on
     *                    the control
     */
    initialize: function(options) {
        OpenLayers.Control.prototype.initialize.apply(this, arguments);
        this.handler = new OpenLayers.Handler.Pinch(this, {
            start: this.pinchStart,
            move: this.pinchMove,
            done: this.pinchDone
        }, this.handlerOptions);
    },
    
    /**
     * Method: pinchStart
     *
     * Parameters:
     * evt - {Event}
     * pinchData - {Object} pinch data object related to the current touchmove
     *     of the pinch gesture. This give us the current scale of the pinch.
     */
    pinchStart: function(evt, pinchData) {
        var xy = (this.preserveCenter) ?
            this.map.getPixelFromLonLat(this.map.getCenter()) : evt.xy;
        this.pinchOrigin = xy;
        this.currentCenter = xy;
    },
    
    /**
     * Method: pinchMove
     *
     * Parameters:
     * evt - {Event}
     * pinchData - {Object} pinch data object related to the current touchmove
     *     of the pinch gesture. This give us the current scale of the pinch.
     */
    pinchMove: function(evt, pinchData) {
        var scale = pinchData.scale;
        var containerOrigin = this.map.layerContainerOriginPx;
        var pinchOrigin = this.pinchOrigin;
        var current = (this.preserveCenter) ?
            this.map.getPixelFromLonLat(this.map.getCenter()) : evt.xy;

        var dx = Math.round((current.x - pinchOrigin.x) + (scale - 1) * (containerOrigin.x - pinchOrigin.x));
        var dy = Math.round((current.y - pinchOrigin.y) + (scale - 1) * (containerOrigin.y - pinchOrigin.y));

        this.applyTransform(
            "translate(" + dx + "px, " + dy + "px) scale(" + scale + ")"
        );
        this.currentCenter = current;
    },
    
    /**
     * Method: applyTransform
     * Applies the given transform to layers.
     */
    applyTransform: function(transform) {
        var style = this.map.layerContainerDiv.style;
        var transformProperty = OpenLayers.Util.vendorPrefix.style("transform");
        if (transformProperty) {
            style[transformProperty] = transform;
        }
    },
    
    /**
     * Method: pinchDone
     *
     * Parameters:
     * evt - {Event}
     * start - {Object} pinch data object related to the touchstart event that
     *     started the pinch gesture.
     * last - {Object} pinch data object related to the last touchmove event
     *     of the pinch gesture. This give us the final scale of the pinch.
     */
    pinchDone: function(evt, start, last) {
        this.applyTransform("");
        var zoom = this.map.getZoomForResolution(this.map.getResolution() / last.scale, true);
        if (zoom !== this.map.getZoom() || !this.currentCenter.equals(this.pinchOrigin)) {
            var resolution = this.map.getResolutionForZoom(zoom);

            var location = this.map.getLonLatFromPixel(this.pinchOrigin);
            var zoomPixel = this.currentCenter;        
            var size = this.map.getSize();

            location.lon += resolution * ((size.w / 2) - zoomPixel.x);
            location.lat -= resolution * ((size.h / 2) - zoomPixel.y);

            // Force a reflow before calling setCenter. This is to work
            // around an issue occuring in iOS.
            //
            // See https://github.com/openlayers/openlayers/pull/351.
            //
            // Without a reflow setting the layer container div's top left
            // style properties to "0px" - as done in Map.moveTo when zoom
            // is changed - won't actually correctly reposition the layer
            // container div.
            //
            // Also, we need to use a statement that the Google Closure
            // compiler won't optimize away.
            this.map.div.clientWidth = this.map.div.clientWidth;

            this.map.setCenter(location, zoom);
        }
    },

    CLASS_NAME: "OpenLayers.Control.PinchZoom"

});
