/* Copyright (c) 2006-2013 by OpenLayers Contributors (see authors.txt for
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

/**
 * @requires OpenLayers/BaseTypes/Class.js
 */


/**
 * Class: OpenLayers.Popup
 * A popup is a small div that can opened and closed on the map.
 * Typically opened in response to clicking on a marker.  
 * See <OpenLayers.Marker>.  Popup's don't require their own
 * layer and are added the the map using the <OpenLayers.Map.addPopup>
 * method.
 *
 * Example:
 * (code)
 * popup = new OpenLayers.Popup("chicken", 
 *                    new OpenLayers.LonLat(5,40),
 *                    new OpenLayers.Size(200,200),
 *                    "example popup",
 *                    true);
 *       
 * map.addPopup(popup);
 * (end)
 */
OpenLayers.Popup = OpenLayers.Class({

    /** 
     * Property: events  
     * {<OpenLayers.Events>} custom event manager 
     */
    events: null,
    
    /** Property: id
     * {String} the unique identifier assigned to this popup.
     */
    id: "",

    /** 
     * Property: lonlat 
     * {<OpenLayers.LonLat>} the position of this popup on the map
     */
    lonlat: null,

    /** 
     * Property: div 
     * {DOMElement} the div that contains this popup.
     */
    div: null,

    /** 
     * Property: contentSize 
     * {<OpenLayers.Size>} the width and height of the content.
     */
    contentSize: null,    

    /** 
     * Property: size 
     * {<OpenLayers.Size>} the width and height of the popup.
     */
    size: null,    

    /** 
     * Property: contentHTML 
     * {String} An HTML string for this popup to display.
     */
    contentHTML: null,
    
    /** 
     * Property: backgroundColor 
     * {String} the background color used by the popup.
     */
    backgroundColor: "",
    
    /** 
     * Property: opacity 
     * {float} the opacity of this popup (between 0.0 and 1.0)
     */
    opacity: "",

    /** 
     * Property: border 
     * {String} the border size of the popup.  (eg 2px)
     */
    border: "",
    
    /** 
     * Property: contentDiv 
     * {DOMElement} a reference to the element that holds the content of
     *              the div.
     */
    contentDiv: null,
    
    /** 
     * Property: groupDiv 
     * {DOMElement} First and only child of 'div'. The group Div contains the
     *     'contentDiv' and the 'closeDiv'.
     */
    groupDiv: null,

    /** 
     * Property: closeDiv
     * {DOMElement} the optional closer image
     */
    closeDiv: null,

    /** 
     * APIProperty: autoSize
     * {Boolean} Resize the popup to auto-fit the contents.
     *     Default is false.
     */
    autoSize: false,

    /**
     * APIProperty: minSize
     * {<OpenLayers.Size>} Minimum size allowed for the popup's contents.
     */
    minSize: null,

    /**
     * APIProperty: maxSize
     * {<OpenLayers.Size>} Maximum size allowed for the popup's contents.
     */
    maxSize: null,

    /** 
     * Property: displayClass
     * {String} The CSS class of the popup.
     */
    displayClass: "olPopup",

    /** 
     * Property: contentDisplayClass
     * {String} The CSS class of the popup content div.
     */
    contentDisplayClass: "olPopupContent",

    /** 
     * Property: padding 
     * {int or <OpenLayers.Bounds>} An extra opportunity to specify internal 
     *     padding of the content div inside the popup. This was originally
     *     confused with the css padding as specified in style.css's 
     *     'olPopupContent' class. We would like to get rid of this altogether,
     *     except that it does come in handy for the framed and anchoredbubble
     *     popups, who need to maintain yet another barrier between their 
     *     content and the outer border of the popup itself. 
     * 
     *     Note that in order to not break API, we must continue to support 
     *     this property being set as an integer. Really, though, we'd like to 
     *     have this specified as a Bounds object so that user can specify
     *     distinct left, top, right, bottom paddings. With the 3.0 release
     *     we can make this only a bounds.
     */
    padding: 0,

    /** 
     * Property: disableFirefoxOverflowHack
     * {Boolean} The hack for overflow in Firefox causes all elements 
     *     to be re-drawn, which causes Flash elements to be 
     *     re-initialized, which is troublesome.
     *     With this property the hack can be disabled.
     */
    disableFirefoxOverflowHack: false,

    /**
     * Method: fixPadding
     * To be removed in 3.0, this function merely helps us to deal with the 
     *     case where the user may have set an integer value for padding, 
     *     instead of an <OpenLayers.Bounds> object.
     */
    fixPadding: function() {
        if (typeof this.padding == "number") {
            this.padding = new OpenLayers.Bounds(
                this.padding, this.padding, this.padding, this.padding
            );
        }
    },

    /**
     * APIProperty: panMapIfOutOfView
     * {Boolean} When drawn, pan map such that the entire popup is visible in
     *     the current viewport (if necessary).
     *     Default is false.
     */
    panMapIfOutOfView: false,
    
    /**
     * APIProperty: keepInMap 
     * {Boolean} If panMapIfOutOfView is false, and this property is true, 
     *     contrain the popup such that it always fits in the available map
     *     space. By default, this is not set on the base class. If you are
     *     creating popups that are near map edges and not allowing pannning,
     *     and especially if you have a popup which has a
     *     fixedRelativePosition, setting this to false may be a smart thing to
     *     do. Subclasses may want to override this setting.
     *   
     *     Default is false.
     */
    keepInMap: false,

    /**
     * APIProperty: closeOnMove
     * {Boolean} When map pans, close the popup.
     *     Default is false.
     */
    closeOnMove: false,
    
    /** 
     * Property: map 
     * {<OpenLayers.Map>} this gets set in Map.js when the popup is added to the map
     */
    map: null,

    /** 
    * Constructor: OpenLayers.Popup
    * Create a popup.
    * 
    * Parameters: 
    * id - {String} a unqiue identifier for this popup.  If null is passed
    *               an identifier will be automatically generated. 
    * lonlat - {<OpenLayers.LonLat>}  The position on the map the popup will
    *                                 be shown.
    * contentSize - {<OpenLayers.Size>} The size of the content.
    * contentHTML - {String}          An HTML string to display inside the   
    *                                 popup.
    * closeBox - {Boolean}            Whether to display a close box inside
    *                                 the popup.
    * closeBoxCallback - {Function}   Function to be called on closeBox click.
    */
    initialize:function(id, lonlat, contentSize, contentHTML, closeBox, closeBoxCallback) {
        if (id == null) {
            id = OpenLayers.Util.createUniqueID(this.CLASS_NAME + "_");
        }

        this.id = id;
        this.lonlat = lonlat;

        this.contentSize = (contentSize != null) ? contentSize 
                                  : new OpenLayers.Size(
                                                   OpenLayers.Popup.WIDTH,
                                                   OpenLayers.Popup.HEIGHT);
        if (contentHTML != null) { 
             this.contentHTML = contentHTML;
        }
        this.backgroundColor = OpenLayers.Popup.COLOR;
        this.opacity = OpenLayers.Popup.OPACITY;
        this.border = OpenLayers.Popup.BORDER;

        this.div = OpenLayers.Util.createDiv(this.id, null, null, 
                                             null, null, null, "hidden");
        this.div.className = this.displayClass;
        
        var groupDivId = this.id + "_GroupDiv";
        this.groupDiv = OpenLayers.Util.createDiv(groupDivId, null, null, 
                                                    null, "relative", null,
                                                    "hidden");

        var id = this.div.id + "_contentDiv";
        this.contentDiv = OpenLayers.Util.createDiv(id, null, this.contentSize.clone(), 
                                                    null, "relative");
        this.contentDiv.className = this.contentDisplayClass;
        this.groupDiv.appendChild(this.contentDiv);
        this.div.appendChild(this.groupDiv);

        if (closeBox) {
            this.addCloseBox(closeBoxCallback);
        } 

        this.registerEvents();
    },

    /** 
     * Method: destroy
     * nullify references to prevent circular references and memory leaks
     */
    destroy: function() {

        this.id = null;
        this.lonlat = null;
        this.size = null;
        this.contentHTML = null;
        
        this.backgroundColor = null;
        this.opacity = null;
        this.border = null;
        
        if (this.closeOnMove && this.map) {
            this.map.events.unregister("movestart", this, this.hide);
        }

        this.events.destroy();
        this.events = null;
        
        if (this.closeDiv) {
            OpenLayers.Event.stopObservingElement(this.closeDiv); 
            this.groupDiv.removeChild(this.closeDiv);
        }
        this.closeDiv = null;
        
        this.div.removeChild(this.groupDiv);
        this.groupDiv = null;

        if (this.map != null) {
            this.map.removePopup(this);
        }
        this.map = null;
        this.div = null;
        
        this.autoSize = null;
        this.minSize = null;
        this.maxSize = null;
        this.padding = null;
        this.panMapIfOutOfView = null;
    },

    /** 
    * Method: draw
    * Constructs the elements that make up the popup.
    *
    * Parameters:
    * px - {<OpenLayers.Pixel>} the position the popup in pixels.
    * 
    * Returns:
    * {DOMElement} Reference to a div that contains the drawn popup
    */
    draw: function(px) {
        if (px == null) {
            if ((this.lonlat != null) && (this.map != null)) {
                px = this.map.getLayerPxFromLonLat(this.lonlat);
            }
        }

        // this assumes that this.map already exists, which is okay because 
        // this.draw is only called once the popup has been added to the map.
        if (this.closeOnMove) {
            this.map.events.register("movestart", this, this.hide);
        }
        
        //listen to movestart, moveend to disable overflow (FF bug)
        if (!this.disableFirefoxOverflowHack && OpenLayers.BROWSER_NAME == 'firefox') {
            this.map.events.register("movestart", this, function() {
                var style = document.defaultView.getComputedStyle(
                    this.contentDiv, null
                );
                var currentOverflow = style.getPropertyValue("overflow");
                if (currentOverflow != "hidden") {
                    this.contentDiv._oldOverflow = currentOverflow;
                    this.contentDiv.style.overflow = "hidden";
                }
            });
            this.map.events.register("moveend", this, function() {
                var oldOverflow = this.contentDiv._oldOverflow;
                if (oldOverflow) {
                    this.contentDiv.style.overflow = oldOverflow;
                    this.contentDiv._oldOverflow = null;
                }
            });
        }

        this.moveTo(px);
        if (!this.autoSize && !this.size) {
            this.setSize(this.contentSize);
        }
        this.setBackgroundColor();
        this.setOpacity();
        this.setBorder();
        this.setContentHTML();
        
        if (this.panMapIfOutOfView) {
            this.panIntoView();
        }    

        return this.div;
    },

    /** 
     * Method: updatePosition
     * if the popup has a lonlat and its map members set, 
     * then have it move itself to its proper position
     */
    updatePosition: function() {
        if ((this.lonlat) && (this.map)) {
            var px = this.map.getLayerPxFromLonLat(this.lonlat);
            if (px) {
                this.moveTo(px);           
            }    
        }
    },

    /**
     * Method: moveTo
     * 
     * Parameters:
     * px - {<OpenLayers.Pixel>} the top and left position of the popup div. 
     */
    moveTo: function(px) {
        if ((px != null) && (this.div != null)) {
            this.div.style.left = px.x + "px";
            this.div.style.top = px.y + "px";
        }
    },

    /**
     * Method: visible
     *
     * Returns:      
     * {Boolean} Boolean indicating whether or not the popup is visible
     */
    visible: function() {
        return OpenLayers.Element.visible(this.div);
    },

    /**
     * Method: toggle
     * Toggles visibility of the popup.
     */
    toggle: function() {
        if (this.visible()) {
            this.hide();
        } else {
            this.show();
        }
    },

    /**
     * Method: show
     * Makes the popup visible.
     */
    show: function() {
        this.div.style.display = '';

        if (this.panMapIfOutOfView) {
            this.panIntoView();
        }    
    },

    /**
     * Method: hide
     * Makes the popup invisible.
     */
    hide: function() {
        this.div.style.display = 'none';
    },

    /**
     * Method: setSize
     * Used to adjust the size of the popup. 
     *
     * Parameters:
     * contentSize - {<OpenLayers.Size>} the new size for the popup's 
     *     contents div (in pixels).
     */
    setSize:function(contentSize) { 
        this.size = contentSize.clone(); 
        
        // if our contentDiv has a css 'padding' set on it by a stylesheet, we 
        //  must add that to the desired "size". 
        var contentDivPadding = this.getContentDivPadding();
        var wPadding = contentDivPadding.left + contentDivPadding.right;
        var hPadding = contentDivPadding.top + contentDivPadding.bottom;

        // take into account the popup's 'padding' property
        this.fixPadding();
        wPadding += this.padding.left + this.padding.right;
        hPadding += this.padding.top + this.padding.bottom;

        // make extra space for the close div
        if (this.closeDiv) {
            var closeDivWidth = parseInt(this.closeDiv.style.width);
            wPadding += closeDivWidth + contentDivPadding.right;
        }

        //increase size of the main popup div to take into account the 
        // users's desired padding and close div.        
        this.size.w += wPadding;
        this.size.h += hPadding;

        //now if our browser is IE, we need to actually make the contents 
        // div itself bigger to take its own padding into effect. this makes 
        // me want to shoot someone, but so it goes.
        if (OpenLayers.BROWSER_NAME == "msie") {
            this.contentSize.w += 
                contentDivPadding.left + contentDivPadding.right;
            this.contentSize.h += 
                contentDivPadding.bottom + contentDivPadding.top;
        }

        if (this.div != null) {
            this.div.style.width = this.size.w + "px";
            this.div.style.height = this.size.h + "px";
        }
        if (this.contentDiv != null){
            this.contentDiv.style.width = contentSize.w + "px";
            this.contentDiv.style.height = contentSize.h + "px";
        }
    },  

    /**
     * APIMethod: updateSize
     * Auto size the popup so that it precisely fits its contents (as 
     *     determined by this.contentDiv.innerHTML). Popup size will, of
     *     course, be limited by the available space on the current map
     */
    updateSize: function() {
        
        // determine actual render dimensions of the contents by putting its
        // contents into a fake contentDiv (for the CSS) and then measuring it
        var preparedHTML = "<div class='" + this.contentDisplayClass+ "'>" + 
            this.contentDiv.innerHTML + 
            "</div>";
 
        var containerElement = (this.map) ? this.map.div : document.body;
        var realSize = OpenLayers.Util.getRenderedDimensions(
            preparedHTML, null, {
                displayClass: this.displayClass,
                containerElement: containerElement
            }
        );

        // is the "real" size of the div is safe to display in our map?
        var safeSize = this.getSafeContentSize(realSize);

        var newSize = null;
        if (safeSize.equals(realSize)) {
            //real size of content is small enough to fit on the map, 
            // so we use real size.
            newSize = realSize;

        } else {

            // make a new 'size' object with the clipped dimensions 
            // set or null if not clipped.
            var fixedSize = {
                w: (safeSize.w < realSize.w) ? safeSize.w : null,
                h: (safeSize.h < realSize.h) ? safeSize.h : null
            };
        
            if (fixedSize.w && fixedSize.h) {
                //content is too big in both directions, so we will use 
                // max popup size (safeSize), knowing well that it will 
                // overflow both ways.                
                newSize = safeSize;
            } else {
                //content is clipped in only one direction, so we need to 
                // run getRenderedDimensions() again with a fixed dimension
                var clippedSize = OpenLayers.Util.getRenderedDimensions(
                    preparedHTML, fixedSize, {
                        displayClass: this.contentDisplayClass,
                        containerElement: containerElement
                    }
                );
                
                //if the clipped size is still the same as the safeSize, 
                // that means that our content must be fixed in the 
                // offending direction. If overflow is 'auto', this means 
                // we are going to have a scrollbar for sure, so we must 
                // adjust for that.
                //
                var currentOverflow = OpenLayers.Element.getStyle(
                    this.contentDiv, "overflow"
                );
                if ( (currentOverflow != "hidden") && 
                     (clippedSize.equals(safeSize)) ) {
                    var scrollBar = OpenLayers.Util.getScrollbarWidth();
                    if (fixedSize.w) {
                        clippedSize.h += scrollBar;
                    } else {
                        clippedSize.w += scrollBar;
                    }
                }
                
                newSize = this.getSafeContentSize(clippedSize);
            }
        }                        
        this.setSize(newSize);     
    },    

    /**
     * Method: setBackgroundColor
     * Sets the background color of the popup.
     *
     * Parameters:
     * color - {String} the background color.  eg "#FFBBBB"
     */
    setBackgroundColor:function(color) { 
        if (color != undefined) {
            this.backgroundColor = color; 
        }
        
        if (this.div != null) {
            this.div.style.backgroundColor = this.backgroundColor;
        }
    },  
    
    /**
     * Method: setOpacity
     * Sets the opacity of the popup.
     * 
     * Parameters:
     * opacity - {float} A value between 0.0 (transparent) and 1.0 (solid).   
     */
    setOpacity:function(opacity) { 
        if (opacity != undefined) {
            this.opacity = opacity; 
        }
        
        if (this.div != null) {
            // for Mozilla and Safari
            this.div.style.opacity = this.opacity;

            // for IE
            this.div.style.filter = 'alpha(opacity=' + this.opacity*100 + ')';
        }
    },  
    
    /**
     * Method: setBorder
     * Sets the border style of the popup.
     *
     * Parameters:
     * border - {String} The border style value. eg 2px 
     */
    setBorder:function(border) { 
        if (border != undefined) {
            this.border = border;
        }
        
        if (this.div != null) {
            this.div.style.border = this.border;
        }
    },      
    
    /**
     * Method: setContentHTML
     * Allows the user to set the HTML content of the popup.
     *
     * Parameters:
     * contentHTML - {String} HTML for the div.
     */
    setContentHTML:function(contentHTML) {

        if (contentHTML != null) {
            this.contentHTML = contentHTML;
        }
       
        if ((this.contentDiv != null) && 
            (this.contentHTML != null) &&
            (this.contentHTML != this.contentDiv.innerHTML)) {
       
            this.contentDiv.innerHTML = this.contentHTML;
       
            if (this.autoSize) {
                
                //if popup has images, listen for when they finish
                // loading and resize accordingly
                this.registerImageListeners();

                //auto size the popup to its current contents
                this.updateSize();
            }
        }    

    },
    
    /**
     * Method: registerImageListeners
     * Called when an image contained by the popup loaded. this function
     *     updates the popup size, then unregisters the image load listener.
     */   
    registerImageListeners: function() { 

        // As the images load, this function will call updateSize() to 
        // resize the popup to fit the content div (which presumably is now
        // bigger than when the image was not loaded).
        // 
        // If the 'panMapIfOutOfView' property is set, we will pan the newly
        // resized popup back into view.
        // 
        // Note that this function, when called, will have 'popup' and 
        // 'img' properties in the context.
        //
        var onImgLoad = function() {
            if (this.popup.id === null) { // this.popup has been destroyed!
                return;
            }
            this.popup.updateSize();
     
            if ( this.popup.visible() && this.popup.panMapIfOutOfView ) {
                this.popup.panIntoView();
            }

            OpenLayers.Event.stopObserving(
                this.img, "load", this.img._onImgLoad
            );
    
        };

        //cycle through the images and if their size is 0x0, that means that 
        // they haven't been loaded yet, so we attach the listener, which 
        // will fire when the images finish loading and will resize the 
        // popup accordingly to its new size.
        var images = this.contentDiv.getElementsByTagName("img");
        for (var i = 0, len = images.length; i < len; i++) {
            var img = images[i];
            if (img.width == 0 || img.height == 0) {

                var context = {
                    'popup': this,
                    'img': img
                };

                //expando this function to the image itself before registering
                // it. This way we can easily and properly unregister it.
                img._onImgLoad = OpenLayers.Function.bind(onImgLoad, context);

                OpenLayers.Event.observe(img, 'load', img._onImgLoad);
            }    
        } 
    },

    /**
     * APIMethod: getSafeContentSize
     * 
     * Parameters:
     * size - {<OpenLayers.Size>} Desired size to make the popup.
     * 
     * Returns:
     * {<OpenLayers.Size>} A size to make the popup which is neither smaller
     *     than the specified minimum size, nor bigger than the maximum 
     *     size (which is calculated relative to the size of the viewport).
     */
    getSafeContentSize: function(size) {

        var safeContentSize = size.clone();

        // if our contentDiv has a css 'padding' set on it by a stylesheet, we 
        //  must add that to the desired "size". 
        var contentDivPadding = this.getContentDivPadding();
        var wPadding = contentDivPadding.left + contentDivPadding.right;
        var hPadding = contentDivPadding.top + contentDivPadding.bottom;

        // take into account the popup's 'padding' property
        this.fixPadding();
        wPadding += this.padding.left + this.padding.right;
        hPadding += this.padding.top + this.padding.bottom;

        if (this.closeDiv) {
            var closeDivWidth = parseInt(this.closeDiv.style.width);
            wPadding += closeDivWidth + contentDivPadding.right;
        }

        // prevent the popup from being smaller than a specified minimal size
        if (this.minSize) {
            safeContentSize.w = Math.max(safeContentSize.w, 
                (this.minSize.w - wPadding));
            safeContentSize.h = Math.max(safeContentSize.h, 
                (this.minSize.h - hPadding));
        }

        // prevent the popup from being bigger than a specified maximum size
        if (this.maxSize) {
            safeContentSize.w = Math.min(safeContentSize.w, 
                (this.maxSize.w - wPadding));
            safeContentSize.h = Math.min(safeContentSize.h, 
                (this.maxSize.h - hPadding));
        }
        
        //make sure the desired size to set doesn't result in a popup that 
        // is bigger than the map's viewport.
        //
        if (this.map && this.map.size) {
            
            var extraX = 0, extraY = 0;
            if (this.keepInMap && !this.panMapIfOutOfView) {
                var px = this.map.getPixelFromLonLat(this.lonlat);
                switch (this.relativePosition) {
                    case "tr":
                        extraX = px.x;
                        extraY = this.map.size.h - px.y;
                        break;
                    case "tl":
                        extraX = this.map.size.w - px.x;
                        extraY = this.map.size.h - px.y;
                        break;
                    case "bl":
                        extraX = this.map.size.w - px.x;
                        extraY = px.y;
                        break;
                    case "br":
                        extraX = px.x;
                        extraY = px.y;
                        break;
                    default:    
                        extraX = px.x;
                        extraY = this.map.size.h - px.y;
                        break;
                }
            }    
          
            var maxY = this.map.size.h - 
                this.map.paddingForPopups.top - 
                this.map.paddingForPopups.bottom - 
                hPadding - extraY;
            
            var maxX = this.map.size.w - 
                this.map.paddingForPopups.left - 
                this.map.paddingForPopups.right - 
                wPadding - extraX;
            
            safeContentSize.w = Math.min(safeContentSize.w, maxX);
            safeContentSize.h = Math.min(safeContentSize.h, maxY);
        }
        
        return safeContentSize;
    },
    
    /**
     * Method: getContentDivPadding
     * Glorious, oh glorious hack in order to determine the css 'padding' of 
     *     the contentDiv. IE/Opera return null here unless we actually add the 
     *     popup's main 'div' element (which contains contentDiv) to the DOM. 
     *     So we make it invisible and then add it to the document temporarily. 
     *
     *     Once we've taken the padding readings we need, we then remove it 
     *     from the DOM (it will actually get added to the DOM in 
     *     Map.js's addPopup)
     *
     * Returns:
     * {<OpenLayers.Bounds>}
     */
    getContentDivPadding: function() {

        //use cached value if we have it
        var contentDivPadding = this._contentDivPadding;
        if (!contentDivPadding) {

            if (this.div.parentNode == null) {
                //make the div invisible and add it to the page        
                this.div.style.display = "none";
                document.body.appendChild(this.div);
            }
                    
            //read the padding settings from css, put them in an OL.Bounds        
            contentDivPadding = new OpenLayers.Bounds(
                OpenLayers.Element.getStyle(this.contentDiv, "padding-left"),
                OpenLayers.Element.getStyle(this.contentDiv, "padding-bottom"),
                OpenLayers.Element.getStyle(this.contentDiv, "padding-right"),
                OpenLayers.Element.getStyle(this.contentDiv, "padding-top")
            );
    
            //cache the value
            this._contentDivPadding = contentDivPadding;

            if (this.div.parentNode == document.body) {
                //remove the div from the page and make it visible again
                document.body.removeChild(this.div);
                this.div.style.display = "";
            }
        }
        return contentDivPadding;
    },

    /**
     * Method: addCloseBox
     * 
     * Parameters:
     * callback - {Function} The callback to be called when the close button
     *     is clicked.
     */
    addCloseBox: function(callback) {

        this.closeDiv = OpenLayers.Util.createDiv(
            this.id + "_close", null, {w: 17, h: 17}
        );
        this.closeDiv.className = "olPopupCloseBox"; 
        
        // use the content div's css padding to determine if we should
        //  padd the close div
        var contentDivPadding = this.getContentDivPadding();
         
        this.closeDiv.style.right = contentDivPadding.right + "px";
        this.closeDiv.style.top = contentDivPadding.top + "px";
        this.groupDiv.appendChild(this.closeDiv);

        var closePopup = callback || function(e) {
            this.hide();
            OpenLayers.Event.stop(e);
        };
        OpenLayers.Event.observe(this.closeDiv, "touchend", 
                OpenLayers.Function.bindAsEventListener(closePopup, this));
        OpenLayers.Event.observe(this.closeDiv, "click", 
                OpenLayers.Function.bindAsEventListener(closePopup, this));
    },

    /**
     * Method: panIntoView
     * Pans the map such that the popup is totaly viewable (if necessary)
     */
    panIntoView: function() {
        
        var mapSize = this.map.getSize();
    
        //start with the top left corner of the popup, in px, 
        // relative to the viewport
        var origTL = this.map.getViewPortPxFromLayerPx( new OpenLayers.Pixel(
            parseInt(this.div.style.left),
            parseInt(this.div.style.top)
        ));
        var newTL = origTL.clone();
    
        //new left (compare to margins, using this.size to calculate right)
        if (origTL.x < this.map.paddingForPopups.left) {
            newTL.x = this.map.paddingForPopups.left;
        } else 
        if ( (origTL.x + this.size.w) > (mapSize.w - this.map.paddingForPopups.right)) {
            newTL.x = mapSize.w - this.map.paddingForPopups.right - this.size.w;
        }
        
        //new top (compare to margins, using this.size to calculate bottom)
        if (origTL.y < this.map.paddingForPopups.top) {
            newTL.y = this.map.paddingForPopups.top;
        } else 
        if ( (origTL.y + this.size.h) > (mapSize.h - this.map.paddingForPopups.bottom)) {
            newTL.y = mapSize.h - this.map.paddingForPopups.bottom - this.size.h;
        }
        
        var dx = origTL.x - newTL.x;
        var dy = origTL.y - newTL.y;
        
        this.map.pan(dx, dy);
    },

    /** 
     * Method: registerEvents
     * Registers events on the popup.
     *
     * Do this in a separate function so that subclasses can 
     *   choose to override it if they wish to deal differently
     *   with mouse events
     * 
     *   Note in the following handler functions that some special
     *    care is needed to deal correctly with mousing and popups. 
     *   
     *   Because the user might select the zoom-rectangle option and
     *    then drag it over a popup, we need a safe way to allow the
     *    mousemove and mouseup events to pass through the popup when
     *    they are initiated from outside. The same procedure is needed for
     *    touchmove and touchend events.
     * 
     *   Otherwise, we want to essentially kill the event propagation
     *    for all other events, though we have to do so carefully, 
     *    without disabling basic html functionality, like clicking on 
     *    hyperlinks or drag-selecting text.
     */
     registerEvents:function() {
        this.events = new OpenLayers.Events(this, this.div, null, true);

        function onTouchstart(evt) {
            OpenLayers.Event.stop(evt, true);
        }
        this.events.on({
            "mousedown": this.onmousedown,
            "mousemove": this.onmousemove,
            "mouseup": this.onmouseup,
            "click": this.onclick,
            "mouseout": this.onmouseout,
            "dblclick": this.ondblclick,
            "touchstart": onTouchstart,
            scope: this
        });
        
     },

    /** 
     * Method: onmousedown 
     * When mouse goes down within the popup, make a note of
     *   it locally, and then do not propagate the mousedown 
     *   (but do so safely so that user can select text inside)
     * 
     * Parameters:
     * evt - {Event} 
     */
    onmousedown: function (evt) {
        this.mousedown = true;
        OpenLayers.Event.stop(evt, true);
    },

    /** 
     * Method: onmousemove
     * If the drag was started within the popup, then 
     *   do not propagate the mousemove (but do so safely
     *   so that user can select text inside)
     * 
     * Parameters:
     * evt - {Event} 
     */
    onmousemove: function (evt) {
        if (this.mousedown) {
            OpenLayers.Event.stop(evt, true);
        }
    },

    /** 
     * Method: onmouseup
     * When mouse comes up within the popup, after going down 
     *   in it, reset the flag, and then (once again) do not 
     *   propagate the event, but do so safely so that user can 
     *   select text inside
     * 
     * Parameters:
     * evt - {Event} 
     */
    onmouseup: function (evt) {
        if (this.mousedown) {
            this.mousedown = false;
            OpenLayers.Event.stop(evt, true);
        }
    },

    /**
     * Method: onclick
     * Ignore clicks, but allowing default browser handling
     * 
     * Parameters:
     * evt - {Event} 
     */
    onclick: function (evt) {
        OpenLayers.Event.stop(evt, true);
    },

    /** 
     * Method: onmouseout
     * When mouse goes out of the popup set the flag to false so that
     *   if they let go and then drag back in, we won't be confused.
     * 
     * Parameters:
     * evt - {Event} 
     */
    onmouseout: function (evt) {
        this.mousedown = false;
    },
    
    /** 
     * Method: ondblclick
     * Ignore double-clicks, but allowing default browser handling
     * 
     * Parameters:
     * evt - {Event} 
     */
    ondblclick: function (evt) {
        OpenLayers.Event.stop(evt, true);
    },

    CLASS_NAME: "OpenLayers.Popup"
});

OpenLayers.Popup.WIDTH = 200;
OpenLayers.Popup.HEIGHT = 200;
OpenLayers.Popup.COLOR = "white";
OpenLayers.Popup.OPACITY = 1;
OpenLayers.Popup.BORDER = "0px";
