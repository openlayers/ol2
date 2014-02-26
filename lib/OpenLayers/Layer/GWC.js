/* Copyright (c) 2006-2013 by OpenLayers Contributors (see authors.txt for
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */


/**
 * @requires OpenLayers/Layer/Grid.js
 */

/**
 * Class: OpenLayers.Layer.GWC
 * Create a layer for accessing tiles from a GeoWebCache tilestore 
 *     that is delivered by a normal http web server. The tilestore
 *     is built up like 
 *     '{url}/path/to/cache/EPSG_900913_{zoom}/{dir_x}_{dir_y}/{x}_{y}.png'
 *     
 * Example:
 * (code)
 *     var layer = new OpenLayers.Layer.GWC(
 *         "My Layer", // name for display in LayerSwitcher
 *         "http://myserver.org/geowebcache_data/the_gwc_layer/EPSG_900913_", // url endpoint substring
 *         {type: "png"} // required properties
 *     );
 * (end)
 * 
 * Inherits from:
 *  - <OpenLayers.Layer.Grid>
 */
OpenLayers.Layer.GWC = OpenLayers.Class(OpenLayers.Layer.Grid, {

    /**
     * APIProperty: type
     * {String} The format extension corresponding to the requested tile image
     *     type.  Usually set to "png" or "jpg".
     */
    type: null,

    /**
     * APIProperty: isBaseLayer
     * {Boolean} Make this layer a base layer.  Default is true.  Set false to
     *     use the layer as an overlay.
     */
    isBaseLayer: true,

    /**
     * APIProperty: tileOrigin
     * {<OpenLayers.LonLat>} Optional origin for aligning the grid of tiles.
     *     If provided, requests for tiles at all resolutions will be aligned
     *     with this location (no tiles shall overlap this location).  If
     *     not provided, the grid of tiles will be aligned with the bottom-left
     *     corner of the map's <maxExtent>.  Default is ``null``.
     *
     * Example:
     * (code)
     *     var layer = new OpenLayers.Layer.GWC(
     *         "My Layer",
     *         "http://myserver.org/geowebcache_data/the_gwc_layer/EPSG_900913_", 
     *         {
     *             type: "png",     
     *             // set if different than the bottom left of map.maxExtent
     *             tileOrigin: new OpenLayers.LonLat(-180, -90)
     *         } 
     *     );
     * (end)
     */
    tileOrigin: null,

    /**
     * APIProperty: serverResolutions
     * {Array} A list of all resolutions available on the server.  Only set this
     *     property if the map resolutions differ from the server. This
     *     property serves two purposes. (a) <serverResolutions> can include
     *     resolutions that the server supports and that you don't want to
     *     provide with this layer; you can also look at <zoomOffset>, which is
     *     an alternative to <serverResolutions> for that specific purpose.
     *     (b) The map can work with resolutions that aren't supported by
     *     the server, i.e. that aren't in <serverResolutions>. When the
     *     map is displayed in such a resolution data for the closest
     *     server-supported resolution is loaded and the layer div is
     *     stretched as necessary.
     */
    serverResolutions: null,

    /**
     * APIProperty: zoomOffset
     * {Number} If your cache has more zoom levels than you want to provide
     *     access to with this layer, supply a zoomOffset.  This zoom offset
     *     is added to the current map zoom level to determine the level
     *     for a requested tile.  For example, if you supply a zoomOffset
     *     of 3, when the map is at the zoom 0, tiles will be requested from
     *     level 3 of your cache.  Default is 0 (assumes cache level and map
     *     zoom are equivalent).  Using <zoomOffset> is an alternative to
     *     setting <serverResolutions> if you only want to expose a subset
     *     of the server resolutions.
     */
    zoomOffset: 0,
    
    /**
     * Constructor: OpenLayers.Layer.GWC
     * 
     * Parameters:
     * name - {String} Title to be displayed in a <OpenLayers.Control.LayerSwitcher>
     * url - {String} URL endpoint substring  E.g.
     *     "http://myserver.org/geowebcache_data/the_gwc_layer/EPSG_900913_".
     * options - {Object} Additional properties to be set on the layer.  The
     *     <type> property must be set here.
     */
    initialize: function(name, url, options) {
        var newArguments = [];
        newArguments.push(name, url, {}, options);
        OpenLayers.Layer.Grid.prototype.initialize.apply(this, newArguments);
    },    

    /**
     * APIMethod: clone
     * Create a complete copy of this layer.
     *
     * Parameters:
     * obj - {Object} Should only be provided by subclasses that call this
     *     method.
     * 
     * Returns:
     * {<OpenLayers.Layer.GWC>} An exact clone of this <OpenLayers.Layer.GWC>
     */
    clone: function (obj) {
        
        if (obj == null) {
            obj = new OpenLayers.Layer.GWC(this.name,
                                           this.url,
                                           this.getOptions());
        }

        //get all additions from superclasses
        obj = OpenLayers.Layer.Grid.prototype.clone.apply(this, [obj]);

        // copy/set any non-init, non-simple values here

        return obj;
    },    
    
    /**
     * Method: zeroPadder
     * helper method that pads the directory number with the required zeros
     * 
     * Parameters:
     * unPaddedInt - {number} unpadded integer
     * padReq - {number} total number of required digits 
     * 
     * Returns:
     * {String} zero padded string
     */
    zeroPadder: function(unPaddedInt, padReq) {
        padded = unPaddedInt.toString();
        while (padded.length < padReq) {
            padded = "0" + padded;
        }
        return padded;
    },
    
    /**
     * Method: log10
     * helper method to calculate log10 of a number
     * 
     * Parameters:
     * val - {number}
     * 
     * Returns:
     * {number} the log10 value of the val 
     */
    log10: function (val) {
        return Math.log(val) / Math.LN10;
    },
    
    /**
     * Method: getURL
     * 
     * Parameters:
     * bounds - {<OpenLayers.Bounds>}
     * 
     * Returns:
     * {String} A string corresponding to the GWC tilestorage layout.  The URL
     *      is constructed in the way as outlined in the GeoWebCache src file at
     *      https://github.com/GeoWebCache/geowebcache/blob/master/geowebcache/core/src/main/java/org/geowebcache/storage/blobstore/file/FilePathGenerator.java#L60
     */
    getURL: function (bounds) {
        bounds = this.adjustBounds(bounds);        
        var res = this.getServerResolution();
        var z = this.getServerZoom();
        var x = Math.round((bounds.left - this.tileOrigin.lon) / (res * this.tileSize.w));
        var y = Math.round((bounds.bottom - this.tileOrigin.lat) / (res * this.tileSize.h));
        
        var shift = Math.floor(z / 2) + 1;
        var half = Math.pow(2, shift);
        var digits = 1;
        if (half > 10) {
            digits = Math.floor(this.log10(half) + 1);
        }
        var halfx = Math.floor(x / half);
        var halfy = Math.floor(y / half);
        
        var paddedZ = this.zeroPadder(z, 2);
        var paddedHalfX = this.zeroPadder(halfx, digits);
        var paddedHalfY = this.zeroPadder(halfy, digits);        
        var paddedX = this.zeroPadder(x, 2 * digits);
        var paddedY = this.zeroPadder(y, 2 * digits);
        
        var path = paddedZ + "/" + paddedHalfX + "_" + paddedHalfY + "/" + paddedX + "_" + paddedY + "." + this.type;
        var url = this.url;
        if (OpenLayers.Util.isArray(url)) {
            url = this.selectUrl(path, url);
        }
        return url + path;
    },

    /** 
     * Method: setMap
     * When the layer is added to a map, then we can fetch our origin 
     *    (if we don't have one.) 
     * 
     * Parameters:
     * map - {<OpenLayers.Map>}
     */
    setMap: function(map) {
        OpenLayers.Layer.Grid.prototype.setMap.apply(this, arguments);
        if (!this.tileOrigin) { 
            this.tileOrigin = new OpenLayers.LonLat(this.map.maxExtent.left,
                                                this.map.maxExtent.bottom);
        }                                       
    },

    CLASS_NAME: "OpenLayers.Layer.GWC"
});
