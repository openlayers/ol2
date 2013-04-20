/* Copyright (c) 2006-2013 by OpenLayers Contributors (see authors.txt for
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */


/**
 * @requires OpenLayers/Popup.js
 */

/**
 * Class: OpenLayers.Popup.Anchored
 * 
 * Inherits from:
 *  - <OpenLayers.Popup>
 */
OpenLayers.Popup.Anchored = 
  OpenLayers.Class(OpenLayers.Popup, {

    /** 
     * Property: relativePosition
     * {String} Relative position of the popup ("br", "tr", "tl" or "bl").
     */
    relativePosition: null,
    
    /**
     * APIProperty: keepInMap 
     * {Boolean} If panMapIfOutOfView is false, and this property is true, 
     *     contrain the popup such that it always fits in the available map
     *     space. By default, this is set. If you are creating popups that are
     *     near map edges and not allowing pannning, and especially if you have
     *     a popup which has a fixedRelativePosition, setting this to false may
     *     be a smart thing to do.
     *   
     *     For anchored popups, default is true, since subclasses will
     *     usually want this functionality.
     */
    keepInMap: true,

    /**
     * Property: anchor
     * {Object} Object to which we'll anchor the popup. Must expose a 
     *     'size' (<OpenLayers.Size>) and 'offset' (<OpenLayers.Pixel>).
     */
    anchor: null,

    /** 
    * Constructor: OpenLayers.Popup.Anchored
    * 
    * Parameters:
    * id - {String}
    * lonlat - {<OpenLayers.LonLat>}
    * contentSize - {<OpenLayers.Size>}
    * contentHTML - {String}
    * anchor - {Object} Object which must expose a 'size' <OpenLayers.Size> 
    *     and 'offset' <OpenLayers.Pixel> (generally an <OpenLayers.Icon>).
    * closeBox - {Boolean}
    * closeBoxCallback - {Function} Function to be called on closeBox click.
    */
    initialize:function(id, lonlat, contentSize, contentHTML, anchor, closeBox,
                        closeBoxCallback) {
        var newArguments = [
            id, lonlat, contentSize, contentHTML, closeBox, closeBoxCallback
        ];
        OpenLayers.Popup.prototype.initialize.apply(this, newArguments);

        this.anchor = (anchor != null) ? anchor 
                                       : { size: new OpenLayers.Size(0,0),
                                           offset: new OpenLayers.Pixel(0,0)};
    },

    /**
     * APIMethod: destroy
     */
    destroy: function() {
        this.anchor = null;
        this.relativePosition = null;
        
        OpenLayers.Popup.prototype.destroy.apply(this, arguments);        
    },

    /**
     * APIMethod: show
     * Overridden from Popup since user might hide popup and then show() it 
     *     in a new location (meaning we might want to update the relative
     *     position on the show)
     */
    show: function() {
        this.updatePosition();
        OpenLayers.Popup.prototype.show.apply(this, arguments);
    },

    /**
     * Method: moveTo
     * Since the popup is moving to a new px, it might need also to be moved
     *     relative to where the marker is. We first calculate the new 
     *     relativePosition, and then we calculate the new px where we will 
     *     put the popup, based on the new relative position. 
     * 
     *     If the relativePosition has changed, we must also call 
     *     updateRelativePosition() to make any visual changes to the popup 
     *     which are associated with putting it in a new relativePosition.
     * 
     * Parameters:
     * px - {<OpenLayers.Pixel>}
     */
    moveTo: function(px) {
        var oldRelativePosition = this.relativePosition;
        this.relativePosition = this.calculateRelativePosition(px);

        OpenLayers.Popup.prototype.moveTo.call(this, this.calculateNewPx(px));
        
        //if this move has caused the popup to change its relative position, 
        // we need to make the appropriate cosmetic changes.
        if (this.relativePosition != oldRelativePosition) {
            this.updateRelativePosition();
        }
    },

    /**
     * APIMethod: setSize
     * 
     * Parameters:
     * contentSize - {<OpenLayers.Size>} the new size for the popup's 
     *     contents div (in pixels).
     */
    setSize:function(contentSize) { 
        OpenLayers.Popup.prototype.setSize.apply(this, arguments);

        if ((this.lonlat) && (this.map)) {
            var px = this.map.getLayerPxFromLonLat(this.lonlat);
            this.moveTo(px);
        }
    },  
    
    /** 
     * Method: calculateRelativePosition
     * 
     * Parameters:
     * px - {<OpenLayers.Pixel>}
     * 
     * Returns:
     * {String} The relative position ("br" "tr" "tl" "bl") at which the popup
     *     should be placed.
     */
    calculateRelativePosition:function(px) {
        var lonlat = this.map.getLonLatFromLayerPx(px);        
        
        var extent = this.map.getExtent();
        var quadrant = extent.determineQuadrant(lonlat);
        
        return OpenLayers.Bounds.oppositeQuadrant(quadrant);
    }, 

    /**
     * Method: updateRelativePosition
     * The popup has been moved to a new relative location, so we may want to 
     *     make some cosmetic adjustments to it. 
     * 
     *     Note that in the classic Anchored popup, there is nothing to do 
     *     here, since the popup looks exactly the same in all four positions.
     *     Subclasses such as Framed, however, will want to do something
     *     special here.
     */
    updateRelativePosition: function() {
        //to be overridden by subclasses
    },

    /** 
     * Method: calculateNewPx
     * 
     * Parameters:
     * px - {<OpenLayers.Pixel>}
     * 
     * Returns:
     * {<OpenLayers.Pixel>} The the new px position of the popup on the screen
     *     relative to the passed-in px.
     */
    calculateNewPx:function(px) {
        var newPx = px.offset(this.anchor.offset);
        
        //use contentSize if size is not already set
        var size = this.size || this.contentSize;

        var top = (this.relativePosition.charAt(0) == 't');
        newPx.y += (top) ? -size.h : this.anchor.size.h;
        
        var left = (this.relativePosition.charAt(1) == 'l');
        newPx.x += (left) ? -size.w : this.anchor.size.w;

        return newPx;   
    },

    CLASS_NAME: "OpenLayers.Popup.Anchored"
});
