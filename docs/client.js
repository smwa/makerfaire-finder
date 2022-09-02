var faires = [];

var userLocation = null;

var isMetric = true;

$(function() {
  $.get('./faires.json', function(data) {
    
    faires = data.Locations;
    
    populateTable(faires, userLocation);
  });

  
    $.ajax({
          url: "https://get.geojs.io/v1/ip/geo.js",
          jsonpCallback: "geoip",
          dataType: "jsonp",
          success: function( location ) {
            userLocation = location;
            if (location.country == "United States") {
              isMetric = false;
            }
            populateTable(faires, userLocation);
          },
          complete: function() {
            if (navigator.geolocation && (!userLocation || userLocation.accuracy >= 50)) {
              navigator.geolocation.getCurrentPosition(useGpsLocation);
            }
          }
      });
  
  

});

function useGpsLocation(position) {
  userLocation = position.coords;
  populateTable(faires, userLocation);
}

function populateTable(locations, userLocation) {

  locations = locations.filter((location) => {
    var dt = new Date(location.event_start_dt);
    var today = new Date();
    var timeDiff = dt.getTime() - today.getTime();
    var daysFromNow = Math.ceil(timeDiff / (1000 * 3600 * 24));

    return daysFromNow >= 0;
  });
  
  if (userLocation) {
    locations.forEach(function(location) {
      location.distanceFromMe = getDistanceFromLatLonInKm(userLocation.latitude, userLocation.longitude, location.lat, location.lng);
    });
    locations.sort(function(left, right) {
      return left.distanceFromMe - right.distanceFromMe;
    });
  }
  
  var toShow = locations.slice(0,10); //top 10
  
  var $table = $("#locations > table");
  
  $table.find("tr").each(function() {
    if (this.id != "tableHeaderRow") {
      this.remove();
    }
  });
  
  toShow.forEach(function(location) {
    var distance = "Unknown";
    if (userLocation) {
      if (isMetric) {
        distance = Math.round(location.distanceFromMe, 0) + "km";
      }
      else {
        distance = Math.round(location.distanceFromMe * 0.621371, 0) + " miles";
      }
    }
    var dt = new Date(location.event_start_dt);
    var today = new Date();
    var timeDiff = dt.getTime() - today.getTime();
    var daysFromNow = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    $table.append("<tr><td>"+location.name+"</td><td>"+location.event_start_dt.substring(0,10)+"</td><td>"+daysFromNow+"</td><td>"+distance+"</td><td>"+location.event_type+"</td></tr>");
  });
}

function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}
