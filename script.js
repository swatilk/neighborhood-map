var map, infowindow, info;
var locationName = 'San Francisco';
function initMap() {
	var pyrmont = {lat: 37.7833, lng: -122.4167};
	  map = new google.maps.Map(document.getElementById('map'), {
	    center: pyrmont,
	    zoom: 12
	  });

	  $.ajax({
		url: "https://maps.googleapis.com/maps/api/place/textsearch/json?query=restaurants+in+"+locationName+"&key=AIzaSyAYcG9EzDuM4CeVjR8h8mfApu10Mu9blI0",
		dataType: "jsonp",
		success: function(Locdata){
			console.log(Locdata);
			var information = Locdata.results;
		},
		error: function(error){
			alert(error);
		}
	});
	info = information;
	ko.applyBindings(new mapViewModel);
}

function mapError(){

	document.getElementById('map').innerHTML = "<p>Sorry the maps could not be loaded!</p>";
}

var Place = function(placeObj){

	this.name = ko.observable(placeObj.name);
	this.lat = ko.observable(placeObj.geometry.location.lat);
	this.lng = ko.observable(placeObj.geometry.location.lng);
	this.marker = ko.observable();
	this.formatted_address = ko.observable();
	this.infowindow = ko.observable();
	this.contact = ko.observable();
	this.url = ko.observable();
};

var mapViewModel = function(){
	var self = this;

			this.placeArray = ko.observableArray();
			//locationData.forEach(function(place){
				console.log(info);
			info.forEach(function(place){
				self.placeArray.push(new Place(place));
			});

			var latlng;
			self.placeArray().forEach(function(place){
				console.log(place);
				latlng = {"lat":place.lat(), "lng":place.lng()};
				place.marker = new google.maps.Marker({
	    			map: map,
	    			position: latlng,
	    			animation: google.maps.Animation.DROP
	    			//title: name
  				});
  				place.marker.addListener('click', toggleBounce);

  				function toggleBounce() {
  					 if (place.marker.getAnimation() !== null) {
					    place.marker.setAnimation(null);
					  } else {
					    place.marker.setAnimation(google.maps.Animation.DROP);
					  }
  				}

  				$.ajax({

					url: "https://maps.googleapis.com/maps/api/place/details/json?placeid="+place.place_id+"&key=AIzaSyAYcG9EzDuM4CeVjR8h8mfApu10Mu9blI0",
					dataType: "jsonp",
					success: function(data){

						var results = data.result;
						var loc = results.hasOwnProperty('formatted_address') ? results.formatted_address : '';

							place.formatted_address(loc);


						place.contact(results.formatted_phone_number);
						place.url(results.website || '');
						//place.category(results.categories.name);
						var infoDetails = '<div><h3>'+place.name()+'</h3><p>'+ place.formatted_address() +'</p><span>Contact: '+ place.contact()+'</span><span>'+ place.url()+'</span></div>'
		  				place.infowindow = new google.maps.InfoWindow();

				  		google.maps.event.addListener(place.marker, 'click', function() {
				    		place.infowindow.setContent(infoDetails);
				    		place.infowindow.open(map, place.marker);
			  			});
					},
					fail: function(error){
						place.infowindow.setContent('<p>Data for this place could not be loaded!</p>')
					}

				});


			});

    		self.showClickedPlace = function(placeItem){
    			document.getElementsByClassName('gm-style-iw').innerHTML = '';
    			google.maps.event.trigger(placeItem.marker, 'click', function(){
    				placeItem.infowindow.open(map, placeItem.marker);
    			});
    			return placeItem.marker;
    		}

			self.visiblePlaces = ko.observableArray();
			self.listedPlaces = ko.observableArray();
			self.placeArray().forEach(function(place){
				self.listedPlaces.push(place);
			});

			self.userInput = ko.observable('');

			self.listPlaces = ko.computed(function(){
				//self.listedPlaces.removeAll();

				return ko.utils.arrayFilter(self.listedPlaces(), function(listedPlace){
					//console.log(listedPlace());
					listedPlace.marker.setVisible(false);
					var filter = listedPlace.name().toLowerCase().indexOf(self.userInput().toLowerCase());
					if(filter >= 0){
						self.visiblePlaces.push(listedPlace);
						listedPlace.marker.setVisible(true);
						return true;
					}
					else
						return false;
				});
			});
			console.log(self.listPlaces());

			self.visiblePlaces().forEach(function(pl){
				pl.marker.setVisible(true);
			});

};