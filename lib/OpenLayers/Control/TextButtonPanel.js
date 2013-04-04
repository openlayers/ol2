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
     * Property: vertical
     * {Boolean}
     */
    vertical: false,

    additionalClass: null,

    /**
     * Constructor: OpenLayers.Control.TextButtonPanel
     * Create a panel for holding text-based button controls
     *
     * Parameters:
     * options - {Object}
     */
    initialize: function(options) {
        OpenLayers.Control.Panel.prototype.initialize.apply(this, [options]);
    },

    /**
     * Method: onButtonClick
     *
     * Parameters:
     * evt - {Event}
     */
    onButtonClick: function (evt) {
        var controls = this.controls,
            button = evt.buttonElement;
        for (var i=controls.length-1; i>=0; --i) {
            var control = controls[i];
            if (control.panel_div === button) {
                this.activateControl(control);
                if (control.text) {
                    button.innerHTML = control.text;
                }
                break;
            }
        }
    },

    /**
     * APIMethod: createControlMarkup
     * This function overrides the default createControlMarkup in
     * <OpenLayers.Control.Panel> by adding a control's text (if any) to the
     * created div.
     *
     * Parameters:
     * control - {<OpenLayers.Control>} The control to create the HTML
     *     markup for.
     *
     * Returns:
     * {DOMElement} The markup.
     */
    createControlMarkup: function(control) {
        var div = document.createElement("div");
        if (control.text) {
            div.innerHTML = control.text;
        }
        return div;
    },

    /**
     * Method: draw
     *
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
     */
    redraw: function() {
        OpenLayers.Control.Panel.prototype.redraw.apply(this, arguments);
        this.setOrientationClass();
    },

    /**
     * Method: setOrientationClass
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
