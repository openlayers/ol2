/* Copyright (c) 2006-2013 by OpenLayers Contributors (see authors.txt for
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

/**
 * @requires OpenLayers/Format/WFST/v1.js
 * @requires OpenLayers/Format/Filter/v2_0_0.js
 * @requires OpenLayers/Format/OWSCommon/v1_0_0.js
 */

/**
 * Class: OpenLayers.Format.WFST.v2_0_0
 * A format for creating WFS v2.0.0 transactions.  Create a new instance with the
 *     <OpenLayers.Format.WFST.v2_0_0> constructor.
 *
 * Inherits from:
 *  - <OpenLayers.Format.Filter.v2_0_0>
 *  - <OpenLayers.Format.WFST.v1>
 */
OpenLayers.Format.WFST.v2_0_0 = OpenLayers.Class(
    OpenLayers.Format.Filter.v2_0_0, OpenLayers.Format.WFST.v1, {
    
    /**
     * Property: namespaces
     * {Object} Mapping of namespace aliases to namespace URIs.
     */
    namespaces: {
        xlink: "http://www.w3.org/1999/xlink",
        xsi: "http://www.w3.org/2001/XMLSchema-instance",
        wfs: "http://www.opengis.net/wfs/2.0",
        gml: "http://www.opengis.net/gml/3.2",
        fes: "http://www.opengis.net/fes/2.0",
        xmlns: "http://www.w3.org/2000/xmlns/"
    },
        
    /**
     * Property: version
     * {String} WFS version number.
     */
    version: "2.0.0",
    
    /**
     * Property: schemaLocations
     * {Object} Properties are namespace aliases, values are schema locations.
     */
    schemaLocations: {
        "wfs": "http://schemas.opengis.net/wfs/2.0/wfs.xsd"
    },

    /**
     * Constructor: OpenLayers.Format.WFST.v2_0_0
     * A class for parsing and generating WFS v2.0.0 transactions.
     *
     * Parameters:
     * options - {Object} Optional object whose properties will be set on the
     *     instance.
     *
     * Valid options properties:
     * featureType - {String} Local (without prefix) feature typeNames (required).
     * featureNS - {String} Feature namespace (optional).
     * featurePrefix - {String} Feature namespace alias (optional - only used
     *     if featureNS is provided).  Default is 'feature'.
     * geometryName - {String} Name of geometry attribute.  Default is 'the_geom'.
     */
    initialize: function(options) {
        OpenLayers.Format.Filter.v2_0_0.prototype.initialize.apply(this, [options]);
        OpenLayers.Format.WFST.v1.prototype.initialize.apply(this, [options]);
    },
    
    /**
     * Method: readNode
     * Shorthand for applying one of the named readers given the node
     *     namespace and local name.  Readers take two args (node, obj) and
     *     generally extend or modify the second.
     *
     * Parameters:
     * node - {DOMElement} The node to be read (required).
     * obj - {Object} The object to be modified (optional).
     * first - {Boolean} Should be set to true for the first node read. This
     *     is usually the readNode call in the read method. Without this being
     *     set, auto-configured properties will stick on subsequent reads.
     *
     * Returns:
     * {Object} The input object, modified (or a new one if none was provided).
     */
    readNode: function(node, obj, first) {
        // Not the superclass, only the mixin classes inherit from
        // Format.GML.v2. We need this because we don't want to get readNode
        // from the superclass's superclass, which is OpenLayers.Format.XML.
        return OpenLayers.Format.GML.v3.prototype.readNode.apply(this, arguments);
    },
    
    /**
     * Property: readers
     * Contains public functions, grouped by namespace prefix, that will
     *     be applied when a namespaced node is found matching the function
     *     name.  The function will be applied in the scope of this parser
     *     with two arguments: the node being read and a context object passed
     *     from the parent.
     */
    readers: {
        "wfs": OpenLayers.Util.applyDefaults({
            "FeatureCollection": function(node, obj) {
                obj.numberReturned = parseInt(node.getAttribute(
                    "numberReturned"));
                obj.numberMatched = parseInt(node.getAttribute(
                "numberMatched"));
                OpenLayers.Format.WFST.v1.prototype.readers["wfs"]["FeatureCollection"].apply(
                    this, arguments);
            },
            "TransactionResponse": function(node, obj) {
                obj.insertIds = [];
                obj.success = false;
                this.readChildNodes(node, obj);
            },
            "TransactionSummary": function(node, obj) {
                obj.success = true;
            },
            "InsertResults": function(node, obj) {
                this.readChildNodes(node, obj);
            },
            "Feature": function(node, container) {
                var obj = {fids: []};
                this.readChildNodes(node, obj);
                container.insertIds.push(obj.fids[0]);
            },
            "member": function(node, obj) {
                this.readChildNodes(node, obj);
            },
            "boundedBy": function(node, obj) {
                var container = {};
                this.readChildNodes(node, container);
                if(container.components && container.components.length > 0) {
                    obj.bounds = container.components[0];
                }
            }

        }, OpenLayers.Format.WFST.v1.prototype.readers["wfs"]),
        "gml": OpenLayers.Format.GML.v3.prototype.readers["gml"],
        "feature": OpenLayers.Format.GML.v3.prototype.readers["feature"],
        "ows": OpenLayers.Format.OWSCommon.v1_0_0.prototype.readers["ows"],
        "fes": OpenLayers.Format.Filter.v2_0_0.prototype.readers["fes"]
    },

    /**
     * Property: writers
     * As a compliment to the readers property, this structure contains public
     *     writing functions grouped by namespace alias and named like the
     *     node names they produce.
     */
    writers: {
        "wfs": OpenLayers.Util.applyDefaults({
        	"GetFeature": function(options) {
                var node = OpenLayers.Format.WFST.v1.prototype.writers["wfs"]["GetFeature"].apply(this, arguments);
                options && this.setAttributes(node, {
                    resultType: options.resultType,
                    startIndex: options.startIndex,
                    count: options.count
                });
                return node;
            },
            "Query": function(options) {
                options = OpenLayers.Util.extend({
                    featureNS: this.featureNS,
                    featurePrefix: this.featurePrefix,
                    featureType: this.featureType,
                    srsName: this.srsName
                }, options);
                var prefix = options.featurePrefix;
                var node = this.createElementNSPlus("wfs:Query", {
                    attributes: {
                        typeNames: (prefix ? prefix + ":" : "") +
                            options.featureType,
                        srsName: options.srsName
                    }
                });
                if(options.featureNS) {
                    this.setAttributeNS(
                        node, this.namespaces.xmlns,
                        "xmlns:" + prefix, options.featureNS
                    );
                }
                if(options.propertyNames) {
                    for(var i=0,len = options.propertyNames.length; i<len; i++) {
                        this.writeNode(
                            "wfs:PropertyName", 
                            {property: options.propertyNames[i]},
                            node
                        );
                    }
                }
                if(options.filter) {
                    this.setFilterProperty(options.filter);
                    this.writeNode("fes:Filter", options.filter, node);
                }
                return node;
            },
            "Update": function(obj) {
                var feature = obj.feature;
                var options = obj.options;
                var node = this.createElementNSPlus("wfs:Update", {
                    attributes: {
                        handle: options && options.handle,
                        typeName: (this.featureNS ? this.featurePrefix + ":" : "") +
                            this.featureType
                    }
                });
                if(this.featureNS) {
                    this.setAttributeNS(
                        node, this.namespaces.xmlns,
                        "xmlns:" + this.featurePrefix, this.featureNS
                    );
                }
                
                // add in geometry
                var modified = feature.modified;
                if (this.geometryName !== null && (!modified || modified.geometry !== undefined)) {
                    this.srsName = this.getSrsName(feature);
                    this.writeNode(
                        "Property", {name: this.geometryName, value: feature.geometry}, node
                    );
                }
        
                // add in attributes
                for(var key in feature.attributes) {
                    if(feature.attributes[key] !== undefined &&
                                (!modified || !modified.attributes ||
                                (modified.attributes && (key in modified.attributes)))) {
                        this.writeNode(
                            "Property", {name: key, value: feature.attributes[key]}, node
                        );
                    }
                }
                
                // add feature id filter
                this.writeNode("fes:Filter", new OpenLayers.Filter.FeatureId({
                    fids: [feature.fid]
                }), node);
        
                return node;
            },
            "Property": function(obj) {
                var node = this.createElementNSPlus("wfs:Property");
                this.writeNode("ValueReference", obj.name, node);
                if(obj.value !== null) {
                    this.writeNode("Value", obj.value, node);
                }
                return node;
            },
            "PropertyName": function(obj) {
                return this.createElementNSPlus("wfs:PropertyName", {
                    value: obj.property
                });
            },
            "ValueReference": function(name) {
                return this.createElementNSPlus("wfs:ValueReference", {value: name});
            },
            "Delete": function(obj) {
                var feature = obj.feature;
                var options = obj.options;
                var node = this.createElementNSPlus("wfs:Delete", {
                    attributes: {
                        handle: options && options.handle,
                        typeName: (this.featureNS ? this.featurePrefix + ":" : "") +
                            this.featureType
                    }
                });
                if(this.featureNS) {
                    this.setAttributeNS(
                        node, this.namespaces.xmlns,
                        "xmlns:" + this.featurePrefix, this.featureNS
                    );
                }
                this.writeNode("fes:Filter", new OpenLayers.Filter.FeatureId({
                    fids: [feature.fid]
                }), node);
                return node;
            }
        }, OpenLayers.Format.WFST.v1.prototype.writers["wfs"]),
        "gml": OpenLayers.Format.GML.v3.prototype.writers["gml"],
        "feature": OpenLayers.Format.GML.v3.prototype.writers["feature"],
        "fes": OpenLayers.Format.Filter.v2_0_0.prototype.writers["fes"]
    },
   
    CLASS_NAME: "OpenLayers.Format.WFST.v2_0_0" 
});
