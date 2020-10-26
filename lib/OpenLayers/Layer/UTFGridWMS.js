/* Copyright (c) 2006-2012 by OpenLayers Contributors (see authors.txt for
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */


/**
 * @requires OpenLayers/Layer/WMS.js
 * @requires OpenLayers/Tile/UTFGrid.js
 * @requires OpenLayers/Control/UTFGrid.js
 */

/**
 * Class: OpenLayers.Layer.UTFGridWMS
 * This Layer reads from UTFGrid WMS data sources.  Since UTFGrids are
 * essentially JSON-based ASCII art with attached attributes, they are not
 * visibly rendered.  In order to use them in the map, you must add a
 * <OpenLayers.Control.UTFGrid> control as well
 *
 * Inherits from:
 *  - <OpenLayers.Layer.WMS>
 */
OpenLayers.Layer.UTFGridWMS = OpenLayers.Class(OpenLayers.Layer.WMS, {

    /**
     * APIProperty: isBaseLayer
     * {Boolean} Default is false for UTFGridWMS layer
     */
    isBaseLayer: false,

    /**
    * Property: useJSONP
    * {Boolean}
    * Should we use a JSONP script approach instead of a standard AJAX call?
    *
    * Set to true for using utfgrids from another server.
    * Avoids same-domain policy restrictions.
    * Note that this only works if the server accepts
    * the callback GET parameter and dynamically
    * wraps the returned json in a function call.
    *
    * Default is false
    */
    useJSONP: false,

    /**
     * Property: tileClass
     * {<OpenLayers.Tile>} The tile class to use for this layer.
     *     Defaults is <OpenLayers.Tile.UTFGrid>.
     */
    tileClass: OpenLayers.Tile.UTFGrid,

    /**
     * Constructor: OpenLayers.Layer.UTFGridWMS
     * Create a new UTFGridWMS layer object
     *
     * Parameters:
     * name - {String} A name for the layer
     * url - {String} Base url for the WMS
     *                (e.g. http://wms.jpl.nasa.gov/wms.cgi)
     * params - {Object} An object with key/value pairs representing the
     *                   GetMap query string parameters and parameter values.
     * options - {Object} Hashtable of extra options to tag onto the layer.
     *     These options include all properties listed above, plus the ones
     *     inherited from superclasses.
     */
    initialize: function(name, url, params, options) {

        this.DEFAULT_PARAMS.format= "application/json";

        OpenLayers.Layer.WMS.prototype.initialize.apply(this, arguments);


        this.tileOptions = OpenLayers.Util.extend({
            utfgridResolution: this.utfgridResolution
        }, this.tileOptions);
    },

    /**
     * Method: createBackBuffer
     * The UTFGrid cannot create a back buffer, so this method is overriden.
     */
    createBackBuffer: function() {},

    /**
     * APIProperty: getFeatureInfo
     * Get details about a feature associated with a map location.  The object
     *     returned will have id and data properties.  If the given location
     *     doesn't correspond to a feature, null will be returned.
     *
     * Parameters:
     * location - {<OpenLayers.LonLat>} map location
     *
     * Returns:
     * {Object} Object representing the feature id and UTFGrid data
     *     corresponding to the given map location.  Returns null if the given
     *     location doesn't hit a feature.
     */
    getFeatureInfo:function(location) {
        var info = null;
        var tileInfo = this.getTileData(location);
        if (tileInfo && tileInfo.tile) {
            info = tileInfo.tile.getFeatureInfo(tileInfo.i, tileInfo.j);
        }
        return info;
    },

    /**
     * APIMethod: getFeatureId
     * Get the identifier for the feature associated with a map location.
     *
     * Parameters:
     * location - {<OpenLayers.LonLat>} map location
     *
     * Returns:
     * {String} The feature identifier corresponding to the given map location.
     *     Returns null if the location doesn't hit a feature.
     */
    getFeatureId: function(location) {
        var id = null;
        var info = this.getTileData(location);
        if (info.tile) {
            id = info.tile.getFeatureId(info.i, info.j);
        }
        return id;
    },

    CLASS_NAME: "OpenLayers.Layer.UTFGridWMS"
});
