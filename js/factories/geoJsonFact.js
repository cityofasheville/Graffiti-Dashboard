'use strict';
//This factory provides an api access to the Public Stuff API for the City of Asheville

graffitiAvl.factory('geoJsonFact', function ($http, $q) {
  	//instatiate the factory object
  	var geoJsonFact = {};
  	
  	geoJsonFact.generateGeoJsonFromRequestList = function(requestList){
  		var geoJson = {
  			type : "FeatureCollection",
  			features : []
  		};

  		for (var i = 0; i < requestList.length; i++) {
  			var feature ={
  				type : "Feature",
  				geometry : {
  					type : "Point",
  					coordinates : [requestList[i].request.lon, requestList[i].request.lat]
  				},
  				properties : requestList[i].request
  			}
  			geoJson.features.push(feature);
  		};
  		return geoJson
  	}

    //return the factory object
  	return geoJsonFact
  });