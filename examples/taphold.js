var HoldHandler = OpenLayers.Class(OpenLayers.Handler, {

    holdTime: 500,

    initialize: function(control, callbacks, options) {
        OpenLayers.Handler.prototype.initialize.apply(this, arguments);
    },

    touchstart: function(evt) {
        this._mousedown(evt);
    },

    touchmove: function(evt) {
        this._mousemove(evt);
    },

    touchend: function(evt) {
        this._mouseup(evt);
    },

    mousedown: function(evt) {
        this._mousedown(evt);
    },

    mousemove: function(evt) {
        this._mousemove(evt);
    },

    mouseup: function(evt) {
        this._mouseup(evt);
    },

    _mousedown: function(evt) {
        var self = this;
        this.callback('mousedown', [evt]);
        this._cancelhold();
        var hold = this._starthold();
        setTimeout(function() {
            if (hold.flag) {
                if (!evt.touches) {
                    self.callback('clickhold', [evt]);
                } else {
                    self.callback('clickhold', [evt.touches[0]]);
                }
            }
        }, this.holdTime);
        return true;
    },

    _mousemove: function(evt) {
        this._cancelhold();
    },

    _mouseup: function(evt) {
        this.callback('mouseup', [evt]);
        this._cancelhold();
        return true;
    },

    _starthold: function() {
        return (this.hold = { flag: true });
    },

    _cancelhold: function() {
        if (this.hold) {
            this.hold.flag = false;
        }
    }

});

var CustomControl = OpenLayers.Class(OpenLayers.Control, {
   initialize: function(options) {
        OpenLayers.Control.prototype.initialize.apply(
            this, arguments
        ); 
        this.handler = new HoldHandler(
            this, {
                clickhold: this.clickhold
            }, { holdTime: 1000 }
        );
    }, 

    clickhold: function(evt) {
        document.getElementById('output').value = "taphold at " + evt.clientX + ", " + evt.clientY;
    }

});

function init() {

    var map = new OpenLayers.Map({
            div: "map",
            allOverlays: true
    });
    var osm = new OpenLayers.Layer.OSM();
    map.addLayers([osm]);
    map.zoomToMaxExtent();

    var control = new CustomControl;
    map.addControl(control);
    control.activate();

}

