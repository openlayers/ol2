/* Copyright (c) 2006-2012 by OpenLayers Contributors (see authors.txt for
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

/**
 * @requires OpenLayers/Control.js
 * @requires OpenLayers/Feature/Vector.js
 * @requires OpenLayers/Geometry/LineString.js
 * @requires OpenLayers/Geometry/Point.js
 * @requires OpenLayers/Handler/Feature.js
 * @requires OpenLayers/Handler/Point.js
 */

/**
 * Class: OpenLayers.Control.OrthogonalLines
 * Construct orthogonal lines by defining a base line with two points, a
 * distance from the first point along the base line (abscissa) and a distance
 * perpendicular to the base line (ordinate).
 *
 * Inherits from:
 *  - <OpenLayers.Control>
 */
OpenLayers.Control.OrthogonalLines = OpenLayers.Class(OpenLayers.Control, {

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
     * {Array(<OpenLayers.Feature.Vector>)} Virtual features for base points,
     *     base line and orthogonal lines
     */
    virtualFeatures: null,

    /**
     * Property: basePoints
     * {Array(<OpenLayers.Geometry.Point>)} Positions for the two base points
     */
    basePoints: null,

    /**
     * APIProperty: baseFeaturesStyle
     * {Object} A symbolizer to be used for base points and base line. Default
     *     is the layer's temporary style.
     */
    baseFeaturesStyle: null,

    /**
     * APIProperty: orthogonalLinesStyle
     * {Object} A symbolizer to be used for the orthogonal lines. Default is the
     *     layer's temporary style with green stroke color.
     */
    orthogonalLinesStyle: null,

    /**
     * APIProperty: orthogonalLinesSelectStyle
     * {Object} A symbolizer to be used for highlighting the orthogonal lines.
     *     Default is the layer's select style.
     */
    orthogonalLinesSelectStyle: null,

    /**
     * Constructor: OpenLayers.Control.OrthogonalLines
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
        this.baseFeaturesStyle = OpenLayers.Util.extend({}, layerTempStyle);
        layerTempStyle.strokeColor = "#00ff00";
        this.orthogonalLinesStyle = OpenLayers.Util.extend({}, layerTempStyle);
        this.orthogonalLinesSelectStyle = OpenLayers.Util.extend({},
            this.layer.styleMap.createSymbolizer(null, "select")
        );

        options = options || {};
        OpenLayers.Control.prototype.initialize.apply(this, [options]);
        this.handlers = {
            // handler for drawing points for base line
            setBasePoint: new OpenLayers.Handler.Point(
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
                    done: this.setBasePoint
                }
            ),
            // handler for creating new feature from intersection
            orthogonalLinesFeature: new OpenLayers.Handler.Feature(
                this, this.layer, OpenLayers.Util.extend({
                    over: this.onOrthogonalLinesOver,
                    out: this.onOrthogonalLinesOut,
                    click: this.onOrthogonalLinesClick
                }),
                {
                    geometryTypes: ["OpenLayers.Geometry.LineString"]
                }
            )
        };
        this.virtualFeatures = [];
        this.basePoints = [];
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
        this.basePoints = [];
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
        return (this.handlers.setBasePoint.activate() &&
            this.handlers.orthogonalLinesFeature.activate() &&
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
        var deactivated = this.handlers.setBasePoint.deactivate() &&
            this.handlers.orthogonalLinesFeature.deactivate() &&
            OpenLayers.Control.prototype.deactivate.apply(this, arguments);
        if (deactivated) {
            // reset temp features
            this.layer.destroyFeatures(this.virtualFeatures, {silent: true});
            this.virtualFeatures = [];
            // reset base points
            this.basePoints = [];
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
        this.handlers.setBasePoint.setMap(map);
        this.handlers.orthogonalLinesFeature.setMap(map);
        OpenLayers.Control.prototype.setMap.apply(this, arguments);
    },

    /**
     * APIMethod: setBasePoint
     * Set position of base point. Remove oldest base point if there are more
     * than two base points.
     *
     * Parameters:
     * geometry - {<OpenLayers.Geometry.Point>} Position of base point
     */
    setBasePoint: function(geometry) {
        // add new base point
        this.basePoints.push(geometry);
        if (this.basePoints.length > 2) {
            // remove oldest base point
            this.basePoints.shift();
        }
        this.updateConstruction();
    },

    /**
     * APIMethod: setAbscissa
     * Set distance along the base line. Direction is from first to second base
     * point.
     *
     * Parameters:
     * abscissa - {Float} Distance in map units, zero and negative values allowed
     */
    setAbscissa: function(abscissa) {
        this.abscissa = abscissa;
        this.updateConstruction();
    },

    /**
     * APIMethod: setOrdinate
     * Set distance perpendicular to the base line. Direction is on the
     * left-hand side of the base line from first to second base point.
     *
     * Parameters:
     * ordinate - {Float} Distance in map units, zero and negative values allowed
     */
    setOrdinate: function(ordinate) {
        this.ordinate = ordinate;
        this.updateConstruction();
    },

    /**
     * Method: updateConstruction
     * Calculate and show current orthogonal lines.
     */
    updateConstruction: function() {
        this.updateTempFeatures();

        // valid base points, abscissa and ordinate?
        if (this.basePoints.length < 2 || (this.abscissa == 0 && this.ordinate == 0)) {
            return;
        }

        // calculate orthogonal lines
        // P0
        var x0 = this.basePoints[0].x;
        var y0 = this.basePoints[0].y;
        // P1
        var x1 = this.basePoints[1].x;
        var y1 = this.basePoints[1].y;

        var dx = x1 - x0;
        var dy = y1 - y0;
        if (dx == 0 && dy == 0) {
            // base points identical
            return;
        }
        var d = Math.sqrt(dx * dx + dy * dy);
        // vector
        var vx = dx / d;
        var vy = dy / d;
        // normal vector
        var nx = -vy;
        var ny = vx;

        // P2
        var x2 = x0 + this.abscissa * vx;
        var y2 = y0 + this.abscissa * vy;
        // P3
        var x3 = x2 + this.ordinate * nx;
        var y3 = y2 + this.ordinate * ny;

        // create line string with points P0, P2, P3
        var points = [new OpenLayers.Geometry.Point(x0, y0)];
        if (this.abscissa != 0) {
            points.push(new OpenLayers.Geometry.Point(x2, y2));
        }
        if (this.ordinate != 0) {
            points.push(new OpenLayers.Geometry.Point(x3, y3));
        }
        if (points.length >= 2) {
            // add line feature
            var orthogonalLinesFeature = new OpenLayers.Feature.Vector(
                new OpenLayers.Geometry.LineString(points),
                null,
                this.orthogonalLinesStyle
            );
            // mark as orthogonal lines
            orthogonalLinesFeature._orthogonalLines = true;
            this.virtualFeatures.push(orthogonalLinesFeature);
            this.layer.addFeatures([orthogonalLinesFeature], {silent: true});
        }
    },

    /**
     * Method: updateTempFeatures
     * Show base points and base line as features.
     */
    updateTempFeatures: function() {
        // cleanup temp features
        this.layer.destroyFeatures(this.virtualFeatures, {silent: true});
        this.virtualFeatures = [];

        // create and add temp features
        for (var i=0; i<this.basePoints.length; i++) {
            var basePointFeature = new OpenLayers.Feature.Vector(
                this.basePoints[i],
                null,
                this.baseFeaturesStyle
            );
            // mark as temporary
            basePointFeature._sketch = true;
            this.virtualFeatures.push(basePointFeature);
        }
        if (this.basePoints.length == 2) {
            var baseLineFeature = new OpenLayers.Feature.Vector(
                new OpenLayers.Geometry.LineString(this.basePoints),
                null,
                this.baseFeaturesStyle
            );
            // mark as temporary
            baseLineFeature._sketch = true;
            this.virtualFeatures.push(baseLineFeature);
        }

        this.layer.addFeatures(this.virtualFeatures, {silent: true});
    },

    /**
     * Method: onOrthogonalLinesOver
     * Highlight orthogonal lines feature on hover.
     */
    onOrthogonalLinesOver: function(feature) {
        if (feature._orthogonalLines) {
            // highlight
            this.layer.drawFeature(feature, this.orthogonalLinesSelectStyle);
        }
    },

    /**
     * Method: onOrthogonalLinesOut
     * Remove highlight of orthogonal lines feature on move out.
     */
    onOrthogonalLinesOut: function(feature) {
        if (feature._orthogonalLines) {
            // remove highlight
            this.layer.drawFeature(feature, this.orthogonalLinesStyle);
        }
    },

    /**
     * Method: onOrthogonalLinesClick
     * Add new line string feature when clicking on orthogonal lines feature.
     */
    onOrthogonalLinesClick: function(feature) {
        if (feature._orthogonalLines) {
            // create and add new line string feature
            var newFeature = new OpenLayers.Feature.Vector(feature.geometry.clone());
            newFeature.state = OpenLayers.State.INSERT;
            this.layer.addFeatures([newFeature]);
            this.events.triggerEvent("featureadded",{feature : newFeature});
        }
    },

    CLASS_NAME: "OpenLayers.Control.OrthogonalLines"
});
