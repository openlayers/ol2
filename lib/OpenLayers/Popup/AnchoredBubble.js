/* Copyright (c) 2006-2011 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the Clear BSD license.  
 * See http://svn.openlayers.org/trunk/openlayers/license.txt for the
 * full text of the license. */


/**
 * @requires OpenLayers/Popup/Anchored.js
 */

/**
 * Class: OpenLayers.Popup.AnchoredBubble
 * 
 * Inherits from: 
 *  - <OpenLayers.Popup.Anchored>
 */
OpenLayers.Popup.AnchoredBubble = 
  OpenLayers.Class(OpenLayers.Popup.Anchored, {

    /**
     * Property: rounded
     * {Boolean} Has the popup been rounded yet?
     */
    rounded: false, 
    
    /** 
     * Constructor: OpenLayers.Popup.AnchoredBubble
     * 
     * Parameters:
     * id - {String}
     * lonlat - {<OpenLayers.LonLat>}
     * contentSize - {<OpenLayers.Size>}
     * contentHTML - {String}
     * anchor - {Object} Object to which we'll anchor the popup. Must expose 
     *     a 'size' (<OpenLayers.Size>) and 'offset' (<OpenLayers.Pixel>) 
     *     (Note that this is generally an <OpenLayers.Icon>).
     * closeBox - {Boolean}
     * closeBoxCallback - {Function} Function to be called on closeBox click.
     */
    initialize:function(id, lonlat, contentSize, contentHTML, anchor, closeBox,
                        closeBoxCallback) {
        
        this.padding = new OpenLayers.Bounds(
            0, OpenLayers.Popup.AnchoredBubble.CORNER_SIZE,
            0, OpenLayers.Popup.AnchoredBubble.CORNER_SIZE
        );
        OpenLayers.Popup.Anchored.prototype.initialize.apply(this, arguments);
    },

    /** 
     * Method: draw
     * 
     * Parameters:
     * px - {<OpenLayers.Pixel>}
     * 
     * Returns:
     * {DOMElement} Reference to a div that contains the drawn popup.
     */
    draw: function(px) {
        
        OpenLayers.Popup.Anchored.prototype.draw.apply(this, arguments);

        this.setContentHTML();
        
        //set the popup color and opacity           
        this.setBackgroundColor(); 
        this.setOpacity();

        return this.div;
    },

    /**
     * Method: updateRelativePosition
     * The popup has been moved to a new relative location.
     */
    updateRelativePosition: function() {
    },

    /**
     * APIMethod: setSize
     * 
     * Parameters:
     * contentSize - {<OpenLayers.Size>} the new size for the popup's 
     *     contents div (in pixels).
     */
    setSize:function(contentSize) { 
        OpenLayers.Popup.Anchored.prototype.setSize.apply(this, arguments);
    },  

    /**
     * APIMethod: setBackgroundColor
     * 
     * Parameters:
     * color - {String}
     */
    setBackgroundColor:function(color) { 
        if (color != undefined) {
            this.backgroundColor = color; 
        }
        
        if (this.div != null && this.contentDiv != null) {
            this.div.style.background = "transparent";
        }
    },  
    
    /**
     * APIMethod: setOpacity
     * 
     * Parameters: 
     * opacity - {float}
     */
    setOpacity:function(opacity) { 
        OpenLayers.Popup.Anchored.prototype.setOpacity.call(this, opacity);
    },  
 
    /** 
     * Method: setBorder
     * Always sets border to 0. Bubble Popups can not have a border.
     * 
     * Parameters:
     * border - {Integer}
     */
    setBorder:function(border) { 
        this.border = 0;
    },      

    CLASS_NAME: "OpenLayers.Popup.AnchoredBubble"
});

/**
 * Constant: CORNER_SIZE
 * {Integer} 5. Border space for the RICO corners.
 */
OpenLayers.Popup.AnchoredBubble.CORNER_SIZE = 5;

