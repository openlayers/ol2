/* Copyright (c) 2006-2012 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

/**
 * @requires OpenLayers/Renderer.js
 */

/**
 * Class: OpenLayers.Renderer.Markers
 * 
 * Inherits:
 *  - <OpenLayers.Renderer>
 */
OpenLayers.Renderer.Markers = OpenLayers.Class(OpenLayers.Renderer, {

    /**
     * Constructor: OpenLayers.Renderer.Markers
     *
     * Parameters:
     * containerID - {<String>}
     * options - {Object} options for this renderer. 
     */
    initialize: function(containerID, options) {
        OpenLayers.Renderer.prototype.initialize.apply(this, arguments);
        OpenLayers.Util.extend(this, options);
        this.root = this.container;
    },

    /**
     * APIMethod: destroy
     */
    destroy: function() {
        this.clear();
        this.root = null;
        OpenLayers.Renderer.prototype.destroy.apply(this, arguments);
    },

    /**
     * Method: drawFeature
     * Draw the feature.  The optional style argument can be used
     * to override the feature's own style.  This method should only
     * be called from layer.drawFeature().
     *
     * Parameters:
     * feature - {<OpenLayers.Feature.Vector>}
     * style - {<Object>}
     *
     * Returns:
     * {Boolean} true if the feature has been drawn completely, false if not,
     *     undefined if the feature had no geometry
     */
    drawFeature: function(feature, style) {
        if(style == null) {
            style = feature.style;
        }
        if (feature.geometry) {
            var bounds = feature.geometry.getBounds();
            if(bounds) {
                if (!bounds.intersectsBounds(this.extent)) {
                    style = {display: "none"};
                }
                return this.drawGeometry(feature.geometry, style, feature.id);
            }
        }
    },

    /**
     * Method: clear
     * Remove all the elements from the root
     */
    clear: function() {
        if (this.root) {
            while (this.root.childNodes.length > 0) {
                this.root.removeChild(this.root.firstChild);
            }
        }
    },

    /**
     * Method: getFeatureIdFromEvent
     *
     * Parameters:
     * evt - {Object} An <OpenLayers.Event> object
     *
     * Returns:
     * {String} The featureId of the object where the event happened
     */
    getFeatureIdFromEvent: function(evt) {
        return evt.target._featureId;
    },

    /**
     * APIMethod: supported
     *
     * Returns:
     * {Boolean} Whether or not the browser supports this renderer
     */
    supported: function() {
        return true;
    },

    /**
     * Method: setExtent
     *
     * Parameters:
     * extent - {<OpenLayers.Bounds>}
     * resolutionChanged - {Boolean}
     *
     * Returns:
     * {Boolean} true to notify the layer that the new extent does not exceed
     *     the coordinate range, and the features will not need to be redrawn.
     *     False otherwise.
     */
    setExtent: function(extent, resolutionChanged) {
        OpenLayers.Renderer.prototype.setExtent.apply(this, arguments);
        var resolution = this.getResolution();
        this.left = -extent.left / resolution;
        this.top = extent.top / resolution;
        return false;
    },

    /**
     * Method: eraseGeometry
     * Erase a geometry from the renderer. We look for a node with the
     *     featureId and remove it from the DOM.
     *
     * Parameters:
     * geometry - {<OpenLayers.Geometry>}
     * featureId - {String}
     */
    eraseGeometry: function(geometry, featureId) {
        var element = document.getElementById(featureId);
        if (element && element.parentNode) {
           element.parentNode.removeChild(element);
        }
    },

    /**
     * Method: drawGeometry
     * Draw the geometry, creating new nodes, setting featureId on the node. 
     *     This method should only be called by the renderer itself.
     *
     * Parameters:
     * geometry - {<OpenLayers.Geometry>}
     * style - {Object}
     * featureId - {String}
     *
     * Returns:
     * {Boolean} true if the geometry has been drawn completely; null if
     *     incomplete; false otherwise
     */
    drawGeometry: function(geometry, style, featureId) {
        var rendered = false;
        if (geometry instanceof OpenLayers.Geometry.Point) {
            var width = style.graphicWidth;
            var height = style.graphicHeight;
            var xOffset = (style.graphicXOffset != undefined) ?
                style.graphicXOffset : -(0.5 * width);
            var yOffset = (style.graphicYOffset != undefined) ?
                style.graphicYOffset : -(0.5 * height);
            var node = document.getElementById(geometry.id);
            var resolution = this.getResolution(),
                x = Math.round((geometry.x / resolution + this.left) + xOffset),
                y = Math.round((this.top - geometry.y / resolution) + yOffset);
            if (node) {
                if (style.display != "none") {
                    node.style.left = x + "px";
                    node.style.top = y + "px";
                    node.style.width = width + "px";
                    node.style.height = height + "px";
                    if (node.getAttribute("src") !== style.externalGraphic) {
                        node.setAttribute("src", style.externalGraphic);
                    }
                    rendered = true;
                }
            } else if (style.display !== "none") { 
                node = document.createElement('img');
                node.setAttribute("src", style.externalGraphic);
                node.style.width = width + "px";
                node.style.height = height + "px";
                node.id = geometry.id;
                node._featureId = featureId;
                node.style.left = x + "px";
                node.style.top = y + "px";
                node.style.position = "absolute";
                this.root.appendChild(node);
                rendered = true;
            }
            if (node && rendered === false) {
                this.root.removeChild(node);
            }
            return rendered;
        }
    },

    CLASS_NAME: "OpenLayers.Renderer.Markers"

});
