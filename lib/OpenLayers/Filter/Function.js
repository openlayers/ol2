/* Copyright (c) 2006-2012 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the Clear BSD license.  
 * See http://svn.openlayers.org/trunk/openlayers/license.txt for the
 * full text of the license. */

/**
 * @requires OpenLayers/Filter.js
 */

/**
 * Class: OpenLayers.Filter.Function
 * This class represents a filter function.
 * We are using this class for creation of complex 
 * filters that can contain filter functions as values.
 * Nesting function as other functions parameter is supported.
 * 
 * Inherits from:
 * - <OpenLayers.Filter>
 */
OpenLayers.Filter.Function = OpenLayers.Class(OpenLayers.Filter, {

    /**
     * APIProperty: name
     * {String} Name of the function.
     */
    name: null,
    
    /**
     * APIProperty: params
     * {Array(<OpenLayers.Filter.Function> || String || Number)} Function parameters
     * For now support only other Functions, String or Number
     */
    params: null,  
    
    /** 
     * Constructor: OpenLayers.Filter.Function
     * Creates a filter function.
     *
     * Parameters:
     * options - {Object} An optional object with properties to set on the
     *     function.
     * 
     * Returns:
     * {<OpenLayers.Filter.Function>}
     */

    CLASS_NAME: "OpenLayers.Filter.Function"
});

