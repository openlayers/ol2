/* Copyright (c) 2006-2012 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

/**
 * @requires OpenLayers/Format/XML/VersionedOGC.js
 * @requires OpenLayers/Filter/FeatureId.js
 * @requires OpenLayers/Filter/Logical.js
 * @requires OpenLayers/Filter/Comparison.js
 */

/**
 * Class: OpenLayers.Format.Filter
 * Read/Write ogc:Filter. Create a new instance with the <OpenLayers.Format.Filter>
 *     constructor.
 * 
 * Inherits from:
 *  - <OpenLayers.Format.XML.VersionedOGC>
 */
OpenLayers.Format.Filter = OpenLayers.Class(OpenLayers.Format.XML.VersionedOGC, {
    
    /**
     * APIProperty: defaultVersion
     * {String} Version number to assume if none found.  Default is "1.0.0".
     */
    defaultVersion: "1.0.0",
    
    /**
     * APIMethod: write
     * Write an ogc:Filter given a filter object.
     *
     * Parameters:
     * filter - {<OpenLayers.Filter>} An filter.
     * options - {Object} Optional configuration object.
     *
     * Returns:
     * {Elment} An ogc:Filter element node.
     */
    
    /**
     * APIMethod: read
     * Read and Filter doc and return an object representing the Filter.
     *
     * Parameters:
     * data - {String | DOMElement} Data to read.
     *
     * Returns:
     * {<OpenLayers.Filter>} A filter object.
     */

    CLASS_NAME: "OpenLayers.Format.Filter" 
});
