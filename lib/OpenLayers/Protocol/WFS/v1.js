/* Copyright (c) 2006-2013 by OpenLayers Contributors (see authors.txt for
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

/**
 * @requires OpenLayers/Protocol/WFS.js
 */

/**
 * Class: OpenLayers.Protocol.WFS.v1
 * Abstract class for for v1.0.0 and v1.1.0 protocol.
 *
 * Inherits from:
 *  - <OpenLayers.Protocol>
 */
OpenLayers.Protocol.WFS.v1 = OpenLayers.Class(OpenLayers.Protocol, {
    
    /**
     * Property: version
     * {String} WFS version number.
     */
    version: null,
    
    /**
     * Property: srsName
     * {String} Name of spatial reference system.  Default is "EPSG:4326".
     */
    srsName: "EPSG:4326",
    
    /**
     * Property: featureType
     * {String} Local feature typeName.
     */
    featureType: null,
    
    /**
     * Property: featureNS
     * {String} Feature namespace.
     */
    featureNS: null,
    
    /**
     * Property: geometryName
     * {String} Name of the geometry attribute for features.  Default is
     *     "the_geom" for WFS <version> 1.0, and null for higher versions.
     */
    geometryName: "the_geom",

    /**
     * Property: maxFeatures
     * {Integer} Optional maximum number of features to retrieve.
     */
    
    /**
     * Property: schema
     * {String} Optional schema location that will be included in the
     *     schemaLocation attribute value.  Note that the feature type schema
     *     is required for a strict XML validator (on transactions with an
     *     insert for example), but is *not* required by the WFS specification
     *     (since the server is supposed to know about feature type schemas).
     */
    schema: null,

    /**
     * Property: featurePrefix
     * {String} Namespace alias for feature type.  Default is "feature".
     */
    featurePrefix: "feature",
    
    /**
     * Property: formatOptions
     * {Object} Optional options for the format.  If a format is not provided,
     *     this property can be used to extend the default format options.
     */
    formatOptions: null,

    /** 
     * Property: readFormat 
     * {<OpenLayers.Format>} For WFS requests it is possible to get a  
     *     different output format than GML. In that case, we cannot parse  
     *     the response with the default format (WFST) and we need a different 
     *     format for reading. 
     */ 
    readFormat: null,
    
    /**
     * Property: readOptions
     * {Object} Optional object to pass to format's read.
     */
    readOptions: null,
    
    /**
     * Constructor: OpenLayers.Protocol.WFS
     * A class for giving layers WFS protocol.
     *
     * Parameters:
     * options - {Object} Optional object whose properties will be set on the
     *     instance.
     *
     * Valid options properties:
     * url - {String} URL to send requests to (required).
     * featureType - {String} Local (without prefix) feature typeName (required).
     * featureNS - {String} Feature namespace (required, but can be autodetected
     *     during the first query if GML is used as readFormat and
     *     featurePrefix is provided and matches the prefix used by the server
     *     for this featureType).
     * featurePrefix - {String} Feature namespace alias (optional - only used
     *     for writing if featureNS is provided).  Default is 'feature'.
     * geometryName - {String} Name of geometry attribute.  The default is
     *     'the_geom' for WFS <version> 1.0, and null for higher versions. If
     *     null, it will be set to the name of the first geometry found in the
     *     first read operation.
     * multi - {Boolean} If set to true, geometries will be casted to Multi
     *     geometries before they are written in a transaction. No casting will
     *     be done when reading features.
     */
    initialize: function(options) {
        OpenLayers.Protocol.prototype.initialize.apply(this, [options]);
        if(!options.format) {
            this.format = OpenLayers.Format.WFST(OpenLayers.Util.extend({
                version: this.version,
                featureType: this.featureType,
                featureNS: this.featureNS,
                featurePrefix: this.featurePrefix,
                geometryName: this.geometryName,
                srsName: this.srsName,
                schema: this.schema
            }, this.formatOptions));
        }
        if (!options.geometryName && parseFloat(this.format.version) > 1.0) {
            this.setGeometryName(null);
        }
    },
    
    /**
     * APIMethod: destroy
     * Clean up the protocol.
     */
    destroy: function() {
        if(this.options && !this.options.format) {
            this.format.destroy();
        }
        this.format = null;
        OpenLayers.Protocol.prototype.destroy.apply(this);
    },

    /**
     * APIMethod: read
     * Construct a request for reading new features.  Since WFS splits the
     *     basic CRUD operations into GetFeature requests (for read) and
     *     Transactions (for all others), this method does not make use of the
     *     format's read method (that is only about reading transaction
     *     responses).
     *
     * Parameters:
     * options - {Object} Options for the read operation, in addition to the
     *     options set on the instance (options set here will take precedence).
     *
     * To use a configured protocol to get e.g. a WFS hit count, applications
     * could do the following:
     *
     * (code)
     * protocol.read({
     *     readOptions: {output: "object"},
     *     resultType: "hits",
     *     maxFeatures: null,
     *     callback: function(resp) {
     *         // process resp.numberOfFeatures here
     *     }
     * });
     * (end)
     *
     * To use a configured protocol to use WFS paging (if supported by the
     * server), applications could do the following:
     *
     * (code)
     * protocol.read({
     *     startIndex: 0,
     *     count: 50
     * });
     * (end)
     *
     * To limit the attributes returned by the GetFeature request, applications
     * can use the propertyNames option to specify the properties to include in
     * the response:
     *
     * (code)
     * protocol.read({
     *     propertyNames: ["DURATION", "INTENSITY"]
     * });
     * (end)
     */
    read: function(options) {
        OpenLayers.Protocol.prototype.read.apply(this, arguments);
        options = OpenLayers.Util.extend({}, options);
        OpenLayers.Util.applyDefaults(options, this.options || {});
        var response = new OpenLayers.Protocol.Response({requestType: "read"});
        
        var data = OpenLayers.Format.XML.prototype.write.apply(
            this.format, [this.format.writeNode("wfs:GetFeature", options)]
        );

        response.priv = OpenLayers.Request.POST({
            url: options.url,
            callback: this.createCallback(this.handleRead, response, options),
            params: options.params,
            headers: options.headers,
            data: data
        });

        return response;
    },

    /**
     * APIMethod: setFeatureType
     * Change the feature type on the fly.
     *
     * Parameters:
     * featureType - {String} Local (without prefix) feature typeName.
     */
    setFeatureType: function(featureType) {
        this.featureType = featureType;
        this.format.featureType = featureType;
    },
 
    /**
     * APIMethod: setGeometryName
     * Sets the geometryName option after instantiation.
     *
     * Parameters:
     * geometryName - {String} Name of geometry attribute.
     */
    setGeometryName: function(geometryName) {
        this.geometryName = geometryName;
        this.format.geometryName = geometryName;
    },
    
    /**
     * Method: handleRead
     * Deal with response from the read request.
     *
     * Parameters:
     * response - {<OpenLayers.Protocol.Response>} The response object to pass
     *     to the user callback.
     * options - {Object} The user options passed to the read call.
     */
    handleRead: function(response, options) {
        options = OpenLayers.Util.extend({}, options);
        OpenLayers.Util.applyDefaults(options, this.options);

        if(options.callback) {
            var request = response.priv;
            if(request.status >= 200 && request.status < 300) {
                // success
                var result = this.parseResponse(request, options.readOptions);
                if (result && result.success !== false) { 
                    if (options.readOptions && options.readOptions.output == "object") {
                        OpenLayers.Util.extend(response, result);
                    } else {
                        response.features = result;
                    }
                    response.code = OpenLayers.Protocol.Response.SUCCESS;
                } else {
                    // failure (service exception)
                    response.code = OpenLayers.Protocol.Response.FAILURE;
                    response.error = result;
                }
            } else {
                // failure
                response.code = OpenLayers.Protocol.Response.FAILURE;
            }
            options.callback.call(options.scope, response);
        }
    },

    /**
     * Method: parseResponse
     * Read HTTP response body and return features
     *
     * Parameters:
     * request - {XMLHttpRequest} The request object
     * options - {Object} Optional object to pass to format's read
     *
     * Returns:
     * {Object} or {Array({<OpenLayers.Feature.Vector>})} or
     *     {<OpenLayers.Feature.Vector>} 
     * An object with a features property, an array of features or a single 
     * feature.
     */
    parseResponse: function(request, options) {
        var doc = request.responseXML;
        if(!doc || !doc.documentElement) {
            doc = request.responseText;
        }
        if(!doc || doc.length <= 0) {
            return null;
        }
        var result = (this.readFormat !== null) ? this.readFormat.read(doc) : 
            this.format.read(doc, options);
        if (!this.featureNS) {
            var format = this.readFormat || this.format;
            this.featureNS = format.featureNS;
            // no need to auto-configure again on subsequent reads
            format.autoConfig = false;
            if (!this.geometryName) {
                this.setGeometryName(format.geometryName);
            }
        }
        return result;
    },

    /**
     * Method: commit
     * Given a list of feature, assemble a batch request for update, create,
     *     and delete transactions.  A commit call on the prototype amounts
     *     to writing a WFS transaction - so the write method on the format
     *     is used.
     *
     * Parameters:
     * features - {Array(<OpenLayers.Feature.Vector>)}
     * options - {Object}
     *
     * Valid options properties:
     * nativeElements - {Array({Object})} Array of objects with information for writing
     * out <Native> elements, these objects have vendorId, safeToIgnore and
     * value properties. The <Native> element is intended to allow access to 
     * vendor specific capabilities of any particular web feature server or 
     * datastore.
     *
     * Returns:
     * {<OpenLayers.Protocol.Response>} A response object with a features
     *     property containing any insertIds and a priv property referencing
     *     the XMLHttpRequest object.
     */
    commit: function(features, options) {

        options = OpenLayers.Util.extend({}, options);
        OpenLayers.Util.applyDefaults(options, this.options);
        
        var response = new OpenLayers.Protocol.Response({
            requestType: "commit",
            reqFeatures: features
        });
        response.priv = OpenLayers.Request.POST({
            url: options.url,
            headers: options.headers,
            data: this.format.write(features, options),
            callback: this.createCallback(this.handleCommit, response, options)
        });
        
        return response;
    },
    
    /**
     * Method: handleCommit
     * Called when the commit request returns.
     * 
     * Parameters:
     * response - {<OpenLayers.Protocol.Response>} The response object to pass
     *     to the user callback.
     * options - {Object} The user options passed to the commit call.
     */
    handleCommit: function(response, options) {
        if(options.callback) {
            var request = response.priv;

            // ensure that we have an xml doc
            var data = request.responseXML;
            if(!data || !data.documentElement) {
                data = request.responseText;
            }
            
            var obj = this.format.read(data) || {};
            
            response.insertIds = obj.insertIds || [];
            if (obj.success) {
                response.code = OpenLayers.Protocol.Response.SUCCESS;
            } else {
                response.code = OpenLayers.Protocol.Response.FAILURE;
                response.error = obj;
            }
            options.callback.call(options.scope, response);
        }
    },
    
    /**
     * Method: filterDelete
     * Send a request that deletes all features by their filter.
     * 
     * Parameters:
     * filter - {<OpenLayers.Filter>} filter
     */
    filterDelete: function(filter, options) {
        options = OpenLayers.Util.extend({}, options);
        OpenLayers.Util.applyDefaults(options, this.options);    
        
        var response = new OpenLayers.Protocol.Response({
            requestType: "commit"
        });    
        
        var root = this.format.createElementNSPlus("wfs:Transaction", {
            attributes: {
                service: "WFS",
                version: this.version
            }
        });
        
        var deleteNode = this.format.createElementNSPlus("wfs:Delete", {
            attributes: {
                typeName: (options.featureNS ? this.featurePrefix + ":" : "") +
                    options.featureType
            }
        });       
        
        if(options.featureNS) {
            deleteNode.setAttribute("xmlns:" + this.featurePrefix, options.featureNS);
        }
        var filterNode = this.format.writeNode("ogc:Filter", filter);
        
        deleteNode.appendChild(filterNode);
        
        root.appendChild(deleteNode);
        
        var data = OpenLayers.Format.XML.prototype.write.apply(
            this.format, [root]
        );
        
        return OpenLayers.Request.POST({
            url: this.url,
            callback : options.callback || function(){},
            data: data
        });   
        
    },

    /**
     * Method: abort
     * Abort an ongoing request, the response object passed to
     * this method must come from this protocol (as a result
     * of a read, or commit operation).
     *
     * Parameters:
     * response - {<OpenLayers.Protocol.Response>}
     */
    abort: function(response) {
        if (response) {
            response.priv.abort();
        }
    },
  
    CLASS_NAME: "OpenLayers.Protocol.WFS.v1" 
});
