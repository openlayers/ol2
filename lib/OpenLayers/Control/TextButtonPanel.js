/* Copyright (c) 2006-2012 by OpenLayers Contributors (see authors.txt for
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

/**
 * @requires OpenLayers/Control/Panel.js
 */

/**
 * Class: OpenLayers.Control.TextButtonPanel
 * The TextButtonPanel is a panel designed primarily to hold TextButton
 * controls.  By default it has a displayClass of olControlTextButtonPanel,
 * which hooks it to a set of text-appropriate styles in the default stylesheet.
 *
 * Inherits from:
 *  - <OpenLayers.Control.Panel>
 */
OpenLayers.Control.TextButtonPanel = OpenLayers.Class(
  OpenLayers.Control.Panel, {

    /**
     * APIProperty: vertical
     * {Boolean} Whether the button strip should appear vertically on the map.
     */
    vertical: false,

    /**
     * APIProperty: additionalClass
     * {String} An additional class to be applied in addition to
     * .olControlTextButtonPanel to allow for non-default positioning.
     */
    additionalClass: null,

    /**
     * Constructor: OpenLayers.Control.TextButtonPanel
     * Create a panel for holding text-based button controls
     *
     * Parameters:
     * options - {Object}
     */

    /**
     * Method: draw
     * Overrides the draw method in <OpenLayers.Control.Panel> by applying
     * up to two additional CSS classes
     * Returns:
     * {DOMElement}
     */
    draw: function() {
        OpenLayers.Control.Panel.prototype.draw.apply(this, arguments);
        this.setOrientationClass();
        this.setAdditionalClass();
        return this.div;
    },

    /**
     * Method: redraw
     * Overrides the redraw method in <OpenLayers.Control.Panel> by setting
     * the orientation class.
     */
    redraw: function() {
        OpenLayers.Control.Panel.prototype.redraw.apply(this, arguments);
        this.setOrientationClass();
    },

    /**
     * Method: setOrientationClass
     * Adds the "vertical" class if this TextButtonPanel should have a vertical,
     * rather than horizontal, layout.
     */
    setOrientationClass: function() {
        if (this.vertical) {
            OpenLayers.Element.addClass(this.div, "vertical");
        }
        else {
            OpenLayers.Element.removeClass(this.div, "vertical");
        }
    },
    
    /**
     * APIMethod: setAdditionalClass
     * Sets an additional CSS class for this TextButtonPanel
     * (for example, to override the default placement).  This
     * allows more than one TextButtonPanel to exist on the map
     * at once.
     */
    setAdditionalClass: function() {
        if (!!this.additionalClass) {
            OpenLayers.Element.addClass(this.div, this.additionalClass);
        }
    },

    CLASS_NAME: "OpenLayers.Control.TextButtonPanel"
});
