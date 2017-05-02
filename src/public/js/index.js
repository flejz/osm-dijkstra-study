var map, geocoder, marker, hospital, paths = [];
var request = null;

function setMapOnAll(map) {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
  }
}

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 14,
    center: {lat: -23.223701, lng: -45.900907399999994}
  });
  geocoder = new google.maps.Geocoder();

  map.addListener('click', function(location) {
    placeMarker(location.latLng)
  })

  document.getElementById('submit').addEventListener('click', function() {
    geocodeAddress();
  });
}

function geocodeAddress() {
  var address = document.getElementById('address').value;
  geocoder.geocode({'address': address}, function(results, status) {
    if (status === 'OK') {
      var location = results[0].geometry.location
      map.setCenter(location);
      placeMarker(location);
    } else {
      alert('Geocode was not successful for the following reason: ' + status);
    }
  });
}

function placeMarker(location) {

  if (request) {
    request.abort();
  }

  function clearMapMarkers() {
    if (marker) {
      marker.setMap(null)
    }
    if (hospital) {
      hospital.setMap(null)
    }
    for (var path of paths) {
      path.setMap(null)
    }
    paths = []
  }

  function zoomToResults(paths) {

    var bounds = new google.maps.LatLngBounds();
    for (var path of paths) {
      for (var coordinates of path) {
          bounds.extend(coordinates);
      }
    }
    map.fitBounds(bounds);
  }

  clearMapMarkers()

  marker = new google.maps.Marker({
    map: map,
    icon: '/assets/img/ambulance-pin.png',
    position: location
  });

  request = $.get(
    'http://localhost:3000/api/fastest?' + 'lat=' + location.lat() + '&lon=' + location.lng(),
    function(response, status) {

    hospital = new google.maps.Marker({
      map: map,
      icon: '/assets/img/hospital-pin.png',
      position: response.hospital.latLng
    });

    for (var path of response.paths) {

      paths.push(new google.maps.Polyline({
        map: map,
        path: path,
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 2
      }))
    }

    zoomToResults(response.paths)
  })
}
