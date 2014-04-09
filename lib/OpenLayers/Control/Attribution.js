/* Copyright (c) 2006-2013 by OpenLayers Contributors (see authors.txt for
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

/**
 * @requires OpenLayers/Control.js
 */

/**
 * Class: OpenLayers.Control.Attribution
 * The attribution control adds attribution from layers to the map display. 
 * It uses 'attribution' property of each layer.
 *
 * Inherits from:
 *  - <OpenLayers.Control>
 */
OpenLayers.Control.Attribution = 
  OpenLayers.Class(OpenLayers.Control, {
    
    /**
     * APIProperty: separator
     * {String} String used to separate layers.
     */
    separator: ", ",

    /**
     * APIProperty: template
     * {String} Template for the global attribution markup. This has to include the
     *     substring "${layers}", which will be replaced by the layer specific
     *     attributions, separated by <separator>. The default is "${layers}".
     */
    template: "${layers}",

    /**
     * APIProperty: layerTemplate
     * {String} Template for the layer specific attribution. This has to include
     *     the substrings "${href}" and "${title}", which will be replaced by
     *     the layer specific attribution object properties.
     *     The default is '<a href="${href}" target="_blank">${title}</a>'.
     */
    layerTemplate: '<a href="${href}" target="_blank">${title}</a>',

    /**
     * Constructor: OpenLayers.Control.Attribution 
     * 
     * Parameters:
     * options - {Object} Options for control.
     */

    /** 
     * Method: destroy
     * Destroy control.
     */
    destroy: function() {
        this.map.events.un({
            "removelayer": this.updateAttribution,
            "addlayer": this.updateAttribution,
            "changelayer": this.updateAttribution,
            "changebaselayer": this.updateAttribution,
            scope: this
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
    draw: function() {
        OpenLayers.Control.prototype.draw.apply(this, arguments);
        
        this.map.events.on({
            'changebaselayer': this.updateAttribution,
            'changelayer': this.updateAttribution,
            'addlayer': this.updateAttribution,
            'removelayer': this.updateAttribution,
            scope: this
        });
        this.updateAttribution();
        
        return this.div;    
    },

    /**
     * Method: updateAttribution
     * Update attribution string.
     */
    updateAttribution: function() {
        var attributions = [], attribution;
        if (this.map && this.map.layers) {
            for(var i=0, len=this.map.layers.length; i<len; i++) {
                var layer = this.map.layers[i];
                if (layer.attribution && layer.getVisibility()) {
                    attribution = (typeof layer.attribution == "object") ?
                        OpenLayers.String.format(
                            this.layerTemplate, layer.attribution) :
                        layer.attribution;
                    // add attribution only if attribution text is unique
                    if (OpenLayers.Util.indexOf(
                                    attributions, attribution) === -1) {
                        attributions.push( attribution );
                    }
                }
            } 
            this.div.innerHTML = OpenLayers.String.format(this.template, {
                layers: attributions.join(this.separator)
            });
        }
    },

    CLASS_NAME: "OpenLayers.Control.Attribution"
});
