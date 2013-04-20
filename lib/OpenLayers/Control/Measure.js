/* Copyright (c) 2006-2013 by OpenLayers Contributors (see authors.txt for
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

/**
 * @requires OpenLayers/Control.js
 * @requires OpenLayers/Feature/Vector.js
 */

/**
 * Class: OpenLayers.Control.Measure
 * Allows for drawing of features for measurements.
 *
 * Inherits from:
 *  - <OpenLayers.Control>
 */
OpenLayers.Control.Measure = OpenLayers.Class(OpenLayers.Control, {

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
     * measure - Triggered when a measurement sketch is complete.  Listeners
     *      will receive an event with measure, units, order, and geometry
     *      properties.
     * measurepartial - Triggered when a new point is added to the
     *      measurement sketch or if the <immediate> property is true and the
     *      measurement sketch is modified.  Listeners receive an event with measure,
     *      units, order, and geometry.
     */

    /**
     * APIProperty: handlerOptions
     * {Object} Used to set non-default properties on the control's handler
     */

    /**
     * Property: callbacks
     * {Object} The functions that are sent to the handler for callback
     */
    callbacks: null,

    /**
     * APIProperty: displaySystem
     * {String} Display system for output measurements.  Supported values
     *     are 'english', 'metric', and 'geographic'.  Default is 'metric'.
     */
    displaySystem: 'metric',

    /**
     * APIProperty: geodesic
     * {Boolean} Calculate geodesic metrics instead of planar metrics.  This
     *     requires that geometries can be transformed into Geographic/WGS84
     *     (if that is not already the map projection).  Default is false.
     */
    geodesic: false,

    /**
     * Property: displaySystemUnits
     * {Object} Units for various measurement systems.  Values are arrays
     *     of unit abbreviations (from OpenLayers.INCHES_PER_UNIT) in decreasing
     *     order of length.
     */
    displaySystemUnits: {
        geographic: ['dd'],
        english: ['mi', 'ft', 'in'],
        metric: ['km', 'm']
    },

    /**
     * Property: delay
     * {Number} Number of milliseconds between clicks before the event is
     *     considered a double-click.  The "measurepartial" event will not
     *     be triggered if the sketch is completed within this time.  This
     *     is required for IE where creating a browser reflow (if a listener
     *     is modifying the DOM by displaying the measurement values) messes
     *     with the dblclick listener in the sketch handler.
     */
    partialDelay: 300,

    /**
     * Property: delayedTrigger
     * {Number} Timeout id of trigger for measurepartial.
     */
    delayedTrigger: null,

    /**
     * APIProperty: persist
     * {Boolean} Keep the temporary measurement sketch drawn after the
     *     measurement is complete.  The geometry will persist until a new
     *     measurement is started, the control is deactivated, or <cancel> is
     *     called.
     */
    persist: false,

    /**
     * APIProperty: immediate
     * {Boolean} Activates the immediate measurement so that the "measurepartial"
     *     event is also fired once the measurement sketch is modified.
     *     Default is false.
     */
    immediate : false,

    /**
     * Constructor: OpenLayers.Control.Measure
     *
     * Parameters:
     * handler - {<OpenLayers.Handler>}
     * options - {Object}
     */
    initialize: function(handler, options) {
        OpenLayers.Control.prototype.initialize.apply(this, [options]);
        var callbacks = {done: this.measureComplete,
            point: this.measurePartial};
        if (this.immediate){
            callbacks.modify = this.measureImmediate;
        }
        this.callbacks = OpenLayers.Util.extend(callbacks, this.callbacks);

        // let the handler options override, so old code that passes 'persist'
        // directly to the handler does not need an update
        this.handlerOptions = OpenLayers.Util.extend(
            {persist: this.persist}, this.handlerOptions
        );
        this.handler = new handler(this, this.callbacks, this.handlerOptions);
    },

    /**
     * APIMethod: deactivate
     */
    deactivate: function() {
        this.cancelDelay();
        return OpenLayers.Control.prototype.deactivate.apply(this, arguments);
    },

    /**
     * APIMethod: cancel
     * Stop the control from measuring.  If <persist> is true, the temporary
     *     sketch will be erased.
     */
    cancel: function() {
        this.cancelDelay();
        this.handler.cancel();
    },

    /**
     * APIMethod: setImmediate
     * Sets the <immediate> property. Changes the activity of immediate
     * measurement.
     */
    setImmediate: function(immediate) {
        this.immediate = immediate;
        if (this.immediate){
            this.callbacks.modify = this.measureImmediate;
        } else {
            delete this.callbacks.modify;
        }
    },

    /**
     * Method: updateHandler
     *
     * Parameters:
     * handler - {Function} One of the sketch handler constructors.
     * options - {Object} Options for the handler.
     */
    updateHandler: function(handler, options) {
        var active = this.active;
        if(active) {
            this.deactivate();
        }
        this.handler = new handler(this, this.callbacks, options);
        if(active) {
            this.activate();
        }
    },

    /**
     * Method: measureComplete
     * Called when the measurement sketch is done.
     *
     * Parameters:
     * geometry - {<OpenLayers.Geometry>}
     */
    measureComplete: function(geometry) {
        this.cancelDelay();
        this.measure(geometry, "measure");
    },

    /**
     * Method: measurePartial
     * Called each time a new point is added to the measurement sketch.
     *
     * Parameters:
     * point - {<OpenLayers.Geometry.Point>} The last point added.
     * geometry - {<OpenLayers.Geometry>} The sketch geometry.
     */
    measurePartial: function(point, geometry) {
        this.cancelDelay();
        geometry = geometry.clone();
        // when we're wating for a dblclick, we have to trigger measurepartial
        // after some delay to deal with reflow issues in IE
        if (this.handler.freehandMode(this.handler.evt)) {
            // no dblclick in freehand mode
            this.measure(geometry, "measurepartial");
        } else {
            this.delayedTrigger = window.setTimeout(
                OpenLayers.Function.bind(function() {
                    this.delayedTrigger = null;
                    this.measure(geometry, "measurepartial");
                }, this),
                this.partialDelay
            );
        }
    },

    /**
     * Method: measureImmediate
     * Called each time the measurement sketch is modified.
     *
     * Parameters:
     * point - {<OpenLayers.Geometry.Point>} The point at the mouse position.
     * feature - {<OpenLayers.Feature.Vector>} The sketch feature.
     * drawing - {Boolean} Indicates whether we're currently drawing.
     */
    measureImmediate : function(point, feature, drawing) {
        if (drawing && !this.handler.freehandMode(this.handler.evt)) {
            this.cancelDelay();
            this.measure(feature.geometry, "measurepartial");
        }
    },

    /**
     * Method: cancelDelay
     * Cancels the delay measurement that measurePartial began.
     */
    cancelDelay: function() {
        if (this.delayedTrigger !== null) {
            window.clearTimeout(this.delayedTrigger);
            this.delayedTrigger = null;
        }
    },

    /**
     * Method: measure
     *
     * Parameters:
     * geometry - {<OpenLayers.Geometry>}
     * eventType - {String}
     */
    measure: function(geometry, eventType) {
        var stat, order;
        if(geometry.CLASS_NAME.indexOf('LineString') > -1) {
            stat = this.getBestLength(geometry);
            order = 1;
        } else {
            stat = this.getBestArea(geometry);
            order = 2;
        }
        this.events.triggerEvent(eventType, {
            measure: stat[0],
            units: stat[1],
            order: order,
            geometry: geometry
        });
    },

    /**
     * Method: getBestArea
     * Based on the <displaySystem> returns the area of a geometry.
     *
     * Parameters:
     * geometry - {<OpenLayers.Geometry>}
     *
     * Returns:
     * {Array([Float, String])}  Returns a two item array containing the
     *     area and the units abbreviation.
     */
    getBestArea: function(geometry) {
        var units = this.displaySystemUnits[this.displaySystem];
        var unit, area;
        for(var i=0, len=units.length; i<len; ++i) {
            unit = units[i];
            area = this.getArea(geometry, unit);
            if(area > 1) {
                break;
            }
        }
        return [area, unit];
    },

    /**
     * Method: getArea
     *
     * Parameters:
     * geometry - {<OpenLayers.Geometry>}
     * units - {String} Unit abbreviation
     *
     * Returns:
     * {Float} The geometry area in the given units.
     */
    getArea: function(geometry, units) {
        var area, geomUnits;
        if(this.geodesic) {
            area = geometry.getGeodesicArea(this.map.getProjectionObject());
            geomUnits = "m";
        } else {
            area = geometry.getArea();
            geomUnits = this.map.getUnits();
        }
        var inPerDisplayUnit = OpenLayers.INCHES_PER_UNIT[units];
        if(inPerDisplayUnit) {
            var inPerMapUnit = OpenLayers.INCHES_PER_UNIT[geomUnits];
            area *= Math.pow((inPerMapUnit / inPerDisplayUnit), 2);
        }
        return area;
    },

    /**
     * Method: getBestLength
     * Based on the <displaySystem> returns the length of a geometry.
     *
     * Parameters:
     * geometry - {<OpenLayers.Geometry>}
     *
     * Returns:
     * {Array([Float, String])}  Returns a two item array containing the
     *     length and the units abbreviation.
     */
    getBestLength: function(geometry) {
        var units = this.displaySystemUnits[this.displaySystem];
        var unit, length;
        for(var i=0, len=units.length; i<len; ++i) {
            unit = units[i];
            length = this.getLength(geometry, unit);
            if(length > 1) {
                break;
            }
        }
        return [length, unit];
    },

    /**
     * Method: getLength
     *
     * Parameters:
     * geometry - {<OpenLayers.Geometry>}
     * units - {String} Unit abbreviation
     *
     * Returns:
     * {Float} The geometry length in the given units.
     */
    getLength: function(geometry, units) {
        var length, geomUnits;
        if(this.geodesic) {
            length = geometry.getGeodesicLength(this.map.getProjectionObject());
            geomUnits = "m";
        } else {
            length = geometry.getLength();
            geomUnits = this.map.getUnits();
        }
        var inPerDisplayUnit = OpenLayers.INCHES_PER_UNIT[units];
        if(inPerDisplayUnit) {
            var inPerMapUnit = OpenLayers.INCHES_PER_UNIT[geomUnits];
            length *= (inPerMapUnit / inPerDisplayUnit);
        }
        return length;
    },

    CLASS_NAME: "OpenLayers.Control.Measure"
});
