/* Copyright (c) 2006-2012 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

/**
 * @requires OpenLayers/Control/Cache.js
 */


/**
 * Class: OpenLayers.Control.Cache.LocalStorage
 * Uses HTML5 local storage to cache tiles locally. 
 *
 * Inherits from:
 *  - <OpenLayers.Control.Cache>
 */
OpenLayers.Control.Cache.LocalStorage = OpenLayers.Class(OpenLayers.Control.Cache, {
    
    /** 
     * Method: isAvailable
     * Whether the Cache is available for use. 
     */
    isAvailable: function() {
        if (window.localStorage) {
            return true;
        }
        else {
            return false;
        }
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
        var value = window.localStorage.getItem(key);
        callback(value);
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
        window.localStorage.setItem(key, value);
    },
    
    /**
     * Method: length
     * Get the number of tiles in the cache.
     */
    length: function(callback) {
        var i, key, count = 0;
        var len = window.localStorage.length;
        for (i=0; i<len; i++) {
            key = window.localStorage.key(i);
            if (key.substr(0, 8) === "olCache_") {
                count++;
            }
        }
        callback(count);
    },
    
    /** 
     * Method: clear
     * Clear the Cache by removing all values starting with 'olCache_'
     */
    clear: function() {
        var i, key;
        for (i=window.localStorage.length-1; i>=0; --i) {
            key = window.localStorage.key(i);
            if (key.substr(0, 8) === "olCache_") {
                window.localStorage.removeItem(key);
            }
        }
    },

    CLASS_NAME: "OpenLayers.Control.Cache.LocalStorage"
});