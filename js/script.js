var map, info;
/** Initializes a text based location name, desired latitude and longitude */
var locationName = 'San Francisco';
var lati = 37.7833;
var lon = -122.4167;

/**
 *  @description initializes a map with center, implements autocomplete functionality and calls Foursquare API to get place details based on text input
 */
function initMap() {
	var pyrmont = {lat: lati, lng: lon};
	map = new google.maps.Map(document.getElementById('map'), {
		center: pyrmont,
		zoom: 14
	});

	var input = (document.getElementById('pac-input'));
	/** Creates the autocomplete helper, and associate it with
	 an HTML text input box.*/
	var autocomplete = new google.maps.places.Autocomplete(input);
	autocomplete.bindTo('bounds', map);

	map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

	var infowindow = new google.maps.InfoWindow();
	var marker = new google.maps.Marker({
		map: map,
		animation: google.maps.Animation.DROP
	});

	google.maps.event.addListener(marker, 'click', function() {
		infowindow.open(map, marker);
	});

	/** Gets the full place details when the user selects a place from the
	list of suggestions. */
	google.maps.event.addListener(autocomplete, 'place_changed', function() {
		infowindow.close();
		var place = autocomplete.getPlace();
		if (!place.geometry) {
			return;
		}

		if (place.geometry.viewport) {
			map.fitBounds(place.geometry.viewport);
		}
		else {
			map.setCenter(place.geometry.location);
			map.setZoom(13);
		}

		/** Sets the position of the marker using the place ID and location. */
		marker.setPlace( ({
			placeId: place.place_id,
			location: place.geometry.location
		}));
		marker.setVisible(true);

		infowindow.setContent('<div><h3>'+place.name+'</h3><p>Place ID: '+ place.place_id +'</p><span>'+ place.formatted_address+'</span></div>');
		infowindow.open(map, marker);
	});

	/** Makes asynchronous call to the API, to fetch details of restaurants around given place */
	$.ajax({
		url:"https://api.foursquare.com/v2/venues/search?near="+locationName+"&query=restaurant&radius=1000&client_id=VHONOODDSAV1KJZ0ZWCCGUPKM1UUHE02QBEKQFRTSESI3NWG&client_secret=41ZWOUFBU4G3GHX1LNBVIJX0WOKGIMSCJM3DBHNP2ST4CYAY&v=20150806&m=foursquare",
		dataType: "jsonp",
		success: function(data){
			/** Checks to see if data is stored in Local Storage, if it is, then fetches it and parses and assigns to 'info' */
	    	function getItems(key){
	        	if(localStorage[key]){
	            	return JSON.parse(localStorage[key]);
	        	}
	        	/** If user is accessing the app for the first time, then stores the data in Local Storage and assigns it to 'info' */
	        	else {
	        		localStorage[key] = JSON.stringify(data.response.venues);
	            	return data.response.venues;
	        	}
			}
			info = getItems('keys');
			/** Makes call to Knockout(KO) MVVM 'mapViewModel' */
	    	ko.applyBindings(new mapViewModel);
		},
		/** If API call fails for some reason, alerts the error message */
		error: function(error){
	    	alert("sorry! Could not load the data from Foursqaure API", error);
		}
	});

}

/** Displays error message, if map fails to load */
function mapError(){
	document.getElementById('map').innerHTML = "<p>Sorry the maps could not be loaded!</p>";
}

/** Creates 'Place' object to for accessing inside KO MVVM */
var Place = function(placeObj){
	this.name = ko.observable(placeObj.name);
	this.lat = ko.observable(placeObj.location.lat);
	this.lng = ko.observable(placeObj.location.lng);
	this.marker = ko.observable();
	this.formatted_address = ko.observable();
	this.infowindow = ko.observable();
	this.contact = ko.observable();
	this.url = ko.observable();
	this.venue_id = ko.observable(placeObj.id);
};

/** KO MVVM to create observable array to apply filtering */
var mapViewModel = function(){
	var self = this;
	self.placeArray = ko.observableArray();
	self.isDrawerOpen = ko.observable(false);
	self.hideDrawer = function(){
		self.isDrawerOpen(false);
		return true;
	}

	self.toggleDrawer = function(){
		var oppositeDrawerState = !(self.isDrawerOpen());
    	self.isDrawerOpen(oppositeDrawerState);
	}
	/** Iterates through each object of the results obtained from the above API call and pushes each to the obervable array */
	info.forEach(function(place){
		self.placeArray.push(new Place(place));
	});

	var latlng;
	var gmarkers = [];
	/** default icon for markers */
	var defaultIcon = {url: 'http://maps.gstatic.com/mapfiles/markers2/marker.png',
		/** This marker is 32 pixels wide by 32 pixels tall, Origin is 0,0 and the anchor for this image is the base of the flagpole at 0,32 */
		size: new google.maps.Size(32, 32),
		origin: new google.maps.Point(0,0),
		anchor: new google.maps.Point(16, 32)};

	/** Active icon, to differentiate active marker */
	var activeIcon = {url: 'http://maps.gstatic.com/mapfiles/markers2/icon_green.png',
		/** This marker is 20 pixels wide by 32 pixels tall,The origin for this image is 0,0 and the anchor for this image is the base of the flagpole at 0,32 */
		size: new google.maps.Size(32, 32),
		origin: new google.maps.Point(0,0),
		anchor: new google.maps.Point(16, 32)};
		/** Shapes define the clickable region of the icon. The type defines an HTML &lt;area&gt; element 'poly' which traces out a polygon as a series of X,Y points. The final coordinate closes the poly by connecting to the first
		coordinate. */
	var shape = {
		coord: [9,0,6,1,4,2,2,4,0,8,0,12,1,14,2,16,5,19,7,23,8,26,9,30,9,34,11,34,11,30,12,26,13,24,14,21,16,18,18,16,20,12,20,8,18,4,16,2,15,1,13,0],
		type: 'poly'
	};

	/** Iterates through each object in the observable array to create a marker for each */
	self.placeArray().forEach(function(place){
		latlng = {"lat":place.lat(), "lng":place.lng()};
		place.marker = new google.maps.Marker({
			map: map,
			position: latlng,
			animation: google.maps.Animation.DROP,
			icon: defaultIcon
		});
		place.marker.addListener('click', toggleDROP);

		/** Toggles the DROP animation to each marker, on 'click' event*/
		function toggleDROP() {
			if (place.marker.getAnimation() !== null) {
				place.marker.setAnimation(null);
			}
			else {
				place.marker.setAnimation(google.maps.Animation.DROP);
			}
		}

		/** Makes asynchronous call to the API, to fetch details of each restaurant in the observable array */
		$.ajax({
			url:"https://api.foursquare.com/v2/venues/"+ place.venue_id() +"?client_id=VHONOODDSAV1KJZ0ZWCCGUPKM1UUHE02QBEKQFRTSESI3NWG&client_secret=41ZWOUFBU4G3GHX1LNBVIJX0WOKGIMSCJM3DBHNP2ST4CYAY&v=20150806&m=foursquare",
			dataType: "jsonp",
			success: function(data){
				var results = data.response.venue;
				var loc = results.hasOwnProperty('location') ? results.location.formattedAddress : '';
				place.formatted_address(loc);
				place.contact(results.contact.formattedPhone);
				place.url(results.url || '');
				/** Format the data to appear on the infowindow */
				var infoDetails = '<div><h3>'+place.name() +'</h3><p>'+ place.formatted_address() +'</p><span>Contact: '+ place.contact() +'</span><br><a target="_blank" href="'+ place.url() +'" >'+ place.url() +'</a></div>';
				place.infowindow = new google.maps.InfoWindow();

				/** On 'click' event, sets all markers' icons to default and then sets the current marker's icon to active icon  */
		  		google.maps.event.addListener(place.marker, 'click', function() {
		    		for(var i =0; i < gmarkers.length; i++){
		    			gmarkers[i].marker.setIcon(defaultIcon);
		    			gmarkers[i].infowindow.close();
		    		}
		    		place.marker.setIcon(activeIcon);
		    		place.infowindow.setContent(infoDetails);
		    		place.infowindow.open(map, place.marker);

	  			});
	  			/** On 'closeclick' event for the infowindow, set the marker to default */
	  			google.maps.event.addListener(place.infowindow, 'closeclick', function(){
	  				place.marker.setIcon(defaultIcon);
	  			});

			},
			/** Handles errors on the API call */
			error: function(error){
				place.infowindow.setContent('<p>Data for this place could not be loaded!</p>');
			}

		});
		gmarkers.push(place);
	});

	/** close any open infowindow , when user starts typing in the filter field */
	self.closeInfo = function(){
		self.placeArray().forEach(function(place){
			place.infowindow.close();
			place.marker.setIcon(defaultIcon);
		});
	};
	/**
 	 *  @description displays the marker and corresponding infowindow when the user clicks on a reataurant name on the list, while hiding the rest of the markers and infowindows
 	 *  param {Object} placeItem - Current/Clicked place (restaurant) Object
     */
	self.showClickedPlace = function(placeItem){
		document.getElementsByClassName('gm-style-iw').innerHTML = '';
		self.placeArray().forEach(function(singlePlace){
			singlePlace.infowindow.close();
			singlePlace.marker.setIcon(defaultIcon);
		});
		google.maps.event.trigger(placeItem.marker, 'click', function(){
			placeItem.infowindow.open(map, placeItem.marker);
		});
		return placeItem.marker;
	};

	/** Observable array to store only places after filtering */
	self.visiblePlaces = ko.observableArray();
	self.listedPlaces = ko.observableArray();
	self.placeArray().forEach(function(place){
		//place.infowindow.close();
		self.listedPlaces.push(place);
	});
	self.userInput = ko.observable('');

	/** Applies filtering on the list of places and shows only filtered places. Also pushes each visible place object to an array */
	self.listPlaces = ko.computed(function(){
		return ko.utils.arrayFilter(self.listedPlaces(), function(listedPlace){
			listedPlace.marker.setVisible(false);
			var filter = listedPlace.name().toLowerCase().indexOf(self.userInput().toLowerCase());
			if(filter >= 0){
				self.visiblePlaces.push(listedPlace);
				listedPlace.marker.setVisible(true);
				return true;
			}
			else {
				return false;
			}
		});
	});

	/** Set the markers of all filtered places to 'visible' */
	self.visiblePlaces().forEach(function(pl){
		pl.marker.setVisible(true);
	});
};