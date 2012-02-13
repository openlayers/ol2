/* 
 *	
 * 	Purpose: extends OpenLayers API (toolTips)
 * 		Add New Control ToolTips
 *  Author:  Van De Casteele Arnaud
 * 
 *	Date:   November 2008
 *	Version: 0.1	
 *
 */


/**
 * @requires OpenLayers/Control.js
 */

/**
 * Class: OpenLayers.Control.ToolTips
 *
 * Inherits from:
 *  - <OpenLayers.Control>
 */
OpenLayers.Control.ToolTips = OpenLayers.Class(OpenLayers.Control, {

   /**
     * Property: element
     * {DOMElement} The DOM element that contains the toolTips Element
     */
    element: null,

    /** 
     * Property: text color
	  * Can be a text as black or hexadecimal color as #000000
     * {String} 
     */
    textColor: "black",

		/** 
     * Property: bold text
     * {String}
     */
		bold : false,

   /** 
     * Property: Opacity
     * {String}
     */
		opacity : 100,
    
    /** 
     * Property: background color
	  * Can be a text as white or hexadecimal color as #FFFFFF
     * {String}
     */
    bgColor: "white",
    
    /** 
     * Property: Padding of the div
     * {String}
     */
    paddingValue : "2px",
 
    /** 
     * Property: lastXy
     * {<OpenLayers.LonLat>}
     */
    lastXy: null,

		html : null,
    
    /**
     * Constructor: OpenLayers.Control.MousePosition
     * 
     * Parameters:
     * options - {DOMElement} Options for control.
     */
    initialize: function(options) {
		  //Extend with new arguments 
		  	var newArguments = [];
        OpenLayers.Util.extend(this, options);
        OpenLayers.Control.prototype.initialize.apply(this, arguments);
    },

    /**
     * Method: destroy
     */
     destroy: function() {
         if (this.map) {
             this.map.events.unregister('mousemove', this, this.redraw);
         }
         OpenLayers.Control.prototype.destroy.apply(this, arguments);
     },	

    /**
     * Method: draw
		 * Used with the mapadd.Control
     * {DOMElement}
     */    
    draw: function() {
				OpenLayers.Control.prototype.draw.apply(this, arguments);
				// Create the Div in the DOM
				// Div background
				this.divBgTtips = document.createElement("div");
						this.divBgTtips.id = OpenLayers.Util.createUniqueID("divBgTtips");
						this.divBgTtips.className = this.displayClass + 'ToolTipsElement';
						this.divBgTtips.style.backgroundColor = this.bgColor;
						this.divBgTtips.style.display = "none";
						this.divBgTtips.style.position = "absolute";
						this.divBgTtips.style.zIndex = "100000";
						this.divBgTtips.style.padding = "2px 5px 2px 5px";
						this.divBgTtipsTx = document.createElement("span");
						if(this.bold){this.divBgTtipsTx.style.fontWeight="bold";}		
						this.divBgTtips.appendChild(this.divBgTtipsTx);		
						//BG Opacity
						this.divBgTtips.style.filter="alpha(opacity="+this.opacity*100+")";						
						this.divBgTtips.style.opacity=this.opacity;		
						document.getElementById(this.map.div.id).appendChild(this.divBgTtips);
				// Div for the text
				// Hack to have a transparent background and a 100 opacity text				
				this.divTxTtips = document.createElement("div");
						this.divTxTtips.id = OpenLayers.Util.createUniqueID("divTxTtips");
						this.divTxTtips.style.color = this.textColor;						
						this.divTxTtips.style.display = "none";
						this.divTxTtips.style.position = "absolute";
						this.divTxTtips.style.zIndex = "100001";
						this.divTxTtips.style.padding = "2px 5px 2px 5px";
						if(this.bold){this.divTxTtips.style.fontWeight="bold";}				
				document.getElementById(this.map.div.id).appendChild(this.divTxTtips); 
				this.map.events.register('mousemove', this, this.redraw);
    },

		/**
     * Method: show
		 * Show the tooltips on the map
     */ 
		show : function(valueHTML){						
			this.divBgTtipsTx.innerHTML = valueHTML.html;
			this.divBgTtipsTx.style.visibility = "hidden";
			this.divTxTtips.innerHTML = valueHTML.html;
			this.divTxTtips.style.display = "block";
			this.divBgTtips.style.display = "block";
		},

		/**
     * Method: hide
		 * hide the tooltips on the map   
     */ 
		hide : function(){
			this.divBgTtips.style.display = "none";		
			this.divTxTtips.style.display = "none";		
		},
   
    /**
     * Method: redraw the div
		 * with new position params
     */
    redraw: function(evt) {	
			this.divBgTtips.style.left = ((evt.xy.x)+22)+"px";
			this.divBgTtips.style.top = ((evt.xy.y)-12)+"px";	
			this.divTxTtips.style.left = ((evt.xy.x)+22)+"px";
			this.divTxTtips.style.top = ((evt.xy.y)-12)+"px";
    },  

    CLASS_NAME: "OpenLayers.Control.ToolTips"
});
