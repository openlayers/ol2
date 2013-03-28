/* Copyright (c) 2006-2012 by OpenLayers Contributors (see authors.txt for
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

/**
 * @requires OpenLayers/Control.js
 * @requires OpenLayers/Feature/Vector.js
 * @requires OpenLayers/Geometry/Point.js
 * @requires OpenLayers/Geometry/Polygon.js
 * @requires OpenLayers/Handler/Feature.js
 * @requires OpenLayers/Handler/Point.js
 */

/**
 * Class: OpenLayers.Control.ArcIntersection
 * Construct intersection points from two circles with user defined centers and
 * radii
 *
 * Inherits from:
 *  - <OpenLayers.Control>
 */
OpenLayers.Control.ArcIntersection = OpenLayers.Class(OpenLayers.Control, {

    /**
     * APIProperty: events
     * {<OpenLayers.Events>} Events instance for listeners and triggering
     *     control specific events.
     *
     * Register a listener for a particular event with the following syntax:
     * (code)
     * control.events.register(type, obj, listener);
     * (end)
     *
     * Supported event types (in addition to those from <OpenLayers.Control.events>):
     * featureadded - Triggered when a feature is added. Listeners will receive
     *     an object with a *feature* property referencing the feature.
     */

    /**
     * Property: layer
     * {<OpenLayers.Layer.Vector>}
     */
    layer: null,

    /**
     * Property: handlers
     * {Object}
     */
    handlers: null,

    /**
     * Property: virtualFeatures
     * {Array(<OpenLayers.Feature.Vector>)} Virtual features for circles and
     *     intersection points.
     */
    virtualFeatures: null,

    /**
     * Property: circles
     * {Array(Object)} Centers and radii for the two circles.
     */
    circles: null,

    /**
     * Property: circleReplaceIndex
     * {Integer} Index for next circle to replace on click. Alternate between 0
     *     and 1 to replace oldest circle.
     */
    circleReplaceIndex: null,

    /**
     * APIProperty: circlesStyle
     * {Object} A symbolizer to be used for the circles. Default is the layer's
     *     temporary style.
     */
    circlesStyle: null,

    /**
     * APIProperty: intersectionsStyle
     * {Object} A symbolizer to be used for intersection points. Default is the
     *     layer's temporary style with green stroke color.
     */
    intersectionsStyle: null,

    /**
     * APIProperty: intersectionsSelectStyle
     * {Object} A symbolizer to be used for highlighting intersection points.
     *     Default is the layer's select style.
     */
    intersectionsSelectStyle: null,

    /**
     * Constructor: OpenLayers.Control.ArcIntersection
     *
     * Parameters:
     * layer - {<OpenLayers.Layer.Vector>} The target layer.
     * options - {Object} Optional object whose properties will be set on the
     *     control.
     */
    initialize: function(layer, options) {
        // default styles for virtual features
        this.layer = layer;
        var layerTempStyle = this.layer.styleMap.createSymbolizer(null, "temporary");
        this.circlesStyle = OpenLayers.Util.extend({}, layerTempStyle);
        layerTempStyle.strokeColor = "#00ff00";
        this.intersectionsStyle = OpenLayers.Util.extend({}, layerTempStyle);
        this.intersectionsSelectStyle = OpenLayers.Util.extend({},
            this.layer.styleMap.createSymbolizer(null, "select")
        );

        options = options || {};
        OpenLayers.Control.prototype.initialize.apply(this, [options]);
        this.handlers = {
            // handler for drawing circle center
            setCenter: new OpenLayers.Handler.Point(
                this,
                {
                    create: function(vertex, feature) {
                        // used for snapping
                        this.layer.events.triggerEvent(
                            "sketchstarted", {vertex: vertex, feature: feature}
                        );
                    },
                    modify: function(vertex, feature) {
                        // used for snapping
                        this.layer.events.triggerEvent(
                            "sketchmodified", {vertex: vertex, feature: feature}
                        );
                    },
                    done: this.setCenter
                }
            ),
            // handler for creating new feature from intersection
            intersectionFeature: new OpenLayers.Handler.Feature(
                this, this.layer, OpenLayers.Util.extend({
                    over: this.onIntersectionOver,
                    out: this.onIntersectionOut,
                    click: this.onIntersectionClick
                }),
                {
                    geometryTypes: ["OpenLayers.Geometry.Point"]
                }
            )
        };
        this.virtualFeatures = [];
        this.circles = [
            {
                center: null,
                radius: null
            },
            {
                center: null,
                radius: null
            }
        ];
        this.circleReplaceIndex = 0;
    },

    /**
     * APIMethod: destroy
     * Take care of things that are not handled in superclass.
     */
    destroy: function() {
        if (this.active) {
            this.deactivate();
        }
        this.layer = null;
        this.circles = [];
        OpenLayers.Control.prototype.destroy.apply(this, arguments);
    },

    /**
     * APIMethod: activate
     * Activate the control.
     *
     * Returns:
     * {Boolean} Successfully activated the control.
     */
    activate: function() {
        return (this.handlers.setCenter.activate() &&
            this.handlers.intersectionFeature.activate() &&
            OpenLayers.Control.prototype.activate.apply(this, arguments));
    },

    /**
     * APIMethod: deactivate
     * Deactivate the control.
     *
     * Returns:
     * {Boolean} Successfully deactivated the control.
     */
    deactivate: function() {
        var deactivated = (this.handlers.setCenter.deactivate() &&
            this.handlers.intersectionFeature.deactivate() &&
            OpenLayers.Control.prototype.deactivate.apply(this, arguments));
        if (deactivated) {
            // reset features
            this.layer.destroyFeatures(this.virtualFeatures, {silent: true});
            this.virtualFeatures = [];
            // reset circles
            for (var i=0; i<this.circles.length; i++) {
                this.circles[i].center = null;
            }
        }
        return deactivated;
    },

    /**
     * Method: setMap
     * Set the map property for the control and all handlers.
     *
     * Parameters:
     * map - {<OpenLayers.Map>} The control's map.
     */
    setMap: function(map) {
        this.handlers.setCenter.setMap(map);
        this.handlers.intersectionFeature.setMap(map);
        OpenLayers.Control.prototype.setMap.apply(this, arguments);
    },

    /**
     * APIMethod: setCenter
     * Set center of next circle. Replace oldest circle if there are two circles.
     *
     * Parameters:
     * geometry - {<OpenLayers.Geometry.Point>} Center of circle
     */
    setCenter: function(geometry) {
        // replace oldest circle
        this.circles[this.circleReplaceIndex].center = geometry;
        this.circleReplaceIndex = (this.circleReplaceIndex + 1) % 2;
        this.updateIntersection();
    },

    /**
     * APIMethod: setRadius
     * Set radius of circle at index.
     *
     * Parameters:
     * circleIndex - {Integer} Circle index (0 or 1)
     * radius - {Float} Radius of circle in map units
     */
    setRadius: function(circleIndex, radius) {
        if (circleIndex >= 0 && circleIndex < this.circles.length) {
            this.circles[circleIndex].radius = radius;
            this.updateIntersection();
        }
    },

    /**
     * Method: updateIntersection
     * Calculate and show current circle intersections.
     */
    updateIntersection: function() {
        this.updateCircles();

        // valid circles?
        for (var i=0; i<this.circles.length; i++) {
            var circle = this.circles[i];
            if (circle.center == null || circle.radius == null) {
                // less than two circles defined
                return;
            }
        }

        // calculate intersection points
        var x0 = this.circles[0].center.x;
        var y0 = this.circles[0].center.y;
        var r0 = this.circles[0].radius;
        var x1 = this.circles[1].center.x;
        var y1 = this.circles[1].center.y;
        var r1 = this.circles[1].radius;

        var dx = x1 - x0;
        var dy = y1 - y0;
        var d_sq = dx * dx + dy * dy;

        if ( (d_sq > 0) && (d_sq <= (r0 + r1) * (r0 + r1)) && (d_sq >= (r0 - r1) * (r0 - r1)) ) {
            // circles do intersect
            var d = Math.sqrt(d_sq);
            var a = (r0 * r0 - r1 * r1 + d_sq) / (2.0 * d);
            var x2 = x0 + a * dx / d;
            var y2 = y0 + a * dy / d;
            var h = Math.sqrt(r0 * r0 - a * a);
            var rx = h * dy / d;
            var ry = -h * dx / d;

            // add intersection features
            var intersections = [];
            intersections.push(new OpenLayers.Geometry.Point(x2 + rx, y2 + ry));
            intersections.push(new OpenLayers.Geometry.Point(x2 - rx, y2 - ry));
            for (var i=0; i<intersections.length; i++) {
                var intersectionFeature = new OpenLayers.Feature.Vector(
                    intersections[i],
                    null,
                    this.intersectionsStyle
                );
                // mark as intersection point
                intersectionFeature._intersection = true;
                this.virtualFeatures.push(intersectionFeature);
                this.layer.addFeatures([intersectionFeature], {silent: true});
            }
        }
    },

    /**
     * Method: updateCircles
     * Show current circles as features.
     */
    updateCircles: function() {
        // cleanup temp features
        this.layer.destroyFeatures(this.virtualFeatures, {silent: true});
        this.virtualFeatures = [];

        // create and add circle features
        for (var i=0; i<this.circles.length; i++) {
            var circle = this.circles[i];
            if (circle.center != null && circle.radius != null) {
                var circleFeature = new OpenLayers.Feature.Vector(
                    new OpenLayers.Geometry.Polygon.createRegularPolygon(circle.center, circle.radius, 120, 0),
                    null,
                    this.circlesStyle
                );
                // mark as temporary
                circleFeature._sketch = true;
                this.virtualFeatures.push(circleFeature);

                var centerFeature = new OpenLayers.Feature.Vector(
                    circle.center,
                    null,
                    this.circlesStyle
                );
                // mark as temporary
                centerFeature._sketch = true;
                this.virtualFeatures.push(centerFeature);
            }
        }

        this.layer.addFeatures(this.virtualFeatures, {silent: true});
    },

    /**
     * Method: onIntersectionOver
     * Highlight intersection feature on hover.
     */
    onIntersectionOver: function(feature) {
        if (feature._intersection) {
            // highlight
            this.layer.drawFeature(feature, this.intersectionsSelectStyle);
        }
    },

    /**
     * Method: onIntersectionOut
     * Remove highlight of intersection feature on move out.
     */
    onIntersectionOut: function(feature) {
        if (feature._intersection) {
            // remove highlight
            this.layer.drawFeature(feature, this.intersectionsStyle);
        }
    },

    /**
     * Method: onIntersectionClick
     * Add new point feature at intersection point when clicking on intersection
     * feature.
     */
    onIntersectionClick: function(feature) {
        if (feature._intersection) {
            // create and add new point feature at intersection
            var newFeature = new OpenLayers.Feature.Vector(feature.geometry.clone());
            newFeature.state = OpenLayers.State.INSERT;
            this.layer.addFeatures([newFeature]);
            this.events.triggerEvent("featureadded",{feature : newFeature});
        }
    },

    CLASS_NAME: "OpenLayers.Control.ArcIntersection"
});
