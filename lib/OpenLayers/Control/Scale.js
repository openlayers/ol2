/* Copyright (c) 2006-2012 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */


/**
 * @requires OpenLayers/Control.js
 * @requires OpenLayers/Lang.js
 */

/**
 * Class: OpenLayers.Control.Scale
 * The Scale control displays the current map scale as a ratio (e.g. Scale = 
 * 1:1M). By default it is displayed in the lower right corner of the map.
 *
 * Inherits from:
 *  - <OpenLayers.Control>
 */
OpenLayers.Control.Scale = OpenLayers.Class(OpenLayers.Control, {
    
    /**
     * Property: element
     * {DOMElement}
     */
    element: null,
    
    /**
     * APIProperty: geodesic
     * {Boolean} Use geodesic measurement. Default is false. The recommended
     * setting for maps in EPSG:4326 is false, and true EPSG:900913. If set to
     * true, the scale will be calculated based on the horizontal size of the
     * pixel in the center of the map viewport.
     */
    geodesic: false,

    /**
     * Constructor: OpenLayers.Control.Scale
     * 
     * Parameters:
     * element - {String|DOMElement} 
     * options - {Object} 
     */
    initialize: function(element, options) {
        OpenLayers.Control.prototype.initialize.apply(this, [options]);
        this.element = OpenLayers.Util.getElement(element);        
    },

    /**
     * Method: draw
     * Create the HTML markup for this control.
     *
     * Parameters: 
     * px - {<OpenLayers.Pixel>} The top-left position of the 
     *     container div.
     *
     * Returns: 
     * {DOMElement} The container div. 
     */
    draw: function() {
        OpenLayers.Control.prototype.draw.apply(this, arguments);
        var elementInViewport = false;
        if (!this.element) {
            this.element = document.createElement("div");
            this.div.appendChild(this.element);
            elementInViewport = true;
        }
        this.map.events.register( 'moveend', this, this.updateScale);
        this.updateScale();
        if (elementInViewport) {
            return this.div;
        }
    },
   
    /**
     * Method: updateScale
     */
    updateScale: function() {
        var scale;
        if(this.geodesic === true) {
            var units = this.map.getUnits();
            if(!units) {
                return;
            }
            var inches = OpenLayers.INCHES_PER_UNIT;
            scale = (this.map.getGeodesicPixelSize().w || 0.000001) *
                    inches["km"] * OpenLayers.DOTS_PER_INCH;
        } else {
            scale = this.map.getScale();
        }
            
        if (!scale) {
            return;
        }

        if (scale >= 9500 && scale <= 950000) {
            scale = Math.round(scale / 1000) + "K";
        } else if (scale >= 950000) {
            scale = Math.round(scale / 1000000) + "M";
        } else {
            scale = Math.round(scale);
        }    
        
        this.element.innerHTML = OpenLayers.i18n("Scale = 1 : ${scaleDenom}", {'scaleDenom':scale});
    }, 

    CLASS_NAME: "OpenLayers.Control.Scale"
});

