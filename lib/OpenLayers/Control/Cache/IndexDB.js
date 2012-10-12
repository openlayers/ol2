/* Copyright (c) 2006-2012 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

/**
 * @requires OpenLayers/Control/Cache.js
 */

/**
 * Class: OpenLayers.Control.Cache.IndexDB
 * Uses HTML5 IndexDB to cache tiles locally. 
 *
 * Inherits from:
 *  - <OpenLayers.Control.Cache>
 */
OpenLayers.Control.Cache.IndexDB = OpenLayers.Class(OpenLayers.Control.Cache, {
    
    /**
     * Property: db
     * {Object} The IndexDB instance
     */
    db: null,
    
    /**
     * Property: dbName
     * {String} The name of the IndexDB database.  Defaults to "TileCache".
     */
    dbName: "TileCache",
    
    /**
     * Property: dbVersion
     * {String} The version of the IndexDB database.  Defaults to "1.0".
     */
    dbVersion: "1.0",
    
    /**
     * Constructor: OpenLayers.Control.Cache.IndexDB
     * Opens an IndexDB database.
     *
     * Parameters:
     * options - {Object} An optional object with properties
     *
     * Returns:
     * An instance of OpenLayers.Control.Cache.IndexDB
     */
    initialize: function(options) {
        OpenLayers.Control.Cache.prototype.initialize.apply(this, [options]);
        
        // Handle various prefix differences
        window.indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB; 
        
        if(!this.isAvailable()){
            //if this type of cache is not available then return the base cache control, which
            //will always return false when isAvailable is called.
            return;
        } else {
            // Handle the prefix of Chrome to IDBTransaction/IDBKeyRange.
            if ('webkitIndexedDB' in window) {
                window.IDBTransaction = window.webkitIDBTransaction;
                window.IDBKeyRange = window.webkitIDBKeyRange;
            }
            
            var control = this;
            var request = window.indexedDB.open(this.dbName, this.dbVersion);
            request.onsuccess = function(e) {
                control.db = e.target.result;
                // Work around for Google Chrome
                if (control.db.setVersion) {
                    if (control.dbVersion !== control.db.version) {
                        var setVrequest = control.db.setVersion(control.dbVersion);
                        setVrequest.onfailure = control.onerror;
                        setVrequest.onsuccess = function(e) {
                            control.db.createObjectStore("tiles", {keyPath: "url"});
                        };
                    }
                }
            };
            // For future use. Currently only in latest Firefox versions
            request.onupgradeneeded = function (e) {
                control.db = e.target.result;
                control.db.createObjectStore("tiles", {keyPath: "url"});
            };
            request.onerror = this.onerror;
        }
    },
    
    /**
     * Report errors
     */
    onerror: function(e) {
        OpenLayers.Console.error(e.toString());
    },
    
    /** 
     * Method: isAvailable
     * Whether the Storage is available for use. 
     */
    isAvailable: function() {
        if (window.indexedDB) {
            return true;
        }
        else {
            return false;
        }
    },
    
    /** 
     * Method: isAsync
     * Whether the Cache is asynchronous or not. 
     */
    isAsync: function() {
        return true;
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
       var trans = this.db.transaction(["tiles"], "readonly");
       var store = trans.objectStore("tiles");
       var range = IDBKeyRange.only(key);
       var cursorRequest = store.openCursor(range);
       cursorRequest.onsuccess = function(e) {
           var result = e.target.result;
           if (!!result == false) {
               callback(null);
               return;
           }
           callback(result.value.value);
       };
       var self = this;
       cursorRequest.onerror = function() {
           callback(null); 
           self.onerror;
       };
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
        var trans = this.db.transaction(["tiles"], "readwrite");
        var store = trans.objectStore("tiles");
        var request = store.put({
            "url": key,
            "value": value
        });
        request.onsuccess = function(e) {
            if (callback) {
                callback(key, value);
            }
        }
        request.onerror = this.onerror;
    },
    
    /**
     * Method: length
     * Get the number of tiles in the cache.
     */
    length: function(callback) {
        var trans = this.db.transaction(["tiles"], "readonly");
        var store = trans.objectStore("tiles");
        var range = IDBKeyRange.lowerBound(0);
        var cursorRequest = store.count(range);
        cursorRequest.onsuccess = function(e) {
            callback(e.target.result);
        };
        cursorRequest.onerror = this.onerror;
    },
    
    /** 
     * Method: clear
     * Clear the Cache by removing all values.
     */
    clear: function(callback) {
        var trans = this.db.transaction(["tiles"], "readwrite");
        var store = trans.objectStore("tiles");
        var request = store.clear();
        request.onsuccess = function(e) {
            if (callback) {
                callback();
            }
        }
        request.onerror = this.onerror;
    },

    CLASS_NAME: "OpenLayers.Control.Cache.IndexDB"
});