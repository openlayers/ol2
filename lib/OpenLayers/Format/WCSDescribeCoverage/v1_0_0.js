/* Copyright (c) 2006-2013 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

/**
 * @requires OpenLayers/Format/WCSDescribeCoverage/v1.js
 * @requires OpenLayers/Format/OWSCommon/v1_0_0.js
 * @requires OpenLayers/Format/GML/v3.js
 * @requires OpenLayers/Format/WCSCapabilities/v1_0_0.js
 */

/**
 * Class: OpenLayers.Format.WCSDescribeCoverage/v1_0_0
 * Read WCS DescribeCoverage version 1.0.0.
 * 
 * Inherits from:
 *  - <OpenLayers.Format.WCSDescribeCoverage.v1>
 */
OpenLayers.Format.WCSDescribeCoverage.v1_0_0 = OpenLayers.Class(
    OpenLayers.Format.WCSDescribeCoverage.v1, {

    /**
     * Property: namespaces
     * {Object} Mapping of namespace aliases to namespace URIs.
     */
    namespaces: {
        wcs: "http://www.opengis.net/wcs",
        xlink: "http://www.w3.org/1999/xlink",
        xsi: "http://www.w3.org/2001/XMLSchema-instance",
        ows: "http://www.opengis.net/ows",
        gml: "http://www.opengis.net/gml"
    },

    /**
     * Constructor: OpenLayers.Format.WCSDescribeCoverage.v1_0_0
     * Create a new parser for WCS DescribeCoverage version 1.0.0.
     *
     * Parameters:
     * options - {Object} An optional object whose properties will be set on
     *     this instance.
     */

    /**
     * Property: readers
     * Contains public functions, grouped by namespace prefix, that will
     *     be applied when a namespaced node is found matching the function
     *     name.  The function will be applied in the scope of this parser
     *     with two arguments: the node being read and a context object passed
     *     from the parent.
     */
    readers: {
        "wcs": {
            // Root object, contains one or more CoverageDecription entries
            // In 1.0.0, this is CoverageDescription, in 1.1.0, 
            // it will be CoverageDescriptions (plural)
            "CoverageDescription": function(node, obj) {
                obj.coverageDescriptions = {};        
                this.readChildNodes(node, obj.coverageDescriptions);

                // Make a list of keys for easy access
                obj.coverageDescriptionKeys = [];
                for(var key in obj.coverageDescriptions) {
                    obj.coverageDescriptionKeys.push(key);
                }
            },
            // In 1.1.0, this element is called CoverageDescription.  We'll use
            // that name because it's... better.
            "CoverageOffering": function(node, descriptions) {
                var description = {};
                this.readChildNodes(node, description);
                descriptions[description.identifier] = description;

                // Provide a consistent handle on the native CRS 
                description.nativeCRS = description.supportedCRSs.nativeCRSs[0];
            },
            // As with GetCapabilities, we'll use the 1.1.0 element name
            // (identifier) because it is less ambiguous
            "name": function(node, description) {
                description.identifier = this.getChildValue(node);
            },
            // As with GetCapabilities, we'll use the 1.1.0 element name
            // (title) because it is less ambiguous
            "label": function(node, description) {
                description.title = this.getChildValue(node);
            },
            // This format is the same as that used by GetCapabilities 1.0.0,
            // so we can reuse that reader
            "lonLatEnvelope": function(node, description) {
                OpenLayers.Format.WCSCapabilities.v1_0_0.prototype.readers.wcs.lonLatEnvelope.call(this, node, description);
            },
            // Essentially the same as domain in 1.1.0
            "domainSet": function(node, description) {
                description.domain = {};
                this.readChildNodes(node, description.domain);
            },
            "spatialDomain": function(node, domain) {
                domain.spatialDomain = { boundingBoxes: {} };
                this.readChildNodes(node, domain.spatialDomain);
            },
             "nativeCRSs": function(node, description) {
                if(!description.nativeCRSs) {
                    description.nativeCRSs = [];
                }
                var crs = this.getChildValue(node);
                description.nativeCRSs.push(crs);
            },
            "supportedCRSs": function(node, description) {
                if(!description.supportedCRSs) {
                    description.supportedCRSs = [];
                }
                this.readChildNodes(node, description.supportedCRSs)
            },
            // There will be several of these within the supportedCRSs tag
            "requestResponseCRSs" : function(node, supportedCRSs) {
                supportedCRSs.push(this.getChildValue(node));
            },
             "supportedFormats": function(node, description) {
                if(!description.supportedFormats) {
                    description.supportedFormats = [];
                }
                this.readChildNodes(node, description.supportedFormats)
            },
            // There will be several of these within the supportedFormats tag
            "formats" : function(node, supportedFormats) {
                supportedFormats.push(this.getChildValue(node));
            }
        }, 
 
        "ows": OpenLayers.Format.OWSCommon.v1_0_0.prototype.readers["ows"],
        "gml": OpenLayers.Util.applyDefaults({
            // Use custom Envelope reader that understands the srsName attribute
            "Envelope": function(node, spatialDomain) {
                var srsName = node.getAttribute("srsName");
                if(!srsName) { // No SRS?  What does this envelope mean?!?
                    return;
                }

                var obj = {points: []};
                this.readChildNodes(node, obj);

                var min = obj.points[0];
                var max = obj.points[1];
                var bounds = new OpenLayers.Bounds(min.x, min.y, max.x, max.y);
                spatialDomain.boundingBoxes[srsName] = bounds;
            }
        }, OpenLayers.Format.GML.v3.prototype.readers["gml"])
    },

    CLASS_NAME: "OpenLayers.Format.WCSDescribeCoverage.v1_0_0" 

});
