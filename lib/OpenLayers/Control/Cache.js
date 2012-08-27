/* Copyright (c) 2006-2012 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

/**
 * Class: OpenLayers.Control.Cache
 * An abstract base class for storing tiles locally used by the CacheRead and 
 * CacheWrite Controls.
 */
OpenLayers.Control.Cache = OpenLayers.Class({
    
    /** 
     * Method: isAvailable
     * Whether the Cache is available for use. 
     */
    isAvailable: function() {
    },
    
    /** 
     * Method: getItem
     * Get a value for the given key.  The value is passed to the callback
     * function. 
     * 
     * Parameters:
     * key - {String} The key
     * callback - {Function} A callback function that takes a value parameter 
     */
    getItem: function(key, callback) {
    },
    
    /** 
     * Method: setItem
     * Set a value for the given key.
     * 
     * Parameters:
     * key - {String} The key
     * value - {String} The value
     */
    setItem: function(key, value) {
    },
    
    /** 
     * Method: clear
     * Clear the Cache by removing all values.
     */
    clear: function() {
    },
    
    /**
     * Method: length
     * Get the number of tiles in the cache.
     */
    length: function(callback) {
    },
    
    /**
     * Constructor: OpenLayers.Control.Cache
     * Instances of this class are not useful.  See one of the subclasses.
     *
     * Parameters:
     * options - {Object} An optional object with properties to set on the
     *           Cache
     *
     * Returns:
     * An instance of OpenLayers.Cache
     */
    initialize: function(options) {
        OpenLayers.Util.extend(this, options);
        this.options = options;
    },
    
    CLASS_NAME: "OpenLayers.Control.Cache"
});
