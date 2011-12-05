/* Copyright (c) 2006-2011 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the Clear BSD license.  
 * See http://svn.openlayers.org/trunk/openlayers/license.txt for the
 * full text of the license. */

/**
 * @requires OpenLayers/Format/WFSCapabilities/v1.js
 */

/**
 * Class: OpenLayers.Format.WFSCapabilities/v1_1_0
 * Read WFS Capabilities version 1.1.0.
 * 
 * Inherits from:
 *  - <OpenLayers.Format.WFSCapabilities>
 */
OpenLayers.Format.WFSCapabilities.v1_1_0 = OpenLayers.Class(
    OpenLayers.Format.WFSCapabilities.v1, {
    
    /**
     * Constructor: OpenLayers.Format.WFSCapabilities.v1_1_0
     * Create a new parser for WFS capabilities version 1.1.0.
     *
     * Parameters:
     * options - {Object} An optional object whose properties will be set on
     *     this instance.
     */

    /**
     * Method: read_cap_DefaultSRS
     */
    read_cap_DefaultSRS: function(obj, node) {
        var defaultSRS = this.getChildValue(node);
        if (defaultSRS) {
            obj.srs = defaultSRS;
        }
    },

    CLASS_NAME: "OpenLayers.Format.WFSCapabilities.v1_1_0" 

});
