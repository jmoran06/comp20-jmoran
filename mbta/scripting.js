
function init()
{
     mylat = 0;
     mylong = 0;
     me = new google.maps.LatLng(mylat,mylong)
     myOptions = {
          zoom: 13,
          center: me,
          mapTypeId: google.maps.MapTypeId.ROADMAP
     };
     map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
     getMyLocation();
}

function getMyLocation() {
      if(navigator.geolocation) {
           navigator.geolocation.getCurrentPosition(function(position) {
                mylat = position.coords.latitude;
                mylong = position.coords.longitude;
                getTrainData();
           });
      }
      else {
           alert("Geolocation is not supported by your web browser");
      }
}

function renderMap()
{
     me = new google.maps.LatLng(mylat, mylong);
     map.panTo(me);
     mymarker = new google.maps.Marker({
          position: me,
          title: "Me"
     });
     mymarker.setMap(map);

     stations = [];
     stations[0] = {name: "Alewife", lat: 42.395428, long: -71.142483};
     stations[1] = {name: "Davis", lat: 42.39674, long: -71.121815};
     stations[2] = {name: "Porter Square", lat: 42.3884, long: -71.11914899999999};
     stations[3] = {name: "Harvard Square", lat: 42.373362, long: -71.118956};
     stations[4] = {name: "Central Square", lat: 42.365486, long: -71.103802};
     stations[5] = {name: "Kendall/MIT", lat: 42.36249079, long: -71.08617653};
     stations[6] = {name: "Charles/MGH", lat: 42.36116, long: -71.070628};
     stations[7] = {name: "Park Street", lat: 42.35639457, long: -71.0624242};
     stations[8] = {name: "Downtown Crossing", lat: 42.355518, long: -71.06022};
     stations[9] = {name: "South Station", lat: 42.352271, long: -71.05524200000001};
     stations[10] = {name: "Broadway", lat: 42.342622, long: -71.056967};
     stations[11] = {name: "Andrew", lat: 42.330154, long: -71.057655};
     stations[12] = {name: "JFK/Umass", lat: 42.320685, long: -71.052391};
     stations[13] = {name: "Savin Hill", lat: 42.31129, long: -71.053331};
     stations[14] = {name: "Fields Corner", lat: 42.300093, long: -71.061667};
     stations[15] = {name: "Shawmut", lat: 42.29312583, long: -71.06573796000001};
     stations[16] = {name: "Ashmont", lat: 42.284652, long: -71.06448899999999};
     stations[17] = {name: "North Quincy", lat: 42.275275, long: -71.029583};
     stations[18] = {name: "Wollaston", lat: 42.2665139, long: -71.0203369};
     stations[19] = {name: "Quincy Center", lat: 42.251809, long: -71.005409};
     stations[20] = {name: "Quincy Adams", lat: 42.233391, long: -71.007153};
     stations[21] = {name: "Braintree", lat: 42.2078543, long: -71.0011385};
     var closest_dist = -1
     var closest_station = -1
     for(var i = 0; i < stations.length; i++) {
          var stlat = stations[i]["lat"];
          var long = stations[i]["long"];
          var pos = new google.maps.LatLng(stlat, long);
          var marker = new google.maps.Marker({
               position: pos,
               map: map,
               title: stations[i]["name"],
               icon: 'smallmbta.ico',
          });
          marker.setMap(map);
          var dist_to_me = haversineDistance([stlat,
          long], [mylat, mylong], true);
          if (closest_dist < 0 || dist_to_me < closest_dist) {
               closest_dist = dist_to_me;
               closest_station = i;
          }
          if (stations[i]["name"] != "Braintree") {
               nextlat = stations[i+1]["lat"];
               nextlong = stations[i+1]["long"];
          }
          if(stations[i]["name"] == "JFK/Umass"){
               otherlat = stations[i+5]["lat"];
               otherlong = stations[i+5]["long"];
               path2 = new google.maps.Polyline({
                    path: [{lat: stlat, lng: long}, {lat: otherlat, lng: otherlong}],
                    geodesic: true,
                    strokeColor: '#FF0000',
                    strokeOpacity: 1.0,
                    strokeWeight: 4
               });
               path2.setMap(map);
          }
          if (stations[i]["name"] !== "Ashmont" && stations[i]["name"] !== "Braintree") {
               path = new google.maps.Polyline({
                    path: [{lat: stlat, lng: long}, {lat: nextlat, lng: nextlong}],
                    geodesic: true,
                    strokeColor: '#FF0000',
                    strokeOpacity: 1.0,
                    strokeWeight: 4
               });
               path.setMap(map);
          }
          createInfoWindow(stations[i], marker);
     }
     closestlat = stations[closest_station]["lat"];
     closestlong = stations[closest_station]["long"];
     path = new google.maps.Polyline({
          path: [{lat: mylat, lng: mylong}, {lat: closestlat, lng: closestlong}],
          geodesic: true,
          strokecolor: '#0000FF',
          strokeOpacity: 1.0,
          strokeWeight: 4
     });
     path.setMap(map);
     infowindow = new google.maps.InfoWindow();
     google.maps.event.addListener(mymarker, 'click', function() {
          infowindow.setContent("Closest Station: " + stations[closest_station]["name"] +
               "<br/> Distance from you: " + closest_dist + " miles.");
          infowindow.open(map, this);
          map.panTo(this.position);
     });

}

function createInfoWindow(station, statmarker) {
     trainInfo = "Trip ID, Destination, Time Until Arriving (seconds). <br/>";
     for(var i = 0; i < (trainData["TripList"]["Trips"]).length; i++) {
          trip = trainData["TripList"]["Trips"][i];
          tripID = trip["TripID"];
          dest = trip["Destination"];
          for(j = 0; j < (trip["Predictions"]).length; j++) {
               if (trip["Predictions"][j]["Stop"] == station["name"]) {
                    seconds = trip["Predictions"][j]["Seconds"]
                    var trainInfo = trainInfo + tripID + ", " + dest + ", " + seconds + ". <br/>";
               }
          }
     }
     var infowindow = new google.maps.InfoWindow();
     console.log(trainInfo);
     google.maps.event.addListener(statmarker, 'click', function() {
          infowindow.setContent(station["name"] + " <br/> " + trainInfo);
          infowindow.open(map, this);
          map.panTo(this.position);
     });
}

function getTrainData() {
     var raw_data;
     var parsed_data;
     request = new XMLHttpRequest();
     request.open("get", "https://rocky-taiga-26352.herokuapp.com/redline.json", true);
     request.onreadystatechange = function() {
          if(request.readyState == 4 && request.status == 200) {
               raw_data = request.responseText;
               trainData = JSON.parse(raw_data);
               renderMap();
          }
     };
     request.send();
}
function haversineDistance(location1, location2, miles) {
     function toRad(x) {
       return x * Math.PI / 180;
     }
     var lon1 = location1[0];
     var lat1 = location1[1];
     var lon2 = location2[0];
     var lat2 = location2[1];
     var R = 6371; // km
     var x1 = lat2 - lat1;
     var dLat = toRad(x1);
     var x2 = lon2 - lon1;
     var dLon = toRad(x2);
     var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *  Math.sin(dLon / 2) * Math.sin(dLon / 2);
     var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
     var d = R * c;
     if(miles) {
          d = d / 1.60934
     };
     return d.toFixed(4);
}
