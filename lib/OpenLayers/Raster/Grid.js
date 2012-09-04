/**
 * @requires OpenLayers/Raster.js
 * @requires OpenLayers/BaseTypes/Class.js
 */

OpenLayers.Raster.Grid = OpenLayers.Class({

    /**
     * Constant: EVENT_TYPES
     * {Array(String)} Supported application event types.  Register a listener
     *     for a particular event with the following syntax:
     * (code)
     * grid.events.register(type, obj, listener);
     * (end)
     *
     * Listeners will be called with a reference to an event object.  The
     *     properties of this event depends on exactly what happened.
     *
     * Raster grid event types:
     * update - Fired when the grid's underlying data is updated.
     */
    EVENT_TYPES: ["update"],

    /**
     * Constructor: OpenLayers.Raster.Grid
     */
    initialize: function(config) {
        OpenLayers.Util.extend(this, config);
        this.events = new OpenLayers.Events(this, null, this.EVENT_TYPES);
    },
    
    /**
     * Method: getValue
     */
    getValue: function(col, row) {
        throw new Error("getValue must be defined")
    },
    /**
     * APIMethod: numCols
     */
    numCols: function() {
        throw new Error("numCols must be defined")
    },
    /**
     * APIMethod: numRows
     */
    numRows: function() {
        throw new Error("numRows must be defined")
    },
    
    /**
     * APIMethod: forEach
     * Iterate through call values in the grid.  The provided function
     *     will be called with each cell value.
     *
     * Parameters:
     * fn - {Function}
     */
    forEach: function(fn) {
        var cols = this.numCols();
        var rows = this.numRows();
        for (var j=0; j<rows; ++j) {
            for (var i=0; i<cols; ++i) {
                fn(this.getValue(i, j), i, j);
            }
        }
    },
    
    CLASS_NAME: "OpenLayers.Raster.Grid"
    
});

OpenLayers.Raster.Grid.fromArray = function(array) {
    
    var rows = array.length;
    var cols = array[0] && array[0].length || 0;
    
    return new OpenLayers.Raster.Grid({
        numCols: function() {
            return cols;
        },
        numRows: function() {
            return rows;
        },
        getValue: function(col, row) {
            return array[row][col];
        }
    });

};

