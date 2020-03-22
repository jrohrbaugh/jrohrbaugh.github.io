var directionDisplay;
var directionsService;
var map;
var polyline = null;

function createMarker(latlng, label, html) {
  console.log('creating marker');
  console.log(latlng);
  // alert("createMarker("+latlng+","+label+","+html+","+color+")");
  var contentString = '<b>' + label + '</b><br>' + html;
  var marker = new google.maps.Marker({
    position: latlng,
    map: map,
    title: label,
    zIndex: Math.round(latlng.lat() * -100000) << 5
  });
  marker.myname = label;
  // gmarkers.push(marker);

  google.maps.event.addListener(marker, 'click', function() {
    infowindow.setContent(contentString);
    infowindow.open(map, marker);
  });
  return marker;
}

document.addEventListener("DOMContentLoaded", () => {   console.log("DOM content has loaded")
  let url = "https://whispering-dawn-32766.herokuapp.com/steps_maps"
  fetch (url).then(resp => resp.json()).then(stepsData => {
    console.log(stepsData);
    initialize(stepsData);
  });
 });

function initialize(stepsData) {
  directionsService = new google.maps.DirectionsService();
  directionsDisplay = new google.maps.DirectionsRenderer({
    suppressMarkers: true
  });
  var chicago = new google.maps.LatLng(41.850033, -87.6500523);
  var myOptions = {
    zoom: 6,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    center: chicago
  }
  map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
  polyline = new google.maps.Polyline({
    path: [],
    strokeColor: '#FF0000',
    strokeWeight: 3
  });
  directionsDisplay.setMap(map);
  calcRoute(stepsData);
}

function calcRoute(stepsData) {

  var start = stepsData.starting_location;
  var end = stepsData.ending_location;
  var travelMode = google.maps.DirectionsTravelMode.DRIVING;
  var milesToMetres = 1609.34;
  var distanceTraveled = stepsData.distance_traveled * milesToMetres;

  $('#totalSteps').html('Total Steps: ' + stepsData.total_steps.toString());
  $('#stepsToday').html('Steps Today: ' + stepsData.steps_today.toString());
  $('#stepsTodayExpected').html('Steps Today (estimated): ' + stepsData.steps_today_estimate.toString());
  $('#stepsYesterday').html('Steps Yesterday: ' + stepsData.steps_yesterday.toString());
  $('#distanceTraveled').html('Miles Traveled: ' + stepsData.distance_traveled.toString());
  $('#distanceTraveledToday').html('Miles Today: ' + stepsData.distance_traveled_today.toString());
  $('#distanceRemaining').html('Miles Remaining: ' + stepsData.distance_remaining.toString());


  var request = {
    origin: start,
    destination: end,
    travelMode: travelMode
  };
  directionsService.route(request, function(response, status) {
    if (status == google.maps.DirectionsStatus.OK) {
      polyline.setPath([]);
      var bounds = new google.maps.LatLngBounds();
      startLocation = new Object();
      endLocation = new Object();
      directionsDisplay.setDirections(response);
      var route = response.routes[0];
      var summaryPanel = document.getElementById("directions_panel");
      summaryPanel.innerHTML = "";

      // For each route, display summary information.
      var path = response.routes[0].overview_path;
      var legs = response.routes[0].legs;
      for (i = 0; i < legs.length; i++) {
        if (i == 0) {
          startLocation.latlng = legs[i].start_location;
          startLocation.address = legs[i].start_address;
          // marker = google.maps.Marker({map:map,position: startLocation.latlng});
          marker = createMarker(legs[i].start_location, "start", legs[i].start_address, "green");
        }
        endLocation.latlng = legs[i].end_location;
        endLocation.address = legs[i].end_address;
        var steps = legs[i].steps;
        for (j = 0; j < steps.length; j++) {
          var nextSegment = steps[j].path;
          for (k = 0; k < nextSegment.length; k++) {
            polyline.getPath().push(nextSegment[k]);
            bounds.extend(nextSegment[k]);
          }
        }
      }

      polyline.setMap(map);

      computeTotalDistance(response);
      putMarkerOnRoute(distanceTraveled);
    } else {
      alert("directions response " + status);
    }
  });
}

var totalDist = 0;
var totalTime = 0;

function computeTotalDistance(result) {
  totalDist = 0;
  totalTime = 0;
  var myroute = result.routes[0];
  for (i = 0; i < myroute.legs.length; i++) {
    totalDist += myroute.legs[i].distance.value;
    totalTime += myroute.legs[i].duration.value;
  }
  totalDist = totalDist / 1000.
  // document.getElementById("total").innerHTML = "total distance is: " + totalDist + " km<br>total time is: " + (totalTime / 60).toFixed(2) + " minutes";
  // document.getElementById("totalTime").value = (totalTime / 60.).toFixed(2);
}

function putMarkerOnRoute(distance) {
  // alert("Time:"+time+" totalTime:"+totalTime+" totalDist:"+totalDist+" dist:"+distance);
  if (!marker) {
    marker = createMarker(polyline.GetPointAtDistance(distance), "distance: " + distance, "marker");
  } else {
    console.log('putMark');
    console.log(distance);
    console.log(polyline.GetPointAtDistance(distance))
    marker.setPosition(polyline.GetPointAtDistance(distance));
    marker.setTitle("distance:" + distance);
  }
}