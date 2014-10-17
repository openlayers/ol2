/* Copyright (c) 2006-2013 by OpenLayers Contributors (see authors.txt for
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

/**
 * @requires OpenLayers/Control.js
 * @requires OpenLayers/Lang.js
 * @requires OpenLayers/Rule.js
 * @requires OpenLayers/StyleMap.js
 * @requires OpenLayers/Layer/Vector.js
 */

/**
 * Class: OpenLayers.Control.Graticule
 * The Graticule displays a grid of latitude/longitude lines reprojected on
 * the map.
 * The grid is specified by a list of widths in degrees (with height the same as
 * the width). The grid height can be specified as a multiple of the width.
 * This allows making the grid more regular in specific regions of some
 * projections. The grid can also be specified by lists of both widths and
 * heights. This allows matching externally-defined grid systems.
 *
 * Inherits from:
 *  - <OpenLayers.Control>
 *
 */
OpenLayers.Control.Graticule = OpenLayers.Class(OpenLayers.Control, {

    /**
     * APIProperty: autoActivate
     * {Boolean} Activate the control when it is added to a map. Default is
     *     true.
     */
    autoActivate: true,

    /**
     * APIProperty: intervals
     * {Array(Float)} A list of possible graticule widths in degrees.
     */
    intervals: [90, 45, 30, 20, 10, 5, 2, 1,
        0.5, 0.2, 0.1, 0.05, 0.01,
        0.005, 0.002, 0.001
    ],

    /**
     * APIProperty: intervalHeights
     * {Array(Float)} A list of possible graticule heights in degrees.
     * Length must match intervals array.
     * Default is null (same as widths).
     */
    intervalHeights: null,

    /**
     * Property: intervalHeightFactor
     * {Number} Factor to compute graticule height from the width.
     * Can be used to match existing grid systems, or improve regularity of
     * grid. Default is 1.
     * Ignored if intervalHeights are set explicitly.
     */
    intervalHeightFactor: 1,

    /**
     * APIProperty: displayInLayerSwitcher
     * {Boolean} Allows the Graticule control to be switched on and off by
     *     LayerSwitcher control. Defaults is true.
     */
    displayInLayerSwitcher: true,

    /**
     * APIProperty: visible
     * {Boolean} should the graticule be initially visible (default=true)
     */
    visible: true,

    /**
     * APIProperty: numPoints
     * {Integer} The number of points to use in each graticule line.  Higher
     * numbers result in a smoother curve for projected maps.
     * *Deprecated*. The number of points is now determined by adaptive
     * quantization.
     */
    numPoints: 50,

    /**
     * APIProperty: targetSize
     * {Integer} The maximum size of the grid in pixels on the map
     */
    targetSize: 200,

    /**
     * APIProperty: layerName
     * {String} The name to be displayed in the layer switcher, default is set
     *     by {<OpenLayers.Lang>}.
     */
    layerName: null,

    /**
     * APIProperty: labelled
     * {Boolean} Should the graticule lines be labelled?. default=true
     */
    labelled: true,

    /**
     * APIProperty: labelFormat
     * {String} the format of the labels, default = 'dm'. See
     * <OpenLayers.Util.getFormattedLonLat> for other options.
     */
    labelFormat: 'dm',

    /**
     * APIProperty: labelLonYOffset
     * {Integer} the offset of the longitude (X) label from the bottom of the
     * map.
     */
    labelLonYOffset: 2,

    /**
     * APIProperty: labelLatXOffset
     * {Integer} the offset of the latitude (Y) label from the right of the map.
     */
    labelLatXOffset: -2,

    /**
     * APIProperty: lineSymbolizer
     * {symbolizer} the symbolizer used to render lines
     */
    lineSymbolizer: {
        strokeColor: "#333",
        strokeWidth: 1,
        strokeOpacity: 0.5
    },

    /**
     * APIProperty: labelSymbolizer
     * {symbolizer} the symbolizer used to render labels
     */
    labelSymbolizer: null,

    /**
     * Property: gratLayer
     * {<OpenLayers.Layer.Vector>} vector layer used to draw the graticule on
     */
    gratLayer: null,

    /**
     * Property: epsg4326Projection
     * {OpenLayers.Projection}
     */
    epsg4326Projection: null,

    /**
     * Property: projection
     * {OpenLayers.Projection} The projection of the graticule.
     */
    projection: null,

    /**
     * Property: projectionCenterLonLat
     * {OpenLayers.LonLat} The center of the projection's validity extent.
     */
    projectionCenterLonLat: null,

    /**
     * Property: maxLat
     * {number}
     */
    maxLat: Infinity,

    /**
     * Propety: maxLon
     * {number}
     */
    maxLon: Infinity,

    /**
     * Property: minLat
     * {number}
     */
    minLat: -Infinity,

    /**
     * Property: minLon
     * {number}
     */
    minLon: -Infinity,

    /**
     * Property: meridians
     * {Array.<OpenLayers.Feature.Vector>}
     */
    meridians: null,

    /**
     * Property. parallels
     * {Array.<OpenLayers.Feature.Vector>}
     */
    parallels: null,

    /**
     * Constructor: OpenLayers.Control.Graticule
     * Create a new graticule control to display a grid of latitude longitude
     * lines.
     *
     * Parameters:
     * options - {Object} An optional object whose properties will be used
     *     to extend the control.
     */
    initialize: function(options) {
        options = options || {};
        options.layerName = options.layerName || OpenLayers.i18n("Graticule");
        OpenLayers.Control.prototype.initialize.apply(this, [options]);

        this.labelSymbolizer = {
            stroke: false,
            fill: false,
            label: "${label}",
            labelAlign: "${labelAlign}",
            labelXOffset: "${xOffset}",
            labelYOffset: "${yOffset}"
        };

        this.epsg4326Projection = new OpenLayers.Projection('EPSG:4326');
        this.parallels = [];
        this.meridians = [];
    },

    /**
     * APIMethod: destroy
     */
    destroy: function() {
        this.deactivate();
        OpenLayers.Control.prototype.destroy.apply(this, arguments);
        if (this.gratLayer) {
            this.gratLayer.destroy();
            this.gratLayer = null;
        }
    },

    /**
     * Method: draw
     *
     * initializes the graticule layer and does the initial update
     *
     * Returns:
     * {DOMElement}
     */
    draw: function() {
        OpenLayers.Control.prototype.draw.apply(this, arguments);
        if (!this.gratLayer) {
            var gratStyle = new OpenLayers.Style({}, {
                rules: [new OpenLayers.Rule({
                    'symbolizer': {
                        "Point": this.labelSymbolizer,
                        "Line": this.lineSymbolizer
                    }
                })]
            });
            this.gratLayer = new OpenLayers.Layer.Vector(this.layerName, {
                styleMap: new OpenLayers.StyleMap({
                    'default': gratStyle
                }),
                visibility: this.visible,
                displayInLayerSwitcher: this.displayInLayerSwitcher,
                // Prefer the canvas renderer to avoid coordinate range issues
                // with graticule lines
                renderers: ['Canvas', 'VML', 'SVG']
            });
        }
        return this.div;
    },

    /**
     * APIMethod: activate
     */
    activate: function() {
        if (OpenLayers.Control.prototype.activate.apply(this, arguments)) {
            this.map.addLayer(this.gratLayer);
            this.map.events.register('moveend', this, this.update);
            this.update();
            return true;
        } else {
            return false;
        }
    },

    /**
     * APIMethod: deactivate
     */
    deactivate: function() {
        if (OpenLayers.Control.prototype.deactivate.apply(this, arguments)) {
            this.map.events.unregister('moveend', this, this.update);
            this.map.removeLayer(this.gratLayer);
            return true;
        } else {
            return false;
        }
    },

    /**
     * Method: update
     *
     * calculates the grid to be displayed and actually draws it
     *
     * Returns:
     * {DOMElement}
     */
    update: function() {
        var map = this.map;
        //wait for the map to be initialized before proceeding
        var extent = this.map.getExtent();
        if (!extent) {
            return;
        }
        var center = map.getCenter();
        var projection = map.getProjectionObject();
        var resolution = map.getResolution();
        var squaredTolerance = resolution * resolution / 4;

        var updateProjectionInfo = !this.projection || !this.projection.equals(projection);

        if (updateProjectionInfo) {
            this.updateProjectionInfo(projection);
        }

        this.createGraticule(extent, center, resolution, squaredTolerance);

        // Draw the lines
        this.gratLayer.destroyFeatures();
        this.gratLayer.addFeatures(this.meridians);
        this.gratLayer.addFeatures(this.parallels);

        // Draw the labels
        if (this.labelled) {
            var left = new OpenLayers.Geometry.LineString([
                new OpenLayers.Geometry.Point(extent.left, extent.bottom),
                new OpenLayers.Geometry.Point(extent.left, extent.top)
            ]);
            var top = new OpenLayers.Geometry.LineString([
                new OpenLayers.Geometry.Point(extent.left, extent.top),
                new OpenLayers.Geometry.Point(extent.right, extent.top)
            ]);
            var labels = [];
            var i, ii, line, labelPoint, split, labelAlign;
            for (i = 0, ii = this.meridians.length; i < ii; ++i) {
                line = this.meridians[i];
                labelPoint = line.attributes.labelPoint;
                labelAlign = 'cb';
                // If there is no intersection with the bottom of the viewport,
                // intersect with the left.
                if (!labelPoint) {
                    split = line.geometry.split(left);
                    if (split) {
                        labelPoint = split[0].components[1];
                        labelAlign = 'lt';
                    }
                }
                if (labelPoint) {
                    labels.push(new OpenLayers.Feature.Vector(labelPoint, {
                        value: line.attributes.lon,
                        label: OpenLayers.Util.getFormattedLonLat(
                            line.attributes.lon, 'lon', this.labelFormat),
                        labelAlign: labelAlign,
                        xOffset: 0,
                        yOffset: this.labelLonYOffset
                    }));
                }
            }
            for (i = 0, ii = this.parallels.length; i < ii; ++i) {
                line = this.parallels[i];
                labelPoint = line.attributes.labelPoint;
                labelAlign = 'rb';
                // If there is no intersection with the right of the viewport,
                // intersect with the top.
                if (!labelPoint) {
                    split = line.geometry.split(top);
                    if (split) {
                        labelPoint = split[0].components[1];
                        labelAlign = 'ct';
                    }
                }
                if (labelPoint) {
                    labels.push(new OpenLayers.Feature.Vector(labelPoint, {
                        value: line.attributes.lat,
                        label: OpenLayers.Util.getFormattedLonLat(
                            line.attributes.lat, 'lat', this.labelFormat),
                        labelAlign: labelAlign,
                        xOffset: this.labelLatXOffset,
                        yOffset: 2
                    }));
                }
            }
            this.gratLayer.addFeatures(labels);
        }
    },

    /**
     * Method: createGraticule
     *
     * Parameters:
     * extent - {OpenLayers.Bounds} Extent.
     * center - {OpenLayers.LonLat} Center.
     * resolution - {number} Resolution.
     * squaredTolerance - {number} Squared tolerance.
     */
    createGraticule: function(extent, center, resolution, squaredTolerance) {
        var centerLonLat = center.clone().transform(
            this.projection, this.epsg4326Projection);
        // If centerLonLat could not be transformed (e.g. [0, 0] in polar
        // projections), we shift the center a bit to get a result.
        if (isNaN(centerLonLat.lon) || isNaN(centerLonLat.lat)) {
            centerLonLat = center.add(0.000000001, 0.000000001).transform(
                this.projection, this.epsg4326Projection);
        }
        var extentGeom = extent.toGeometry();
        var extent4326 = extent.clone()
            .transform(this.projection, this.epsg4326Projection);

        // Optimize the length of graticule lines: Instead of always calculating
        // and rendering them from one end of the world to the other, we only
        // want to create them for the visible map viewport. To make sure that
        // our graticule lines are long enough (even in polar projections), we
        // only make this optimization under certain conditions:
        // * When we look at a small subset of the world
        // * When coordinates increase south -> north and west -> east
        // * When the projection center is not inside the extent.
        // With these conditions, a valid grid will be available for all
        // projections within their validity extent. Outside the validity
        // extent, partial grid lines may occur.
        var minLon, minLat, maxLon, maxLat;
        var pixelSize = this.map.getGeodesicPixelSize();
        if (pixelSize.w < 0.5 && pixelSize.h < 0.5 &&
                extent4326.right > extent4326.left &&
                extent4326.top > extent4326.bottom &&
                Math.abs(extent4326.bottom) / extent4326.bottom ==
                Math.abs(extent4326.top) / extent4326.top &&
                Math.abs(extent4326.left) / extent4326.left ==
                Math.abs(extent4326.right) / extent4326.right) {
            minLon = Math.max(extent4326.left, this.minLon);
            minLat = Math.max(extent4326.bottom, this.minLat);
            maxLon = Math.min(extent4326.right, this.maxLon);
            maxLat = Math.min(extent4326.top, this.maxLat);
        } else {
            minLon = this.minLon;
            minLat = this.minLat;
            maxLon = this.maxLon;
            maxLat = this.maxLat;
        }

        var size = this.map.getSize();
        var idx, prevIdx, lon, lat, visibleIntervals, interval, intervalIndex;
        var centerLon, centerLat;

        // Create meridians

        // Start with the coarsest interval, then refine until we reach the
        // desired targetSize
        visibleIntervals = Math.ceil(size.w / this.targetSize);
        intervalIndex = 0;
        do {
            interval = this.intervals[intervalIndex++];
            centerLon = Math.floor(centerLonLat.lon / interval) * interval;

            lon = Math.max(centerLon, this.minLon);
            lon = Math.min(lon, this.maxLon);

            idx = this.addMeridian(
                lon, minLat, maxLat, squaredTolerance, extentGeom, 0);

            while (lon != this.minLon) {
                lon = Math.max(lon - interval, this.minLon);
                prevIdx = idx;
                idx = this.addMeridian(
                    lon, minLat, maxLat, squaredTolerance, extentGeom, idx);
                if (prevIdx == idx) {
                    // bail out if we're producing lines that are not visible
                    break;
                }
            }

            lon = Math.max(centerLon, this.minLon);
            lon = Math.min(lon, this.maxLon);

            while (lon != this.maxLon) {
                lon = Math.min(lon + interval, this.maxLon);
                prevIdx = idx;
                idx = this.addMeridian(
                    lon, minLat, maxLat, squaredTolerance, extentGeom, idx);
                if (prevIdx == idx) {
                    // bail out if we're producing lines that are not visible
                    break;
                }
            }
        } while (intervalIndex < this.intervals.length &&
            idx <= visibleIntervals);

        this.meridians.length = idx;

        // Create parallels

        // Start with the coarsest interval, then refine until we reach the
        // desired targetSize
        visibleIntervals = Math.ceil(size.h / this.targetSize);
        intervalIndex = 0;
        do {
            interval = this.intervalHeights ?
                this.intervalHeights[intervalIndex++] :
                this.intervals[intervalIndex++] * this.intervalHeightFactor;
            centerLat = Math.floor(centerLonLat.lat / interval) * interval;

            lat = Math.max(centerLat, this.minLat);
            lat = Math.min(lat, this.maxLat);

            idx = this.addParallel(
                lat, minLon, maxLon, squaredTolerance, extentGeom, 0);

            while (lat != this.minLat) {
                lat = Math.max(lat - interval, this.minLat);
                prevIdx = idx;
                idx = this.addParallel(
                    lat, minLon, maxLon, squaredTolerance, extentGeom, idx);
                if (prevIdx == idx) {
                    // bail out if we're producing lines that are not visible
                    break;
                }
            }

            lat = Math.max(centerLat, this.minLat);
            lat = Math.min(lat, this.maxLat);

            while (lat != this.maxLat) {
                lat = Math.min(lat + interval, this.maxLat);
                prevIdx = idx;
                idx = this.addParallel(
                    lat, minLon, maxLon, squaredTolerance, extentGeom, idx);
                if (prevIdx == idx) {
                    // bail out if we're producing lines that are not visible
                    break;
                }
            }

        } while (intervalIndex < this.intervals.length &&
            idx <= visibleIntervals);

        this.parallels.length = idx;
    },

    /**
     * Method: updateProjectionInfo
     *
     * Parameters:
     * projection - {OpenLayers.Projection} Projection.
     */
    updateProjectionInfo: function(projection) {
        var defaults = OpenLayers.Projection.defaults[projection.getCode()];
        var extent = defaults && defaults.maxExtent ?
            OpenLayers.Bounds.fromArray(defaults.maxExtent) :
            this.map.getMaxExtent();
        var worldExtent = defaults && defaults.worldExtent ?
            defaults.worldExtent : [-180, -90, 180, 90];

        this.maxLat = worldExtent[3];
        this.maxLon = worldExtent[2];
        this.minLat = worldExtent[1];
        this.minLon = worldExtent[0];

        // Use the center of the transformed projection extent rather than the
        // transformed center of the projection extent. This way we avoid issues
        // with polar projections where [0, 0] cannot be transformed.
        this.projectionCenterLonLat = extent.clone().transform(
            projection, this.epsg4326Projection).getCenterLonLat();

        this.projection = projection;
    },

    /**
     * Method: addMeridian
     *
     * Parameters:
     * lon - {number} Longitude.
     * minLat - {number} Minimum latitude.
     * maxLat - {number} Maximum latitude.
     * squaredTolerance - {number} Squared tolerance.
     * extentGeom - {OpenLayers.Geometry.Polygon} Extent.
     * index {number} Index.
     *
     * Returns:
     * {number} Index.
     */
    addMeridian: function(
            lon, minLat, maxLat, squaredTolerance, extentGeom, index) {
        var lineString = OpenLayers.Geometry.LineString.geodesicMeridian(
            lon, minLat, maxLat, this.projection, squaredTolerance);
        var split = lineString.split(new OpenLayers.Geometry.LineString(
            extentGeom.components[0].components.slice(0, 2)));
        if (split || extentGeom.intersects(lineString)) {
            this.meridians[index++] =
                new OpenLayers.Feature.Vector(lineString, {
                    lon: lon,
                    labelPoint: split ? split[0].components[1] : undefined
                });
        }
        return index;
    },

    /**
     * Method: addParallel
     *
     * Parameters:
     * lat - {number} Latitude.
     * minLon - {number} Minimum longitude.
     * maxLon - {number} Maximum longitude.
     * squaredTolerance - {number} Squared tolerance.
     * extentGeom - {OpenLayers.Geometry.Polygon} Extent.
     * index - {number} Index.
     *
     * Returns:
     * {number} Index.
     */
    addParallel: function(
            lat, minLon, maxLon, squaredTolerance, extentGeom, index) {
        var lineString = OpenLayers.Geometry.LineString.geodesicParallel(
            lat, minLon, maxLon, this.projection, squaredTolerance);
        var split = lineString.split(new OpenLayers.Geometry.LineString(
            extentGeom.components[0].components.slice(1, 3)));
        if (split || extentGeom.intersects(lineString)) {
            this.parallels[index++] =
                new OpenLayers.Feature.Vector(lineString, {
                    lat: lat,
                    labelPoint: split ? split[0].components[1] : undefined
                });
        }
        return index;
    },

    CLASS_NAME: "OpenLayers.Control.Graticule"
});
