/* Copyright (c) 2006-2012 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

/**
 * @requires OpenLayers/Control/Cache.js
 */

/**
 * Class: OpenLayers.Control.Cache.WebSQL
 * Uses HTML5 WebSQL Storage to cache tiles locally. 
 *
 * Inherits from:
 *  - <OpenLayers.Control.Cache>
 */
OpenLayers.Control.Cache.WebSQL = OpenLayers.Class(OpenLayers.Control.Cache, {
    
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
     * Constructor: OpenLayers.Control.Cache.WebSQL
     * Opens a WebSQL Storage database.
     *
     * Parameters:
     * options - {Object} An optional object with properties
     *
     * Returns:
     * An instance of OpenLayers.Control.Cache.WebSQL
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
     * Method: length
     * Get the number of tiles in the cache.
     */
    length: function(callback) {
        this.db.transaction(function (tx) {
           tx.executeSql("select count(*) as count from tiles", [], function(tx, results) {
               callback(results.rows.item(0).count);
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

    CLASS_NAME: "OpenLayers.Control.Cache.WebSQL"
});