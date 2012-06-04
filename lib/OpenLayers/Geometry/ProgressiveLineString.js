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
    componentsLoD: null,

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
    clip: 2,

    progressive_geometries: [],

    /**
     * Constructor: OpenLayers.Geometry.ProgressiveLineString
     * Constructor for a ProgressiveLineString Geometry.
     *
     * Parameters: 
     * components - {<OpenLayers.Geometry.LineString>} An array of points used to
     *              generate the linestring
     * componentsLoD - {Array(int)} An array of integers describing the level of detail
     *                 for each point. A LoD of 0 is visible in all zoom levels.
     * levels - {Array(int)} Levels array.
     */
     initialize: function(components, componentsLoD, levels) {
       OpenLayers.Geometry.LineString.prototype.initialize.apply(this, arguments);
       this.componentsLoD = componentsLoD;
       this.levels = levels;
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
        var multiLineString = new Array();
        var points = new Array();
        var inside = false;
        var last = null;

        for (var i = 0, len = this.components.length; i < len; i++) {
          if (this.componentsLoD[i] > lod) continue;

          if (bounds.contains(this.components[i].x, this.components[i].y)) {
            // inside. add to lineString.
            inside = true;

            if (last !== null) {
              // first add the previous vertice (but only once).
              points.push(this.components[last]);
              last = null;
            }

            // add current vertice
            points.push(this.components[i]);
          } else {
            if (inside) {
              // first vertice outside. add this one.
              points.push(this.components[i]);
              // create linestring and add it to multilinestring
              multiLineString.push(new OpenLayers.Geometry.LineString(points));
              // reset points array
              points = new Array();
            }
            // no longer inside
            inside = false;
            last = i;
          }
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

        var geometries_to_remove = this.progressive_geometries;
        this.progressive_geometries = this.getGeometries(bounds, lod);

        return { remove: geometries_to_remove, add: this.progressive_geometries };
      },

    CLASS_NAME: "OpenLayers.Geometry.ProgressiveLineString"
});
