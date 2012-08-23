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

/**
 * Class: OpenLayers.Control.LocalStorageCache
 * Uses HTML5 local storage to cache tiles locally. 
 *
 * Inherits from:
 *  - <OpenLayers.Control.Cache>
 */
OpenLayers.Control.LocalStorageCache = OpenLayers.Class(OpenLayers.Control.Cache, {
    
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

    CLASS_NAME: "OpenLayers.Control.LocalStorageCache"
});

/**
 * Class: OpenLayers.Control.SessionStorageCache
 * Uses HTML5 session storage to cache tiles locally. 
 *
 * Inherits from:
 *  - <OpenLayers.Control.Cache>
 */
OpenLayers.Control.SessionStorageCache = OpenLayers.Class(OpenLayers.Control.Cache, {
    
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
    setItem: function(key, value) {
        window.sessionStorage.setItem(key, value);
    },
    
     /** 
     * Method: clear
     * Clear the Cache by removing all values starting with 'olCache_'
     */
    clear: function() {
        var i, key;
        for (i=window.sessionStorage.length-1; i>=0; --i) {
            key = window.sessionStorage.key(i);
            if (key.substr(0, 8) === "olCache_") {
                window.sessionStorage.removeItem(key);
            }
        }
    },

    CLASS_NAME: "OpenLayers.Control.SessionStorageCache"
});

/**
 * Class: OpenLayers.Control.IndexDBCache
 * Uses HTML5 IndexDB to cache tiles locally. 
 *
 * Inherits from:
 *  - <OpenLayers.Control.Cache>
 */
OpenLayers.Control.IndexDBCache = OpenLayers.Class(OpenLayers.Control.Cache, {
    
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
     * Constructor: OpenLayers.Control.IndexDBCache
     * Opens an IndexDB database.
     *
     * Parameters:
     * options - {Object} An optional object with properties
     *
     * Returns:
     * An instance of OpenLayers.Control.IndexDBCache
     */
    initialize: function(options) {
        OpenLayers.Control.Cache.prototype.initialize.apply(this, [options]);
        
        // Handle various prefix differences
        window.indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB; 
        
        // Handle the prefix of Chrome to IDBTransaction/IDBKeyRange.
        if ('webkitIndexedDB' in window) {
            window.IDBTransaction = window.webkitIDBTransaction;
            window.IDBKeyRange = window.webkitIDBKeyRange;
        }
        
        var control = this;
        var request = window.indexedDB.open(this.dbName);
        request.onsuccess = function(e) {
            control.db = e.target.result;
            if (control.dbVersion != control.db.version) {
                var setVrequest = control.db.setVersion(control.dbVersion);
                setVrequest.onfailure = control.onerror;
                setVrequest.onsuccess = function(e) {
                    var store = control.db.createObjectStore("tiles", {keyPath: "url"});
                };
            }
        };
        request.onerror = this.onerror;
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
     * Method: getItem
     * Get a value for the given key.  The value is passed to the callback
     * function. 
     * 
     * Parameters:
     * key - {String} The key
     * callback - {Function} A callback function that takes a value parameter 
     */
    getItem: function(key, callback) {
       var trans = this.db.transaction(["tiles"], IDBTransaction.READ_WRITE);
       var store = trans.objectStore("tiles");
       var range = IDBKeyRange.only(key);
       var cursorRequest = store.openCursor(range);
       cursorRequest.onsuccess = function(e) {
           var result = e.target.result;
           if (!!result == false) {
               return;
           }
           callback(result.value.value);
       };
       cursorRequest.onerror = this.onerror;
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
        var trans = this.db.transaction(["tiles"], IDBTransaction.READ_WRITE);
        var store = trans.objectStore("tiles");
        var request = store.put({
            "url": key,
            "value": value
        });
        request.onsuccess = function(e) {
            // Do something?
        }
        request.onsuccess = this.onerror;
    },
    
    /** 
     * Method: clear
     * Clear the Cache by removing all values.
     */
    clear: function() {
        var trans = this.db.transaction(["tiles"], IDBTransaction.READ_WRITE);
        var store = trans.objectStore("tiles");
        var request = store.clear();
        request.onsuccess = function(e) {
            // Do something?
        }
        request.onsuccess = this.onerror;
    },

    CLASS_NAME: "OpenLayers.Control.IndexDBCache"
});

/**
 * Class: OpenLayers.Control.WebSQLStorageCache
 * Uses HTML5 WebSQL Storage to cache tiles locally. 
 *
 * Inherits from:
 *  - <OpenLayers.Control.Cache>
 */
OpenLayers.Control.WebSQLStorageCache = OpenLayers.Class(OpenLayers.Control.Cache, {
    
    /**
     * Property: db
     * {Object} The WebSQL Storage database instance
     */
    db: null,
    
    /**
     * Property: dbName
     * {String} The name of the WebSQL Storage database.  Defaults to "TileCache".
     */
    dbName: "TileCache",
    
    /**
     * Property: dbVersion
     * {String} The version of the WebSQL Storage database.  Defaults to "1.0".
     */
    dbVersion: "1.0",
    
    /**
     * Property: dbSize
     * {String} The maximum size of the WebSQL Storage database.  Defaults to "5 * 1024 * 1024".
     */
    dbSize: 5 * 1024 * 1024,
    
    /**
     * Constructor: OpenLayers.Control.WebSQLStorageCache
     * Opens a WebSQL Storage database.
     *
     * Parameters:
     * options - {Object} An optional object with properties
     *
     * Returns:
     * An instance of OpenLayers.Control.WebSQLStorageCache
     */
    initialize: function(options) {
        OpenLayers.Control.Cache.prototype.initialize.apply(this, [options]);
        if (!options || !options.db) {
            this.db = window.openDatabase(this.dbName + this.dbVersion, this.dbVersion, "Local Tile Cache", this.dbSize);
            if (!this.db) {
                OpenLayers.Console.error("Error opening database!");
            }
            else {
                this.db.transaction(function (tx) {
                        tx.executeSql('CREATE TABLE tiles (url text, value text)');
                    },
                    function(err) {
                        OpenLayers.Console.error("Error creating tables! " + err.toString());
                    },
                    function() {
                        OpenLayers.Console.log("Tables created!");
                    }
                );
            }
        } else {
            this.db = options.db;
        }
    },
    
    /** 
     * Method: isAvailable
     * Whether the Cache is available for use. 
     */
    isAvailable: function() {
        if (this.db) {
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
        this.db.transaction(function (tx) {
           tx.executeSql("SELECT value FROM tiles WHERE url = ?",[key], function(tx, results) {
               if (results.rows.length === 1) {
                   callback(results.rows.item(0).value);
               }
           });
        });
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
        this.db.transaction(function (tx) {
           tx.executeSql("INSERT INTO tiles (url, value) VALUES (?,?)",[key, value], function(tx, results) {
               // OpenLayers.Console.log("Inserted: ", key, value);
           });
        });
    },
    
    /** 
     * Method: clear
     * Clear the Cache by removing all values.
     */
    clear: function() {
        this.db.transaction(function (tx) {
           tx.executeSql("DELETE FROM tiles",[], function(tx, results) {
               // OpenLayers.Console.log("Deleted all tiles");
           });
        });
    },

    CLASS_NAME: "OpenLayers.Control.WebSQLStorageCache"
});