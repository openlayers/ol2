/* Copyright (c) 2006-2011 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the Clear BSD license.  
 * See http://svn.openlayers.org/trunk/openlayers/license.txt for the
 * full text of the license. */

/** 
 * @requires OpenLayers/Control/LayerSwitcher.js
 * @requires OpenLayers/Control.js
 * @requires OpenLayers/Lang.js
 * @requires Rico/Corner.js
 */

/**
 * Class: OpenLayers.Control.LayerSwitcherGroups
 * The LayerSwitcherGroups control displays a table of contents for the map
 * similar to LayerSwitcher but with split over groups (like lakes, building, etc).
 * 
 * Inherits from:
 *  - <OpenLayers.Control.LayerSwitcher>
 */
OpenLayers.Control.LayerSwitcherGroups = 
  OpenLayers.Class(OpenLayers.Control.LayerSwitcher, {
    /**
     * Constructor: OpenLayers.Control.LayerSwitcherGroups
     * 
     * Parameters:
     * options - {Object}
     */
    initialize: function(options) {
        OpenLayers.Control.LayerSwitcher.prototype.initialize.apply(this, arguments);
        this.layerStates = [];
    },

    /**
     * APIMethod: destroy 
     */    
    destroy: function() {
        
        OpenLayers.Event.stopObservingElement(this.div);

        OpenLayers.Event.stopObservingElement(this.minimizeDiv);
        OpenLayers.Event.stopObservingElement(this.maximizeDiv);

        //clear out layers info and unregister their events 
        this.clearLayersArray("base");
        this.clearLayersArray("data");
        
        this.map.events.un({
            "addlayer": this.redraw,
            "changelayer": this.redraw,
            "removelayer": this.redraw,
            "changebaselayer": this.redraw,
            scope: this
        });
        
        OpenLayers.Control.prototype.destroy.apply(this, arguments);
    },

    /** 
     * Method: clearLayersArray
     * User specifies either "base" or "data". we then clear all the
     *     corresponding listeners, the div, and reinitialize a new array.
     * 
     * Parameters:
     * layersType - {String}  
     */
    clearLayersArray: function(layersType) {
        var layers = this[layersType + "Layers"];
        if (layers) {
            for(var i=0, len=layers.length; i<len ; i++) {
                var layer = layers[i];
                OpenLayers.Event.stopObservingElement(layer.inputElem);
                OpenLayers.Event.stopObservingElement(layer.labelSpan);
            }
        }
        this[layersType + "LayersDiv"].innerHTML = "";
        this[layersType + "Layers"] = [];
    },


    /**
     * Method: checkRedraw
     * Checks if the layer state has changed since the last redraw() call.
     * 
     * Returns:
     * {Boolean} The layer state changed since the last redraw() call. 
     */
    checkRedraw: function() {
        var redraw = false;
        if ( !this.layerStates.length ||
             (this.map.layers.length != this.layerStates.length) ) {
            redraw = true;
        } else {
            for (var i=0, len=this.layerStates.length; i<len; i++) {
                var layerState = this.layerStates[i];
                var layer = this.map.layers[i];
                if ( (layerState.name != layer.name) || 
                     (layerState.inRange != layer.inRange) || 
                     (layerState.id != layer.id) || 
                     (layerState.visibility != layer.visibility) ) {
                    redraw = true;
                    break;
                }    
            }
        }    
        return redraw;
    },
    
    /** 
     * Method: redraw
     * Goes through and takes the current state of the Map and rebuilds the
     *     control to display that state. Groups base layers into a 
     *     radio-button group and lists each data layer with a checkbox.
     *
     * Returns: 
     * {DOMElement} A reference to the DIV DOMElement containing the control
     */  
    redraw: function() {
        //if the state hasn't changed since last redraw, no need 
        // to do anything. Just return the existing div.
        if (!this.checkRedraw()) { 
            return this.div; 
        } 

        //clear out previous layers 
        this.clearLayersArray("base");
        this.clearLayersArray("data");
        
        var containsOverlays = false;
        var containsBaseLayers = false;
        
        // Save state -- for checking layer if the map state changed.
        // We save this before redrawing, because in the process of redrawing
        // we will trigger more visibility changes, and we want to not redraw
        // and enter an infinite loop.
        var len = this.map.layers.length;
        this.layerStates = new Array(len);
        for (var i=0; i <len; i++) {
            var layer = this.map.layers[i];
            this.layerStates[i] = {
                'name': layer.name, 
                'visibility': layer.visibility,
                'inRange': layer.inRange,
                'id': layer.id
            };
        }    

        var layers = this.map.layers.slice();
        if (!this.ascending) { layers.reverse(); }

        function addLayer(layer, baseLayer) {
            // only check a baselayer if it is *the* baselayer, check data
            //  layers if they are visible
            var checked = (baseLayer) ? (layer == this.map.baseLayer)
                                      : layer.getVisibility();

            // create input element
            var inputElem = document.createElement("input");
            inputElem.id = this.id + "_input_" + layer.name;
            inputElem.name = (baseLayer) ? this.id + "_baseLayers" : layer.name;
            inputElem.type = (baseLayer) ? "radio" : "checkbox";
            inputElem.value = layer.name;
            inputElem.checked = checked;
            inputElem.defaultChecked = checked;
            inputElem.className = "olButton";
			      inputElem._layer = layer.id;
			      inputElem._layerSwitcher = this.id;

            if (!baseLayer && !layer.inRange) {
                inputElem.disabled = true;
            }
            var context = {
                'inputElem': inputElem,
                'layer': layer,
                'layerSwitcher': this
            };
            OpenLayers.Event.observe(inputElem, "mouseup", 
                OpenLayers.Function.bindAsEventListener(this.onInputClick,
                                                        context)
            );
            
            // create span
            var labelSpan = document.createElement("span");
            OpenLayers.Element.addClass(labelSpan, "labelSpan");
            if (!baseLayer && !layer.inRange) {
                labelSpan.style.color = "gray";
            }
            labelSpan.innerHTML = layer.name;
            labelSpan.style.verticalAlign = (baseLayer) ? "bottom" 
                                                        : "baseline";
            OpenLayers.Event.observe(labelSpan, "click", 
                OpenLayers.Function.bindAsEventListener(this.onInputClick,
                                                        context)
            );
            // create line break
            var br = document.createElement("br");
            
            var groupArray = (baseLayer) ? this.baseLayers
                                         : this.dataLayers;
            groupArray.push({
                'layer': layer,
                'inputElem': inputElem,
                'labelSpan': labelSpan
            });
                                                 

            var groupDiv = (baseLayer) ? this.baseLayersDiv
                                       : this.dataLayersDiv;
            groupDiv.appendChild(inputElem);
            groupDiv.appendChild(labelSpan);
            groupDiv.appendChild(br);
        }

        function addGroupHeader(group, layers) {
            var checked = true;
            var toggleElem = document.createElement("span");
            toggleElem.innerHTML = layers.hide ? "+" : "-";
            toggleElem.id = this.id + "_span_group_" + group;
            toggleElem.style.marginLeft = "-1em";
            toggleElem.style.marginTop = "-0.1em";
            toggleElem.style.width = "0.5em";
            toggleElem.style.display = "inline-block";
            toggleElem.style.verticalAlign = "top";

            var inputElem = document.createElement("input");
            inputElem.name = group;
            inputElem.id = this.id + "_input_group_" + group;
            inputElem.type = "checkbox";
            inputElem.value = group;
            var allLayers = true;
            for (var i=0; i<layers.length; i++) {
                if (!layers[i].getVisibility()) { allLayers = false; }
            }
            layers.checked = layers.checked || allLayers;
            inputElem.checked = layers.checked;
            inputElem.defaultChecked = layers.checked;

            var context = {
                'toggleElem': toggleElem,
                'inputElem': inputElem,
                'group': group,
                'layers': layers,
                'layerSwitcher': this
            };
            function hideClick() {
                if (this.toggleElem.innerHTML == "+") { 
                    layers.hide = false; 
                    this.toggleElem.innerHTML = "-";
                } else {
                    layers.hide = true;
                    this.toggleElem.innerHTML = "+";
                }
                addGroupHeader.maintainVisibility.call(this);
            }
            addGroupHeader.maintainVisibility = function() {
                var el = this.inputElem.nextSibling.nextSibling;
                while(el = el.nextSibling) {
                    if (el.id.match(/_span_group_/)) { break; }
                    if (this.layers.hide) {
                        el.oldDisplay = el.style.display;
                        el.style.display = 'none';
                    } else {
                        el.style.display = el.oldDisplay;
                    }
                }
            }
            function toggleClick() {
                var el = this.inputElem;
                el.checked = layers.checked = !layers.checked;
                while(el = el.nextSibling) {
                    if (el.id.match(/_input_group/)) { break; }
                    if (el.tagName.toLowerCase() != "input") { continue; }
                    el.checked = layers.checked;
                }
                for(var i=0, len=this.layers.length; i<len; i++) {
                    var layer = this.layers[i];
                    layer.setVisibility(layers.checked);
                }
            }

            // create span
            var labelSpan = document.createElement("span");
            OpenLayers.Element.addClass(labelSpan, "labelSpan");
            if (!layer.inRange) {
                labelSpan.style.color = "gray";
                inputElem.disabled = true;
            }
            labelSpan.innerHTML = group;
            labelSpan.style.verticalAlign = "baseline";
            OpenLayers.Event.observe(toggleElem, "click", 
                OpenLayers.Function.bindAsEventListener(hideClick, context)
            );
            OpenLayers.Event.observe(inputElem, "mouseup", 
                OpenLayers.Function.bindAsEventListener(toggleClick, context)
            );
            OpenLayers.Event.observe(labelSpan, "click", 
                OpenLayers.Function.bindAsEventListener(toggleClick, context)
            );
            var br = document.createElement("br");
            var groupDiv = this.dataLayersDiv;
            groupDiv.appendChild(toggleElem);
            groupDiv.appendChild(inputElem);
            groupDiv.appendChild(labelSpan);
            groupDiv.appendChild(br);
            return context;
        }

        // add base layers
        for(var i=0, len=layers.length; i<len; i++) {
            var layer = layers[i];
            var baseLayer = layer.isBaseLayer;

            if (!layer.displayInLayerSwitcher) { continue; }

            if (baseLayer) {
                containsBaseLayers = true;
                addLayer.call(this, layer, baseLayer);
            } else {
                containsOverlays = true;
            }    
        }

        if (!this.groups) {
            this.groups = {};
            for (var i=0; i<layers.length; i++) {
                var layer = layers[i];
                if (!layer.displayInLayerSwitcher || layer.isBaseLayer) continue;
                if (!layer.group) { layer.group = "_no_group"; }
                this.groups[layer.group] = (this.groups[layer.group] || []);
                this.groups[layer.group].hide = true;
                this.groups[layer.group].push(layer);
            }
        }
        for (var group in this.groups) {
            if (!this.groups.hasOwnProperty(group)) { continue; }
            var layers = this.groups[group];
            var ctx = null;
            if (group !== "_no_group") { ctx = addGroupHeader.call(this, group, layers); }
            for(var i=0, len=layers.length; i<len; i++) {
                var layer = layers[i];
                addLayer.call(this, layer, false);
            }
            if (ctx) { addGroupHeader.maintainVisibility.call(ctx); }
        }
        // if no overlays, dont display the overlay label
        this.dataLbl.style.display = (containsOverlays) ? "" : "none";        
        
        // if no baselayers, dont display the baselayer label
        this.baseLbl.style.display = (containsBaseLayers) ? "" : "none";        

        return this.div;
    },

    /** 
     * Method:
     * A label has been clicked, check or uncheck its corresponding input
     * 
     * Parameters:
     * e - {Event} 
     *
     * Context:  
     *  - {DOMElement} inputElem
     *  - {<OpenLayers.Control.LayerSwitcher>} layerSwitcher
     *  - {<OpenLayers.Layer>} layer
     */

    onInputClick: function(e) {

        if (!this.inputElem.disabled) {
            if (this.inputElem.type == "radio") {
                this.inputElem.checked = true;
                this.layer.map.setBaseLayer(this.layer);
            } else {
                this.inputElem.checked = !this.inputElem.checked;
                this.layerSwitcher.updateMap();
            }
        }
        OpenLayers.Event.stop(e);
    },
    
    /** 
     * Method: updateMap
     * Cycles through the loaded data and base layer input arrays and makes
     *     the necessary calls to the Map object such that that the map's 
     *     visual state corresponds to what the user has selected in 
     *     the control.
     */
    updateMap: function() {

        // set the newly selected base layer        
        for(var i=0, len=this.baseLayers.length; i<len; i++) {
            var layerEntry = this.baseLayers[i];
            if (layerEntry.inputElem.checked) {
                this.map.setBaseLayer(layerEntry.layer, false);
            }
        }

        // set the correct visibilities for the overlays
        for(var i=0, len=this.dataLayers.length; i<len; i++) {
            var layerEntry = this.dataLayers[i];   
            layerEntry.layer.setVisibility(layerEntry.inputElem.checked);
        }

    },

    CLASS_NAME: "OpenLayers.Control.LayerSwitcher"
});
