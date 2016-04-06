// Creates the gservice factory. This will be the primary means by which we interact with Google Maps
angular.module('gservice', [])
    .factory('gservice', function($http){

        // Initialize Variables
        // -------------------------------------------------------------
        // Service our factory will return
        var googleMapService = {};

        // Array of locations obtained from API calls
        var locations = [];

        // Selected Location (initialize to center of America)
        var selectedLat = 39.50;
        var selectedLong = -98.35;

        // Functions
        // --------------------------------------------------------------
        // Refresh the Map with new data. Function will take new latitude and longitude coordinates.
        googleMapService.refresh = function(latitude, longitude){

            // Clears the holding array of locations
            locations = [];

            // Set the selected lat and long equal to the ones provided on the refresh() call
            selectedLat = latitude;
            selectedLong = longitude;

            // Then initialize the map.
            initialize(latitude, longitude);

            // Perform an AJAX call to get all of the records in the db.
            $http.get('/users').success(function(response){

                // Convert the results into Google Map Format
                locations = convertToMapPoints(response);


            }).error(function(){});
        };

        // Private Inner Functions
        // --------------------------------------------------------------
        // Convert a JSON of users into map points
        var convertToMapPoints = function(response){

            // Clear the locations holder
            var locations = [];

            // Loop through all of the JSON entries provided in the response
            for(var i= 0; i < response.length; i++) {
                var user = response[i];

                // Create popup windows for each record
                var  contentString =
                    '<p><b>Username</b>: ' + user.username +
                    '<br><b>Age</b>: ' + user.age +
                    '<br><b>Gender</b>: ' + user.gender +
                    '<br><b>Favorite Language</b>: ' + user.favlang +
                    '</p>';

                // Converts each of the JSON records into Google Maps Location format (Note [Lat, Lng] format).
                locations.push({
                    latlon: new google.maps.LatLng(user.location[1], user.location[0]),
                    message: new google.maps.InfoWindow({
                        content: contentString,
                        maxWidth: 320
                    }),
                    username: user.username,
                    gender: user.gender,
                    age: user.age,
                    favlang: user.favlang
                });
            }
            // location is now an array populated with records in Google Maps format
            return locations;
        };

        var displayPlace = function (place) {

            // Add place details on the places-container
            $("#places-container").html('<div><h1>' + place.name + '</h1><h3>'
            + place.types[0] + '</h3><h2>'
            + place.formatted_address + '</h2><h2>'
            + 'Rating: ' + place.rating + '</h2></div>');

            // Add place name to the places-list
            var placeName = '<div class="place-item">' + place.name + '</div>';
            $("#places-list").append (placeName)


        }

        var addPhoto = function (place) {
            var photos = place.photos;
                if (!photos) {
                     return;
                }

                else {
                var photosURL = '<img src=' + place.photos[0].getUrl({'maxWidth': 1000, 'maxHeight': 1000}) +'">'
                $("#places-container").prepend(photosURL);
                }
        }

// Initializes the map
var initialize = function(latitude, longitude) {

    // Apply map styling (Avocado World)
    var styles = [{"featureType":"water","elementType":"geometry","stylers":[{"visibility":"on"},{"color":"#aee2e0"}]},{"featureType":"landscape","elementType":"geometry.fill","stylers":[{"color":"#abce83"}]},{"featureType":"poi","elementType":"geometry.fill","stylers":[{"color":"#769E72"}]},{"featureType":"poi","elementType":"labels.text.fill","stylers":[{"color":"#7B8758"}]},{"featureType":"poi","elementType":"labels.text.stroke","stylers":[{"color":"#EBF4A4"}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"visibility":"simplified"},{"color":"#8dab68"}]},{"featureType":"road","elementType":"geometry.fill","stylers":[{"visibility":"simplified"}]},{"featureType":"road","elementType":"labels.text.fill","stylers":[{"color":"#5B5B3F"}]},{"featureType":"road","elementType":"labels.text.stroke","stylers":[{"color":"#ABCE83"}]},{"featureType":"road","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#A4C67D"}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#9BBF72"}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"color":"#EBF4A4"}]},{"featureType":"transit","stylers":[{"visibility":"off"}]},{"featureType":"administrative","elementType":"geometry.stroke","stylers":[{"visibility":"on"},{"color":"#87ae79"}]},{"featureType":"administrative","elementType":"geometry.fill","stylers":[{"color":"#7f2200"},{"visibility":"off"}]},{"featureType":"administrative","elementType":"labels.text.stroke","stylers":[{"color":"#ffffff"},{"visibility":"on"},{"weight":4.1}]},{"featureType":"administrative","elementType":"labels.text.fill","stylers":[{"color":"#495421"}]},{"featureType":"administrative.neighborhood","elementType":"labels","stylers":[{"visibility":"off"}]}]

    // Create a new StyledMapType object, passing it the array of styles,
    // as well as the name to be displayed on the map type control.
    var styledMap = new google.maps.StyledMapType(styles,
        {name: "Styled Map"});

    // Uses the selected lat, long as starting point
    var myLatLng = {lat: selectedLat, lng: selectedLong};

    // Create a map object, and include the MapTypeId to add
    // to the map type control.
    var mapOptions = {
        zoom: 3,
        center: myLatLng,
        mapTypeControlOptions: {
        mapTypeIds: [google.maps.MapTypeId.ROADMAP, 'map_style']
        }
    };
    // If map has not been created already...
    if (!map){

        // Create a new map and place in the index.html page
        var map = new google.maps.Map(document.getElementById('map'),
    mapOptions);
        //Associate the styled map with the MapTypeId and set it to display.
        map.mapTypes.set('map_style', styledMap);
        map.setMapTypeId('map_style');
    }

    var input = /** @type {HTMLInputElement} */(
      document.getElementById('place-input'));

    // Create the autocomplete helper, and associate it with
    // an HTML text input box.
    var autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.bindTo('bounds', map);

    var marker = new google.maps.Marker({
        map: map
    });

    var places = new google.maps.places
          .PlacesService(document.getElementById('places-container')
                         .appendChild(document.createElement('div')));
   
    // Get the full place details when the user selects a place from the
    // list of suggestions.
    google.maps.event.addListener(autocomplete, 'place_changed', function() {
        var place = autocomplete.getPlace();
        if (!place.geometry) {
          return;
        }

        if (place.geometry.viewport) {
          map.fitBounds(place.geometry.viewport);
        } else {
          map.setCenter(place.geometry.location);
          map.setZoom(17);
        }

        // Set the position of the marker using the place ID and location.
        marker.setPlace(/** @type {!google.maps.Place} */ ({
          placeId: place.place_id,
          location: place.geometry.location
        }));
        marker.setVisible(true);

        // Displays place details on the app
        displayPlace (place);

        // Handles cases when no pictures are returned
        addPhoto(place);

      });
    // Loop through each location in the array and place a marker
    // locations.forEach(function(n, i){
    //     var marker = new google.maps.Marker({
    //         position: n.latlon,
    //         map: map,
    //         title: "Big Map",
    //         icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
    //     });

    //     // For each marker created, add a listener that checks for clicks
    //     google.maps.event.addListener(marker, 'click', function(e){

    //         // When clicked, open the selected marker's message
    //         currentSelectedMarker = n;
    //         n.message.open(map, marker);
    //     });
    // });

    // // Set initial location as a bouncing red marker
    // var initialLocation = new google.maps.LatLng(latitude, longitude);
    // var marker = new google.maps.Marker({
    //     position: initialLocation,
    //     animation: google.maps.Animation.BOUNCE,
    //     map: map,
    //     icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
    // });
    // lastMarker = marker;

};

// Refresh the page upon window load. Use the initial latitude and longitude
google.maps.event.addDomListener(window, 'load',
    googleMapService.refresh(selectedLat, selectedLong));

return googleMapService;
});