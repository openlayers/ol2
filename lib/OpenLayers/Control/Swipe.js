/* Copyright (c) 2006-2013 by OpenLayers Contributors (see authors.txt for
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

/**
 * @requires OpenLayers/Control.js
 */

/**
 * Class: OpenLayers.Control.Swipe
 * Swipe the first layer and allow the use to move the swipe control from right to left.
 *
 * Inherits from:
 *  - <OpenLayers.Control>
 */
OpenLayers.Control.Swipe = OpenLayers.Class(OpenLayers.Control, {

    /** api: config[swipeRatio]
     *  ``Number``
     *  A number between 0 and 1 defining the position of the swipe relative to the map (from right to left)
     */
    swipeRatio: null,

    /**
     * Property: width
     * {Options} the width of the movable swipe div.
     */
    width: 32,

    /**
     * Property: swipeLayer
     * {Options} the OpenLayers.Layer that is swiped.
     */
    swipeLayer: null,

    /**
     * Property: isTitleVisible
     * {Options} boolean used during drag in order to know the visibility of the title.
     */
    isTitleVisible: false,

    /**
     * Property: isDragging
     * {Options} boolean used during drag in order to know if dragging is ongoing.
     */
    isDragging: false,

    /**
     * Property: mouseDragStart
     * {Options} position of the mouse drag start.
     */
    mouseDragStart: null,


    /**
     * Property: divEvents
     * {<OpenLayers.Events>}
     */
    divEvents: null,

    /**
     * Constructor: OpenLayers.Control.Swipe
     * Create a new control to swipe first layer.
     *
     * Parameters:
     * options - {Object} Optional object whose properties will be set on the
     *     control.
     */
    initialize: function (options) {
        "use strict";
        OpenLayers.Control.prototype.initialize.apply(
            this,
            arguments
        );
        // Manage position of swipe
        if (this.map && this.map.swipeRatio) {
            // Swipe ratio can be set in the map (in order to manage permalink, for example)
            this.setSwipeRatio(this.map.swipeRatio);
        } else {
            if (!this.swipeRatio) {
                // Default swipe ratio is 0.5
                this.setSwipeRatio(0.5);
            } else {
                // Swipe ratio can be set to the control
                this.setSwipeRatio(this.swipeRatio);
            }
        }
    },

    /**
     * Method: activate
     * Activates the control.
     *
     * Returns:
     * {Boolean} The control was effectively activated.
     */
    activate: function () {
        this.map.swipeActive = true;
        this.map.events.triggerEvent("changelayer", {
            layer: this.swipeLayer,
            property: "name"
        });
        OpenLayers.Control.prototype.activate.apply(this, arguments);
        this.map.events.on({
            "addlayer": this.handleAddLayer,
            "removelayer": this.handleRemoveLayer,
            "changelayer": this.handleChangeLayer,
            "updatesize": this.handleUpdateSize,
            "move": this.handleMove,
            "scope": this
        });

        if (this.isLayersInLayerSwitcher()) {
            this.div.style.display = 'block';
            this.viewBigArrow();
        }
        this.resize();

        return true;
    },

    /**
     * Method: deactivate
     * Deactivates the control.
     *
     * Returns:
     * {Boolean} The control was effectively deactivated.
     */
    deactivate: function () {
        this.map.swipeActive = false;
        this.map.events.triggerEvent("changelayer", {
            layer: this.swipeLayer,
            property: "name"
        });
        this.map.events.un({
            "addlayer": this.handleAddLayer,
            "removelayer": this.handleRemoveLayer,
            "changelayer": this.handleChangeLayer,
            "updatesize": this.handleUpdateSize,
            "move": this.handleMove,
            "scope": this
        });
        this.hideBigArrow();
        this.hideLayerTitle();
        this.div.style.display = 'none';
        if (this.swipeLayer) {
            if (this.swipeLayer.layers) {
                for (var i = this.swipeLayer.layers.length - 1; i >= 0; i--) {
                    var layer = this.swipeLayer.layers[i];
                    if (layer.div) {
                        layer.div.style.clip = 'auto';
                    }
                }
            } else {
                this.swipeLayer.div.style.clip = 'auto';
            }
            this.swipeLayer = null;
        }

        return OpenLayers.Control.prototype.deactivate.apply(
            this, arguments
        );
    },

    /**
     * Method: destroy
     * Destroy control.
     */
    destroy: function () {
        this.map.events.un({
            "addlayer": this.handleAddLayer,
            "removelayer": this.handleRemoveLayer,
            "changelayer": this.handleChangeLayer,
            "updatesize": this.handleUpdateSize,
            "scope": this
        });
        OpenLayers.Control.prototype.destroy.apply(this, arguments);
    },

    /**
     * Method: draw
     * Initialize control.
     *
     * Returns:
     * {DOMElement} A reference to the DIV DOMElement containing the control
     */
    draw: function () {
        OpenLayers.Control.prototype.draw.apply(this, arguments);

        this.elementLayer = document.createElement("div");
        this.div.appendChild(this.elementLayer);
        OpenLayers.Element.addClass(
            this.elementLayer,
            'olControlSwipeLayerHide'
        );
        this.elementLayerSpan = document.createElement("span");
        this.div.appendChild(this.elementLayerSpan);
        OpenLayers.Element.addClass(
            this.elementLayerSpan,
            'olControlSwipeLayerSpan'
        );
        this.elementLeft = document.createElement("div");
        this.div.appendChild(this.elementLeft);
        OpenLayers.Element.addClass(
            this.elementLeft,
            'olControlArrowLeft'
        );

        this.elementRight = document.createElement("div");
        this.div.appendChild(this.elementRight);
        OpenLayers.Element.addClass(
            this.elementRight,
            'olControlArrowRight'
        );

        OpenLayers.Control.prototype.draw.apply(this, arguments);

        this.divEvents = new OpenLayers.Events(this, this.div, null, true, {includeXY: true});

        this.divEvents.on({
            "touchstart": this.divDown,
            "touchmove": this.divDrag,
            "touchend": this.divUp,
            "mousedown": this.divDown,
            "mousemove": this.divDrag,
            "mouseup": this.divUp,
            "mouseover": this.divMouseOver,
            "mouseout": this.divMouseOut,
            scope: this
        });

        return this.div;
    },

    /*
     * Method: divMouseOver
     * event listener for onmouseover event
     *
     * Parameters:
     * evt - {<OpenLayers.Event>}
     */
    divMouseOver: function (ev) {
        OpenLayers.Element.addClass(
            this.div,
            'olControlSwipeHover'
        );
        this.viewLayerTitle();
    },

    /*
     * Method: hideBigArrow
     * Hide the arrows placed in the control
     *
     */
    hideBigArrow: function () {
        if (!this.isDragging) {
            this.elementLeft.style.display = "none";
            this.elementRight.style.display = "none";
        }
    },

    /*
     * Method: viewBigArrow
     * Hide the arrows placed in the control
     *
     */
    viewBigArrow: function () {
        if (!this.isDragging) {
            this.elementLeft.style.display = "block";
            this.elementRight.style.display = "block";
        }
    },

    /*
     * Method: divMouseOut
     * event listener for onmouseout event
     *
     * Parameters:
     * evt - {<OpenLayers.Event>}
     */
    divMouseOut: function (ev) {
        OpenLayers.Element.removeClass(
            this.div,
            'olControlSwipeHover'
        );
        this.hideLayerTitle();
        this.viewBigArrow();
    },

    /**
     * Method: passEventToDiv
     * This function is used to pass events that happen on the map,
     * through to the div, which then does its moving thing.
     *
     * Parameters:
     * evt - {<OpenLayers.Event>}
     */
    passEventToDiv: function (evt) {
        this.divEvents.handleBrowserEvent(evt);
    },

    /*
     * Method: divDown
     * event listener for clicks on the div
     *
     * Parameters:
     * evt - {<OpenLayers.Event>}
     */
    divDown: function (evt) {
        if (!OpenLayers.Event.isLeftClick(evt) && !OpenLayers.Event.isSingleTouch(evt)) {
            return;
        }
        this.map.events.on({
            "touchmove": this.passEventToDiv,
            "mousemove": this.passEventToDiv,
            "mouseup": this.passEventToDiv,
            scope: this
        });
        this.mouseDragStart = evt.xy.clone();
        OpenLayers.Event.stop(evt);
        this.viewLayerTitle();
        this.hideBigArrow();
        this.isDragging = true;
        return false;
    },

    /*
     * Method: divDrag
     * This is what happens when a click has occurred, and the client is
     * dragging.
     *
     * Parameters:
     * evt - {<OpenLayers.Event>}
     */
    divDrag: function (evt) {
        if (this.mouseDragStart && this.isDragging) {
            var deltaX = this.mouseDragStart.x - evt.xy.x;
            var left = parseInt(this.div.style.left, 10);
            if ((left - deltaX) >= 0 &&
                (left - deltaX) <= (this.map.size.w - this.width)) {
                var delta = 0;
                if (OpenLayers.BROWSER_NAME === "msie" || OpenLayers.BROWSER_NAME === "safari") {
                    delta = -1;
                }
                this.setSwipeRatio((left - deltaX) / (this.map.size.w - this.width + delta));
                this.moveTo(this.computePosition());
                this.clipFirstLayer();
                this.mouseDragStart = evt.xy.clone();
            }
            OpenLayers.Event.stop(evt);
        }
        return false;
    },

    /*
     * Method: divUp
     * Perform cleanup when a mouseup event is received
     *
     * Parameters:
     * evt - {<OpenLayers.Event>}
     */
    divUp: function (evt) {
        this.map.events.un({
            "touchmove": this.passEventToDiv,
            "mousemove": this.passEventToDiv,
            "mouseup": this.passEventToDiv,
            scope: this
        });
        if (!OpenLayers.Event.isLeftClick(evt) && evt.type !== "touchend") {
            return;
        }
        if (this.mouseDragStart) {
            this.mouseDragStart = null;
        }
        this.isDragging = false;
        this.viewBigArrow();
        if (evt.type === "touchend") {
            this.hideLayerTitle();
        }
        OpenLayers.Event.stop(evt);
        return false;
    },

    /*
     * Method: clipFirstLayer
     * Clip the first layer present in the layer switcher
     */
    clipFirstLayer: function () {
        var newFirstLayer = this.getFirstLayerInLayerSwitcher();
        if (this.swipeLayer) {
            if (newFirstLayer.id !== this.swipeLayer.id) {
                if (this.swipeLayer.layers) {
                    for (var i = this.swipeLayer.layers.length - 1; i >= 0; i--) {
                        var layer = this.swipeLayer.layers[i];
                        if (layer.div) {
                            layer.div.style.clip = 'auto';
                        }
                    }
                } else {
                    this.swipeLayer.div.style.clip = 'auto';
                }
            }
        }

        if (newFirstLayer) {
            var width = this.map.getCurrentSize().w;
            var height = this.map.getCurrentSize().h;
            // slider position in pixels
            var s = parseInt(width * this.getSwipeRatio() * ((this.map.getCurrentSize().w - this.width) / this.map.getCurrentSize().w), 10);
            // cliping rectangle
            var top = -this.map.layerContainerOriginPx.y;
            var bottom = top + height;
            var left = -this.map.layerContainerOriginPx.x;
            var right = left + s + Math.ceil((this.width - 1) / 2);
            //Syntax for clip "rect(top,right,bottom,left)"
            var clip = "rect(" + top + "px " + right + "px " + bottom + "px " + left + "px)";
            this.swipeLayer = newFirstLayer;
            if (this.swipeLayer.layers) {
                for (var j = this.swipeLayer.layers.length - 1; j >= 0; j--) {
                    var layer1 = this.swipeLayer.layers[j];
                    if (layer1.div) {
                        layer1.div.style.clip = clip;
                    }
                }
            } else {
                this.swipeLayer.div.style.clip = clip;
            }
        }

    },

    /*
     * Method: handleAddLayer
     * Triggered when a new layer is added
     *
     * Parameters:
     * object - {<OpenLayers.Event>}
     */
    handleAddLayer: function (object) {
        if (this.isLayersInLayerSwitcher()) {
            this.div.style.display = 'block';
            this.moveTo(this.computePosition());
            this.clipFirstLayer();
        } else {
            this.div.style.display = 'none';
            this.swipeLayer = null;
        }
    },

    /*
     * Method: viewLayerTitle
     * View the layer title (layer.name)
     *
     */
    viewLayerTitle: function () {
        if (!this.isTitleVisible && !this.isDragging) {
            if (this.swipeLayer) {
                var content = "&nbsp&nbsp&nbsp&nbsp " + this.swipeLayer.name;
                this.elementLayer.innerHTML = content;
                this.elementLayerSpan.innerHTML = content;
                OpenLayers.Element.addClass(
                    this.elementLayer,
                    'olControlSwipeLayerView'
                );
                OpenLayers.Element.removeClass(
                    this.elementLayer,
                    'olControlSwipeLayerHide'
                );
                var width = parseInt(this.elementLayerSpan.offsetWidth,10) + 5;
                this.elementLayer.style.width = width + "px";
                this.elementLayer.style.marginLeft = "-" + width + "px";

            }

        }
        this.isTitleVisible = true;
    },

    /*
     * Method: hideLayerTitle
     * Hide the layer title
     *
     */
    hideLayerTitle: function () {
        if (!this.isDragging) {
            this.elementLayer.innerHTML = '';
            this.isTitleVisible = false;
            OpenLayers.Element.addClass(
                this.elementLayer,
                'olControlSwipeLayerHide'
            );
            OpenLayers.Element.removeClass(
                this.elementLayer,
                'olControlSwipeLayerView'
            );
        }
    },

    /*
     * Method: handleRemoveLayer
     * Triggered when a new layer is removed
     *
     * Parameters:
     * object - {<OpenLayers.Event>}
     */
    handleRemoveLayer: function (object) {
        if (this.isLayersInLayerSwitcher()) {
            this.div.style.display = 'block';
            this.moveTo(this.computePosition());
            this.clipFirstLayer();
        } else {
            this.div.style.display = 'none';
            this.swipeLayer = null;
        }
    },

    /*
     * Method: handleChangeLayer
     * Triggered when the layer order is changed
     *
     * Parameters:
     * object - {<OpenLayers.Event>}
     */
    handleChangeLayer: function (object) {
        if (object.property === 'order') {
            if (this.isLayersInLayerSwitcher()) {
                this.div.style.display = 'block';
                this.moveTo(this.computePosition());
                this.clipFirstLayer();
            } else {
                this.div.style.display = 'none';
                this.swipeLayer = null;
            }
        }
    },

    /*
     * Method: handleUpdateSize
     * Triggered when the map size changed. In this case the swipe control is updated accordingly.
     *
     * Parameters:
     * object - {<OpenLayers.Event>}
     */
    handleUpdateSize: function (object) {
        //we have to delay this on Android devices
        if (navigator.userAgent.toLowerCase().indexOf("android") > 0) {
            var self = this;
            setTimeout(function () {
                self.resize();
            }, 10);
        } else {
            this.resize();
        }
    },

    /*
     * Method: handleMove
     * Triggered when the map is moved. In this case, the clip ares has to be updated
     *
     * Parameters:
     * object - {<OpenLayers.Event>}
     */
    handleMove: function (object) {
        this.clipFirstLayer();
    },

    /*
     * Method: resize
     * Resize the swipe and update the first layer clipping
     */
    resize: function () {
        this.div.style.height = this.map.getCurrentSize().h + 'px';
        this.div.style.width = this.width + 'px';
        this.moveTo(this.computePosition());
        this.clipFirstLayer();
        var topPosition = (this.map.getCurrentSize().h / 2) - 32;
        this.elementLeft.style.marginTop = topPosition + 'px';
        this.elementRight.style.marginTop = topPosition + 'px';
    },

    /*
     * Method: computePosition
     * Recompute the position of the swipe acording  to swipeRatio and the size of the map
     */
    computePosition: function () {
        var y = 0;
        var x = this.getSwipeRatio() * (this.map.size.w - this.width);
        return new OpenLayers.Pixel(x, y);
    },

    /*
     * Method: getFirstLayerInLayerSwitcher
     * Get the first layer visible in the layer switcher
     */
    getFirstLayerInLayerSwitcher: function () {
        for (var i = this.map.layers.length - 1; i >= 0; i--) {
            var layer = this.map.layers[i];
            if (layer.displayInLayerSwitcher) {
                return layer;
            }
        }
        return null;
    },

    /*
     * Method: isLayersInLayerSwitcher
     * Check the presence of a layer in the layer switcher
     */
    isLayersInLayerSwitcher: function () {
        for (var i = 0, len = this.map.layers.length; i < len; i++) {
            var layer = this.map.layers[i];
            if (layer.displayInLayerSwitcher) {
                return true;
            }
        }
        return false;
    },

    /*
     * Method: setSwipeRatio
     * Set the swipe ratio (value between 0 and 1 representing the relative position of the swip in the map)
     */
    setSwipeRatio: function (ratio) {
        this.map.events.triggerEvent("changelayer", {
            layer: this.swipeLayer,
            property: "name"
        });
        this.map.swipeRatio = ratio;
        this.map.swipeActive = this.active;
    },

    /*
     * Method: getSwipeRatio
     * Get the swipe ratio (value between 0 and 1 representing the relative position of the swip in the map. This value is stored in the map)
     */
    getSwipeRatio: function () {
        return this.map.swipeRatio;
    },

    /*
     * Method: updateRatio
     * Update the swipeRatio and update the swipe control accordingly
     */
    updateRatio: function (ratio) {
        this.setSwipeRatio(ratio);
        if (this.isLayersInLayerSwitcher()) {
            this.div.style.display = 'block';
            this.moveTo(this.computePosition());
            this.clipFirstLayer();
        } else {
            this.div.style.display = 'none';
            this.swipeLayer = null;
        }
    },

    CLASS_NAME: "OpenLayers.Control.Swipe"
});

