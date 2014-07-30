'use strict';

angular.module('graffitiAvl')
  .controller('MainCtrl', ['$scope', '$filter', 'pubStuffFact','geoJsonFact', function ($scope, $filter, pubStuffFact, geoJsonFact) {

  	L.Icon.Default.imagePath = 'dependencies/js/images';
  	$('#loadingModal').modal();
  	//Global variable for detailed map showing the details of request location
  	var requestLocation;

  	var openIcon = L.icon({
			iconUrl: 'images/open.png',
			iconSize: [32, 37],
			iconAnchor: [16, 37],
			popupAnchor: [0, -28]
		});

  	var completedIcon = L.icon({
			iconUrl: 'images/completed.png',
			iconSize: [32, 37],
			iconAnchor: [16, 37],
			popupAnchor: [0, -28]
		});

  	//Base map tile layers for main map
  	var osm = L.tileLayer( 'http://{s}.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.png', {
   		attribution: '&copy; <a href="http://osm.org/copyright" title="OpenStreetMap" target="_blank">OpenStreetMap</a> contributors | Tiles Courtesy of <a href="http://www.mapquest.com/" title="MapQuest" target="_blank">MapQuest</a> <img src="http://developer.mapquest.com/content/osm/mq_logo.png" width="16" height="16">',
    	subdomains: ['otile1','otile2','otile3','otile4']
	});

	var aerial = L.tileLayer("http://{s}.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.png",{
		attribution:'&copy; <a href="http://osm.org/copyright" title="OpenStreetMap" target="_blank">OpenStreetMap</a> contributors | Tiles Courtesy of <a href="http://www.mapquest.com/" title="MapQuest" target="_blank">MapQuest</a> <img src="http://developer.mapquest.com/content/osm/mq_logo.png" width="16" height="16">',
		subdomains:["otile1","otile2","otile3","otile4"]
	});

	var baseMaps = {
		"OSM" : osm,
		"Aerial" : aerial
	};


	//Initialize Main map
	var map = L.map('map', {
		center: [35.5951125,-82.5511088], 
		zoom : 13,
		layers : [aerial, osm]});


	//Layer control for main map
	L.control.layers(baseMaps).addTo(map);


	//Base map tile layers for main map
  	var osmDetail = L.tileLayer( 'http://{s}.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.png', {
   		attribution: '&copy; <a href="http://osm.org/copyright" title="OpenStreetMap" target="_blank">OpenStreetMap</a> contributors | Tiles Courtesy of <a href="http://www.mapquest.com/" title="MapQuest" target="_blank">MapQuest</a> <img src="http://developer.mapquest.com/content/osm/mq_logo.png" width="16" height="16">',
    	subdomains: ['otile1','otile2','otile3','otile4']
	});

	var aerialDetail = L.tileLayer("http://{s}.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.png",{
		attribution:'&copy; <a href="http://osm.org/copyright" title="OpenStreetMap" target="_blank">OpenStreetMap</a> contributors | Tiles Courtesy of <a href="http://www.mapquest.com/" title="MapQuest" target="_blank">MapQuest</a> <img src="http://developer.mapquest.com/content/osm/mq_logo.png" width="16" height="16">',
		subdomains:["otile1","otile2","otile3","otile4"]
	});

	var baseMapsDetail = {
		"Aerial" : aerialDetail,
		"OSM" : osmDetail
	};

	//Initialize Details map
	var detailMap = L.map('detailMap', {
		center: [35.5951125,-82.5511088], 
		zoom : 14,
		layers : [osmDetail, aerialDetail]});

	//Layer control for main map
	var mapLayerControl = L.control.layers(baseMapsDetail).addTo(detailMap);

	$scope.map = false;
	//Toggle Details map visibility
	$scope.toggleDetailMap = function(){
		$scope.map = !$scope.map;
		if($scope.map){
			detailMap.invalidateSize();
			setTimeout(function(){
				detailMap.invalidateSize();
			}, 500);
		}else{
			detailMap.removeLayer(requestLocation);
		}
	}

	var generateStatsOnDetailedRequestList = function(requestsList){
		$scope.requestsList = $filter('orderBy')(requestsList, '-request.date_created', false)
		//Get the latest requests
		var latestRequestDtime = $scope.requestsList[0].request.date_created*1000;
		var d = new Date();
		var dTime = d.getTime();
		$scope.daysSinceLastRequest = Math.floor((latestRequestDtime/dTime)/3600);
		var dTime30DaysAgo = d.setDate(d.getDate() - 30);
		var dTime365DaysAgo = d.setDate(d.getDate() - 365);
		var count30days = 0;
		var count365days = 0;
		for(var i = 0; i < $scope.requestsList.length; i++) {
			if($scope.requestsList[i].request.date_created*1000 > dTime30DaysAgo){
				count30days += 1
			}
			if($scope.requestsList[i].request.date_created*1000 > dTime365DaysAgo){
				count365days += 1
			}
		};
		$scope.requestsLast30days = count30days;
		$scope.requestsLast365days = count365days;
		$scope.totalRequests = $scope.requestsList.length;
		$scope.completed = 0;
		$scope.open = 0;
		$scope.investmentByCity = 0;
		$scope.costToPropertyOwners = 0;
		for (var i = 0; i < $scope.requestsList.length; i++) {
			if($scope.requestsList[i].request.status === "completed"){
				$scope.completed += 1;
			}else{
				$scope.open += 1;
			}
			for (var x = 0; x < $scope.requestsList[i].request.custom_fields.length; x++) {
				if($scope.requestsList[i].request.custom_fields[x].custom_field.name === "Investment by City ($):"){
					$scope.investmentByCity += Number($scope.requestsList[i].request.custom_fields[x].custom_field.value);
				}
				if($scope.requestsList[i].request.custom_fields[x].custom_field.name === "Cost to Property Owner ($):"){
					$scope.costToPropertyOwners += Number($scope.requestsList[i].request.custom_fields[x].custom_field.value);
				}
			}
		};
		$scope.percentOfAllocatedFundsInvested = (($scope.investmentByCity/300000)*100).toFixed(0) + "%"


	};

	var generateGeoJsonFromDetailedRequestList = function(requestsList){
		var requestLocations = L.geoJson(geoJsonFact.generateGeoJsonFromRequestList(requestsList), {
			style: function(feature) {
				var statusToColor = {
					"in progress" : "#d9534f",
					"completed" : "#5bc0de",
					"submitted" : "#5bc0de",
					"accepted" : "#5cb85c"
				}
		        return {color: statusToColor[feature.properties.status]};
		    },
		    pointToLayer: function(feature, latlng) {
		    	if(feature.properties.status === 'completed'){
		    		return new L.marker(latlng, {icon : completedIcon});
		    	}else{
		    		return new L.marker(latlng, {icon : openIcon});
		    	}
		        
		    },
			onEachFeature: function (feature, layer) {

				// var popupContent = "<div class = 'well'><p> Request ID : "+feature.properties.id+"</p><p> Address : "+feature.properties.address+"</p></div>";
				// layer.bindPopup(popupContent);
				// layer.on('mouseover', layer.openPopup.bind(layer));
				// layer.on('mouseout', layer.closePopup.bind(layer));
		  		layer.on('click', function(){

		  			$scope.getRequestDetails(feature.properties);
		        	
		  		})
		        
		    }
		}).addTo(map);
		mapLayerControl.addOverlay(requestLocations);
	}

	var detailedRequestList = [];

  	pubStuffFact.getListOfRequestTypes()
  		//when promise resolves...
  		.then(function(requestTypes){
  			for (var i = 0; i < requestTypes.length; i++) {
  				//We are interested in graffiti requests types; so we'll check request type by name
		  		if(requestTypes[i].request_type.name === "Graffiti"){
		  			var graffitiInitStartDate = new Date(2014, 5, 1, 0, 0, 0, 0);
					pubStuffFact.getListOfRequests({ "verbose" : 1, "request_type_id" : requestTypes[i].request_type.id, "limit" : 1000, "after_timestamp" : graffitiInitStartDate.getTime()/1000})
						.then(function(requestsList){
							$('#loadingModal').modal('toggle');
							for (var x = 0; x < requestsList.requests.length; x++) {
								if(requestsList.requests[x].request.custom_fields !== undefined){
									for (var y = 0; y < requestsList.requests[x].request.custom_fields.length; y++) {
										if(requestsList.requests[x].request.custom_fields[y].custom_field.name === "Graffiti Initiative Participant Property Type:"){
											if(requestsList.requests[x].request.custom_fields[y].custom_field.value === "2: City Property" ||
												requestsList.requests[x].request.custom_fields[y].custom_field.value === "3: Private Property"){
												
												detailedRequestList.push(requestsList.requests[x])
											}
												
										}
									};
								}
							};
							generateStatsOnDetailedRequestList(detailedRequestList);
							generateGeoJsonFromDetailedRequestList(detailedRequestList);
						})
				}
		  	};
  		});

	$scope.getRequestDetails =function (requestDetails){
		//Update the view for the Details map
		detailMap.setView([requestDetails.lat,requestDetails.lon],15);
		requestLocation =L.marker([requestDetails.lat,requestDetails.lon]).addTo(detailMap);
		$scope.requestDetails = {};
		//Set scoped variable for request details
		$scope.requestDetails.requestDate = requestDetails.date_created;
		$scope.requestDetails.imageThumbnail = requestDetails.image_thumbnail;
		$scope.requestDetails.id = requestDetails.id;
		$scope.requestDetails.status = requestDetails.status;
		$scope.requestDetails.address = requestDetails.address;
		$scope.requestDetails.description = requestDetails.description;
		$scope.requestDetails.investmentByCity = 0;
		$scope.requestDetails.costToPropertyOwner = 0;
		for (var i = 0; i < requestDetails.custom_fields.length; i++) {

			if(requestDetails.custom_fields[i].custom_field.name === "Investment by City ($):"){
				$scope.requestDetails.investmentByCity = Number(requestDetails.custom_fields[i].custom_field.value);
			}
			if(requestDetails.custom_fields[i].custom_field.name === "Cost to Property Owner ($):"){
				$scope.requestDetails.costToPropertyOwner = Number(requestDetails.custom_fields[i].custom_field.value);
			}
		};
		//$scope.$apply();
		$('#requestDetailsModal').modal();
	};

	$scope.closeRequestDetail = function(){
		$scope.map = false;
		detailMap.removeLayer(requestLocation);
	}

	$scope.posting = false;

	$scope.postComment=function(requestId,comment){
		$scope.comment="";
		$scope.posting=false; 
		pubStuffFact.postAComment(requestId,commment)
			.then(function(){
				pubStuffFact.getCommentsForARequest(re)
					.then(function(c){
						$scope.comments=$filter("orderBy")(c.comments,"-comment.create_date",false);
						a.posting=false
					})
				});

	}
  	
  	
}]);
