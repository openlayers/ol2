/**
 * @requires OpenLayers/Raster/Composite.js
 */

OpenLayers.Raster.Operation = (function() {
    var Grid = OpenLayers.Raster.Grid;
    var Composite = OpenLayers.Raster.Composite;

    return {

        create: function(fn) {
            var op = function() {
                var args = Array.prototype.slice.call(arguments);
                var len = args.length;
                
                if (len == 1) {
                    var operand = args[0];
                    if (operand instanceof Grid) {
                        var result = new Grid({
                            numCols: function() {
                                return operand.numCols();
                            },
                            numRows: function() {
                                return operand.numRows();
                            },
                            getValue: function(col, row) {
                                return fn(operand.getValue(col, row));
                            },
                            getCount: function() {
                                return 1;
                            }
                        });
                        operand.events.register("update", null, function() {
                            result.events.triggerEvent("update");
                        });
                        return result;
                    } else {
                        throw new Error("Operation must be called with at least one grid.");
                    }
                } else {
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

                    // TODO: provide a better way to supply grid count
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
                }
        
            };
            return op;
        }

    };
    
})();
