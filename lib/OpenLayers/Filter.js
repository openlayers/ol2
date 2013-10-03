/* Copyright (c) 2006-2013 by OpenLayers Contributors (see authors.txt for
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */


/**
 * @requires OpenLayers/BaseTypes/Class.js
 * @requires OpenLayers/Util.js
 * @requires OpenLayers/Style.js
 */

/**
 * Class: OpenLayers.Filter
 * This class represents an OGC Filter.
 */
OpenLayers.Filter = OpenLayers.Class({
    
    /** 
     * Constructor: OpenLayers.Filter
     * This class represents a generic filter.
     *
     * Parameters:
     * options - {Object} Optional object whose properties will be set on the
     *     instance.
     * 
     * Returns:
     * {<OpenLayers.Filter>}
     */
    initialize: function(options) {
        OpenLayers.Util.extend(this, options);
    },

    /** 
     * APIMethod: destroy
     * Remove reference to anything added.
     */
    destroy: function() {
    },

    /**
     * APIMethod: evaluate
     * Evaluates this filter for a given feature.  Instances or subclasses
     * are supposed to override this method.
     * 
     * Parameters:
     * feature - {Object} Feature to use in evaluating the filter.
     * 
     * Returns:
     * {Boolean} The filter applies or matches.
     */
    evaluate: function(context) {
        return true;
    },
    
    /**
     * APIMethod: clone
     * Clones this filter. Should be implemented by subclasses.
     * 
     * Returns:
     * {<OpenLayers.Filter>} Clone of this filter.
     */
    clone: function() {
        return null;
    },
    
    /**
     * APIMethod: toString
     *
     * Returns:
     * {String} Include <OpenLayers.Format.CQL> in your build to get a CQL
     *     representation of the filter returned. Otherwise "[Object object]"
     *     will be returned.
     */
    toString: function() {
        var string;
        if (OpenLayers.Format && OpenLayers.Format.CQL) {
            string = OpenLayers.Format.CQL.prototype.write(this);
        } else {
            string = Object.prototype.toString.call(this);
        }
        return string;
    },
    
    /**
     * Method: getContext
     * Gets the context for evaluating this filter.  Some subclasses already
     * use this functionality so this function is provided to standardise
     * the concept of context.
     * 
     * Paramters:
     * feature - {<OpenLayers.Feature>} feature to take the context from if
     *           none is specified.
     */
    getContext: function(feature) {
        var context = feature.attributes || feature.data;
        if (typeof context == "function") {
            context = context(feature);
        }
        return context;
    },

    CLASS_NAME: "OpenLayers.Filter"
});
