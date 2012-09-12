/* Copyright (c) 2006-2012 by OpenLayers Contributors (see authors.txt for
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

/**
 * @requires OpenLayers/Control.js
 * @requires OpenLayers/Events/buttonclick.js
 */

/**
 * Class: OpenLayers.Control.Zoom
 * The Zoom control is a pair of +/- links for zooming in and out.
 *
 * Inherits from:
 *  - <OpenLayers.Control>
 */
OpenLayers.Control.ZoomBar = OpenLayers.Class(OpenLayers.Control, {

    /**
     * APIProperty: zoomInText
     * {String}
     * Text for zoom-in link.  Default is "+".
     */
    zoomInText: "+",

    /**
     * APIProperty: zoomOutText
     * {String}
     * Text for zoom-out link.  Default is "\u2212".
     */
    zoomOutText: "\u2212",

    /**
     * APIProperty: zoomOutId
     * {String}
     * Instead of having the control create a zoom out link, you can provide
     *     the identifier for an anchor element already added to the document.
     *     By default, an element with id "olZoomOutLink" will be searched for
     *     and used if it exists.
     */
    zoomBarId: "olZoomBar",

    /**
     * APIProperty: zoomStopHeight
     * {int}
     * Default is 8.
     */
    zoomStopHeight: 8,

    /**
     * PrivateProperty: zoomStartY
     * {int}
     */
    zoomStartY: -1,

    /**
     * Method: draw
     *
     * Returns:
     * {DOMElement} A reference to the DOMElement containing the zoom links.
     */
    draw: function() {
        // initialize our internal div
        OpenLayers.Control.prototype.draw.apply(this, arguments);

        // place the controls
        this.buttons = [];

        this.zoomIn = document.createElement("a");
        this.zoomIn.href = "#zoomIn";
        this.zoomIn.appendChild(document.createTextNode(this.zoomInText));
        this.zoomIn.className = "olControlZoomIn";
        OpenLayers.Element.addClass(this.zoomIn, "olButton");
        var zoomInCnt = document.createElement("div");
        zoomInCnt.className = "olControlZoomInCnt";
        zoomInCnt.appendChild(this.zoomIn);
        this.div.appendChild(zoomInCnt);

        this._addZoomBar();

        this.zoomOut = document.createElement("a");
        this.zoomOut.href = "#zoomOut";
        this.zoomOut.appendChild(document.createTextNode(this.zoomOutText));
        this.zoomOut.className = "olControlZoomOut";
        OpenLayers.Element.addClass(this.zoomOut, "olButton");
        var zoomOutCnt = document.createElement("div");
        zoomOutCnt.className = "olControlZoomOutCnt";
        zoomOutCnt.appendChild(this.zoomOut);
        this.div.appendChild(zoomOutCnt);

        this.map.events.register("buttonclick", this, this.onZoomClick);

        return this.div;
    },

    /**
     * Method: setMap
     *
     * Parameters:
     * map - {<OpenLayers.Map>}
     */
    setMap: function(map) {
        OpenLayers.Control.PanZoom.prototype.setMap.apply(this, arguments);
        this.map.events.on({
            "changebaselayer": this.redraw,
            scope: this
        });
    },

    /**
     * Method: redraw
     * clear the div and start over.
     */
    redraw: function() {
        this.zoombarDivInternal.style.height = this.zoomStopHeight *
                (this.map.getNumZoomLevels() - this.map.getMinZoom()) + 'px';
    },

    /**
     * Method: _addZoomBar
     */
    _addZoomBar: function() {
        this.slider = document.createElement("a");
        this.slider.className = "olButton olControlZoomSlider";
        this.moveZoomBar()
        this.slider.style.cursor = "move";

        this.sliderEvents = new OpenLayers.Events(this, this.slider,
                null, true, {includeXY: true});
        this.sliderEvents.on({
            "touchstart": this.zoomBarDown,
            "touchmove": this.zoomBarDrag,
            "touchend": this.zoomBarUp,
            "mousedown": this.zoomBarDown,
            "mousemove": this.zoomBarDrag,
            "mouseup": this.zoomBarUp
        });

        this.zoombarDiv = document.createElement("div");
        this.zoombarDiv.href = "#zoom";
        this.zoombarDiv.style.cursor = "pointer";
        this.zoombarDiv.className = "olButton olControlZoomBarBar";

        this.zoombarDivInternal = document.createElement("div");
        this.zoombarDivInternal.className = "olControlZoomBarBarInternal";
        this.zoombarDivInternal.style.height = this.zoomStopHeight *
                (this.map.getNumZoomLevels() - this.map.getMinZoom()) + 'px';

        this.div.appendChild(this.zoombarDiv);
        this.zoombarDiv.appendChild(this.slider);
        var zoomCnt = document.createElement("div");
        zoomCnt.className = "olControlZoomBarCnt";
        zoomCnt.appendChild(this.zoombarDivInternal);
        this.zoombarDiv.appendChild(zoomCnt);

        this.map.events.register("zoomend", this, this.moveZoomBar);
    },

    /**
     * Method: onZoomClick
     * Called when zoomin/out link is clicked.
     */
    onZoomClick: function(evt) {
        var button = evt.buttonElement;
        if (button === this.zoomIn) {
            this.map.zoomIn();
        }
        else if (button === this.zoomOut) {
            this.map.zoomOut();
        }
        else if (button === this.zoombarDiv && this.zoomStartY == -1) {
            var levels = evt.buttonXY.y / this.zoomStopHeight;
            if (!this.map.fractionalZoom) {
                levels = Math.floor(levels);
            }
            else {
                levels -= 0.5;
            }
            var zoom = (this.map.getNumZoomLevels() - 1) - levels;
            zoom = Math.min(Math.max(zoom, 0), this.map.getNumZoomLevels() - 1);
            this.map.zoomTo(zoom);
        }
    },

    /**
     * Method: passEventToSlider
     * This function is used to pass events that happen on the div, or the map,
     * through to the slider, which then does its moving thing.
     *
     * Parameters:
     * evt - {<OpenLayers.Event>}
     */
    passEventToSlider:function(evt) {
        this.sliderEvents.handleBrowserEvent(evt);
    },

    /**
     * Method: zoomBarDown
     * event listener for clicks on the slider
     *
     * Parameters:
     * evt - {<OpenLayers.Event>}
     */
    zoomBarDown:function(evt) {
        if (!OpenLayers.Event.isLeftClick(evt) && !OpenLayers.Event.isSingleTouch(evt)) {
            return;
        }
        this.map.events.on({
            "touchmove": this.passEventToSlider,
            "mousemove": this.passEventToSlider,
            "mouseup": this.passEventToSlider,
            scope: this
        });
        this.zoomStartY = evt.xy.y;
        this.zoomStart = this.map.zoom;
        this.div.style.cursor = "move";
        OpenLayers.Event.stop(evt);
    },

    /**
     * Method: zoomBarDrag
     * This is what happens when a click has occurred, and the client is
     * dragging.  Here we must ensure that the slider doesn't go beyond the
     * bottom/top of the zoombar div, as well as moving the slider to its new
     * visual location
     *
     * Parameters:
     * evt - {<OpenLayers.Event>}
     */
    zoomBarDrag:function(evt) {
        if (this.zoomStartY != -1) {
            var delta = (this.zoomStartY - evt.xy.y) / this.zoomStopHeight;
            if (!this.map.fractionalZoom) {
                delta = Math.round(delta);
            }
            if (delta != 0) {
                zoom = Math.min(Math.max(this.zoomStart + delta, 0),
                        this.map.getNumZoomLevels() - 1);
                this.map.zoomTo(zoom);
                this.moveZoomBar();
            }
            OpenLayers.Event.stop(evt);
        }
    },

    /**
     * Method: zoomBarUp
     * Perform cleanup when a mouseup event is received -- discover new zoom
     * level and switch to it.
     *
     * Parameters:
     * evt - {<OpenLayers.Event>}
     */
    zoomBarUp: function(evt) {
        if (!OpenLayers.Event.isLeftClick(evt) && evt.type !== "touchend") {
            return;
        }
        if (this.zoomStartY != -1) {
            this.div.style.cursor="";
            this.map.events.un({
                "touchmove": this.passEventToSlider,
                "mouseup": this.passEventToSlider,
                "mousemove": this.passEventToSlider,
                scope: this
            });
            this.zoomStartY = -1;
            OpenLayers.Event.stop(evt);
        }
    },

    /**
     * Method: moveZoomBar
     * Change the location of the slider to match the current zoom level.
     */
    moveZoomBar: function() {
        this.slider.style.top =
                ((this.map.getNumZoomLevels() - 1 - this.map.getZoom()) *
                this.zoomStopHeight) + "px";
    },

    /**
     * Method: destroy
     * Clean up.
     */
    destroy: function() {
        if (this.map) {
            this.map.events.unregister("buttonclick", this, this.onZoomClick);
            this.map.events.unregister("zoomend", this, this.moveZoomBar);
        }
        delete this.zoomIn;
        delete this.zoomOut;
        delete this.slider;
        delete this.sliderEvents;
        delete this.zoombarDiv;

        OpenLayers.Control.prototype.destroy.apply(this);
    },

    CLASS_NAME: "OpenLayers.Control.ZoomBar"
});
