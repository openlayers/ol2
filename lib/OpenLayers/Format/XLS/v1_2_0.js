/* Copyright (c) 2006-2011 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the Clear BSD license.  
 * See http://svn.openlayers.org/trunk/openlayers/license.txt for the
 * full text of the license. */

/**
 * @requires OpenLayers/Format/XLS/v1_1_0.js
 */

/**
 * Class: OpenLayers.Format.XLS.v1_2_0
 * Read / write XLS version 1.2.0.
 * 
 * Inherits from:
 *  - <OpenLayers.Format.XLS.v1_1_0>
 */
OpenLayers.Format.XLS.v1_2_0 = OpenLayers.Class(
    OpenLayers.Format.XLS.v1_1_0, {
    
    /**
     * Constant: VERSION
     * {String} 1.2
     */
    VERSION: "1.2",
    
    /**
     * Property: schemaLocation
     * {String} http://www.opengis.net/xls
     *   http://schemas.opengis.net/ols/1.1.0/LocationUtilityService.xsd
     *   http://schemas.opengis.net/ols/1.2.0/RouteService.xsd
     *   http://schemas.opengis.net/ols/1.2.0/ADT.xsd
     */
    schemaLocation: "http://www.opengis.net/xls http://schemas.opengis.net/ols/1.2.0/ADT.xsd http://schemas.opengis.net/ols/1.2.0/LocationUtilityService.xsd http://schemas.opengis.net/ols/1.2.0/RouteService.xsd",

    /**
     * Constructor: OpenLayers.Format.XLS.v1_1_0
     * Instances of this class are not created directly.  Use the
     *     <OpenLayers.Format.XLS> constructor instead.
     *
     * Parameters:
     * options - {Object} An optional object whose properties will be set on
     *     this instance.
     */
    initialize: function(options) {
        OpenLayers.Format.XLS.v1_1_0.prototype.initialize.apply(
            this, [options]
        );
    },/**
     * Property: readers
     * Contains public functions, grouped by namespace prefix, that will
     *     be applied when a namespaced node is found matching the function
     *     name.  The function will be applied in the scope of this parser
     *     with two arguments: the node being read and a context object passed
     *     from the parent.
     */
    readers: {
        "xls": {
	  //Common
            "XLS": function(node, xls) {
                xls.version = node.getAttribute("version");
                this.readChildNodes(node, xls);
            },
            "Response": function(node, xls) {
               this.readChildNodes(node, xls);
            },
	    
	    //Route Service
	    "DetermineRouteResponse": function(node, xls){
               xls.responseLists = [];
               this.readChildNodes(node, xls); //TODO childs
	    },
	    
	    //Geocode Service
            "GeocodeResponse": function(node, xls) {
               xls.responseLists = [];
               this.readChildNodes(node, xls);
            },
            "GeocodeResponseList": function(node, xls) {
                var responseList = {
                    features: [], 
                    numberOfGeocodedAddresses: 
                        parseInt(node.getAttribute("numberOfGeocodedAddresses"))
                };
                xls.responseLists.push(responseList);
                this.readChildNodes(node, responseList);
            },
            "GeocodedAddress": function(node, responseList) {
                var feature = new OpenLayers.Feature.Vector();
                responseList.features.push(feature);
                this.readChildNodes(node, feature);
                // post-process geometry
                feature.geometry = feature.components[0];
            },
            "GeocodeMatchCode": function(node, feature) {
                feature.attributes.matchCode = {
                    accuracy: parseFloat(node.getAttribute("accuracy")),
                    matchType: node.getAttribute("matchType")
                };
            },
            "Address": function(node, feature) {
                var address = {
                    countryCode: node.getAttribute("countryCode"),
                    addressee: node.getAttribute("addressee"),
                    street: [],
                    place: []
                };
                feature.attributes.address = address;
                this.readChildNodes(node, address);
            },
            "freeFormAddress": function(node, address) {
                address.freeFormAddress = this.getChildValue(node);
            },
            "StreetAddress": function(node, address) {
                this.readChildNodes(node, address);
            },
            "Building": function(node, address) {
                address.building = {
                    'number': node.getAttribute("number"),
                    subdivision: node.getAttribute("subdivision"),
                    buildingName: node.getAttribute("buildingName")
                };
            },
            "Street": function(node, address) {
                // only support the built-in primitive type for now
                address.street.push(this.getChildValue(node));
            },
            "Place": function(node, address) {
                // type is one of CountrySubdivision, 
                // CountrySecondarySubdivision, Municipality or
                // MunicipalitySubdivision
                address.place[node.getAttribute("type")] = 
                    this.getChildValue(node);
            },
            "PostalCode": function(node, address) {
                address.postalCode = this.getChildValue(node);
            }
        },
        "gml": OpenLayers.Format.GML.v3.prototype.readers.gml
    }, /**
     * Property: writers
     * As a compliment to the readers property, this structure contains public
     *     writing functions grouped by namespace alias and named like the
     *     node names they produce.
     */
    writers: {
        "xls": {
	  //Common
            "XLS": function(request) {
                var root = this.createElementNSPlus(
                    "xls:XLS",
                    {attributes: {
                        "version": this.VERSION,
                        "xsi:schemaLocation": this.schemaLocation
                    }}
                );
                this.writeNode("RequestHeader", request.header, root);
                this.writeNode("Request", request, root);
                return root;
            },
            "RequestHeader": function(header) {
                return this.createElementNSPlus("xls:RequestHeader");
            },
            "Request": function(request) {
	      var node = this.createElementNSPlus("xls:Request", {
                    attributes: {
                        methodName: request.methodName,
                        requestID: request.requestID || "",
                        version: this.VERSION
                    }
                });
	      if(request.methodName == "GeocodeRequest"){
                this.writeNode("GeocodeRequest", request.addresses, node);
	      } else if(request.methodName == "DetermineRouteRequest"){
                this.writeNode("DetermineRouteRequest", request.routeParameters, node);
	      } 
		return node;
            },
	    
	    //Geocode Service
            "GeocodeRequest": function(addresses) {
                var node = this.createElementNSPlus("xls:GeocodeRequest");
                for (var i=0, len=addresses.length; i<len; i++) {
                    this.writeNode("Address", addresses[i], node);
                }
                return node;
            },
            "Address": function(address) {
                var node = this.createElementNSPlus("xls:Address", {
                    attributes: {
                        countryCode: address.countryCode
                    }
                });
                if (address.freeFormAddress) {
                    this.writeNode("freeFormAddess", address.freeFormAddress, node);
                } else {
                    if (address.street) {
                        this.writeNode("StreetAddress", address, node);
                    }
                    if (address.municipality) {
                        this.writeNode("Municipality", address.municipality, node);
                    }
                    if (address.countrySubdivision) {
                        this.writeNode("CountrySubdivision", address.countrySubdivision, node);
                    }
                    if (address.postalCode) {
                        this.writeNode("PostalCode", address.postalCode, node);
                    }
                }
                return node;
            },
            "freeFormAddress": function(freeFormAddress) {
                return this.createElementNSPlus("freeFormAddress", 
                    {value: freeFormAddress});
            },
            "StreetAddress": function(address) {
                var node = this.createElementNSPlus("xls:StreetAddress");
                if (address.building) {
                    this.writeNode(node, "Building", address.building);
                }
                var street = address.street;
                if (!(OpenLayers.Util.isArray(street))) {
                    street = [street];
                }
                for (var i=0, len=street.length; i < len; i++) {
                    this.writeNode("Street", street[i], node);
                }
                return node;
            },
            "Building": function(building) {
                return this.createElementNSPlus("xls:Building", {
                    attributes: {
                        "number": building["number"],
                        "subdivision": building.subdivision,
                        "buildingName": building.buildingName
                    }
                });
            },
            "Street": function(street) {
                return this.createElementNSPlus("xls:Street", {value: street});
            },
            "Municipality": function(municipality) {
                return this.createElementNSPlus("xls:Place", {
                    attributes: {
                        type: "Municipality"
                    },
                    value: municipality
                });
            },
            "CountrySubdivision": function(countrySubdivision) {
                return this.createElementNSPlus("xls:Place", {
                    attributes: {
                        type: "CountrySubdivision"
                    },
                    value: countrySubdivision
                });
            },
            "PostalCode": function(postalCode) {
                return this.createElementNSPlus("xls:PostalCode", {
                    value: postalCode
                });
            },
	    //Route Service
            "DetermineRouteRequest": function(routeParameters) {
	      
	      routeParameters.provideRouteHandle = routeParameters.provideRouteHandle || routeParameters.routeHandle;
	      var attributes = {
		    distanceUnit: routeParameters.distanceUnit || "m",
		    provideRouteHandle: routeParameters.provideRouteHandle
		  };
		  
		if(routeParameters.provideRouteHandle)
		    attributes.routeHandle = routeParameters.routeHandle;
		
                var node = this.createElementNSPlus("xls:DetermineRouteRequest", { attributes: attributes });
                
		if(!routeParameters.provideRouteHandle)
		  this.writeNode("RoutePlan", routeParameters.routePlan, node);
		
		this.writeNode("RouteInstructionsRequest", routeParameters.routeInstructionsRequest, node);
		this.writeNode("RouteGeometryRequest", routeParameters.routeGeometryRequest, node);
		this.writeNode("RouteMapRequest", routeParameters.routeMapRequest, node); 
                
		return node;
            },  
	    "RoutePlan": function(plan) {
	      var attributes = {
		    useRealTimeTraffic: routeParameters.useRealTimeTraffic || false
		  };
		  
		  if(plan.expectedStartTime)
		    attributes.expectedStartTime = plan.expectedStartTime;
		  if(plan.expectedEndTime)
		    attributes.expectedEndTime = plan.expectedEndTime;
		  
                var node = this.createElementNSPlus("xls:RoutePlan", { attributes: attributes});
		if(plan.routePreference)
		  this.writeNode("RoutePreference", plan.routePreference, node);
		
		this.writeNode("WayPointList", plan.wayPointList, node);
		if(plan.avoidList)
		  this.writeNode("AvoidList", plan.avoidList, node);
		
                return node;
            },  
	    "RouteInstructionsRequest": function(instructions) {
	      var attributes =  {
		    provideGeometry: instructions.provideGeometry || false,
		    provideBoundingBox: instructions.provideBoundingBox || false
		  };
		  
		  if(instructions.format)
		    attributes.format = instructions.format;
		  
                return this.createElementNSPlus("xls:RouteInstructionsRequest", {attributes: attributes});
            },  
	    "RouteGeometryRequest": function(geometryRequest) {
	      var attributes =  {
		    scale: geometryRequest.scale || 1,
		    provideStartingPortion: geometryRequest.provideStartingPortion || false,
		    maxPoints: geometryRequest.maxPoints || 100
		  };
		  
                var node = this.createElementNSPlus("xls:RouteGeometryRequest", {attributes: attributes});
		
		this.writeNode("BoundingBox", geometryRequest.boundingBox, node);
		
		return node;
            },  
	    "RouteMapRequest": function(mapRequest) {
	      
                var node = this.createElementNSPlus("xls:RouteMapRequest");
		
                for (var i=0, len=mapRequest.length; i<len; i++) {
                    this.writeNode("RouteMapOutputType", mapRequest[i], node);
                }
		
		return node;
            },  
	    "RoutePreference": function(preference) {
                var node = this.createElementNSPlus("xls:RoutePreference");
		node.appendChild(this.createTextNode(preference));
		return node;
            },  
	    "WayPointList": function(wayPointList) {
                var node = this.createElementNSPlus("xls:WayPointList");
		this.writeNode("StartPoint", wayPointList[0], node); 
		
                for (var i=1; i<wayPointList.length - 1; i++) {
                    this.writeNode("ViaPoint", mapRequest[i], node);
                }
                
		this.writeNode("EndPoint", wayPointList[wayPointList.length], node);
		return node;
            },  
	    "AvoidList": function(avoidList) {
                var node = this.createElementNSPlus("xls:AvoidList");
		
                for (var i=0, len=avoidList.aoi.length; i<len; i++) {
		  this.writeNode("AOI", avoidList.aoi[i], node);
		}
                for (var i=0, len=avoidList._location.length; i<len; i++) {
		  this.writeNode("_Location", avoidList._location[i], node);
		}
                for (var i=0, len=avoidList.avoidFeature.length; i<len; i++) {
		  this.writeNode("AvoidFeature", avoidList.avoidFeature[i], node);
		}
		return node;
            },  
	    "RouteMapOutputType": function(outputType) {
	      var attributes =  {
		    width: outputType.width,
		    height: outputType.height,
		    format: outputType.format,
		  };
		  
		if(outputType.BGcolor)
		  attributes.BGcolor = outputType.BGcolor;
		if(outputType.transparent)
		  attributes.transparent = outputType.transparent;
		
                var node = this.createElementNSPlus("xls:RouteMapOutputType", {attributes: attributes});
		
                for (var i=0, len=outputType.boundingBox.length; i<len; i++) {
		  this.writeNode("BoundingBox", outputType.boundingBox[i], node);
		}
                if(outputType.style) {
		  this.writeNode("RouteMapStyle", avoidList.routeMapStyle, node);
		}
		return node;
            },
	    "StartPoint": function(point){
	      return this.writers["xls"]["WayPoint"].apply(this, [point]);
	    },
	    "EndPoint": function(point){
	      return this.writers["xls"]["WayPoint"].apply(this, [point]);
	    },
	    "ViaPoint": function(point){
	      return this.writers["xls"]["WayPoint"].apply(this, [point]);
	    },
	    "AOI": function(aoi){
	      return this.writers["xls"]["AreaOfInterest"].apply(this, [aoi]);
	    },  
	    "AvoidFeature": function(featureType) {
                var node = this.createElementNSPlus("xls:AvoidFeature");
		node.appendChild(this.createTextNode(featureType));
		return node;
            },  
	    "RouteMapStyle": function(mapStyle) {
                var node = this.createElementNSPlus("xls:RouteMapStyle");
		node.appendChild(this.createTextNode(mapStyle));
		return node;
            },  
	    "AreaOfInterest": function(areaOfInterest) {
                var node = this.createElementNSPlus("xls:AreaOfInterest");
		if(areaOfInterest.circleByCenterPoint)
		  this.writeNode("CircleByCenterPoint", areaOfInterest.circleByCenterPoint, node);
		else if(areaOfInterest.polygon)
		  this.writeNode("Polygon", areaOfInterest.polygon, node);
		else if(areaOfInterest.envelope)
		  this.writeNode("Envelope", areaOfInterest.envelope, node);
		return node;
            },  
	    "WayPoint": function(wayPoint) {
	      var attributes =  {
		    stop: wayPoint.stop || true
		  };
                var node = this.createElementNSPlus("xls:WayPoint", {attributes: attributes});
		this.writeNode("_Location", wayPoint._location, node);
                for (var i=0, len=wayPoint.geocodeMatchCode.length; i<len; i++) {
		  this.writeNode("GeocodeMatchCode", wayPoint.geocodeMatchCode[i], node);
		}
		return node;
            },  
	    "_Location": function(wayPoint) { //TODO
	      var attributes =  {
		    stop: wayPoint.stop || true
		  };
                var node = this.createElementNSPlus("xls:AbstractLocationType", {attributes: attributes});
		return node;
            },  
	    "GeocodeMatchCode": function(geocodeMatchCode) {
	      var attributes = {};
	      if(geocodeMatchCode.accuracy)
		attributes.accuracy = geocodeMatchCode.accuracy;
	      if(geocodeMatchCode.matchType)
		attributes.matchType = geocodeMatchCode.matchType;
               return this.createElementNSPlus("xls:GeocodingQOSType", {attributes: attributes});
            }
	},

    CLASS_NAME: "OpenLayers.Format.XLS.v1_2_0"

});

// Support non standard implementation
OpenLayers.Format.XLS.v1_2 = OpenLayers.Format.XLS.v1_2_0;
