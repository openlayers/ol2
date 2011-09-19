/**
 * @requires OpenLayers/Raster/Composite.js
 */

OpenLayers.Raster.Operation = (function() {
    var Grid = OpenLayers.Raster.Grid;
    var Composite = OpenLayers.Raster.Composite;
    var operations = {};

    return {

        create: function(fn) {
            var op = function() {
                var args = Array.prototype.slice.call(arguments);
                var len = args.length;

                function getFirstGrid() {
                    var grid;
                    for (var i=0; i<len; ++i) {
                        if (args[i] instanceof Grid) {
                            grid = args[i];
                            break;
                        }
                    }
                    if (!grid) {
                        throw new Error("Operation must be called with at least one grid.");
                    }
                    return grid;
                }

                var count = 1;
                for (var i=0; i<len; ++i) {
                    if (args[i] instanceof Composite) {
                        count = Math.max(count, args[i].getCount());
                    }
                }
                
                var Constructor = (count > 1) ? Composite : Grid;
                var grid = new Constructor({
                    numCols: function() {
                        return getFirstGrid().numCols();
                    },
                    numRows: function() {
                        return getFirstGrid().numRows();
                    },
                    getValue: function(col, row) {
                        var values = new Array(len);
                        var arg;
                        for (var i=0; i<len; ++i) {
                            arg = args[i];
                            if (arg instanceof Grid) {
                                values[i] = arg.getValue(col, row);
                            } else {
                                values[i] = arg;
                            }
                        }
                        return fn.apply(null, values);
                    },
                    getCount: function() {
                        return count;
                    }
                });
                
                for (var i=0; i<len; ++i) {
                    if (args[i] instanceof Grid) {
                        args[i].events.register("update", null, function() {
                            grid.events.triggerEvent("update");
                        });
                    }
                }
                
                return grid;
        
            };
            return op;
        },
        
        get: function(name) {
            return operations[name];
        }

    };
    
})();
