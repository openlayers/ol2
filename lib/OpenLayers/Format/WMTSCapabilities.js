/* Copyright (c) 2006-2013 by OpenLayers Contributors (see authors.txt for
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

/**
 * @requires OpenLayers/Format/XML/VersionedOGC.js
 */

/**
 * Class: OpenLayers.Format.WMTSCapabilities
 * Read WMTS Capabilities.
 *
 * Inherits from:
 *  - <OpenLayers.Format.XML.VersionedOGC>
 */
OpenLayers.Format.WMTSCapabilities = OpenLayers.Class(OpenLayers.Format.XML.VersionedOGC, {

    /**
     * APIProperty: defaultVersion
     * {String} Version number to assume if none found.  Default is "1.0.0".
     */
    defaultVersion: "1.0.0",

    /**
     * APIProperty: yx
     * {Object} Members in the yx object are used to determine if a CRS URN
     *     corresponds to a CRS with y,x axis order.  Member names are CRS URNs
     *     and values are boolean.  By default, the following CRS URN are
     *     assumed to correspond to a CRS with y,x axis order:
     *
     * * urn:ogc:def:crs:EPSG::4326
     */
    yx: {
        "urn:ogc:def:crs:EPSG::4326": true
    },

    /**
     * Constructor: OpenLayers.Format.WMTSCapabilities
     * Create a new parser for WMTS capabilities.
     *
     * Parameters:
     * options - {Object} An optional object whose properties will be set on
     *     this instance.
     */

    /**
     * APIMethod: read
     * Read capabilities data from a string, and return information about
     * the service (offering and observedProperty mostly).
     *
     * Parameters:
     * data - {String} or {DOMElement} data to read/parse.
     *
     * Returns:
     * {Object} Info about the WMTS Capabilities
     */

    /**
     * APIMethod: createLayer
     * Create a WMTS layer given a capabilities object.
     *
     * Parameters:
     * capabilities - {Object} The object returned from a <read> call to this
     *     format.
     * config - {Object} Configuration properties for the layer.  Defaults for
     *     the layer will apply if not provided.
     *
     * Required config properties:
     * layer - {String} The layer identifier.
     *
     * Optional config properties:
     * matrixSet - {String} The matrix set identifier, required if there is 
     *      more than one matrix set in the layer capabilities.
     * projection - {String} The desired CRS when no matrixSet is specified.
     *     eg: "EPSG:3857". If the desired projection is not available, 
     *     an error is thrown.
     * style - {String} The name of the style
     * format - {String} Image format for the layer. Default is the first
     *     format returned in the GetCapabilities response.
     * param - {Object} The dimensions values eg: {"Year": "2012"}
     *
     * Returns:
     * {<OpenLayers.Layer.WMTS>} A properly configured WMTS layer.  Throws an
     *     error if an incomplete config is provided.  Returns undefined if no
     *     layer could be created with the provided config.
     */
    createLayer: function(capabilities, config) {
        var layer;

        // confirm required properties are supplied in config
        if (!('layer' in config)) {
            throw new Error("Missing property 'layer' in configuration.");
        }

        var contents = capabilities.contents;

        // find the layer definition with the given identifier
        var layers = contents.layers;
        var layerDef;
        for (var i=0, ii=contents.layers.length; i<ii; ++i) {
            if (contents.layers[i].identifier === config.layer) {
                layerDef = contents.layers[i];
                break;
            }
        }
        if (!layerDef) {
            throw new Error("Layer not found");
        }
        
        var format = config.format;
        if (!format && layerDef.formats && layerDef.formats.length) {
            format = layerDef.formats[0];
        }

        // find the matrixSet definition
        var matrixSet;
        if (config.matrixSet) {
            matrixSet = contents.tileMatrixSets[config.matrixSet];
        } else if (config.projection) {
            for (var i=0,l=layerDef.tileMatrixSetLinks.length;i<l;i++) {
                if (contents.tileMatrixSets[
                        layerDef.tileMatrixSetLinks[i].tileMatrixSet
                    ].supportedCRS.replace(
                        /urn:ogc:def:crs:(\w+):(.*:)?(\w+)$/, "$1:$3"
                    ) === config.projection) {

                    matrixSet = contents.tileMatrixSets[
                        layerDef.tileMatrixSetLinks[i].tileMatrixSet];
                    break;
                }
            }
        } else if (layerDef.tileMatrixSetLinks.length >= 1) {
            matrixSet = contents.tileMatrixSets[
                layerDef.tileMatrixSetLinks[0].tileMatrixSet];
        }
        if (!matrixSet) {
            throw new Error("matrixSet not found");
        }

        // get the default style for the layer
        var style;
        for (var i=0, ii=layerDef.styles.length; i<ii; ++i) {
            style = layerDef.styles[i];
            if (style.isDefault) {
                break;
            }
        }

        var requestEncoding = config.requestEncoding;
        if (!requestEncoding) {
            requestEncoding = "KVP";
            if (capabilities.operationsMetadata.GetTile.dcp.http) {
                var http = capabilities.operationsMetadata.GetTile.dcp.http;
                // Get first get method
                if (http.get[0].constraints) {
                    var constraints = http.get[0].constraints;
                    var allowedValues = constraints.GetEncoding.allowedValues;
                    // The OGC documentation is not clear if we should use
                    // REST or RESTful, ArcGis use RESTful,
                    // and OpenLayers use REST.
                    if (!allowedValues.KVP &&
                            (allowedValues.REST || allowedValues.RESTful)) {
                        requestEncoding = "REST";
                    }
                }
            }
        }

        var dimensions = [];
        var params = config.params || {};
        // to don't overwrite the changes in the applyDefaults
        delete config.params;
        for (var id = 0, ld = layerDef.dimensions.length ; id < ld ; id++) {
            var dimension = layerDef.dimensions[id];
            dimensions.push(dimension.identifier);
            if (!params.hasOwnProperty(dimension.identifier)) {
                params[dimension.identifier] = dimension['default'];
            }
        }

        var projection = config.projection || matrixSet.supportedCRS.replace(
                /urn:ogc:def:crs:(\w+):(.*:)?(\w+)$/, "$1:$3");
        var units = config.units ||
                (projection === ("EPSG:4326" || "OGC:CRS84") ? "degrees" : "m");

        // compute server-supported resolutions array
        var resolutions = [], minScaleDenominator, maxScaleDenominator,
            reducedMatrixIds = [], tileMatrixSetLink,
            tileMatrixSetLinks = layerDef.tileMatrixSetLinks;
        var buildResolutionsArray = function(scaleDenominator) {
            resolutions.push(
                scaleDenominator * 0.28E-3 / OpenLayers.METERS_PER_INCH /
                    OpenLayers.INCHES_PER_UNIT[units]
            );
            if (!minScaleDenominator || minScaleDenominator > scaleDenominator) {
                minScaleDenominator = scaleDenominator;
            }
            if (!maxScaleDenominator || maxScaleDenominator < scaleDenominator) {
                maxScaleDenominator = scaleDenominator;
            }
        };
        for (var j=0, l=tileMatrixSetLinks.length; j<l; j++) {
            tileMatrixSetLink = tileMatrixSetLinks[j];
            if (tileMatrixSetLink.tileMatrixSet === matrixSet.identifier) {
                if (tileMatrixSetLink.tileMatrixSetLimits) {
                    // reformat matrixSet.matrixIds so that identifiers become keys
                    var tmpMatrixIds = {}, mid;
                    for (var k=0, ll=matrixSet.matrixIds.length; k<ll; k++) {
                        tmpMatrixIds[matrixSet.matrixIds[k].identifier] = matrixSet.matrixIds[k];
                    }
                    // compute resolutions array + scale limits
                    for (var k=0, ll=tileMatrixSetLink.tileMatrixSetLimits.length; k<ll; k++) {
                        mid = tmpMatrixIds[tileMatrixSetLink.tileMatrixSetLimits[k].tileMatrix];
                        reducedMatrixIds.push(mid);
                        buildResolutionsArray(mid.scaleDenominator);
                    }
                } else {
                    // if there are no limits in the tileMatrixSetLink, 
                    // use the resolutions from the full tile matrix set
                    for (var k=0, ll=matrixSet.matrixIds.length; k<ll; k++) {
                        buildResolutionsArray(matrixSet.matrixIds[k].scaleDenominator);
                    };
                }
                break;
            }
        }

        var url;
        if (requestEncoding === "REST" && layerDef.resourceUrls) {
            url = [];
            var resourceUrls = layerDef.resourceUrls,
                resourceUrl;
            for (var t = 0, tt = layerDef.resourceUrls.length; t < tt; ++t) {
                resourceUrl = layerDef.resourceUrls[t];
                if (resourceUrl.format === format && resourceUrl.resourceType === "tile") {
                    url.push(resourceUrl.template);
                }
            }
        } else {
            var httpGet = capabilities.operationsMetadata.GetTile.dcp.http.get;
            url = [];
            var constraint;
            for (var i = 0, ii = httpGet.length; i < ii; i++) {
                constraint = httpGet[i].constraints;
                if (!constraint || (constraint && constraint.
                        GetEncoding.allowedValues[requestEncoding])) {
                    url.push(httpGet[i].url);
                }
            }
        }

        resolutions.sort(function(a,b){
            return b-a;
        });
        var options = OpenLayers.Util.applyDefaults(config, {
            url: url,
            requestEncoding: requestEncoding,
            name: layerDef.title,
            style: style && style.identifier || "",
            format: format,
            matrixIds: reducedMatrixIds.length ? 
                reducedMatrixIds : matrixSet.matrixIds,
            matrixSet: matrixSet.identifier,
            projection: projection,
            units: units,
            tileFullExtent: matrixSet.bounds,
            dimensions: dimensions,
            params: params,
            resolutions: config.isBaseLayer === false ? undefined :
                resolutions,
            serverResolutions: resolutions,
            minScale: 1/Math.ceil(maxScaleDenominator),
            maxScale: 1/Math.floor(minScaleDenominator)
        });
        return new OpenLayers.Layer.WMTS(options);
    },

    CLASS_NAME: "OpenLayers.Format.WMTSCapabilities"
});
