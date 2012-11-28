/* Copyright (c) 2006-2012 by OpenLayers Contributors (see authors.txt for
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

/**
 * @requires OpenLayers/Format/GeoRSS.js
 * @requires OpenLayers/Format/XML.js
 * @requires OpenLayers/Feature/Vector.js
 * @requires OpenLayers/Geometry/Point.js
 * @requires OpenLayers/Geometry/LineString.js
 * @requires OpenLayers/Geometry/Polygon.js
 */

/**
 * Class: OpenLayers.Format.Picasa
 * Read Picasa GeoRSS. Create a new instance with the <OpenLayers.Format.Picasa>
 *     constructor.
 *
 * Inherits from:
 *  - <OpenLayers.Format.GeoRSS>
 */

OpenLayers.Format.Picasa = OpenLayers.Class(OpenLayers.Format.GeoRSS, {
    /**
     * Method: createFeatureFromItem
     * Return a feature from a Picasa GeoRSS  Item.
     *
     * Parameters:
     * item - {DOMElement} A Picasa GeoRSS item node.
     *
     * Returns:
     * {<OpenLayers.Feature.Vector>} A feature representing the item.
     */
    createFeatureFromItem: function(item) {
        var feature = OpenLayers.Format.GeoRSS.prototype
            .createFeatureFromItem.apply(this, arguments);
        feature.attributes.thumbnail = this.getElementsByTagNameNS(item, "http://search.yahoo.com/mrss/", "thumbnail")[0].getAttribute("url");
        feature.attributes.content = OpenLayers.Util.getXmlNodeValue(this.getElementsByTagNameNS(item, "*","summary")[0]);
        return feature;
    }
});