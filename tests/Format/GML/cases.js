var xml = new OpenLayers.Format.XML(); 
function readXML(file) {
    return xml.read(document.getElementById(file).firstChild.nodeValue);
}

var cases = {

    "v2/point-coord.xml": new OpenLayers.Geometry.Point(1, 2),

    "v2/point-coordinates.xml": new OpenLayers.Geometry.Point(1, 2),
    "v2/point-coordinates-z.xml": new OpenLayers.Geometry.Point(1, 2, 3),

    "v2/linestring-coord.xml": new OpenLayers.Geometry.LineString([
        new OpenLayers.Geometry.Point(1, 2),
        new OpenLayers.Geometry.Point(3, 4)
    ]),
    
    "v2/linestring-coordinates.xml": new OpenLayers.Geometry.LineString([
        new OpenLayers.Geometry.Point(1, 2),
        new OpenLayers.Geometry.Point(3, 4)
    ]),
    "v2/linestring-coordinates-z.xml": new OpenLayers.Geometry.LineString([
        new OpenLayers.Geometry.Point(1, 2, 3),
        new OpenLayers.Geometry.Point(3, 4, 5)
    ]),
    
    "v2/linearring-coord.xml": new OpenLayers.Geometry.LinearRing([
        new OpenLayers.Geometry.Point(1, 2),
        new OpenLayers.Geometry.Point(3, 4),
        new OpenLayers.Geometry.Point(5, 6),
        new OpenLayers.Geometry.Point(1, 2)
    ]),
    
    "v2/linearring-coordinates.xml": new OpenLayers.Geometry.LinearRing([
        new OpenLayers.Geometry.Point(1, 2),
        new OpenLayers.Geometry.Point(3, 4),
        new OpenLayers.Geometry.Point(5, 6),
        new OpenLayers.Geometry.Point(1, 2)
    ]),
    
    "v2/polygon-coord.xml": new OpenLayers.Geometry.Polygon([
        new OpenLayers.Geometry.LinearRing([
            new OpenLayers.Geometry.Point(1, 2),
            new OpenLayers.Geometry.Point(3, 4),
            new OpenLayers.Geometry.Point(5, 6),
            new OpenLayers.Geometry.Point(1, 2)
        ]),
        new OpenLayers.Geometry.LinearRing([
            new OpenLayers.Geometry.Point(2, 3),
            new OpenLayers.Geometry.Point(4, 5),
            new OpenLayers.Geometry.Point(6, 7),
            new OpenLayers.Geometry.Point(2, 3)
        ]),
        new OpenLayers.Geometry.LinearRing([
            new OpenLayers.Geometry.Point(3, 4),
            new OpenLayers.Geometry.Point(5, 6),
            new OpenLayers.Geometry.Point(7, 8),
            new OpenLayers.Geometry.Point(3, 4)
        ])
    ]),
    
    "v2/polygon-coordinates.xml": new OpenLayers.Geometry.Polygon([
        new OpenLayers.Geometry.LinearRing([
            new OpenLayers.Geometry.Point(1, 2),
            new OpenLayers.Geometry.Point(3, 4),
            new OpenLayers.Geometry.Point(5, 6),
            new OpenLayers.Geometry.Point(1, 2)
        ]),
        new OpenLayers.Geometry.LinearRing([
            new OpenLayers.Geometry.Point(2, 3),
            new OpenLayers.Geometry.Point(4, 5),
            new OpenLayers.Geometry.Point(6, 7),
            new OpenLayers.Geometry.Point(2, 3)
        ]),
        new OpenLayers.Geometry.LinearRing([
            new OpenLayers.Geometry.Point(3, 4),
            new OpenLayers.Geometry.Point(5, 6),
            new OpenLayers.Geometry.Point(7, 8),
            new OpenLayers.Geometry.Point(3, 4)
        ])
    ]),
    "v2/polygon-coordinates-z.xml": new OpenLayers.Geometry.Polygon([
        new OpenLayers.Geometry.LinearRing([
            new OpenLayers.Geometry.Point(1, 2, 3),
            new OpenLayers.Geometry.Point(3, 4, 5),
            new OpenLayers.Geometry.Point(5, 6, 7),
            new OpenLayers.Geometry.Point(1, 2, 3)
        ]),
        new OpenLayers.Geometry.LinearRing([
            new OpenLayers.Geometry.Point(2, 3, 4),
            new OpenLayers.Geometry.Point(4, 5, 6),
            new OpenLayers.Geometry.Point(6, 7, 8),
            new OpenLayers.Geometry.Point(2, 3, 4)
        ]),
        new OpenLayers.Geometry.LinearRing([
            new OpenLayers.Geometry.Point(3, 4, 5),
            new OpenLayers.Geometry.Point(5, 6, 7),
            new OpenLayers.Geometry.Point(7, 8, 9),
            new OpenLayers.Geometry.Point(3, 4, 5)
        ])
    ]),
    
    "v2/multipoint-coord.xml": new OpenLayers.Geometry.MultiPoint([
        new OpenLayers.Geometry.Point(1, 2),
        new OpenLayers.Geometry.Point(2, 3),
        new OpenLayers.Geometry.Point(3, 4)
    ]),
    
    "v2/multipoint-coordinates.xml": new OpenLayers.Geometry.MultiPoint([
        new OpenLayers.Geometry.Point(1, 2),
        new OpenLayers.Geometry.Point(2, 3),
        new OpenLayers.Geometry.Point(3, 4)
    ]),
    "v2/multipoint-coordinates-z.xml": new OpenLayers.Geometry.MultiPoint([
        new OpenLayers.Geometry.Point(1, 2, 3),
        new OpenLayers.Geometry.Point(2, 3, 4),
        new OpenLayers.Geometry.Point(3, 4, 5)
    ]),
    
    "v2/multilinestring-coord.xml": new OpenLayers.Geometry.MultiLineString([
        new OpenLayers.Geometry.LineString([
            new OpenLayers.Geometry.Point(1, 2),
            new OpenLayers.Geometry.Point(2, 3)
        ]),
        new OpenLayers.Geometry.LineString([
            new OpenLayers.Geometry.Point(3, 4),
            new OpenLayers.Geometry.Point(4, 5)
        ])
    ]),
    
    "v2/multilinestring-coordinates.xml": new OpenLayers.Geometry.MultiLineString([
        new OpenLayers.Geometry.LineString([
            new OpenLayers.Geometry.Point(1, 2),
            new OpenLayers.Geometry.Point(2, 3)
        ]),
        new OpenLayers.Geometry.LineString([
            new OpenLayers.Geometry.Point(3, 4),
            new OpenLayers.Geometry.Point(4, 5)
        ])
    ]),
    "v2/multilinestring-coordinates-z.xml": new OpenLayers.Geometry.MultiLineString([
        new OpenLayers.Geometry.LineString([
            new OpenLayers.Geometry.Point(1, 2, 3),
            new OpenLayers.Geometry.Point(2, 3, 4)
        ]),
        new OpenLayers.Geometry.LineString([
            new OpenLayers.Geometry.Point(3, 4, 5),
            new OpenLayers.Geometry.Point(4, 5, 6)
        ])
    ]),
    
    "v2/multipolygon-coord.xml": new OpenLayers.Geometry.MultiPolygon([
        new OpenLayers.Geometry.Polygon([
            new OpenLayers.Geometry.LinearRing([
                new OpenLayers.Geometry.Point(1, 2),
                new OpenLayers.Geometry.Point(3, 4),
                new OpenLayers.Geometry.Point(5, 6),
                new OpenLayers.Geometry.Point(1, 2)
            ]),
            new OpenLayers.Geometry.LinearRing([
                new OpenLayers.Geometry.Point(2, 3),
                new OpenLayers.Geometry.Point(4, 5),
                new OpenLayers.Geometry.Point(6, 7),
                new OpenLayers.Geometry.Point(2, 3)
            ]),
            new OpenLayers.Geometry.LinearRing([
                new OpenLayers.Geometry.Point(3, 4),
                new OpenLayers.Geometry.Point(5, 6),
                new OpenLayers.Geometry.Point(7, 8),
                new OpenLayers.Geometry.Point(3, 4)
            ])
        ]),
        new OpenLayers.Geometry.Polygon([
            new OpenLayers.Geometry.LinearRing([
                new OpenLayers.Geometry.Point(1, 2),
                new OpenLayers.Geometry.Point(3, 4),
                new OpenLayers.Geometry.Point(5, 6),
                new OpenLayers.Geometry.Point(1, 2)
            ])
        ])
    ]),
    
    "v2/multipolygon-coordinates.xml": new OpenLayers.Geometry.MultiPolygon([
        new OpenLayers.Geometry.Polygon([
            new OpenLayers.Geometry.LinearRing([
                new OpenLayers.Geometry.Point(1, 2),
                new OpenLayers.Geometry.Point(3, 4),
                new OpenLayers.Geometry.Point(5, 6),
                new OpenLayers.Geometry.Point(1, 2)
            ]),
            new OpenLayers.Geometry.LinearRing([
                new OpenLayers.Geometry.Point(2, 3),
                new OpenLayers.Geometry.Point(4, 5),
                new OpenLayers.Geometry.Point(6, 7),
                new OpenLayers.Geometry.Point(2, 3)
            ]),
            new OpenLayers.Geometry.LinearRing([
                new OpenLayers.Geometry.Point(3, 4),
                new OpenLayers.Geometry.Point(5, 6),
                new OpenLayers.Geometry.Point(7, 8),
                new OpenLayers.Geometry.Point(3, 4)
            ])
        ]),
        new OpenLayers.Geometry.Polygon([
            new OpenLayers.Geometry.LinearRing([
                new OpenLayers.Geometry.Point(1, 2),
                new OpenLayers.Geometry.Point(3, 4),
                new OpenLayers.Geometry.Point(5, 6),
                new OpenLayers.Geometry.Point(1, 2)
            ])
        ])
    ]),
    "v2/multipolygon-coordinates-z.xml": new OpenLayers.Geometry.MultiPolygon([
        new OpenLayers.Geometry.Polygon([
            new OpenLayers.Geometry.LinearRing([
                new OpenLayers.Geometry.Point(1, 2, 3),
                new OpenLayers.Geometry.Point(3, 4, 5),
                new OpenLayers.Geometry.Point(5, 6, 7),
                new OpenLayers.Geometry.Point(1, 2, 3)
            ]),
            new OpenLayers.Geometry.LinearRing([
                new OpenLayers.Geometry.Point(2, 3, 4),
                new OpenLayers.Geometry.Point(4, 5, 6),
                new OpenLayers.Geometry.Point(6, 7, 8),
                new OpenLayers.Geometry.Point(2, 3, 4)
            ]),
            new OpenLayers.Geometry.LinearRing([
                new OpenLayers.Geometry.Point(3, 4, 5),
                new OpenLayers.Geometry.Point(5, 6, 7),
                new OpenLayers.Geometry.Point(7, 8, 9),
                new OpenLayers.Geometry.Point(3, 4, 5)
            ])
        ]),
        new OpenLayers.Geometry.Polygon([
            new OpenLayers.Geometry.LinearRing([
                new OpenLayers.Geometry.Point(1, 2, 3),
                new OpenLayers.Geometry.Point(3, 4, 5),
                new OpenLayers.Geometry.Point(5, 6, 7),
                new OpenLayers.Geometry.Point(1, 2, 3)
            ])
        ])
    ]),
    
    "v2/geometrycollection-coordinates.xml": new OpenLayers.Geometry.Collection([
        new OpenLayers.Geometry.Point(1, 2),
        new OpenLayers.Geometry.LineString([
            new OpenLayers.Geometry.Point(1, 2),
            new OpenLayers.Geometry.Point(3, 4)
        ]),
        new OpenLayers.Geometry.Polygon([
            new OpenLayers.Geometry.LinearRing([
                new OpenLayers.Geometry.Point(1, 2),
                new OpenLayers.Geometry.Point(3, 4),
                new OpenLayers.Geometry.Point(5, 6),
                new OpenLayers.Geometry.Point(1, 2)
            ]),
            new OpenLayers.Geometry.LinearRing([
                new OpenLayers.Geometry.Point(2, 3),
                new OpenLayers.Geometry.Point(4, 5),
                new OpenLayers.Geometry.Point(6, 7),
                new OpenLayers.Geometry.Point(2, 3)
            ]),
            new OpenLayers.Geometry.LinearRing([
                new OpenLayers.Geometry.Point(3, 4),
                new OpenLayers.Geometry.Point(5, 6),
                new OpenLayers.Geometry.Point(7, 8),
                new OpenLayers.Geometry.Point(3, 4)
            ])
        ])
    ]),
    
    "v2/box-coord.xml": new OpenLayers.Bounds(1, 2, 3, 4),
    
    "v2/box-coordinates.xml": new OpenLayers.Bounds(1, 2, 3, 4),
    
    "v3/linestring3d.xml": new OpenLayers.Geometry.LineString([
        new OpenLayers.Geometry.Point(1, 2, 3),
        new OpenLayers.Geometry.Point(4, 5, 6)
    ])
    
};

// some cases for v3 use the same geometries
OpenLayers.Util.extend(cases, {
    "v3/point.xml": cases["v2/point-coordinates.xml"],
    "v3/point-z.xml": cases["v2/point-coordinates-z.xml"],
    "v3/linestring.xml": cases["v2/linestring-coordinates.xml"],
    "v3/linestring-z.xml": cases["v2/linestring-coordinates-z.xml"],
    "v3/curve.xml": cases["v2/linestring-coordinates.xml"],
    "v3/curve-z.xml": cases["v2/linestring-coordinates-z.xml"],
    "v3/polygon.xml": cases["v2/polygon-coordinates.xml"],
    "v3/polygon-z.xml": cases["v2/polygon-coordinates-z.xml"],
    "v3/surface.xml": cases["v2/polygon-coordinates.xml"],
    "v3/surface-z.xml": cases["v2/polygon-coordinates-z.xml"],
    "v3/multipoint-singular.xml": cases["v2/multipoint-coordinates.xml"],
    "v3/multipoint-singular-z.xml": cases["v2/multipoint-coordinates-z.xml"],
    "v3/multipoint-plural.xml": cases["v2/multipoint-coordinates.xml"],
    "v3/multipoint-plural-z.xml": cases["v2/multipoint-coordinates-z.xml"],
    "v3/multilinestring-singular.xml": cases["v2/multilinestring-coordinates.xml"],
    "v3/multilinestring-singular-z.xml": cases["v2/multilinestring-coordinates-z.xml"],
    "v3/multilinestring-plural.xml": cases["v2/multilinestring-coordinates.xml"],
    "v3/multilinestring-plural-z.xml": cases["v2/multilinestring-coordinates-z.xml"],
    "v3/multicurve-singular.xml": cases["v2/multilinestring-coordinates.xml"],
    "v3/multicurve-singular-z.xml": cases["v2/multilinestring-coordinates-z.xml"],
    "v3/multicurve-curve.xml": cases["v2/multilinestring-coordinates.xml"],
    "v3/multicurve-curve-z.xml": cases["v2/multilinestring-coordinates-z.xml"],
    "v3/multipolygon-singular.xml": cases["v2/multipolygon-coordinates.xml"],
    "v3/multipolygon-singular-z.xml": cases["v2/multipolygon-coordinates-z.xml"],
    "v3/multipolygon-plural.xml": cases["v2/multipolygon-coordinates.xml"],
    "v3/multipolygon-plural-z.xml": cases["v2/multipolygon-coordinates-z.xml"],
    "v3/multisurface-singular.xml": cases["v2/multipolygon-coordinates.xml"],
    "v3/multisurface-singular-z.xml": cases["v2/multipolygon-coordinates-z.xml"],
    "v3/multisurface-plural.xml": cases["v2/multipolygon-coordinates.xml"],
    "v3/multisurface-plural-z.xml": cases["v2/multipolygon-coordinates-z.xml"],
    "v3/multisurface-surface.xml": cases["v2/multipolygon-coordinates.xml"],
    "v3/multisurface-surface-z.xml": cases["v2/multipolygon-coordinates-z.xml"],
    "v3/envelope.xml": cases["v2/box-coordinates.xml"]
});