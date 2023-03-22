/* Copyright (c) 2006-2013 by OpenLayers Contributors (see authors.txt for
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */


/**
 * @requires OpenLayers/Popup.js
 */

/**
 * Class: OpenLayers.Popup.SideAnchored
 *
 * Inherits from:
 *  - <OpenLayers.Popup>
 *
 * A subclass of Popup which anchors one of its sides at the given point,
 *     as opposed to one of its corners as OpenLayers.Popup.Anchored does.
 * Some CSS decorations are possible, giving this a look and feel
 *     reminiscent of ol3 and leaflet popups when forced to the top.
 */
OpenLayers.Popup.SideAnchored =
  OpenLayers.Class(OpenLayers.Popup, {

    /**
     * Property: relativePosition
     * {String} Relative position of the popup ("b", "t", "l" or "r").
     */
    relativePosition: null,

    /**
      * Property: validRelativePositions
      * {Array} Set of relative positions this pop-up can choose from.
      *     It defaults to ["b","t","l","r"] meaning that the pop-up
      *     can choose any of its sides. Less values will constrain
      *     the possibilities. In order to have a leaflet-like pop-up,
      *     set this to just ["t"].
      */
    validRelativePositions: ["b","t","l","r"],

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
                        closeBoxCallback, validRelativePositions) {
        var newArguments = [
            id, lonlat, contentSize, contentHTML, closeBox, closeBoxCallback
        ];
        OpenLayers.Popup.prototype.initialize.apply(this, newArguments);

        this.anchor = (anchor != null) ? anchor
                                       : { size: new OpenLayers.Size(0,0),
                                           offset: new OpenLayers.Pixel(0,0)};

        // Use CSS defaults instead of forcing a 0px border in the parent class
        this.border = null;

        if (validRelativePositions) {
            this.validRelativePositions = validRelativePositions;
        }
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
     * px - {<OpenLayers.Pixel>} The top-left position of the popup dif
     *
     * Returns:
     * {String} The relative position ("b" "t" "l" "r") at which the popup
     *     should be placed. The value returned will always be one of
     *     validRelativePositions.
     */
    calculateRelativePosition:function(px) {
        var maxDistance = Number.NEGATIVE_INFINITY;
        var centerPixel = this.map.getPixelFromLonLat( this.map.center );

        // Convert the pixel into lon-lat and back again into px
        //   so it can be compared to centerPixel.
        var lonlat = this.map.getLonLatFromLayerPx(px);
        var px = this.map.getPixelFromLonLat(lonlat);

        /// Calculate the maximum distance from the lonlat to the map
        ///   center, then return the name of the boundary
        ///   with the maximum distance.
        for (var i in this.validRelativePositions) {
            var side = this.validRelativePositions[i];
            var distance = Number.NEGATIVE_INFINITY;

            if (side == "b") {
                distance = centerPixel.y - px.y;
            } else if (side == "t") {
                distance = px.y - centerPixel.y;
            } else if (side == "l") {
                distance = centerPixel.x - px.x;
            } else if (side == "r") {
                distance = px.x - centerPixel.x;
            }

            if (distance > maxDistance) {
                maxDistance = distance;
                this.relativePosition = side;
            }
        }

        return this.relativePosition;
    },

    /**
     * Method: updateRelativePosition
     * The popup has been moved to a new relative location, so we may want to
     *     make some cosmetic adjustments to it. By changing the CSS class,
     *     the bubble arrow can be shown on the correct side of the popup.
     */
    updateRelativePosition: function() {

        if (this.relativePosition == "t") {
            this.div.className = "olPopup olPopupTop"
        } else if (this.relativePosition == "b") {
            this.div.className = "olPopup olPopupBottom"
        } else if (this.relativePosition == "l") {
            this.div.className = "olPopup olPopupLeft"
        } else if (this.relativePosition == "r") {
            this.div.className = "olPopup olPopupRight"
        }

        this.div.style.overflow="visible";
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

        var top;
        var left;

        if (this.relativePosition == "t") {
            top = -size.h - this.anchor.size.h/2;
            left = (this.anchor.size.w - size.w)/2;
        } else if (this.relativePosition == "b") {
            top = this.anchor.size.h*1.5;
            left = (this.anchor.size.w - size.w)/2;
        } else if (this.relativePosition == "l") {
            top = (this.anchor.size.h - size.h)/2;
            left = this.anchor.size.w*1.5;
        } else if (this.relativePosition == "r") {
            top = (this.anchor.size.h - size.h)/2;
            left = -size.w - this.anchor.size.w/2;
        }

        newPx.x += left;
        newPx.y += top;

        return newPx;
    },

    CLASS_NAME: "OpenLayers.Popup.SideAnchored"
});
