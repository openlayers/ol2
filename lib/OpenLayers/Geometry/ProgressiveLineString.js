/* Copyright (c) 2006-2012 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the Clear BSD license.  
 * See http://svn.openlayers.org/trunk/openlayers/license.txt for the
 * full text of the license. */

/**
 * @requires OpenLayers/Geometry/LineString.js
 */

/**
 * Class: OpenLayers.Geometry.ProgressiveLineString
 * A LineString with level of detail classification
 * 
 * Inherits from:
 *  - <OpenLayers.Geometry.LineString>
 *  - <OpenLayers.Geometry.Curve> 
 */
OpenLayers.Geometry.ProgressiveLineString = OpenLayers.Class(
  OpenLayers.Geometry.LineString, {

    /**
     * Property: componentsLoD
     * {Array(int)} An array of level of detail classifications.
     * This array must be as long as the number of points in the
     * original LineString.
     */
    componentsLevel: null,

    /**
     * Property: levels
     * {Array(int)} An array of levels of detail <-> zoom level
     * e.g. levels[0] = 0 means all LoD >= 0 are visible in zoom level >= 0
     */
    levels: null,

    /**
     * Property: clip
     * {float} how large to clip the geometry when drawing
     */
    clip: 1.5,


    /**
     * Holds and tracks all partitioned geometries of our LineString.
    */
    progressiveGeometries: [],

    /**
     * Constructor: OpenLayers.Geometry.ProgressiveLineString
     * Constructor for a ProgressiveLineString Geometry.
     *
     * Parameters: 
     * components - {<OpenLayers.Geometry.LineString>} An array of points used to
     *              generate the linestring
     * componentsLevel - {Array(int)} An array of integers describing the level of detail
     *                   for each point. A LoD of 0 is visible in all zoom levels.
     * levels - {Array(int)} Levels array.
     */
    initialize: function(components, componentsLevel, levels) {
        if (components.length != componentsLevel.length) return;

        OpenLayers.Geometry.LineString.prototype.initialize.apply(this, arguments);
        this.componentsLevel = componentsLevel;
        this.levels = levels;

        for (var i = 0, len = this.components.length; i < len; i++) {
          this.components[i].originalIndex = i;
        }
    },

    /**
     * Method: getGeometries
     * Get this LineString as MultiLineString clipped to bounds and only with
     * points at the given lod.
     *
     * Parameters:
     * bounds - {<OpenLayers.Bounds>}
     * lod - {int} Level of detail
     */
    getGeometries: function(bounds, lod) {
        var multiLineString = [];
        var points = [];
        var inside = false;
        var last = 0;

        for (var i = 1, len = this.components.length; i < len; i++) {
            if (this.componentsLevel[i] > lod) continue;

            var vertice = new OpenLayers.Bounds();
            vertice.extend(this.components[i]);
            vertice.extend(this.components[last]);

            if (bounds.intersectsBounds(vertice)) {
                // inside. add to lineString.

                if (!inside) {
                    // first add the previous point.
                    points.push(this.components[last]);
                }

                // add current point
                points.push(this.components[i]);
                inside = true;
            } else {
                if (inside) {
                // create linestring and add it to multilinestring
                multiLineString.push(new OpenLayers.Geometry.LineString(points));
                // reset points array
                points = [];
                }
                // no longer inside
                inside = false;
            }
            last = i;
        }

        // push last linestring if not done already
        if (inside) multiLineString.push(new OpenLayers.Geometry.LineString(points));

        return multiLineString;
    },


    updateGeometries: function(bbox, zoom) {
        var bounds = bbox.scale(this.clip);

        var lod = 0;
        for (var i = 0; i < this.levels.length; i++) {
            if (this.levels[i] <= zoom) {
                lod = i;
            }
        }

        var geometries_to_remove = this.progressiveGeometries;
        this.progressiveGeometries = this.getGeometries(bounds, lod);

        return { remove: geometries_to_remove, add: this.progressiveGeometries };
    },

    CLASS_NAME: "OpenLayers.Geometry.ProgressiveLineString"
});
