/* Copyright (c) 2006-2012 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

/**
 * @requires OpenLayers/Renderer.js
 */

/**
 * Class: OpenLayers.FeaturesIndexer
 * This class takes care of figuring out which order features should be
 *     placed in the canvas based on given indexing methods.
 *
 */
OpenLayers.FeaturesIndexer = OpenLayers.Class({

    /**
     * Implied zIndex if it's not defined
     */
    minZIndex: -1000,

    /**
     * Property: order
     * {Array<String>} This is an array of features id's stored in the
     *     order that they should show up on screen. Id's higher up in the
     *     array (higher array index) represent nodes with higher z-indeces.
     */
    order: null,

    /**
     * Property: features
     * {Object} This is a hash that maps feature ids to feature and associated data
     */
    features: null,

    /**
     * APIMethod: initialize
     * Create a new feature indexer
     */
    initialize: function() {
        this.clear();
    },

    /**
     * APIMethod: clear
     */
    clear: function() {
        this.order = [];
        this.features = {};
    },

    /**
     * APIMethod: exists
     *
     * Parameters:
     * featureId - {String} The feature id to test for existence.
     *
     * Returns:
     * {Boolean} Whether or not the feature exists in the indexer?
     */
    exists: function(featureId) {
        return !!this.features[featureId];
    },

    /**
     * APIMethod: remove
     *
     * Parameters:
     * featureId - {String} The feature id to be removed.
     */
    remove: function(featureId) {
        var index = OpenLayers.Util.indexOf(this.order, featureId);
        if (index >= 0) {
            this.order.splice(index, 1);
            delete this.features[featureId];
        }
    },

    /**
     * APIMethod: insert
     * Insert a new feature into the indexer. In order to find the correct
     *     positioning for the node to be inserted, this method uses a binary
     *     search. This makes inserting O(log(n)).
     *
     * Parameters:
     * newFeature - {<OpenLayers.Feature.Vector>} The new feature to be inserted.
     * data - {Object} data associated with object
     */
    insert: function(newFeature, data) {
        // If the node is known to the indexer, remove it so we can
        // recalculate where it should go.
        if (this.exists(newFeature.id)) {
            this.remove(newFeature.id);
        }

        var featureId = newFeature.id;

        var leftIndex = -1;
        var rightIndex = this.order.length;
        var middle;

        while (rightIndex - leftIndex > 1) {
            middle = parseInt((leftIndex + rightIndex) / 2);

            var placement = this.compare(newFeature, this.features[this.order[middle]][0]);

            if (placement > 0) {
                leftIndex = middle;
            } else {
                rightIndex = middle;
            }
        }

        this.order.splice(rightIndex, 0, featureId);
        this.features[featureId] = [newFeature, data];
    },

    /**
     * APIMethod: compare
     */
    compare: function(f1, f2) {
        var z1 = this.getZIndex(f1);
        var result = 0;

        if (f2) {
            var z2 = this.getZIndex(f2);
            result = z1 - z2;
            if (result == 0) {
                result = 1;
            }
        }

        return result;
    },

    /**
     * APIMethod: getZIndex
     * Get the z-index value for the current feature from the feature data itself.
     *
     * Parameters:
     * feature - {<OpenLayers.Feature.Vector>} The feature whose z-index to get.
     *
     * Returns:
     * {Integer} The z-index value for the specified feature (from the feature
     *     data itself).
     */
    getZIndex: function(feature) {
        var zIndex = feature.style && feature.style.graphicZIndex;
        if (zIndex == null) zIndex = this.minZIndex;
        return zIndex;
    },

    /**
     * APIMethod: iterate
     * Iterates over features
     *
     * Parameters:
     * handler - {Function} The function(feature, data) called each iteration in indexer's order.
     * Iteration will be canceled if handler returns false.
     * scope - {Object} scope for handler
     *
     * Returns:
     * {Boolean} true if handler iterates over all features, else false
     */
    iterate: function(handler, scope) {
        for (var i = 0, len = this.order.length; i < len; i++) {
            var data = this.features[this.order[i]];
            if (handler.apply(scope, data) == false) {
                return false;
            }
        }
        return true;
    },

    /**
     * APIMethod: getFeatureById
     * Returns feature by id
     *
     * Parameters:
     * id - {Number} feature id
     *
     * Returns:
     * {<OpenLayers.Feature.Vector>} found feature or null
     */
    getFeatureById: function(id) {
        return this.features[id][0];
    },

    CLASS_NAME: "OpenLayers.FeaturesIndexer"
});

/**
 * Class: OpenLayers.Renderer.Canvas 
 * A renderer based on the 2D 'canvas' drawing element.
 * 
 * Inherits:
 *  - <OpenLayers.Renderer>
 */
OpenLayers.Renderer.Canvas = OpenLayers.Class(OpenLayers.Renderer, {
    
    /**
     * APIProperty: hitDetection
     * {Boolean} Allow for hit detection of features.  Default is true.
     */
    hitDetection: true,
    
    /**
     * Property: hitOverflow
     * {Number} The method for converting feature identifiers to color values
     *     supports 16777215 sequential values.  Two features cannot be 
     *     predictably detected if their identifiers differ by more than this
     *     value.  The hitOverflow allows for bigger numbers (but the 
     *     difference in values is still limited).
     */
    hitOverflow: 0,

    /**
     * Property: canvas
     * {Canvas} The canvas context object.
     */
    canvas: null, 
    
    /**
     * Property: indexer
     * {<OpenLayers.FeaturesIndexer>} An instance of OpenLayers.FeaturesIndexer
     *     created upon initialization
     */
    indexer: null,
    
    /**
     * Property: pendingRedraw
     * {Boolean} The renderer needs a redraw call to render features added while
     *     the renderer was locked.
     */
    pendingRedraw: false,
    
    /**
     * Property: cachedSymbolBounds
     * {Object} Internal cache of calculated symbol extents.
     */
    cachedSymbolBounds: {},
    
    /**
     * Constructor: OpenLayers.Renderer.Canvas
     *
     * Parameters:
     * containerID - {<String>}
     * options - {Object} Optional properties to be set on the renderer.
     */
    initialize: function(containerID, options) {
        OpenLayers.Renderer.prototype.initialize.apply(this, arguments);
        this.root = document.createElement("canvas");
        this.container.appendChild(this.root);
        this.canvas = this.root.getContext("2d");
        this.indexer = new OpenLayers.FeaturesIndexer();
        if (this.hitDetection) {
            this.hitCanvas = document.createElement("canvas");
            this.hitContext = this.hitCanvas.getContext("2d");
        }
    },
    
    /**
     * Method: setExtent
     * Set the visible part of the layer.
     *
     * Parameters:
     * extent - {<OpenLayers.Bounds>}
     * resolutionChanged - {Boolean}
     *
     * Returns:
     * {Boolean} true to notify the layer that the new extent does not exceed
     *     the coordinate range, and the features will not need to be redrawn.
     *     False otherwise.
     */
    setExtent: function() {
        OpenLayers.Renderer.prototype.setExtent.apply(this, arguments);
        // always redraw features
        return false;
    },
    
    /** 
     * Method: eraseGeometry
     * Erase a geometry from the renderer. Because the Canvas renderer has
     *     'memory' of the features that it has drawn, we have to remove the
     *     feature so it doesn't redraw.   
     * 
     * Parameters:
     * geometry - {<OpenLayers.Geometry>}
     * featureId - {String}
     */
    eraseGeometry: function(geometry, featureId) {
        this.eraseFeatures(this.indexer.getFeatureById(featureId));
    },

    /**
     * APIMethod: supported
     * 
     * Returns:
     * {Boolean} Whether or not the browser supports the renderer class
     */
    supported: function() {
        return OpenLayers.CANVAS_SUPPORTED;
    },    
    
    /**
     * Method: setSize
     * Sets the size of the drawing surface.
     *
     * Once the size is updated, redraw the canvas.
     *
     * Parameters:
     * size - {<OpenLayers.Size>} 
     */
    setSize: function(size) {
        this.size = size.clone();
        var root = this.root;
        root.style.width = size.w + "px";
        root.style.height = size.h + "px";
        root.width = size.w;
        root.height = size.h;
        this.resolution = null;
        if (this.hitDetection) {
            var hitCanvas = this.hitCanvas;
            hitCanvas.style.width = size.w + "px";
            hitCanvas.style.height = size.h + "px";
            hitCanvas.width = size.w;
            hitCanvas.height = size.h;
        }
    },
    
    /**
     * Method: drawFeature
     * Draw the feature. Stores the feature in the features list,
     * then redraws the layer. 
     *
     * Parameters:
     * feature - {<OpenLayers.Feature.Vector>} 
     * style - {<Object>} 
     *
     * Returns:
     * {Boolean} The feature has been drawn completely.  If the feature has no
     *     geometry, undefined will be returned.  If the feature is not rendered
     *     for other reasons, false will be returned.
     */
    drawFeature: function(feature, style) {
        var rendered;
        if (feature.geometry) {
            style = this.applyDefaultSymbolizer(style || feature.style);
            // don't render if display none or feature outside extent
            var bounds = feature.geometry.getBounds();

            var worldBounds;
            if (this.map.baseLayer && this.map.baseLayer.wrapDateLine) {
                worldBounds = this.map.getMaxExtent();
            }

            var intersects = bounds && bounds.intersectsBounds(this.extent, {worldBounds: worldBounds});

            rendered = (style.display !== "none") && !!bounds && intersects;
            if (rendered) {
                // keep track of what we have rendered for redraw
                this.indexer.insert(feature, style);
            }
            else {
                // remove from features tracked for redraw
                this.indexer.remove(feature.id);
            }
            this.pendingRedraw = true;
        }
        if (this.pendingRedraw && !this.locked) {
            this.redraw();
            this.pendingRedraw = false;
        }
        return rendered;
    },

    /** 
     * Method: drawGeometry
     * Used when looping (in redraw) over the features; draws
     * the canvas. 
     *
     * Parameters:
     * geometry - {<OpenLayers.Geometry>} 
     * style - {Object} 
     */
    drawGeometry: function(geometry, style, featureId) {
        var className = geometry.CLASS_NAME;
        if ((className == "OpenLayers.Geometry.Collection") ||
            (className == "OpenLayers.Geometry.MultiPoint") ||
            (className == "OpenLayers.Geometry.MultiLineString") ||
            (className == "OpenLayers.Geometry.MultiPolygon")) {
            for (var i = 0; i < geometry.components.length; i++) {
                this.drawGeometry(geometry.components[i], style, featureId);
            }
            return;
        }
        switch (geometry.CLASS_NAME) {
            case "OpenLayers.Geometry.Point":
                this.drawPoint(geometry, style, featureId);
                break;
            case "OpenLayers.Geometry.LineString":
                this.drawLineString(geometry, style, featureId);
                break;
            case "OpenLayers.Geometry.LinearRing":
                this.drawLinearRing(geometry, style, featureId);
                break;
            case "OpenLayers.Geometry.Polygon":
                this.drawPolygon(geometry, style, featureId);
                break;
            default:
                break;
        }
    },

    /**
     * Method: drawExternalGraphic
     * Called to draw External graphics. 
     * 
     * Parameters: 
     * geometry - {<OpenLayers.Geometry>}
     * style    - {Object}
     * featureId - {String}
     */ 
    drawExternalGraphic: function(geometry, style, featureId) {
        var img = new Image();

        if (style.graphicTitle) {
            img.title = style.graphicTitle;           
        }

        var width = style.graphicWidth || style.graphicHeight;
        var height = style.graphicHeight || style.graphicWidth;
        width = width ? width : style.pointRadius * 2;
        height = height ? height : style.pointRadius * 2;
        var xOffset = (style.graphicXOffset != undefined) ?
           style.graphicXOffset : -(0.5 * width);
        var yOffset = (style.graphicYOffset != undefined) ?
           style.graphicYOffset : -(0.5 * height);

        var opacity = style.graphicOpacity || style.fillOpacity;
        
        var onLoad = function() {
            if(!this.indexer.exists(featureId)) {
                return;
            }
            var pt = this.getLocalXY(geometry);
            var p0 = pt[0];
            var p1 = pt[1];
            if(!isNaN(p0) && !isNaN(p1)) {
                var x = (p0 + xOffset) | 0;
                var y = (p1 + yOffset) | 0;
                var canvas = this.canvas;
                canvas.globalAlpha = opacity;
                var factor = OpenLayers.Renderer.Canvas.drawImageScaleFactor ||
                    (OpenLayers.Renderer.Canvas.drawImageScaleFactor =
                        /android 2.1/.test(navigator.userAgent.toLowerCase()) ?
                            // 320 is the screen width of the G1 phone, for
                            // which drawImage works out of the box.
                            320 / window.screen.width : 1
                    );
                canvas.drawImage(
                    img, x*factor, y*factor, width*factor, height*factor
                );
                if (this.hitDetection) {
                    this.setHitContextStyle("fill", featureId);
                    this.hitContext.fillRect(x, y, width, height);
                }
            }
        };

        img.onload = OpenLayers.Function.bind(onLoad, this);
        img.src = style.externalGraphic;
    },

    /**
     * Method: drawNamedSymbol
     * Called to draw Well Known Graphic Symbol Name. 
     * This method is only called by the renderer itself.
     * 
     * Parameters: 
     * geometry - {<OpenLayers.Geometry>}
     * style    - {Object}
     * featureId - {String}
     */ 
    drawNamedSymbol: function(geometry, style, featureId) {
        var x, y, cx, cy, i, symbolBounds, scaling, angle;
        var unscaledStrokeWidth;
        var deg2rad = Math.PI / 180.0;
        
        var symbol = OpenLayers.Renderer.symbol[style.graphicName];
         
        if (!symbol) {
            throw new Error(style.graphicName + ' is not a valid symbol name');
        }
        
        if (!symbol.length || symbol.length < 2) return;
        
        var pt = this.getLocalXY(geometry);
        var p0 = pt[0];
        var p1 = pt[1];
       
        if (isNaN(p0) || isNaN(p1)) return;
        
        // Use rounded line caps
        this.canvas.lineCap = "round";
        this.canvas.lineJoin = "round";
        
        if (this.hitDetection) {
            this.hitContext.lineCap = "round";
            this.hitContext.lineJoin = "round";
        }
        
        // Scale and rotate symbols, using precalculated bounds whenever possible.
        if (style.graphicName in this.cachedSymbolBounds) {
            symbolBounds = this.cachedSymbolBounds[style.graphicName];
        } else {
            symbolBounds = new OpenLayers.Bounds();
            for(i = 0; i < symbol.length; i+=2) {
                symbolBounds.extend(new OpenLayers.LonLat(symbol[i], symbol[i+1]));
            }
            this.cachedSymbolBounds[style.graphicName] = symbolBounds;
        }
        
        // Push symbol scaling, translation and rotation onto the transformation stack in reverse order.
        // Don't forget to apply all canvas transformations to the hitContext canvas as well(!)
        this.canvas.save();
        if (this.hitDetection) { this.hitContext.save(); }
        
        // Step 3: place symbol at the desired location
        this.canvas.translate(p0,p1);
        if (this.hitDetection) { this.hitContext.translate(p0,p1); }
        
        // Step 2a. rotate the symbol if necessary
        angle = deg2rad * style.rotation; // will be NaN when style.rotation is undefined.
        if (!isNaN(angle)) {
            this.canvas.rotate(angle);
            if (this.hitDetection) { this.hitContext.rotate(angle); }
        }
                
        // // Step 2: scale symbol such that pointRadius equals half the maximum symbol dimension.
        scaling = 2.0 * style.pointRadius / Math.max(symbolBounds.getWidth(), symbolBounds.getHeight());
        this.canvas.scale(scaling,scaling);
        if (this.hitDetection) { this.hitContext.scale(scaling,scaling); }
        
        // Step 1: center the symbol at the origin        
        cx = symbolBounds.getCenterLonLat().lon;
        cy = symbolBounds.getCenterLonLat().lat;
        this.canvas.translate(-cx,-cy);
        if (this.hitDetection) { this.hitContext.translate(-cx,-cy); }        

        // Don't forget to scale stroke widths, because they are affected by canvas scale transformations as well(!)
        // Alternative: scale symbol coordinates manually, so stroke width scaling is not needed anymore.
        unscaledStrokeWidth = style.strokeWidth;
        style.strokeWidth = unscaledStrokeWidth / scaling;
            
        if (style.fill !== false) {
            this.setCanvasStyle("fill", style);
            this.canvas.beginPath();
            for (i=0; i<symbol.length; i=i+2) {
                x = symbol[i];
                y = symbol[i+1];
                if (i == 0) this.canvas.moveTo(x,y);
                this.canvas.lineTo(x,y);
            }
            this.canvas.closePath();
            this.canvas.fill();

            if (this.hitDetection) {
                this.setHitContextStyle("fill", featureId, style);
                this.hitContext.beginPath();
                for (i=0; i<symbol.length; i=i+2) {
                    x = symbol[i];
                    y = symbol[i+1];
                    if (i == 0) this.canvas.moveTo(x,y);
                    this.hitContext.lineTo(x,y);
                }
                this.hitContext.closePath();
                this.hitContext.fill();
            }
        }  
        
        if (style.stroke !== false) {
            this.setCanvasStyle("stroke", style);
            this.canvas.beginPath();
            for (i=0; i<symbol.length; i=i+2) {
                x = symbol[i];
                y = symbol[i+1];
                if (i == 0) this.canvas.moveTo(x,y);
                this.canvas.lineTo(x,y);
            }
            this.canvas.closePath();
            this.canvas.stroke();
            
            
            if (this.hitDetection) {
                this.setHitContextStyle("stroke", featureId, style, scaling);
                this.hitContext.beginPath();
                for (i=0; i<symbol.length; i=i+2) {
                    x = symbol[i];
                    y = symbol[i+1];
                    if (i == 0) this.hitContext.moveTo(x,y);
                    this.hitContext.lineTo(x,y);
                }
                this.hitContext.closePath();
                this.hitContext.stroke();
            }
            
        }
        
        style.strokeWidth = unscaledStrokeWidth;
        this.canvas.restore();
        if (this.hitDetection) { this.hitContext.restore(); }
        this.setCanvasStyle("reset");  
    },

    /**
     * Method: setCanvasStyle
     * Prepare the canvas for drawing by setting various global settings.
     *
     * Parameters:
     * type - {String} one of 'stroke', 'fill', or 'reset'
     * style - {Object} Symbolizer hash
     */
    setCanvasStyle: function(type, style) {
        if (type === "fill") {     
            this.canvas.globalAlpha = style['fillOpacity'];
            this.canvas.fillStyle = style['fillColor'];
        } else if (type === "stroke") {  
            this.canvas.globalAlpha = style['strokeOpacity'];
            this.canvas.strokeStyle = style['strokeColor'];
            this.canvas.lineWidth = style['strokeWidth'];
        } else {
            this.canvas.globalAlpha = 0;
            this.canvas.lineWidth = 1;
        }
    },
    
    /**
     * Method: featureIdToHex
     * Convert a feature ID string into an RGB hex string.
     *
     * Parameters:
     * featureId - {String} Feature id
     *
     * Returns:
     * {String} RGB hex string.
     */
    featureIdToHex: function(featureId) {
        var id = Number(featureId.split("_").pop()) + 1; // zero for no feature
        if (id >= 16777216) {
            this.hitOverflow = id - 16777215;
            id = id % 16777216 + 1;
        }
        var hex = "000000" + id.toString(16);
        var len = hex.length;
        hex = "#" + hex.substring(len-6, len);
        return hex;
    },
    
    /**
     * Method: setHitContextStyle
     * Prepare the hit canvas for drawing by setting various global settings.
     *
     * Parameters:
     * type - {String} one of 'stroke', 'fill', or 'reset'
     * featureId - {String} The feature id.
     * symbolizer - {<OpenLayers.Symbolizer>} The symbolizer.
     */
    setHitContextStyle: function(type, featureId, symbolizer, strokeScaling) {
        var hex = this.featureIdToHex(featureId);
        if (type == "fill") {
            this.hitContext.globalAlpha = 1.0;
            this.hitContext.fillStyle = hex;
        } else if (type == "stroke") {  
            this.hitContext.globalAlpha = 1.0;
            this.hitContext.strokeStyle = hex;
            // bump up stroke width to deal with antialiasing. If strokeScaling is defined, we're rendering a symbol 
            // on a transformed canvas, so the antialias width bump has to scale as well.
            if (typeof strokeScaling === "undefined") {
                this.hitContext.lineWidth = symbolizer.strokeWidth + 2;
            } else {
                if (!isNaN(strokeScaling)) { this.hitContext.lineWidth = symbolizer.strokeWidth + 2.0 / strokeScaling; }
            }
        } else {
            this.hitContext.globalAlpha = 0;
            this.hitContext.lineWidth = 1;
        }
    },

    /**
     * Method: drawPoint
     * This method is only called by the renderer itself.
     * 
     * Parameters: 
     * geometry - {<OpenLayers.Geometry>}
     * style    - {Object}
     * featureId - {String}
     */ 
    drawPoint: function(geometry, style, featureId) {
        if(style.graphic !== false) {
            if(style.externalGraphic) {
                this.drawExternalGraphic(geometry, style, featureId);
            } else if (style.graphicName && (style.graphicName != "circle")) {
                this.drawNamedSymbol(geometry, style, featureId);
            } else {
                var pt = this.getLocalXY(geometry);
                var p0 = pt[0];
                var p1 = pt[1];
                if(!isNaN(p0) && !isNaN(p1)) {
                    var twoPi = Math.PI*2;
                    var radius = style.pointRadius;
                    if(style.fill !== false) {
                        this.setCanvasStyle("fill", style);
                        this.canvas.beginPath();
                        this.canvas.arc(p0, p1, radius, 0, twoPi, true);
                        this.canvas.fill();
                        if (this.hitDetection) {
                            this.setHitContextStyle("fill", featureId, style);
                            this.hitContext.beginPath();
                            this.hitContext.arc(p0, p1, radius, 0, twoPi, true);
                            this.hitContext.fill();
                        }
                    }

                    if(style.stroke !== false) {
                        this.setCanvasStyle("stroke", style);
                        this.canvas.beginPath();
                        this.canvas.arc(p0, p1, radius, 0, twoPi, true);
                        this.canvas.stroke();
                        if (this.hitDetection) {
                            this.setHitContextStyle("stroke", featureId, style);
                            this.hitContext.beginPath();
                            this.hitContext.arc(p0, p1, radius, 0, twoPi, true);
                            this.hitContext.stroke();
                        }
                        this.setCanvasStyle("reset");
                    }
                }
            }
        }
    },
    
    /**
     * Method: drawLineString
     * This method is only called by the renderer itself.
     * 
     * Parameters: 
     * geometry - {<OpenLayers.Geometry>}
     * style    - {Object}
     * featureId - {String}
     */ 
    drawLineString: function(geometry, style, featureId) {
        style = OpenLayers.Util.applyDefaults({fill: false}, style);
        this.drawLinearRing(geometry, style, featureId);
    },    
    
    /**
     * Method: drawLinearRing
     * This method is only called by the renderer itself.
     * 
     * Parameters: 
     * geometry - {<OpenLayers.Geometry>}
     * style    - {Object}
     * featureId - {String}
     */ 
    drawLinearRing: function(geometry, style, featureId) {
        if (style.fill !== false) {
            this.setCanvasStyle("fill", style);
            this.renderPath(this.canvas, geometry, style, featureId, "fill");
            if (this.hitDetection) {
                this.setHitContextStyle("fill", featureId, style);
                this.renderPath(this.hitContext, geometry, style, featureId, "fill");
            }
        }
        if (style.stroke !== false) {
            this.setCanvasStyle("stroke", style);
            this.renderPath(this.canvas, geometry, style, featureId, "stroke");
            if (this.hitDetection) {
                this.setHitContextStyle("stroke", featureId, style);
                this.renderPath(this.hitContext, geometry, style, featureId, "stroke");
            }
        }
        this.setCanvasStyle("reset");
    },
    
    /**
     * Method: renderPath
     * Render a path with stroke and optional fill.
     */
    renderPath: function(context, geometry, style, featureId, type) {
        var components = geometry.components;
        var len = components.length;
        context.beginPath();
        var start = this.getLocalXY(components[0]);
        var x = start[0];
        var y = start[1];
        if (!isNaN(x) && !isNaN(y)) {
            context.moveTo(start[0], start[1]);
            for (var i=1; i<len; ++i) {
                var pt = this.getLocalXY(components[i]);
                context.lineTo(pt[0], pt[1]);
            }
            if (type === "fill") {
                context.fill();
            } else {
                context.stroke();
            }
        }
    },
    
    /**
     * Method: drawPolygon
     * This method is only called by the renderer itself.
     * 
     * Parameters: 
     * geometry - {<OpenLayers.Geometry>}
     * style    - {Object}
     * featureId - {String}
     */ 
    drawPolygon: function(geometry, style, featureId) {
        var components = geometry.components;
        var len = components.length;
        this.drawLinearRing(components[0], style, featureId);
        // erase inner rings
        for (var i=1; i<len; ++i) {
            /** 
             * Note that this is overly agressive.  Here we punch holes through 
             * all previously rendered features on the same canvas.  A better 
             * solution for polygons with interior rings would be to draw the 
             * polygon on a sketch canvas first.  We could erase all holes 
             * there and then copy the drawing to the layer canvas. 
             * TODO: http://trac.osgeo.org/openlayers/ticket/3130 
             */
            this.canvas.globalCompositeOperation = "destination-out";
            if (this.hitDetection) {
                this.hitContext.globalCompositeOperation = "destination-out";
            }
            this.drawLinearRing(
                components[i], 
                OpenLayers.Util.applyDefaults({stroke: false, fillOpacity: 1.0}, style),
                featureId
            );
            this.canvas.globalCompositeOperation = "source-over";
            if (this.hitDetection) {
                this.hitContext.globalCompositeOperation = "source-over";
            }
            this.drawLinearRing(
                components[i], 
                OpenLayers.Util.applyDefaults({fill: false}, style),
                featureId
            );
        }
    },
    
    /**
     * Method: drawText
     * This method is only called by the renderer itself.
     *
     * Parameters:
     * location - {<OpenLayers.Point>}
     * style    - {Object}
     */
    drawText: function(location, style) {
        var pt = this.getLocalXY(location);

        this.setCanvasStyle("reset");
        this.canvas.fillStyle = style.fontColor;
        this.canvas.globalAlpha = style.fontOpacity || 1.0;
        var fontStyle = [style.fontStyle ? style.fontStyle : "normal",
                         "normal", // "font-variant" not supported
                         style.fontWeight ? style.fontWeight : "normal",
                         style.fontSize ? style.fontSize : "1em",
                         style.fontFamily ? style.fontFamily : "sans-serif"].join(" ");
        var labelRows = style.label.split('\n');
        var numRows = labelRows.length;
        if (this.canvas.fillText) {
            // HTML5
            this.canvas.font = fontStyle;
            this.canvas.textAlign =
                OpenLayers.Renderer.Canvas.LABEL_ALIGN[style.labelAlign[0]] ||
                "center";
            this.canvas.textBaseline =
                OpenLayers.Renderer.Canvas.LABEL_ALIGN[style.labelAlign[1]] ||
                "middle";
            var vfactor =
                OpenLayers.Renderer.Canvas.LABEL_FACTOR[style.labelAlign[1]];
            if (vfactor == null) {
                vfactor = -.5;
            }
            var lineHeight =
                this.canvas.measureText('Mg').height ||
                this.canvas.measureText('xx').width;
            pt[1] += lineHeight*vfactor*(numRows-1);
            for (var i = 0; i < numRows; i++) {
                if (style.labelOutlineWidth) {
                    this.canvas.save();
                    this.canvas.strokeStyle = style.labelOutlineColor;
                    this.canvas.lineWidth = style.labelOutlineWidth;
                    this.canvas.strokeText(labelRows[i], pt[0], pt[1] + (lineHeight*i) + 1);
                    this.canvas.restore();
                }
                this.canvas.fillText(labelRows[i], pt[0], pt[1] + (lineHeight*i));
            }
        } else if (this.canvas.mozDrawText) {
            // Mozilla pre-Gecko1.9.1 (<FF3.1)
            this.canvas.mozTextStyle = fontStyle;
            // No built-in text alignment, so we measure and adjust the position
            var hfactor =
                OpenLayers.Renderer.Canvas.LABEL_FACTOR[style.labelAlign[0]];
            if (hfactor == null) {
                hfactor = -.5;
            }
            var vfactor =
                OpenLayers.Renderer.Canvas.LABEL_FACTOR[style.labelAlign[1]];
            if (vfactor == null) {
                vfactor = -.5;
            }
            var lineHeight = this.canvas.mozMeasureText('xx');
            pt[1] += lineHeight*(1 + (vfactor*numRows));
            for (var i = 0; i < numRows; i++) {
                var x = pt[0] + (hfactor*this.canvas.mozMeasureText(labelRows[i]));
                var y = pt[1] + (i*lineHeight);
                this.canvas.translate(x, y);
                this.canvas.mozDrawText(labelRows[i]);
                this.canvas.translate(-x, -y);
            }
        }
        this.setCanvasStyle("reset");
    },
    
    /**
     * Method: getLocalXY
     * transform geographic xy into pixel xy
     *
     * Parameters: 
     * point - {<OpenLayers.Geometry.Point>}
     */
    getLocalXY: function(point) {
        var resolution = this.getResolution();
        var extent = this.extent;
        var x = ((point.x - this.featureDx) / resolution + (-extent.left / resolution));
        var y = ((extent.top / resolution) - point.y / resolution);
        return [x, y];
    },

    /**
     * Method: clear
     * Clear all vectors from the renderer.
     */    
    clear: function() {
        var height = this.root.height;
        var width = this.root.width;
        this.canvas.clearRect(0, 0, width, height);
        this.indexer.clear();
        if (this.hitDetection) {
            this.hitContext.clearRect(0, 0, width, height);
        }
    },

    /**
     * Method: getFeatureIdFromEvent
     * Returns a feature id from an event on the renderer.  
     * 
     * Parameters:
     * evt - {<OpenLayers.Event>} 
     *
     * Returns:
     * {<OpenLayers.Feature.Vector} A feature or undefined.  This method returns a 
     *     feature instead of a feature id to avoid an unnecessary lookup on the
     *     layer.
     */
    getFeatureIdFromEvent: function(evt) {
        var featureId, feature;
        
        if (this.hitDetection && this.root.style.display !== "none") {
            // this dragging check should go in the feature handler
            if (!this.map.dragging) {
                var xy = evt.xy;
                var x = xy.x | 0;
                var y = xy.y | 0;
                var data = this.hitContext.getImageData(x, y, 1, 1).data;
                if (data[3] === 255) { // antialiased
                    var id = data[2] + (256 * (data[1] + (256 * data[0])));
                    if (id) {
                        featureId = "OpenLayers_Feature_Vector_" + (id - 1 + this.hitOverflow);
                        try {
                            feature = this.indexer.getFeatureById(featureId);
                        } catch(err) {
                            // Because of antialiasing on the canvas, when the hit location is at a point where the edge of
                            // one symbol intersects the interior of another symbol, a wrong hit color (and therefore id) results.
                            // todo: set Antialiasing = 'off' on the hitContext as soon as browsers allow it.
                        }
                    }
                }
            }
        }
        return feature;
    },
    
    /**
     * Method: eraseFeatures 
     * This is called by the layer to erase features; removes the feature from
     *     the list, then redraws the layer.
     * 
     * Parameters:
     * features - {Array(<OpenLayers.Feature.Vector>)} 
     */
    eraseFeatures: function(features) {
        if(!(OpenLayers.Util.isArray(features))) {
            features = [features];
        }
        for(var i=0; i<features.length; ++i) {
            this.indexer.remove(features[i].id);
        }
        this.redraw();
    },

    /**
     * Method: redraw
     * The real 'meat' of the function: any time things have changed,
     *     redraw() can be called to loop over all the data and (you guessed
     *     it) redraw it.  Unlike Elements-based Renderers, we can't interact
     *     with things once they're drawn, to remove them, for example, so
     *     instead we have to just clear everything and draw from scratch.
     */
    redraw: function() {
        if (!this.locked) {
            var height = this.root.height;
            var width = this.root.width;
            this.canvas.clearRect(0, 0, width, height);
            if (this.hitDetection) {
                this.hitContext.clearRect(0, 0, width, height);
            }
            var labelMap = [];
            var feature, geometry, style;
            var worldBounds = (this.map.baseLayer && this.map.baseLayer.wrapDateLine) && this.map.getMaxExtent();
            this.indexer.iterate(function(feature, style) {
                geometry = feature.geometry;
                this.calculateFeatureDx(geometry.getBounds(), worldBounds);
                this.drawGeometry(geometry, style, feature.id);
                if(style.label) {
                    labelMap.push([feature, style]);
                }
            }, this);
            var item;
            for (var i=0, len=labelMap.length; i<len; ++i) {
                item = labelMap[i];
                this.drawText(item[0].geometry.getCentroid(), item[1]);
            }
        }    
    },

    CLASS_NAME: "OpenLayers.Renderer.Canvas"
});

/**
 * Constant: OpenLayers.Renderer.Canvas.LABEL_ALIGN
 * {Object}
 */
OpenLayers.Renderer.Canvas.LABEL_ALIGN = {
    "l": "left",
    "r": "right",
    "t": "top",
    "b": "bottom"
};

/**
 * Constant: OpenLayers.Renderer.Canvas.LABEL_FACTOR
 * {Object}
 */
OpenLayers.Renderer.Canvas.LABEL_FACTOR = {
    "l": 0,
    "r": -1,
    "t": 0,
    "b": -1
};

/**
 * Constant: OpenLayers.Renderer.Canvas.drawImageScaleFactor
 * {Number} Scale factor to apply to the canvas drawImage arguments. This
 *     is always 1 except for Android 2.1 devices, to work around
 *     http://code.google.com/p/android/issues/detail?id=5141.
 */
OpenLayers.Renderer.Canvas.drawImageScaleFactor = null;
