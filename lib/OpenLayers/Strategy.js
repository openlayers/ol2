/* Copyright (c) 2006-2011 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the Clear BSD license.  
 * See http://svn.openlayers.org/trunk/openlayers/license.txt for the
 * full text of the license. */

/**
 * @requires OpenLayers/BaseTypes/Class.js
 */

/**
 * Class: OpenLayers.Strategy
 * Abstract vector layer strategy class.  Not to be instantiated directly.  Use
 *     one of the strategy subclasses instead.
 */
OpenLayers.Strategy = OpenLayers.Class({

    /**
     * Register a listener for a particular event with the following syntax:
     * (code)
     * strategy.events.register(type, obj, listener);
     * (end)
     *
     * Supported event types:
     *  - *success* Triggered after a successful transaction
     *  - *fail* Triggered after a failed transaction
     */

    /**
     * APIProperty: events
     * {<OpenLayers.Events>} Events instance for triggering this protocol
     *    events.
     */
    events: null,

    /**
     * APIProperty: eventListeners
     * {Object} If set as an option at construction, the eventListeners
     *     object will be registered with <OpenLayers.Events.on>.  Object
     *     structure must be a listeners object as shown in the example for
     *     the events.on method.
     */
    eventListeners: null,

    /**
     * Property: layer
     * {<OpenLayers.Layer.Vector>} The layer this strategy belongs to.
     */
    layer: null,
    
    /**
     * Property: options
     * {Object} Any options sent to the constructor.
     */
    options: null,

    /** 
     * Property: active 
     * {Boolean} The control is active.
     */
    active: null,

    /**
     * Property: autoActivate
     * {Boolean} The creator of the strategy can set autoActivate to false
     *      to fully control when the protocol is activated and deactivated.
     *      Defaults to true.
     */
    autoActivate: true,

    /**
     * Property: autoDestroy
     * {Boolean} The creator of the strategy can set autoDestroy to false
     *      to fully control when the strategy is destroyed. Defaults to
     *      true.
     */
    autoDestroy: true,

    /**
     * Constructor: OpenLayers.Strategy
     * Abstract class for vector strategies.  Create instances of a subclass.
     *
     * Parameters:
     * options - {Object} Optional object whose properties will be set on the
     *     instance.
     */
    initialize: function(options) {
        OpenLayers.Util.extend(this, options);
        this.options = options;
        // set the active property here, so that user cannot override it
        this.active = false;

        this.events = new OpenLayers.Events(this);
        if (this.eventListeners instanceof Object) {
            this.events.on(this.eventListeners);
        }
    },
    
    /**
     * APIMethod: destroy
     * Clean up the strategy.
     */
    destroy: function() {
        this.deactivate();
        this.layer = null;
        this.options = null;
    },

    /**
     * Method: setLayer
     * Called to set the <layer> property.
     *
     * Parameters:
     * {<OpenLayers.Layer.Vector>}
     */
    setLayer: function(layer) {
        this.layer = layer;
    },
    
    /**
     * Method: activate
     * Activate the strategy.  Register any listeners, do appropriate setup.
     *
     * Returns:
     * {Boolean} True if the strategy was successfully activated or false if
     *      the strategy was already active.
     */
    activate: function() {
        if (!this.active) {
            this.active = true;
            return true;
        }
        return false;
    },
    
    /**
     * Method: deactivate
     * Deactivate the strategy.  Unregister any listeners, do appropriate
     *     tear-down.
     *
     * Returns:
     * {Boolean} True if the strategy was successfully deactivated or false if
     *      the strategy was already inactive.
     */
    deactivate: function() {
        if (this.active) {
            this.active = false;
            return true;
        }
        return false;
    },
   
    CLASS_NAME: "OpenLayers.Strategy" 
});
