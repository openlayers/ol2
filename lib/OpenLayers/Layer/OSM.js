/* Copyright (c) 2006-2012 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

/**
 * @requires OpenLayers/Layer/XYZ.js
 */

/**
 * Class: OpenLayers.Layer.OSM
 * This layer allows accessing OpenStreetMap tiles. By default the OpenStreetMap
 *    hosted tile.openstreetmap.org Mapnik tileset is used. If you wish to use
 *    a different layer instead, you need to provide a different
 *    URL to the constructor. Here's an example for using OpenCycleMap:
 * 
 * (code)
 *     new OpenLayers.Layer.OSM("OpenCycleMap", 
 *       ["http://a.tile.opencyclemap.org/cycle/${z}/${x}/${y}.png",
 *        "http://b.tile.opencyclemap.org/cycle/${z}/${x}/${y}.png",
 *        "http://c.tile.opencyclemap.org/cycle/${z}/${x}/${y}.png"]); 
 * (end)
 *
 * Inherits from:
 *  - <OpenLayers.Layer.XYZ>
 */
OpenLayers.Layer.OSM = OpenLayers.Class(OpenLayers.Layer.XYZ, {

    /**
     * APIProperty: name
     * {String} The layer name. Defaults to "OpenStreetMap" if the first
     * argument to the constructor is null or undefined.
     */
    name: "OpenStreetMap",

    /**
     * APIProperty: url
     * {String} The tileset URL scheme. Defaults to
     * : http://[a|b|c].tile.openstreetmap.org/${z}/${x}/${y}.png
     * (the official OSM tileset) if the second argument to the constructor
     * is null or undefined. To use another tileset you can have something
     * like this:
     * (code)
     *     new OpenLayers.Layer.OSM("OpenCycleMap", 
     *       ["http://a.tile.opencyclemap.org/cycle/${z}/${x}/${y}.png",
     *        "http://b.tile.opencyclemap.org/cycle/${z}/${x}/${y}.png",
     *        "http://c.tile.opencyclemap.org/cycle/${z}/${x}/${y}.png"]); 
     * (end)
     */
    url: [
        'http://a.tile.openstreetmap.org/${z}/${x}/${y}.png',
        'http://b.tile.openstreetmap.org/${z}/${x}/${y}.png',
        'http://c.tile.openstreetmap.org/${z}/${x}/${y}.png'
    ],

    /**
     * Property: attribution
     * {String} The layer attribution.
     */
    attribution: "Data CC-By-SA by <a href='http://openstreetmap.org/'>OpenStreetMap</a>",

    /**
     * Property: sphericalMercator
     * {Boolean}
     */
    sphericalMercator: true,

    /**
     * Property: wrapDateLine
     * {Boolean}
     */
    wrapDateLine: true,

    /** APIProperty: tileOptions
     *  {Object} optional configuration options for <OpenLayers.Tile> instances
     *  created by this Layer. Default is
     *
     *  (code)
     *  {crossOriginKeyword: 'anonymous'}
     *  (end)
     *
     *  When using OSM tilesets other than the default ones, it may be
     *  necessary to set this to
     *
     *  (code)
     *  {crossOriginKeyword: null}
     *  (end)
     *
     *  if the server does not send Access-Control-Allow-Origin headers.
     */
    tileOptions: null,

    /**
     * APIProperty: serverResolutions
     * {Array} the resolutions provided by the OSM tile servers.
     */
    serverResolutions: [
        156543.03390625, 78271.516953125, 39135.7584765625,
        19567.87923828125, 9783.939619140625, 4891.9698095703125,
        2445.9849047851562, 1222.9924523925781, 611.4962261962891,
        305.74811309814453, 152.87405654907226, 76.43702827453613,
        38.218514137268066, 19.109257068634033, 9.554628534317017,
        4.777314267158508, 2.388657133579254, 1.194328566789627,
        0.5971642833948135, 0.29858214169740677, 0.14929107084870338,
        0.07464553542435169
    ],

    /**
     * Constructor: OpenLayers.Layer.OSM
     *
     * Parameters:
     * name - {String} The layer name.
     * url - {String} The tileset URL scheme.
     * options - {Object} Configuration options for the layer. Any inherited
     *     layer option can be set in this object (e.g.
     *     <OpenLayers.Layer.Grid.buffer>).
     */
    initialize: function(name, url, options) {
        OpenLayers.Layer.XYZ.prototype.initialize.apply(this, arguments);
        this.tileOptions = OpenLayers.Util.extend({
            crossOriginKeyword: 'anonymous'
        }, this.options && this.options.tileOptions);
    },

    /**
     * Method: clone
     */
    clone: function(obj) {
        if (obj == null) {
            obj = new OpenLayers.Layer.OSM(
                this.name, this.url, this.getOptions());
        }
        obj = OpenLayers.Layer.XYZ.prototype.clone.apply(this, [obj]);
        return obj;
    },

    CLASS_NAME: "OpenLayers.Layer.OSM"
});
