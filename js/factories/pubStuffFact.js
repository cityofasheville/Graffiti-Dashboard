'use strict';
//This factory provides an api access to the Public Stuff API for the City of Asheville

graffitiAvl.factory('pubStuffFact', ['$http', '$q', function ($http, $q) {
  	//instatiate the factory object
  	var pubStuffFact = {};
  	//Private variables
  	var client_id = 819;
  	var space_id = 3737;
  	var api_key = "XXX";
    //var api_key = "XXX";

    

  	//Public API
  		
    //All API calls use the $q library to resolve promises asynchronously

  	//Get a list of request types as JSON
  	pubStuffFact.getListOfRequestTypes = function(){
  		var q = $q.defer();
  		var params = {
  			"return_type" : "json",
        "client_id" : client_id,
        "api_key" : api_key 
  		};
  		$http({
          "url" : "https://www.publicstuff.com/api/2.0/requesttypes_list?", 
          "method" : "GET",
          "params" : params
        })
  			.success(function(response) {
            if(response.response.status.type === "error"){
              console.log(response.response.status.message)
            }
	      		q.resolve(response.response.request_types);
	    	})
        .error(function(error){
          //log an error for now
          console.log(error);
        })
	    return q.promise
  	}

    //Get a list of requests as JSON
    //valid params are: 
    // {
    //   "request_type_id" : Integer,
    //   "after_timestamp" : Unix Timestamp Integer,
    //   "before_timestamp" : Unix datetime Integer,
    //   "status" : String,
    //   "limit" : Integer, *Required
    //   "lat" : Float,
    //   "lng" : Float,
    //   "nearby" : in lat lon units Float
    // }
    pubStuffFact.getListOfRequests = function(params){
      var q = $q.defer();
      params.return_type = "json";
      params.status = "all";
      params.api_key = "i952rk495itu254sx21141j2d3je3x";

      $http({
          "url" : "https://www.publicstuff.com/api/2.0/requests_list?", 
          "method" : "GET",
          "params" : params
        })
        .success(function(response) {
            if(response.response.status.type === "error"){
              console.log(response.response.status.message)
            }
            q.resolve(response.response);
        })
        .error(function(error){
          //log an error for now
          console.log(error);
        })
      return q.promise
    }

    pubStuffFact.getRequestDetails = function(requestId){
      var q = $q.defer();
      var params = {};
      params.return_type = "json";
      params.request_id = requestId;
      params.verbose = 1;
      params.api_key = "i952rk495itu254sx21141j2d3je3x";
      $http({
          "url" : "https://www.publicstuff.com/api/2.0/request_view?", 
          "method" : "GET",
          "params" : params
        })
        .success(function(response) {
            if(response.response.status.type === "error"){
              console.log(response.response.status.message)
            }
            q.resolve(response.response);
        })
        .error(function(error){
          //log an error for now
          console.log(error);
        })
      return q.promise
    }


    pubStuffFact.getCommentsForARequest = function(params){
      var q = $q.defer();
      params["return_type"] = "json";
      $http({
          "url" : "https://www.publicstuff.com/api/2.0/requests_list?", 
          "method" : "GET",
          "params" : params
        })
        .success(function(response) {
            if(response.response.status.type === "error"){
              console.log(response.response.status.message)
            }
            q.resolve(response.response);
        })
        .error(function(error){
          //log an error for now
          console.log(error);
        })
      return q.promise
    }

    pubStuffFact.postAComment = function(requestId, comment){
      var q = $q.defer();
      params["return_type"] = "json";
      $http({
          "url" : "https://www.publicstuff.com/api/2.0/requests_list?api_key="+"&request_id="+requestId+"&comment=" + comment, 
          "method" : "POST",
          "data" : {}
        })
        .success(function(response) {
            if(response.response.status.type === "error"){
              console.log(response.response.status.message)
            }
            q.resolve(response.response);
        })
        .error(function(error){
          //log an error for now
          console.log(error);
        })
      return q.promise
    }

    //return the factory object
  	return pubStuffFact
  }]);
