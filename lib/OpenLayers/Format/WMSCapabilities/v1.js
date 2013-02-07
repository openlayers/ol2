/* Copyright (c) 2006-2013 by OpenLayers Contributors (see authors.txt for
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

/**
 * @requires OpenLayers/Format/WMSCapabilities.js
 * @requires OpenLayers/Format/OGCExceptionReport.js
 * @requires OpenLayers/Format/XML.js
 */

/**
 * Class: OpenLayers.Format.WMSCapabilities.v1
 * Abstract class not to be instantiated directly. Creates
 * the common parts for both WMS 1.1.X and WMS 1.3.X.
 * 
 * Inherits from:
 *  - <OpenLayers.Format.XML>
 */
OpenLayers.Format.WMSCapabilities.v1 = OpenLayers.Class(
    OpenLayers.Format.XML, {
    
    /**
     * Property: namespaces
     * {Object} Mapping of namespace aliases to namespace URIs.
     */
    namespaces: {
        wms: "http://www.opengis.net/wms",
        xlink: "http://www.w3.org/1999/xlink",
        xsi: "http://www.w3.org/2001/XMLSchema-instance"
    },

    /**
     * Property: defaultPrefix
     */
    defaultPrefix: "wms",
    
    /**
     * Constructor: OpenLayers.Format.WMSCapabilities.v1
     * Create an instance of one of the subclasses.
     *
     * Parameters:
     * options - {Object} An optional object whose properties will be set on
     *     this instance.
     */

    /**
     * APIMethod: read
     * Read capabilities data from a string, and return a list of layers. 
     * 
     * Parameters: 
     * data - {String} or {DOMElement} data to read/parse.
     *
     * Returns:
     * {Array} List of named layers.
     */
    read: function(data) {
        if(typeof data == "string") {
            data = OpenLayers.Format.XML.prototype.read.apply(this, [data]);
        }
        var raw = data;
        if(data && data.nodeType == 9) {
            data = data.documentElement;
        }
        var capabilities = {};
        this.readNode(data, capabilities);
        if (capabilities.service === undefined) {
            // an exception must have occurred, so parse it
            var parser = new OpenLayers.Format.OGCExceptionReport();
            capabilities.error = parser.read(raw);
        }
        return capabilities;
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
        "wms": {
            "Service": function(node, obj) {
                obj.service = {};
                this.readChildNodes(node, obj.service);
            },
            "Name": function(node, obj) {
                obj.name = this.getChildValue(node);
            },
            "Title": function(node, obj) {
                obj.title = this.getChildValue(node);
            },
            "Abstract": function(node, obj) {
                obj["abstract"] = this.getChildValue(node);
            },
            "BoundingBox": function(node, obj) {
                var bbox = {};
                bbox.bbox = [
                    parseFloat(node.getAttribute("minx")),
                    parseFloat(node.getAttribute("miny")),
                    parseFloat(node.getAttribute("maxx")),
                    parseFloat(node.getAttribute("maxy"))
                ];
                var res = {
                    x: parseFloat(node.getAttribute("resx")),
                    y: parseFloat(node.getAttribute("resy"))
                };

                if (! (isNaN(res.x) && isNaN(res.y))) {
                    bbox.res = res;
                }
                // return the bbox so that descendant classes can set the
                // CRS and SRS and add it to the obj
                return bbox;
            },
            "OnlineResource": function(node, obj) {
                obj.href = this.getAttributeNS(node, this.namespaces.xlink, 
                    "href");
            },
            "ContactInformation": function(node, obj) {
                obj.contactInformation = {};
                this.readChildNodes(node, obj.contactInformation);
            },
            "ContactPersonPrimary": function(node, obj) {
                obj.personPrimary = {};
                this.readChildNodes(node, obj.personPrimary);
            },
            "ContactPerson": function(node, obj) {
                obj.person = this.getChildValue(node);
            },
            "ContactOrganization": function(node, obj) {
                obj.organization = this.getChildValue(node);
            },
            "ContactPosition": function(node, obj) {
                obj.position = this.getChildValue(node);
            },
            "ContactAddress": function(node, obj) {
                obj.contactAddress = {};
                this.readChildNodes(node, obj.contactAddress);
            },
            "AddressType": function(node, obj) {
                obj.type = this.getChildValue(node);
            },
            "Address": function(node, obj) {
                obj.address = this.getChildValue(node);
            },
            "City": function(node, obj) {
                obj.city = this.getChildValue(node);
            },
            "StateOrProvince": function(node, obj) {
                obj.stateOrProvince = this.getChildValue(node);
            },
            "PostCode": function(node, obj) {
                obj.postcode = this.getChildValue(node);
            },
            "Country": function(node, obj) {
                obj.country = this.getChildValue(node);
            },
            "ContactVoiceTelephone": function(node, obj) {
                obj.phone = this.getChildValue(node);
            },
            "ContactFacsimileTelephone": function(node, obj) {
                obj.fax = this.getChildValue(node);
            },
            "ContactElectronicMailAddress": function(node, obj) {
                obj.email = this.getChildValue(node);
            },
            "Fees": function(node, obj) {
                var fees = this.getChildValue(node);
                if (fees && fees.toLowerCase() != "none") {
                    obj.fees = fees;
                }
            },
            "AccessConstraints": function(node, obj) {
                var constraints = this.getChildValue(node);
                if (constraints && constraints.toLowerCase() != "none") {
                    obj.accessConstraints = constraints;
                }
            },
            "Capability": function(node, obj) {
                obj.capability = {
                    nestedLayers: [],
                    layers: []
                };
                this.readChildNodes(node, obj.capability);
            },
            "Request": function(node, obj) {
                obj.request = {};
                this.readChildNodes(node, obj.request);
            },
            "GetCapabilities": function(node, obj) {
                obj.getcapabilities = {formats: []};
                this.readChildNodes(node, obj.getcapabilities);
            },
            "Format": function(node, obj) {
                if (OpenLayers.Util.isArray(obj.formats)) {
                    obj.formats.push(this.getChildValue(node));
                } else {
                    obj.format = this.getChildValue(node);
                }
            },
            "DCPType": function(node, obj) {
                this.readChildNodes(node, obj);
            },
            "HTTP": function(node, obj) {
                this.readChildNodes(node, obj);
            },
            "Get": function(node, obj) {
                obj.get = {};
                this.readChildNodes(node, obj.get);
                // backwards compatibility
                if (!obj.href) {
                    obj.href = obj.get.href;
                }
            },
            "Post": function(node, obj) {
                obj.post = {};
                this.readChildNodes(node, obj.post);
                // backwards compatibility
                if (!obj.href) {
                    obj.href = obj.get.href;
                }
            },
            "GetMap": function(node, obj) {
                obj.getmap = {formats: []};
                this.readChildNodes(node, obj.getmap);
            },
            "GetFeatureInfo": function(node, obj) {
                obj.getfeatureinfo = {formats: []};
                this.readChildNodes(node, obj.getfeatureinfo);
            },
            "Exception": function(node, obj) {
                obj.exception = {formats: []};
                this.readChildNodes(node, obj.exception);
            },
            "Layer": function(node, obj) {
                var parentLayer, capability;
                if (obj.capability) {
                    capability = obj.capability;
                    parentLayer = obj;
                } else {
                    capability = obj;
                }
                var attrNode = node.getAttributeNode("queryable");
                var queryable = (attrNode && attrNode.specified) ? 
                    node.getAttribute("queryable") : null;
                attrNode = node.getAttributeNode("cascaded");
                var cascaded = (attrNode && attrNode.specified) ?
                    node.getAttribute("cascaded") : null;
                attrNode = node.getAttributeNode("opaque");
                var opaque = (attrNode && attrNode.specified) ?
                    node.getAttribute('opaque') : null;
                var noSubsets = node.getAttribute('noSubsets');
                var fixedWidth = node.getAttribute('fixedWidth');
                var fixedHeight = node.getAttribute('fixedHeight');
                var parent = parentLayer || {},
                    extend = OpenLayers.Util.extend;
                var layer = {
                    nestedLayers: [],
                    styles: parentLayer ? [].concat(parentLayer.styles) : [],
                    srs: parentLayer ? extend({}, parent.srs) : {}, 
                    metadataURLs: [],
                    bbox: parentLayer ? extend({}, parent.bbox) : {},
                    llbbox: parent.llbbox,
                    dimensions: parentLayer ? extend({}, parent.dimensions) : {},
                    authorityURLs: parentLayer ? extend({}, parent.authorityURLs) : {},
                    identifiers: {},
                    keywords: [],
                    queryable: (queryable && queryable !== "") ? 
                        (queryable === "1" || queryable === "true" ) :
                        (parent.queryable || false),
                    cascaded: (cascaded !== null) ? parseInt(cascaded) :
                        (parent.cascaded || 0),
                    opaque: opaque ? 
                        (opaque === "1" || opaque === "true" ) :
                        (parent.opaque || false),
                    noSubsets: (noSubsets !== null) ? 
                        (noSubsets === "1" || noSubsets === "true" ) :
                        (parent.noSubsets || false),
                    fixedWidth: (fixedWidth != null) ? 
                        parseInt(fixedWidth) : (parent.fixedWidth || 0),
                    fixedHeight: (fixedHeight != null) ? 
                        parseInt(fixedHeight) : (parent.fixedHeight || 0),
                    minScale: parent.minScale,
                    maxScale: parent.maxScale,
                    attribution: parent.attribution
                };
                obj.nestedLayers.push(layer);
                layer.capability = capability;
                this.readChildNodes(node, layer);
                delete layer.capability;
                if(layer.name) {
                    var parts = layer.name.split(":"),
                        request = capability.request,
                        gfi = request.getfeatureinfo;
                    if(parts.length > 0) {
                        layer.prefix = parts[0];
                    }
                    capability.layers.push(layer);
                    if (layer.formats === undefined) {
                        layer.formats = request.getmap.formats;
                    }
                    if (layer.infoFormats === undefined && gfi) {
                        layer.infoFormats = gfi.formats;
                    }
                }
            },
            "Attribution": function(node, obj) {
                obj.attribution = {};
                this.readChildNodes(node, obj.attribution);
            },
            "LogoURL": function(node, obj) {
                obj.logo = {
                    width: node.getAttribute("width"),
                    height: node.getAttribute("height")
                };
                this.readChildNodes(node, obj.logo);
            },
            "Style": function(node, obj) {
                var style = {};
                obj.styles.push(style);
                this.readChildNodes(node, style);
            },
            "LegendURL": function(node, obj) {
                var legend = {
                    width: node.getAttribute("width"),
                    height: node.getAttribute("height")
                };
                obj.legend = legend;
                this.readChildNodes(node, legend);
            },
            "MetadataURL": function(node, obj) {
                var metadataURL = {type: node.getAttribute("type")};
                obj.metadataURLs.push(metadataURL);
                this.readChildNodes(node, metadataURL);
            },
            "DataURL": function(node, obj) {
                obj.dataURL = {};
                this.readChildNodes(node, obj.dataURL);
            },
            "FeatureListURL": function(node, obj) {
                obj.featureListURL = {};
                this.readChildNodes(node, obj.featureListURL);
            },
            "AuthorityURL": function(node, obj) {
                var name = node.getAttribute("name");
                var authority = {};
                this.readChildNodes(node, authority);
                obj.authorityURLs[name] = authority.href;
            },
            "Identifier": function(node, obj) {
                var authority = node.getAttribute("authority");
                obj.identifiers[authority] = this.getChildValue(node);
            },
            "KeywordList": function(node, obj) {
                this.readChildNodes(node, obj);
            },
            "SRS": function(node, obj) {
                obj.srs[this.getChildValue(node)] = true;
            }
        }
    },

    CLASS_NAME: "OpenLayers.Format.WMSCapabilities.v1" 

});
