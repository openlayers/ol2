/* Copyright (c) 2006-2012 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the Clear BSD license.  
 * See http://svn.openlayers.org/trunk/openlayers/license.txt for the
 * full text of the license. */


/**
 * @requires OpenLayers/Tile.js
 * @requires OpenLayers/Format/JSON.js
 */

/**
 * Class: OpenLayers.Tile.UTFGrid
 * Instances of OpenLayers.Tile.UTFGrid are used to manage 
 * UTFGrids. This is an unusual tile type in that it doesn't have a
 * rendered image; only a 'hit grid' that can be used to 
 * look up feature attributes.
 *
 * See the <OpenLayers.Tile.UTFGrid> constructor for details on constructing a
 * new instance.
 *
 * Inherits from:
 *  - <OpenLayers.Tile>
 */
OpenLayers.Tile.UTFGrid = OpenLayers.Class(OpenLayers.Tile, {

    /** 
     * Property: url
     * {String}
     * The URL of the UTFGrid file being requested. Provided by the <getURL>
     *     method. 
     */
    url: null,
    
    /**
     * Property: utfgridResolution
     * {Number}
     * Ratio of the pixel width to the width of a UTFGrid data point.  If an 
     *     entry in the grid represents a 2x2 block of pixels, the 
     *     utfgridResolution would be 2.  Default is 4.
     */
    utfgridResolution: 4,
    
    /** 
     * Property: json
     * {Object}
     * Stores the parsed JSON tile data structure. 
     */
    json: null,
    
    /** 
     * Property: format
     * {OpenLayers.Format.JSON}
     * Parser instance used to parse JSON for cross browser support.  The native
     *     JSON.parse method will be used where available (all except IE<8).
     */
    format: null,

    /** 
     * Constructor: OpenLayers.Tile.UTFGrid
     * Constructor for a new <OpenLayers.Tile.UTFGrid> instance.
     * 
     * Parameters:
     * layer - {<OpenLayers.Layer>} layer that the tile will go in.
     * position - {<OpenLayers.Pixel>}
     * bounds - {<OpenLayers.Bounds>}
     * url - {<String>} Deprecated. Remove me in 3.0.
     * size - {<OpenLayers.Size>}
     * options - {Object}
     */

    /** 
     * APIMethod: destroy
     * Clean up.
     */
    destroy: function() {
        this.clear();
        OpenLayers.Tile.prototype.destroy.apply(this, arguments);
    },
    
    /**
     * Method: draw
     * Check that a tile should be drawn, and draw it.
     * In the case of UTFGrids, "drawing" it means fetching and
     * parsing the json. 
     * 
     * Returns:
     * {Boolean} Was a tile drawn?
     */
    draw: function() {
        var drawn = OpenLayers.Tile.prototype.draw.apply(this, arguments);
        if (drawn) {
            if (this.isLoading) {
                this.abortLoading();
                //if we're already loading, send 'reload' instead of 'loadstart'.
                this.events.triggerEvent("reload"); 
            } else {
                this.isLoading = true;
                this.events.triggerEvent("loadstart");
            }
            this.url = this.layer.getURL(this.bounds);

            if (this.layer.useJSONP) {
                // Use JSONP method to avoid xbrowser policy
                var ols = new OpenLayers.Protocol.Script({
                    url: this.url,
                    callback: function(response) {
                        this.isLoading = false;
                        this.events.triggerEvent("loadend");
                        this.json = response.data;
                    },
                    scope: this
                });
                ols.read();
                this.request = ols;
            } else {
                // Use standard XHR
                this.request = OpenLayers.Request.GET({
                    url: this.url,
                    callback: function(response) {
                        this.isLoading = false;
                        this.events.triggerEvent("loadend");
                        if (response.status === 200) {
                            this.parseData(response.responseText);
                        }
                    },
                    scope: this
                });
            }
        } else {
            this.unload();
        }
        return drawn;
    },
    
    /**
     * Method: abortLoading
     * Cancel a pending request.
     */
    abortLoading: function() {
        if (this.request) {
            this.request.abort();
            delete this.request;
        }
        this.isLoading = false;
    },
    
    /**
     * Method: getFeatureData
     * Get feature data associated with a pixel offset.
     *
     * Parameters:
     * i - {Number} X-axis pixel offset (from top left of tile)
     * j - {Number} Y-axis pixel offset (from top left of tile)
     *
     * Returns:
     * {Object} The UTFGrid data corresponding to the given pixel offset.
     */
    getFeatureData: function(i, j) {
        var data;
        if (this.json) {
            data = this.json.data[this.getFeatureId(i, j)];
        }
        return data;
    },
    
    /**
     * Method: getFeatureId
     * Get the identifier for the feature associated with a pixel offset.
     *
     * Parameters:
     * i - {Number} X-axis pixel offset (from top left of tile)
     * j - {Number} Y-axis pixel offset (from top left of tile)
     *
     * Returns:
     * {Object} The feature identifier corresponding to the given pixel offset.
     */
    getFeatureId: function(i, j) {
        var id;
        if (this.json) {
            var resolution = this.utfgridResolution;
            var code = this.resolveCode(this.json.grid[ 
                    Math.floor((j) / resolution) 
                ].charCodeAt(
                    Math.floor((i) / resolution)
                ));
            id = this.json.keys[code];
        }
        return id;
    },

    /**
     * Method: resolveCode
     * Resolve the UTF-8 encoding stored in grids to simple number values.  
     *     See the UTFGrid spec for details.
     *
     * Parameters:
     * key - {Integer}
     *
     * Returns:
     * {Integer} Adjusted key for non-escaped chars
     */
    resolveCode: function(key) {
        if (key >= 93) key--;
        if (key >= 35) key--;
        key -= 32;
        return key;
    },

    /**
     * Method: parseData
     * Parse the JSON from a request
     *
     * Parameters:
     * str - {String} UTFGrid as a JSON string. 
     * 
     * Returns:
     * {Object} parsed javascript data
     */
    parseData: function(str) {
        if (!this.format) {
            this.format = new OpenLayers.Format.JSON();
        }
        this.json = this.format.read(str);
    },
    
    /** 
     * Method: clear
     * Delete data stored with this tile.
     */
    clear: function() {
        this.json = null;
    },
    
    CLASS_NAME: "OpenLayers.Tile.UTFGrid"

});
