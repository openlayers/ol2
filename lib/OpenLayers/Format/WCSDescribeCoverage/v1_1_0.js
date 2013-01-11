/* Copyright (c) 2006-2012 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

/**
 * @requires OpenLayers/Format/WCSDescribeCoverage/v1.js
 * @requires OpenLayers/Format/OWSCommon/v1_1_0.js
 */

/**
 * Class: OpenLayers.Format.WCSDescribeCoverage/v1_1_0
 * Read WCS Capabilities version 1.1.0.
 * 
 * Inherits from:
 *  - <OpenLayers.Format.WCSDescribeCoverage.v1>
 */
OpenLayers.Format.WCSDescribeCoverage.v1_1_0 = OpenLayers.Class(
    OpenLayers.Format.WCSDescribeCoverage.v1, {

    /**
     * Property: namespaces
     * {Object} Mapping of namespace aliases to namespace URIs.
     */
    namespaces: {
        wcs: "http://www.opengis.net/wcs/1.1",
        xlink: "http://www.w3.org/1999/xlink",
        xsi: "http://www.w3.org/2001/XMLSchema-instance",
        ows: "http://www.opengis.net/ows/1.1"
    },

    /**
     * Constructor: OpenLayers.Format.WCSDescribeCoverage.v1_1_0
     * Create a new parser for WCS capabilities version 1.1.0.
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
        "wcs": OpenLayers.Util.applyDefaults({
            // Root object, contains one or more CoverageDecription entries
            // In 1.0.0, this was CoverageDescription, in 1.1.0, it's CoverageDescriptions (plural)
            "CoverageDescriptions": function(node, obj) {
                obj.coverageDescriptions = {};        
                this.readChildNodes(node, obj.coverageDescriptions);

                obj.coverageDescriptionKeys = [];
                for(var key in obj.coverageDescriptions) {
                    if(obj.coverageDescriptions.hasOwnProperty(key)) {
                        obj.coverageDescriptionKeys.push(key);
                    }
                }
                // This would be more efficient, but only in newer browsers:
                // obj.coverageDescriptionKeys = Object.keys(obj.coverageDescriptions);
            },
            // In 1.0.0, CoverageDescription was called CoverageOffering
            "CoverageDescription": function(node, descriptions) {
                var description = {};
                this.readChildNodes(node, description);
                descriptions[description.identifier] = description;
            },
            "Identifier": function(node, description) {
                description.identifier = this.getChildValue(node);
            },
            "Title": function(node, description) {
                description.title = this.getChildValue(node);
            },
            "Domain": function(node, description) {
                description.domain = {};
                this.readChildNodes(node, description.domain);
            },
            "SpatialDomain": function(node, domain) {
                domain.spatialDomain = {};
                domain.spatialDomain.BoundingBox = [];
                this.readChildNodes(node, domain.spatialDomain);
            },
            "GridCRS": function(node, spatialDomain) {
                spatialDomain.gridCRS = {};
                this.readChildNodes(node, spatialDomain.gridCRS);
            },
            "GridBaseCRS": function(node, gridCRS) {
                gridCRS.gridBaseCRS = this.getChildValue(node);
            },
            "GridType": function(node, gridCRS) {
                gridCRS.gridType = this.getChildValue(node);
            },
            "GridOrigin": function(node, gridCRS) {
                var xy = this.getChildValue(node).split(' '); 
                if(xy.length == 2) {
                    gridCRS.gridOrigin = {};
                    gridCRS.gridOrigin.x = Number(xy[0]);
                    gridCRS.gridOrigin.y = Number(xy[1]);
                }
            },
            "GridOffsets": function(node, gridCRS) {
                gridCRS.gridOffsets = this.getChildValue(node);
            },
            "GridCS": function(node, gridCRS) {
                gridCRS.gridCS = this.getChildValue(node);
            },
            "SupportedCRS": function(node, description) {
                if(!!!description.supportedCRSs)
                    description.supportedCRSs = [];
                var crs = this.getChildValue(node);
                description.supportedCRSs.push(crs);
            },
            "SupportedFormat": function(node, description) {
                if(!!!description.supportedFormats)
                    description.supportedFormats = [];
                var format = this.getChildValue(node);
                description.supportedFormats.push(format);
            }
        }, OpenLayers.Format.WCSDescribeCoverage.v1.prototype.readers["wcs"]),
        "ows": OpenLayers.Format.OWSCommon.v1_1_0.prototype.readers["ows"]
    },

    CLASS_NAME: "OpenLayers.Format.WCSDescribeCoverage.v1_1_0" 

});
