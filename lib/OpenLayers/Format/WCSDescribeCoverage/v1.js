/* Copyright (c) 2006-2013 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

/**
 * @requires OpenLayers/Format/WCSDescribeCoverage.js
 * @requires OpenLayers/Format/XML.js
 */

/**
 * Class: OpenLayers.Format.WCSDescribeCoverage.v1
 * Abstract class not to be instantiated directly.
 * 
 * Inherits from:
 *  - <OpenLayers.Format.XML>
 */
OpenLayers.Format.WCSDescribeCoverage.v1 = OpenLayers.Class(
    OpenLayers.Format.XML, {

    regExes: {
        trimSpace: (/^\s*|\s*$/g),
        splitSpace: (/\s+/)
    },

    /**
     * Property: defaultPrefix
     */
    defaultPrefix: "wcs",

    /**
     * APIMethod: read
     *
     * Parameters:
     * data - {DOMElement|String} A WCS DescribeCoverage document.
     *
     * Returns:
     * {Object} An object representing the WCS DescribeCoverage response.
     */
    read: function(data) {
        if(typeof data == "string") { 
            data = OpenLayers.Format.XML.prototype.read.apply(this, [data]);
        }
        if(data && data.nodeType == 9) {
            data = data.documentElement;
        }
        var schema = {};
        if (data.nodeName.split(":").pop() === 'ExceptionReport') {
            // an exception must have occurred, so parse it
            var parser = new OpenLayers.Format.OGCExceptionReport();
            schema.error = parser.read(data);
        } else {
            this.readNode(data, schema);
        }
        return schema;
    },

    CLASS_NAME: "OpenLayers.Format.WCSDescribeCoverage.v1" 

});
