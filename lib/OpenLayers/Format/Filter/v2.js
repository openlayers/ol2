/* Copyright (c) 2006-2013 by OpenLayers Contributors (see authors.txt for
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */
/**
 * @requires OpenLayers/Format/Filter.js
 * @requires OpenLayers/Format/XML.js
 * @requires OpenLayers/Filter/Function.js
 * @requires OpenLayers/BaseTypes/Date.js
 */

/**
 * Class: OpenLayers.Format.Filter.v2
 * Superclass for Filter version 2 parsers.
 *
 * Inherits from:
 *  - <OpenLayers.Format.XML>
 */
OpenLayers.Format.Filter.v2 = OpenLayers.Class(OpenLayers.Format.XML, {
    
    /**
     * Property: namespaces
     * {Object} Mapping of namespace aliases to namespace URIs.
     */
    namespaces: {
        fes: "http://www.opengis.net/fes/2.0",
        gml: "http://www.opengis.net/gml/3.2",
        xlink: "http://www.w3.org/1999/xlink",
        xsi: "http://www.w3.org/2001/XMLSchema-instance"
    },

    /**
     * Property: defaultPrefix
     */
    defaultPrefix: "fes",

    /**
     * Property: schemaLocation
     * {String} Schema location for a particular minor version.
     */
    schemaLocation: null,
    
    /**
     * Constructor: OpenLayers.Format.Filter.v1
     * Instances of this class are not created directly.  Use the
     *     <OpenLayers.Format.Filter> constructor instead.
     *
     * Parameters:
     * options - {Object} An optional object whose properties will be set on
     *     this instance.
     */
    initialize: function(options) {
        OpenLayers.Format.XML.prototype.initialize.apply(this, [options]);
    },
    
    /**
     * Method: read
     *
     * Parameters:
     * data - {DOMElement} A Filter document element.
     *
     * Returns:
     * {<OpenLayers.Filter>} A filter object.
     */
    read: function(data) {
        var obj = {};
        this.readers.fes["Filter"].apply(this, [data, obj]);
        return obj.filter;
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
        "fes": {
            "_expression": function(node) {
                // only the simplest of fes:expression handled
                // "some text and an <ValueReference>attribute</ValueReference>"}
                var obj, value = "";
                for(var child=node.firstChild; child; child=child.nextSibling) {
                    switch(child.nodeType) {
                        case 1:
                            obj = this.readNode(child);
                            if (obj.property) {
                                value += "${" + obj.property + "}";
                            } else if (obj.value !== undefined) {
                                value += obj.value;
                            }
                            break;
                        case 3: // text node
                        case 4: // cdata section
                            value += child.nodeValue;
                    }
                }
                return value;
            },
            "Filter": function(node, parent) {
                // Filters correspond to subclasses of OpenLayers.Filter.
                // Since they contain information we don't persist, we
                // create a temporary object and then pass on the filter
                // (fes:Filter) to the parent obj.
                var obj = {
                    fids: [],
                    filters: []
                };
                this.readChildNodes(node, obj);
                if(obj.fids.length > 0) {
                    parent.filter = new OpenLayers.Filter.FeatureId({
                        fids: obj.fids
                    });
                } else if(obj.filters.length > 0) {
                    parent.filter = obj.filters[0];
                }
            },
            "ResourceId": function(node, obj) {
                var fid = node.getAttribute("rid");
                if(fid) {
                    obj.fids.push(fid);
                }
            },

            "And": function(node, obj) {
                var filter = new OpenLayers.Filter.Logical({
                    type: OpenLayers.Filter.Logical.AND
                });
                this.readChildNodes(node, filter);
                obj.filters.push(filter);
            },
            "Or": function(node, obj) {
                var filter = new OpenLayers.Filter.Logical({
                    type: OpenLayers.Filter.Logical.OR
                });
                this.readChildNodes(node, filter);
                obj.filters.push(filter);
            },
            "Not": function(node, obj) {
                var filter = new OpenLayers.Filter.Logical({
                    type: OpenLayers.Filter.Logical.NOT
                });
                this.readChildNodes(node, filter);
                obj.filters.push(filter);
            },
            "PropertyIsLessThan": function(node, obj) {
                var filter = new OpenLayers.Filter.Comparison({
                    type: OpenLayers.Filter.Comparison.LESS_THAN
                });
                this.readChildNodes(node, filter);
                obj.filters.push(filter);
            },
            "PropertyIsGreaterThan": function(node, obj) {
                var filter = new OpenLayers.Filter.Comparison({
                    type: OpenLayers.Filter.Comparison.GREATER_THAN
                });
                this.readChildNodes(node, filter);
                obj.filters.push(filter);
            },
            "PropertyIsLessThanOrEqualTo": function(node, obj) {
                var filter = new OpenLayers.Filter.Comparison({
                    type: OpenLayers.Filter.Comparison.LESS_THAN_OR_EQUAL_TO
                });
                this.readChildNodes(node, filter);
                obj.filters.push(filter);
            },
            "PropertyIsGreaterThanOrEqualTo": function(node, obj) {
                var filter = new OpenLayers.Filter.Comparison({
                    type: OpenLayers.Filter.Comparison.GREATER_THAN_OR_EQUAL_TO
                });
                this.readChildNodes(node, filter);
                obj.filters.push(filter);
            },
            "PropertyIsBetween": function(node, obj) {
                var filter = new OpenLayers.Filter.Comparison({
                    type: OpenLayers.Filter.Comparison.BETWEEN
                });
                this.readChildNodes(node, filter);
                obj.filters.push(filter);
            },
            "Literal": function(node, obj) {
                obj.value = OpenLayers.String.numericIf(
                    this.getChildValue(node), true);
            },
            "ValueReference": function(node, filter) {
                filter.property = this.getChildValue(node);
            },
            "LowerBoundary": function(node, filter) {
                filter.lowerBoundary = OpenLayers.String.numericIf(
                    this.readers.fes._expression.call(this, node), true);
            },
            "UpperBoundary": function(node, filter) {
                filter.upperBoundary = OpenLayers.String.numericIf(
                    this.readers.fes._expression.call(this, node), true);
            },
            "Intersects": function(node, obj) {
                this.readSpatial(node, obj, OpenLayers.Filter.Spatial.INTERSECTS);
            },
            "Within": function(node, obj) {
                this.readSpatial(node, obj, OpenLayers.Filter.Spatial.WITHIN);
            },
            "Contains": function(node, obj) {
                this.readSpatial(node, obj, OpenLayers.Filter.Spatial.CONTAINS);
            },
            "DWithin": function(node, obj) {
                this.readSpatial(node, obj, OpenLayers.Filter.Spatial.DWITHIN);
            },
            "Distance": function(node, obj) {
                obj.distance = parseInt(this.getChildValue(node));
                obj.distanceUnits = node.getAttribute("units");
            },
            "Function": function(node, obj) {
                //TODO write decoder for it
                return;
            },
            "PropertyIsNull": function(node, obj) {
                var filter = new OpenLayers.Filter.Comparison({
                    type: OpenLayers.Filter.Comparison.IS_NULL
                });
                this.readChildNodes(node, filter);
                obj.filters.push(filter);
            }
        }
    },
    
    /**
     * Method: readSpatial
     *
     * Read a {<OpenLayers.Filter.Spatial>} filter.
     * 
     * Parameters:
     * node - {DOMElement} A DOM element that contains an fes:expression.
     * obj - {Object} The target object.
     * type - {String} One of the OpenLayers.Filter.Spatial.* constants.
     *
     * Returns:
     * {<OpenLayers.Filter.Spatial>} The created filter.
     */
    readSpatial: function(node, obj, type) {
        var filter = new OpenLayers.Filter.Spatial({
            type: type
        });
        this.readChildNodes(node, filter);
        filter.value = filter.components[0];
        delete filter.components;
        obj.filters.push(filter);
    },

    /**
     * APIMethod: encodeLiteral
     * Generates the string representation of a value for use in <Literal> 
     *     elements.  The default encoder writes Date values as ISO 8601 
     *     strings.
     *
     * Parameters:
     * value - {Object} Literal value to encode
     *
     * Returns:
     * {String} String representation of the provided value.
     */
    encodeLiteral: function(value) {
        if (value instanceof Date) {
            value = OpenLayers.Date.toISOString(value);
        }
        return value;
    },

    /**
     * Method: writeOgcExpression
     * Limited support for writing OGC expressions. Currently it supports
     * (<OpenLayers.Filter.Function> || String || Number)
     *
     * Parameters:
     * value - (<OpenLayers.Filter.Function> || String || Number)
     * node - {DOMElement} A parent DOM element 
     *
     * Returns:
     * {DOMElement} Updated node element.
     */
    writeOgcExpression: function(value, node) {
        if (value instanceof OpenLayers.Filter.Function){
            this.writeNode("Function", value, node);
        } else {
            this.writeNode("Literal", value, node);
        }
        return node;
    },    
    
    /**
     * Method: write
     *
     * Parameters:
     * filter - {<OpenLayers.Filter>} A filter object.
     *
     * Returns:
     * {DOMElement} An fes:Filter element.
     */
    write: function(filter) {
        return this.writers.fes["Filter"].apply(this, [filter]);
    },
    
    /**
     * Property: writers
     * As a compliment to the readers property, this structure contains public
     *     writing functions grouped by namespace alias and named like the
     *     node names they produce.
     */
    writers: {
        "fes": {
            "Filter": function(filter) {
                var node = this.createElementNSPlus("fes:Filter");
                this.writeNode(this.getFilterType(filter), filter, node);
                return node;
            },
            "_featureIds": function(filter) {
                var node = this.createDocumentFragment();
                for (var i=0, ii=filter.fids.length; i<ii; ++i) {
                    this.writeNode("fes:ResourceId", filter.fids[i], node);
                }
                return node;
            },
            "ResourceId": function(fid) {
                return this.createElementNSPlus("fes:ResourceId", {
                    attributes: {rid: fid}
                });
            },

            "And": function(filter) {
                var node = this.createElementNSPlus("fes:And");
                var childFilter;
                for (var i=0, ii=filter.filters.length; i<ii; ++i) {
                    childFilter = filter.filters[i];
                    this.writeNode(
                        this.getFilterType(childFilter), childFilter, node
                    );
                }
                return node;
            },
            "Or": function(filter) {
                var node = this.createElementNSPlus("fes:Or");
                var childFilter;
                for (var i=0, ii=filter.filters.length; i<ii; ++i) {
                    childFilter = filter.filters[i];
                    this.writeNode(
                        this.getFilterType(childFilter), childFilter, node
                    );
                }
                return node;
            },
            "Not": function(filter) {
                var node = this.createElementNSPlus("fes:Not");
                var childFilter = filter.filters[0];
                this.writeNode(
                    this.getFilterType(childFilter), childFilter, node
                );
                return node;
            },
            "PropertyIsLessThan": function(filter) {
                var node = this.createElementNSPlus("fes:PropertyIsLessThan");
                // no fes:expression handling for ValueReference for now
                this.writeNode("ValueReference", filter, node);
                // handle Literals or Functions for now
                this.writeOgcExpression(filter.value, node);
                return node;
            },
            "PropertyIsGreaterThan": function(filter) {
                var node = this.createElementNSPlus("fes:PropertyIsGreaterThan");
                // no fes:expression handling for ValueReference for now
                this.writeNode("ValueReference", filter, node);
                // handle Literals or Functions for now
                this.writeOgcExpression(filter.value, node);
                return node;
            },
            "PropertyIsLessThanOrEqualTo": function(filter) {
                var node = this.createElementNSPlus("fes:PropertyIsLessThanOrEqualTo");
                // no fes:expression handling for ValueReference for now
                this.writeNode("ValueReference", filter, node);
                // handle Literals or Functions for now
                this.writeOgcExpression(filter.value, node);
                return node;
            },
            "PropertyIsGreaterThanOrEqualTo": function(filter) {
                var node = this.createElementNSPlus("fes:PropertyIsGreaterThanOrEqualTo");
                // no fes:expression handling for ValueReference for now
                this.writeNode("ValueReference", filter, node);
                // handle Literals or Functions for now
                this.writeOgcExpression(filter.value, node);
                return node;
            },
            "PropertyIsBetween": function(filter) {
                var node = this.createElementNSPlus("fes:PropertyIsBetween");
                // no fes:expression handling for ValueReference for now
                this.writeNode("ValueReference", filter, node);
                this.writeNode("LowerBoundary", filter, node);
                this.writeNode("UpperBoundary", filter, node);
                return node;
            },
            "ValueReference": function(filter) {
                // no fes:expression handling for now
                return this.createElementNSPlus("fes:ValueReference", {
                    value: filter.property
                });
            },
            "Literal": function(value) {
                var encode = this.encodeLiteral ||
                    OpenLayers.Format.Filter.v1.prototype.encodeLiteral;
                return this.createElementNSPlus("fes:Literal", {
                    value: encode(value)
                });
            },
            "LowerBoundary": function(filter) {
                // handle Literals or Functions for now
                var node = this.createElementNSPlus("fes:LowerBoundary");
                this.writeOgcExpression(filter.lowerBoundary, node);
                return node;
            },
            "UpperBoundary": function(filter) {
                // handle Literals or Functions for now
                var node = this.createElementNSPlus("fes:UpperBoundary");
                this.writeNode("Literal", filter.upperBoundary, node);
                return node;
            },
            "INTERSECTS": function(filter) {
                return this.writeSpatial(filter, "Intersects");
            },
            "WITHIN": function(filter) {
                return this.writeSpatial(filter, "Within");
            },
            "CONTAINS": function(filter) {
                return this.writeSpatial(filter, "Contains");
            },
            "DWITHIN": function(filter) {
                var node = this.writeSpatial(filter, "DWithin");
                this.writeNode("Distance", filter, node);
                return node;
            },
            "Distance": function(filter) {
                return this.createElementNSPlus("fes:Distance", {
                    attributes: {
                        units: filter.distanceUnits
                    },
                    value: filter.distance
                });
            },
            "Function": function(filter) {
                var node = this.createElementNSPlus("fes:Function", {
                    attributes: {
                        name: filter.name
                    }
                });
                var params = filter.params;
                for(var i=0, len=params.length; i<len; i++){
                    this.writeOgcExpression(params[i], node);
                }
                return node;
            },
            "PropertyIsNull": function(filter) {
                var node = this.createElementNSPlus("fes:PropertyIsNull");
                this.writeNode("ValueReference", filter, node);
                return node;
            }
        }
    },

    /**
     * Method: getFilterType
     */
    getFilterType: function(filter) {
        var filterType = this.filterMap[filter.type];
        if(!filterType) {
            throw "Filter writing not supported for rule type: " + filter.type;
        }
        return filterType;
    },
    
    /**
     * Property: filterMap
     * {Object} Contains a member for each filter type.  Values are node names
     *     for corresponding OGC Filter child elements.
     */
    filterMap: {
        "&&": "And",
        "||": "Or",
        "!": "Not",
        "==": "PropertyIsEqualTo",
        "!=": "PropertyIsNotEqualTo",
        "<": "PropertyIsLessThan",
        ">": "PropertyIsGreaterThan",
        "<=": "PropertyIsLessThanOrEqualTo",
        ">=": "PropertyIsGreaterThanOrEqualTo",
        "..": "PropertyIsBetween",
        "~": "PropertyIsLike",
        "NULL": "PropertyIsNull",
        "BBOX": "BBOX",
        "DWITHIN": "DWITHIN",
        "WITHIN": "WITHIN",
        "CONTAINS": "CONTAINS",
        "INTERSECTS": "INTERSECTS",
        "FID": "_featureIds"
    },

    CLASS_NAME: "OpenLayers.Format.Filter.v2" 

});
