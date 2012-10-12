/* Copyright (c) 2006-2012 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

/**
 * @requires OpenLayers/Control/Cache.js
 */

/**
 * Class: OpenLayers.Control.Cache.SessionStorage
 * Uses HTML5 session storage to cache tiles locally. 
 *
 * Inherits from:
 *  - <OpenLayers.Control.Cache>
 */
OpenLayers.Control.Cache.SessionStorage = OpenLayers.Class(OpenLayers.Control.Cache, {
    
    /** 
     * Method: isAvailable
     * Whether the Storage is available for use. 
     */
    isAvailable: function() {
        if (window.sessionStorage) {
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
        var value = window.sessionStorage.getItem(key);
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
    setItem: function(key, value, callback) {
        window.sessionStorage.setItem(key, value);
        if (callback) {
            callback(key, value);
        }
    },
    
    /**
     * Method: length
     * Get the number of tiles in the cache.
     */
    length: function(callback) {
        var i, key, count = 0;
        var len = window.sessionStorage.length;
        for (i=0; i<len; i++) {
            key = window.sessionStorage.key(i);
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
    clear: function(callback) {
        var i, key;
        for (i=window.sessionStorage.length-1; i>=0; --i) {
            key = window.sessionStorage.key(i);
            if (key.substr(0, 8) === "olCache_") {
                window.sessionStorage.removeItem(key);
            }
        }
        if (callback) {
            callback();
        }
    },

    CLASS_NAME: "OpenLayers.Control.Cache.SessionStorage"
});