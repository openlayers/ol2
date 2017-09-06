/* ======================================================================
    OpenLayers/Format/WCSCapabilities/v1_1_1.js
   ====================================================================== */

/* Copyright (c) 2006-2015 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

/**
 * @requires OpenLayers/Format/OWSCommon/v1_1_1.js
 */

/**
 * Class: OpenLayers.Format.WCSCapabilities/v1_1_1
 * Read WCS Capabilities version 1.1.1.
 * 
 * Inherits from:
 *  - <OpenLayers.Format.WCSCapabilities.v1_1_0>
 */
OpenLayers.Format.WCSCapabilities.v1_1_1 = OpenLayers.Class(
    OpenLayers.Format.WCSCapabilities.v1_1_0, {

    /**
     * Property: namespaces
     * {Object} Mapping of namespace aliases to namespace URIs.
     */
        namespaces: {
        wcs: "http://www.opengis.net/wcs/1.1.1",
        xlink: "http://www.w3.org/1999/xlink",
        xsi: "http://www.w3.org/2001/XMLSchema-instance",
        ows: "http://www.opengis.net/ows/1.1.1",
        owsesri: "http://www.opengis.net/ows",
        owcsesri: "http://www.opengis.net/wcs/1.1.1/ows"
    },

    /**
     * Constructor: OpenLayers.Format.WCSCapabilities.v1_1_0
     * Create a new parser for WCS capabilities version 1.1.0.
     *
     * Parameters:
     * options - {Object} An optional object whose properties will be set on
     *     this instance.
     */

    CLASS_NAME: "OpenLayers.Format.WCSCapabilities.v1_1_1" 

});
