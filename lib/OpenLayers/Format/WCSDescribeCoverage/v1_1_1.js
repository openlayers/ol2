/* ======================================================================
    OpenLayers/Format/WCSDescribeCoverage/v1_1_1.js
   ====================================================================== */

/* Copyright (c) 2006-2015 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

/**
 * @requires OpenLayers/Format/WCSDescribeCoverage/v1_1_1.js
 */

/**
 * Class: OpenLayers.Format.WCSDescribeCoverage/v1_1_1
 * Read WCS DescribeCoverage version 1.1.1.
 * 
 * Inherits from:
 *  - <OpenLayers.Format.WCSDescribeCoverage.v1_1_0>
 */
OpenLayers.Format.WCSDescribeCoverage.v1_1_1 = OpenLayers.Class(
    OpenLayers.Format.WCSDescribeCoverage.v1_1_0, {

    /**
     * Property: namespaceAlias
     * {Object} Mapping of namespace URIs to namespace aliases.
     * MapServer and GeoServer use different URIs for the "wcs" alias,
     * thus two URIs must be included for each alias.
     */
    namespaceAlias: {
    	"http://www.opengis.net/wcs/1.1.1" : "wcs",
    	"http://www.opengis.net/wcs/1.1" : "wcs",
    	"http://www.opengis.net/ows/1.1.1" : "wcs",
    	"http://www.opengis.net/ows/1.1" : "wcs",
    	"http://www.w3.org/1999/xlink" : "xlink",
    	"http://www.w3.org/2001/XMLSchema-instance" : "xsi",
    	"http://www.opengis.net/ows" : "owsesri"
    },
    
    /**
     * Constructor: OpenLayers.Format.WCSDescribeCoverage.v1_1_1
     * Create a new parser for WCS capabilities version 1.1.1.
     *
     * Parameters:
     * options - {Object} An optional object whose properties will be set on
     *     this instance.
     */
    initialize: function(options) {
        if(window.ActiveXObject) {
            this.xmldom = new ActiveXObject("Microsoft.XMLDOM");
        }
        OpenLayers.Format.prototype.initialize.apply(this, [options]);
        // clone the namespace object and set all namespace aliases
        // in this class namespaceAlias is larger than namespaces, must be assigned directly
        this.namespaces = OpenLayers.Util.extend({}, this.namespaces);
        this.namespaceAlias = OpenLayers.Util.extend({}, this.namespaceAlias);
    },
    
    CLASS_NAME: "OpenLayers.Format.WCSDescribeCoverage.v1_1_1" 
});
