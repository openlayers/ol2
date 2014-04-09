/* Copyright (c) 2006-2013 by OpenLayers Contributors (see authors.txt for
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

/**
 * @requires OpenLayers/Format/XML.js
 * @requires OpenLayers/BaseTypes/Bounds.js
 * @requires OpenLayers/BaseTypes/LonLat.js
 */

/**
 * Class: OpenLayers.Format.TMSCapabilities
 * Parse TMS Capabilities.
 * See http://wiki.osgeo.org/wiki/Tile_Map_Service_Specification
 * 
 * Inherits from:
 *  - <OpenLayers.Format.XML>
 */
OpenLayers.Format.TMSCapabilities = OpenLayers.Class(
    OpenLayers.Format.XML, {

    /**
     * Property: defaultPrefix
     */
    defaultPrefix: "tms",

    /**
     * Property: readers
     * Contains public functions, grouped by namespace prefix, that will
     *     be applied when a namespaced node is found matching the function
     *     name.  The function will be applied in the scope of this parser
     *     with two arguments: the node being read and a context object passed
     *     from the parent.
     */
    readers: {
        "tms": {
            "Services": function(node, obj) {
                obj.services = [];
                this.readChildNodes(node, obj);
            },
            "TileMapService": function(node, obj) {
                if (obj.services) {
                    obj.services.push({
                        service: 'TMS', 
                        version: node.getAttribute("version"),
                        title: node.getAttribute("title"),
                        href: node.getAttribute("href")
                    });
                } else {
                    this.readChildNodes(node, obj);
                }
            },
            "TileMaps": function(node, obj) {
                obj.tileMaps = [];
                this.readChildNodes(node, obj);
            },
            "TileMap": function(node, obj) {
                if (obj.tileMaps) {
                    obj.tileMaps.push({
                        href: node.getAttribute("href"),
                        srs: node.getAttribute("srs"),
                        title: node.getAttribute("title"),
                        profile: node.getAttribute("profile")
                    });
                } else {
                    obj.version =  node.getAttribute("version");
                    obj.tileMapService = node.getAttribute("tilemapservice");
                    this.readChildNodes(node, obj);
                }
            },
            "Title": function(node, obj) {
                obj.title = this.getChildValue(node);
            },
            "Abstract": function(node, obj) {
                obj['abstract'] = this.getChildValue(node);
            },
            "SRS": function(node, obj) {
                obj.srs = this.getChildValue(node);
            },
            "BoundingBox": function(node, obj) {
                obj.bbox = new OpenLayers.Bounds(
                    node.getAttribute("minx"),
                    node.getAttribute("miny"),
                    node.getAttribute("maxx"),
                    node.getAttribute("maxy"));
            },
            "Origin": function(node, obj) {
                obj.origin = new OpenLayers.LonLat(
                    node.getAttribute("x"),
                    node.getAttribute("y"));
            },
            "TileFormat": function(node, obj) {
                obj.tileFormat = {
                    width: parseInt(node.getAttribute("width"), 10),
                    height: parseInt(node.getAttribute("height"), 10),
                    mimeType: node.getAttribute("mime-type"),
                    extension: node.getAttribute("extension")
                };
            },
            "TileSets": function(node, obj) {
                obj.tileSets = [];
                this.readChildNodes(node, obj);
            },
            "TileSet": function(node, obj) {
                obj.tileSets.push({
                    href: node.getAttribute("href"),
                    unitsPerPixel: parseFloat(node.getAttribute("units-per-pixel")),
                    order: parseInt(node.getAttribute("order"), 10)
                });
            },
            "TileMapServerError": function(node, obj) {
                obj.error = true;
            },
            "Message": function(node, obj) {
                obj.message = this.getChildValue(node);
            }
        }
    },

    /**
     * APIMethod: read
     * Read TMS capabilities data from a string, and return a list of tilesets. 
     * 
     * Parameters: 
     * data - {String} or {DOMElement} data to read/parse.
     *
     * Returns:
     * {Object} Information about the services served by this TMS instance.
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
        return capabilities;
    },

    CLASS_NAME: "OpenLayers.Format.TMSCapabilities"

});
