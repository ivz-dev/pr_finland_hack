require('./bootstrap');
window.Vue = require('vue');
window.$ = require('jquery');

var loadGoogleMapsApi = require('load-google-maps-api-2');

loadGoogleMapsApi.key = 'AIzaSyCyDf5C3_f09CMdM7CzypxS1rXQD3SOk2I';
loadGoogleMapsApi.language = 'en';

function Tour_startUp(stops) {
    if (!window.tour) window.tour = {
        updateStops: function (newStops) {
            stops = newStops;
        },
        loadMap: function (map, directionsDisplay) {
            var myOptions = {
                zoom: 24,
                mapTypeId: "roadmap",
            };
            map.setOptions(myOptions);
            directionsDisplay.setMap(map);

            console.log(map);
        },
        fitBounds: function (map) {
            var bounds = new window.google.maps.LatLngBounds();

            // extend bounds for each record
            jQuery.each(stops, function (key, val) {
                var myLatlng = new window.google.maps.LatLng(val.Geometry.Latitude, val.Geometry.Longitude);
                bounds.extend(myLatlng);
            });
            map.fitBounds(bounds);
        },
        calcRoute: function (directionsService, directionsDisplay) {
            var batches = [];
            var itemsPerBatch = 10; // google API max = 10 - 1 start, 1 stop, and 8 waypoints
            var itemsCounter = 0;
            var wayptsExist = stops.length > 0;

            while (wayptsExist) {
                var subBatch = [];
                var subitemsCounter = 0;

                for (var j = itemsCounter; j < stops.length; j++) {
                    subitemsCounter++;
                    subBatch.push({
                        location: new window.google.maps.LatLng(stops[j].Geometry.Latitude, stops[j].Geometry.Longitude),
                        stopover: true
                    });
                    if (subitemsCounter == itemsPerBatch)
                        break;
                }

                itemsCounter += subitemsCounter;
                batches.push(subBatch);
                wayptsExist = itemsCounter < stops.length;
                itemsCounter--;
            }

            // now we should have a 2 dimensional array with a list of a list of waypoints
            var combinedResults;
            var unsortedResults = [{}]; // to hold the counter and the results themselves as they come back, to later sort
            var directionsResultsReturned = 0;

            for (var k = 0; k < batches.length; k++) {
                var lastIndex = batches[k].length - 1;
                var start = batches[k][0].location;
                var end = batches[k][lastIndex].location;

                // trim first and last entry from array
                var waypts = [];
                waypts = batches[k];
                waypts.splice(0, 1);
                waypts.splice(waypts.length - 1, 1);

                var request = {
                    origin: start,
                    destination: end,
                    waypoints: waypts,
                    travelMode: window.google.maps.TravelMode.WALKING
                };
                (function (kk) {
                    directionsService.route(request, function (result, status) {
                        if (status == window.google.maps.DirectionsStatus.OK) {

                            var unsortedResult = {order: kk, result: result};
                            unsortedResults.push(unsortedResult);

                            directionsResultsReturned++;

                            if (directionsResultsReturned == batches.length) // we've received all the results. put to map
                            {
                                // sort the returned values into their correct order
                                unsortedResults.sort(function (a, b) {
                                    return parseFloat(a.order) - parseFloat(b.order);
                                });
                                var count = 0;
                                for (var key in unsortedResults) {
                                    if (unsortedResults[key].result != null) {
                                        if (unsortedResults.hasOwnProperty(key)) {
                                            if (count == 0) // first results. new up the combinedResults object
                                                combinedResults = unsortedResults[key].result;
                                            else {
                                                // only building up legs, overview_path, and bounds in my consolidated object. This is not a complete
                                                // directionResults object, but enough to draw a path on the map, which is all I need
                                                combinedResults.routes[0].legs = combinedResults.routes[0].legs.concat(unsortedResults[key].result.routes[0].legs);
                                                combinedResults.routes[0].overview_path = combinedResults.routes[0].overview_path.concat(unsortedResults[key].result.routes[0].overview_path);

                                                combinedResults.routes[0].bounds = combinedResults.routes[0].bounds.extend(unsortedResults[key].result.routes[0].bounds.getNorthEast());
                                                combinedResults.routes[0].bounds = combinedResults.routes[0].bounds.extend(unsortedResults[key].result.routes[0].bounds.getSouthWest());
                                            }
                                            count++;
                                        }
                                    }
                                }
                                directionsDisplay.setDirections(combinedResults);
                                var legs = combinedResults.routes[0].legs;
                                // alert(legs.length);
                                for (var i = 0; i < legs.length; i++) {
                                    var markerletter = "A".charCodeAt(0);
                                    markerletter += i;
                                    markerletter = String.fromCharCode(markerletter);
                                    createMarker(directionsDisplay.getMap(), legs[i].start_location, "marker" + i, "some text for marker " + i + "<br>" + legs[i].start_address, markerletter);
                                }
                                var i = legs.length;
                                var markerletter = "A".charCodeAt(0);
                                markerletter += i;
                                markerletter = String.fromCharCode(markerletter);
                                createMarker(directionsDisplay.getMap(), legs[legs.length - 1].end_location, "marker" + i, "some text for the " + i + "marker<br>" + legs[legs.length - 1].end_address, markerletter);
                            }
                        }
                    });
                })(k);
            }
        }
    };
}

var icons = new Array();

$(document).ready(function () {
    renderStops(0)
    var i = 0;
    $("#ok").click(function () {
        renderStops(i);
        i++;
        if (i == stops.length) {
            i = 0;
        }
    });

    function renderStops(i) {
        currentPosition.setPosition({
            lat: parseFloat(stops[i]['Geometry']['Latitude']) + 0.004,
            lng: parseFloat(stops[i]['Geometry']['Longitude'])
        });
        map.setCenter({
            lat: parseFloat(stops[i]['Geometry']['Latitude']),
            lng: parseFloat(stops[i]['Geometry']['Longitude'])
        });

        var html = "";
        for (let k = i; k < stops.length; k++) {
            if (k == 0) {
                var html = html + "<li class='station active'>" + stops[k]['Geometry']['name'] + "</li>";
            } else {
                if (k == i) {
                    var html = html + "<li class='station active'>" + stops[k]['Geometry']['name'] + "</li>";
                } else {
                    var html = html + "<li class='station'>" + stops[k]['Geometry']['name'] + "<span class='time'>17 min</span> </li> ";
                }
            }
        }

        $(".stations").html(html);
    }

});


function createMarker(map, latlng, label) {
    var marker = new window.google.maps.Marker({
        position: latlng,
        map: map,
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 5
        },
        title: "ok",
        zIndex: Math.round(latlng.lat() * -100000) << 5
    });

    marker.myname = label;

    return marker;
}

loadGoogleMapsApi().then(function (googleMaps) {
    window.google.maps = googleMaps;
    window.map = new window.google.maps.Map(document.getElementById("map"));

    var icon = {
        url: "http://205.166.161.233/MyRide/css/ico/bus_pointer.svg",
        scaledSize: new google.maps.Size(25, 35), // scaled size
        origin: new google.maps.Point(0, 0), // origin
        anchor: new google.maps.Point(0, 0) // anchor
    };

    window.currentPosition = new window.google.maps.Marker({
        position: {lat: 60.20111, lng: 24.92664},
        map: map,
        icon: icon,
        title: 'current position',
        draggable: true,
        animation: google.maps.Animation.DROP
    });

    var directionsDisplay = new window.google.maps.DirectionsRenderer({suppressMarkers: true});
    var directionsService = new window.google.maps.DirectionsService();

    Tour_startUp(stops);

    window.tour.loadMap(map, directionsDisplay);
    window.tour.fitBounds(map);

    if (stops.length > 1)
        window.tour.calcRoute(directionsService, directionsDisplay);


}).catch(function (err) {
    console.error(err);
});



// called when the client connects
function onConnect() {
    // Once a connection has been made, make a subscription and send a message.
    console.log("onConnect");
    client.subscribe("bus-api"); //назва топіка
}
// called when the client loses its connection
function onConnectionLost(responseObject) {
    if (responseObject.errorCode !== 0) {
        console.log("onConnectionLost:", responseObject.errorMessage);
        setTimeout(function() { client.connect() }, 5000);
    }
}
// called when a message arrives
function onMessageArrived(message) {

}
function onFailure(invocationContext, errorCode, errorMessage) {
    var errDiv = document.getElementById("error");
    errDiv.textContent = "Could not connect to WebSocket server, most likely you're behind a firewall that doesn't allow outgoing connections to port 37501";
    errDiv.style.display = "block";
}
var clientId = "ws" + Math.random();
// Create a client instance
var client = new Paho.MQTT.Client("m14.cloudmqtt.com", 36567, clientId);
// set callback handlers
client.onConnectionLost = onConnectionLost;
client.onMessageArrived = onMessageArrived;
// connect the client
client.connect({
    useSSL: false,
    userName: "dmhetpyq",
    password: "wYYKzkFv6hH6",
    onSuccess: onConnect,
    onFailure: onFailure
});




