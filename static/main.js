var map;
var car_images = ['http://d1a3f4spazzrp4.cloudfront.net/car-types/mono/mono-uberx.png','http://d1a3f4spazzrp4.cloudfront.net/car-types/mono/mono-black.png','http://d1a3f4spazzrp4.cloudfront.net/car-types/mono/mono-uberxl2.png','http://d1a3f4spazzrp4.cloudfront.net/car-types/mono/mono-suv.png','http://d1a3f4spazzrp4.cloudfront.net/car-types/mono/mono-ubergo.png'];
var dest_location = [12.861452,77.664708],
    latitude, longitude, times, prices;


/**
* Launch Uber to complete the cab booking process. Open app, if installed, otherwise open mobile web.
*/

function launch_uber(src_lat, src_lng, pid)
{

  var client_id = "wnMlGUS4pAyj_6Kwuwyyq1C_N_R-nu7S",
    dest_latitude = dest_location[0],
    dest_longitude = dest_location[1],
    dest_nick = "PESIT Bangalore South Campus",
    dest_address = "PES Institute of Technology South Campus, Electronics City, Hosur Road, Bangalore - 560100",
    product_id = pid,
    app_link,
    web_link,
    androidIntentURI;

  app_link = "uber://?client_id=" + client_id + "&action=setPickup&pickup=my_location&pickup[nickname]=My%20Location&dropoff[latitude]=" + dest_latitude + "&dropoff[longitude]=" + dest_longitude + "&dropoff[nickname]=" + encodeURIComponent(dest_nick) + "&dropoff[formatted_address]=" + encodeURIComponent(dest_address) + "&product_id=" + product_id;
  web_link = "https://m.uber.com/sign-up?client_id=" + client_id + "&country_code=in&mobile_country_code=%2B91&product_id=" + product_id + "&pickup_latitude=" + src_lat + "&pickup_longitude=" + src_lng + "&pickup_nickname=My%20Location&dropoff_latitude=" + dest_latitude + "&dropoff_longitude=" + dest_longitude + "&dropoff_nickname=" + dest_nick + "&dropoff_address=" + dest_address;
  androidIntentURI = "intent://?client_id=" + client_id + "&action=setPickup&pickup=my_location&pickup[nickname]=My%20Location&dropoff[latitude]=" + dest_latitude + "&dropoff[longitude]=" + dest_longitude + "&dropoff[nickname]=" + encodeURIComponent(dest_nick) + "&dropoff[formatted_address]=" + encodeURIComponent(dest_address) + "&product_id=" + product_id + "/#Intent;package=com.ubercab;category=BROWSABLE;end";

  var isiOS = navigator.userAgent.match('iPad') || navigator.userAgent.match('iPhone') || navigator.userAgent.match('iPod'),
      isAndroid = navigator.userAgent.match('Android'),
      isAndroidChrome = navigator.userAgent.toLowerCase().match('chrome') && navigator.userAgent.toLowerCase().match('mobile');

  if (isAndroidChrome) {
    window.location = "{{ androidIntentURI }}";
  }
  else if (isiOS || isAndroid) {
    document.getElementById('loader').src = app_link;
  }

  window.setTimeout(function (){ window.location.replace(web_link); }, 1);

}


/** 
* Get current location and display list of available cars
*/ 

function getLocation()
{
  $('.fa-location-arrow').removeClass('fa-location-arrow').addClass('fa-spinner fa-spin');

  // Begin GMaps.geolocate

  GMaps.geolocate({     
    success: function(position) {

      latitude = Math.round(position.coords.latitude*1000000)/1000000;
      longitude = Math.round(position.coords.longitude*1000000)/1000000;
      map.setCenter((latitude+dest_location[0])/2, (longitude+dest_location[1])/2);
      map.setZoom(15);
      map.removeMarkers();
      map.addMarker({
        lat: latitude,
        lng: longitude,
        title: latitude + ', ' + longitude,
        infoWindow: {
          content: '<p>You are here.</p>'
        }
      });
      map.addMarker({
        lat: dest_location[0],
        lng: dest_location[1],
        title: "PESIT BSC",
        infoWindow: {
          content: '<p>PESIT Bangalore South Campus.</p>'
        }
      });
      map.drawRoute({
        origin: [latitude, longitude],
        destination: dest_location,
        travelMode: 'driving',
        strokeColor: '#131540',
        strokeOpacity: 0.6,
        strokeWeight: 6
      });

      // Adjust zoom to fit the route

      var latlngs = [{lat:latitude, lng:longitude}, {lat:dest_location[0], lng:dest_location[1]}];
      var bounds = [];
      for (var i in latlngs) {
        var latlng = new google.maps.LatLng(latlngs[i].lat, latlngs[i].lng);
        bounds.push(latlng);
      }
      map.fitLatLngBounds(bounds);

      $.when(

          $.get(window.location.protocol + '//' + window.location.host + '/eta/'+latitude+'/'+longitude,function(t) {
            times = JSON.parse(t);
          }),

          $.get(window.location.protocol + '//' + window.location.host + '/price/'+latitude+'/'+longitude,function(p) {
            prices = JSON.parse(p);
          })

        ).then(function() {
          $('.fa-spinner').removeClass('fa-spinner fa-spin').addClass('fa-location-arrow');
          
          var car_list = times.times,
              price_list = prices.prices,
              price_object = {},
              duration_object = {};

          price_list.forEach(function (el,index,arr) {
            price_object[el.display_name] = el.estimate;
            duration_object[el.display_name] = el.duration;
          });


          if (car_list.length > 0)
          {
            var result = '',
              distance = Math.round(price_list[0].distance*1.6*10)/10;

            result = result + '<h3>Available cars</h3>';
            result = result + '<div class="table-responsive"><table class="table table-striped"><thead><tr><th>Car Type</th><th></th><th>ETA</th><th>Est. Duration</th><th>Est. Price</th><th></th></tr></thead><tbody>';
            
            for (var i=0; i < car_list.length; i++)
            {
              var car_name = car_list[i].display_name,
                car_image_url,
                car_eta = Math.ceil(car_list[i].estimate/60),
                est_duration,
                est_price;

              if (car_name == 'uberX') {
                car_image_url = car_images[0];
                est_price = price_object[car_name];
                est_duration = Math.round(duration_object[car_name]/60);
              }
              else if (car_name == 'UberBLACK') {
                car_image_url = car_images[1];
                est_price = price_object[car_name];
                est_duration = Math.round(duration_object[car_name]/60);
              }
              else if (car_name == 'uberXL') {
                car_image_url = car_images[2];
                est_price = price_object[car_name];
                est_duration = Math.round(duration_object[car_name]/60);
              }
              else if (car_name == 'UberSUV') {
                car_image_url = car_images[3];
                est_price = price_object[car_name];
                est_duration = Math.round(duration_object[car_name]/60);
              }
              else if (car_name == 'UberGO' || car_name == 'uberGO') {
                car_image_url = car_images[4];
                est_price = price_object[car_name];
                est_duration = Math.round(duration_object[car_name]/60);
              }

              result = result + '<tr><td>' + car_name + '</td><td><img src="' + car_image_url +'" /></td><td>' + car_eta + ' min</td><td>' + est_duration + ' min</td><td>' + est_price + '</td>';
              result = result + '<td><button class=\'btns btn-md book-now\' onclick="launch_uber(\'' + latitude + '\',\'' + longitude + '\',\'' + car_list[i].product_id + '\')">Book now</button></td></tr>';
            }

            result = result + '</tbody></table><p><strong>Total distance: </strong>' + distance + ' km</p></div>'; 
            $(result).appendTo('#info').fadeIn('normal');
            $('html, body').animate({scrollTop: $("#info").offset().top}, 1000);

          }
          else {
            $('<p>Sorry, no cars available at present.</p>').appendTo('#info').fadeIn('normal');
            $('html, body').animate({scrollTop: $("#info").offset().top}, 1000);
          }

        });

      
    },     
    error: function(error){    
      alert('Geolocation failed: ' + error.message);
      $('.fa-spinner').removeClass('fa-spinner fa-spin').addClass('fa-location-arrow');   
    },     
    not_supported: function(){    
      alert("Your browser does not support geolocation");
      $('.fa-spinner').removeClass('fa-spinner fa-spin').addClass('fa-location-arrow');     
    },     
    always: function(){    
    }    
  });

  // End GMaps.Geolocate

}

/** 
* Refresh the list of cars, using the same location
*/

function refreshCars()
{
  $('.fa-refresh').addClass('fa-spin');

  var myNode = document.getElementById("info");
  while (myNode.firstChild) {
      myNode.removeChild(myNode.firstChild);
  }

  $.when(

    $.get(window.location.protocol + '//' + window.location.host + '/eta/'+latitude+'/'+longitude,function(t) {
      times = JSON.parse(t);
    }),

    $.get(window.location.protocol + '//' + window.location.host + '/price/'+latitude+'/'+longitude,function(p) {
      prices = JSON.parse(p);
    })

  ).then(function() {
    $('.fa-refresh').removeClass('fa-spin');
    
    var car_list = times.times,
        price_list = prices.prices,
        price_object = {},
        duration_object = {};

    price_list.forEach(function (el,index,arr) {
      price_object[el.display_name] = el.estimate;
      duration_object[el.display_name] = el.duration;
    });


    if (car_list.length > 0)
    {
      var result = '',
        distance = Math.round(price_list[0].distance*1.6*10)/10;

      result = result + '<h3>Available cars</h3>';
      result = result + '<div class="table-responsive"><table class="table table-striped"><thead><tr><th>Car Type</th><th></th><th>ETA</th><th>Est. Duration</th><th>Est. Price</th><th></th></tr></thead><tbody>';
      
      for (var i=0; i < car_list.length; i++)
      {
        var car_name = car_list[i].display_name,
          car_image_url,
          car_eta = Math.ceil(car_list[i].estimate/60),
          est_duration,
          est_price;

        if (car_name == 'uberX') {
          car_image_url = car_images[0];
          est_price = price_object[car_name];
          est_duration = Math.round(duration_object[car_name]/60);
        }
        else if (car_name == 'UberBLACK') {
          car_image_url = car_images[1];
          est_price = price_object[car_name];
          est_duration = Math.round(duration_object[car_name]/60);
        }
        else if (car_name == 'uberXL') {
          car_image_url = car_images[2];
          est_price = price_object[car_name];
          est_duration = Math.round(duration_object[car_name]/60);
        }
        else if (car_name == 'UberSUV') {
          car_image_url = car_images[3];
          est_price = price_object[car_name];
          est_duration = Math.round(duration_object[car_name]/60);
        }
        else if (car_name == 'UberGO' || car_name == 'uberGO') {
          car_image_url = car_images[4];
          est_price = price_object[car_name];
          est_duration = Math.round(duration_object[car_name]/60);
        }

        result = result + '<tr><td>' + car_name + '</td><td><img src="' + car_image_url +'" /></td><td>' + car_eta + ' min</td><td>' + est_duration + ' min</td><td>' + est_price + '</td>';
        result = result + '<td><button class=\'btns btn-md book-now\' onclick="launch_uber(\'' + latitude + '\',\'' + longitude + '\',\'' + car_list[i].product_id + '\')">Book now</button></td></tr>';
      }

      result = result + '</tbody></table><p><strong>Total distance: </strong>' + distance + ' km</p></div>'; 
      $(result).appendTo('#info').fadeIn('normal');
      $('html, body').animate({scrollTop: $("#info").offset().top}, 1000);

    }
    else {
      $('<p>Sorry, no cars available at present.</p>').appendTo('#info').fadeIn('normal');
      $('html, body').animate({scrollTop: $("#info").offset().top}, 1000);
    }

  });
  
}


$(document).ready(function(){
map = new GMaps({
  div: '#map',
  lat: 12.946550,
  lng: 77.600615,
  zoom: 10,
  scrollwheel: false,
  draggable: false
});
map.addMarker({
  lat: dest_location[0],
  lng: dest_location[1],
  title: "PESIT BSC",
  infoWindow: {
    content: '<p>PESIT Bangalore South Campus.</p>'
  }
});
(map.markers[0].infoWindow).open(map.map,map.markers[0]);

var styles = [{"featureType":"landscape","stylers":[{"hue":"#FFBB00"},{"saturation":43.400000000000006},{"lightness":37.599999999999994},{"gamma":1}]},{"featureType":"road.highway","stylers":[{"hue":"#FFC200"},{"saturation":-61.8},{"lightness":45.599999999999994},{"gamma":1}]},{"featureType":"road.arterial","stylers":[{"hue":"#FF0300"},{"saturation":-100},{"lightness":51.19999999999999},{"gamma":1}]},{"featureType":"road.local","stylers":[{"hue":"#FF0300"},{"saturation":-100},{"lightness":52},{"gamma":1}]},{"featureType":"water","stylers":[{"hue":"#0078FF"},{"saturation":-13.200000000000003},{"lightness":2.4000000000000057},{"gamma":1}]},{"featureType":"poi","stylers":[{"hue":"#00FF6A"},{"saturation":-1.0989010989011234},{"lightness":11.200000000000017},{"gamma":1}]}];

map.addStyle({
  styledMapName:"Styled Map",
  styles: styles,
  mapTypeId: "light-dream"
});
map.setStyle("light-dream");

});