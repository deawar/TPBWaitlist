$(document).ready(function() {
    const customers = [];
    const geosearch = require('leaflet-geosearch');
    const { $where } = require('../../models/Customers');
    // // import
    // import { OpenStreetMapProvider } from 'leaflet-geosearch';

    // // setup
    // const provider = new OpenStreetMapProvider();

    // // search
    // const results = await provider.search({ query: input.value });

    // // import { OpenStreetMapProvider } from 'leaflet-geosearch';

    // const form = document.querySelector('form');
    // const input = form.querySelector('input[type="text"]');

    // form.addEventListener('submit', async (event) => {
    //   event.preventDefault();

    //   const results = await provider.search({ query: input.value });
    //   console.log(results); // » [{}, {}, {}, ...]
    // });

    // Creating map options
    startlat = 33.71416196
    startlon = -83.82237375
    let mapOptions = {
    center: [startlat, startlon],
    zoom: 14
    }

    // Creating a map object
    //var map = new L.map('map', mapOptions);
    let map = new GeoSearchControl({
        provider: myProvider, // required
        style: 'bar', // optional: bar|button  - default button
    }).addTo(map);

    // Creating a Layer object
    var layer = new L.TileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {attribution: 'OSM'}).addTo(map);

    // Adding layer to the map
    map.addLayer(layer);

    // Draggable Marker
    var myMarker = L.marker([startlat, startlon], {title: "Coordinates", alt: "Coordinates", draggable: true}).addTo(map).on('dragend', function() {
        var lat = myMarker.getLatLng().lat.toFixed(8);
        var lon = myMarker.getLatLng().lng.toFixed(8);
        var czoom = map.getZoom();
        if(czoom < 18) { nzoom = czoom + 2; }
        if(nzoom > 18) { nzoom = 18; }
        if(czoom != 18) { map.setView([lat,lon], nzoom); } else { map.setView([lat,lon]); }
        document.getElementById('lat').value = lat;
        document.getElementById('lon').value = lon;
        myMarker.bindPopup("Lat " + lat + "<br />Lon " + lon).openPopup();
    });

    // Choose Address Fx
    function chooseAddr(lat1, lng1) {
        myMarker.closePopup();
        map.setView([lat1, lng1],18);
        myMarker.setLatLng([lat1, lng1]);
        lat = lat1.toFixed(8);
        lon = lng1.toFixed(8);
        document.getElementById('lat').value = lat;
        document.getElementById('lon').value = lon;
        myMarker.bindPopup("Lat " + lat + "<br />Lon " + lon).openPopup();
    }

    // Find Address on click
    function myFunction(arr) {
        var out = "<br />";
        var i;

        if(arr.length > 0) {
            for(i = 0; i < arr.length; i++) {
                out += "<div class='address' title='Show Location and Coordinates' onclick='chooseAddr(" + arr[i].lat + ", " + arr[i].lon + ");return false;'>" + arr[i].display_name + "</div>";
            }
            document.getElementById('results').innerHTML = out;
        }
        else {
            document.getElementById('results').innerHTML = "Sorry, no results...";
        }

    }

    // Address Search
    function addr_search() {
        var inp = document.getElementById("addr");
        var xmlhttp = new XMLHttpRequest();
        var url = "https://nominatim.openstreetmap.org/search?format=json&limit=3&q=" + inp.value;
        xmlhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200)
            {
                var myArr = JSON.parse(this.responseText);
                myFunction(myArr);
            }
        };
        xmlhttp.open("GET", url, true);
        xmlhttp.send();
    }

    
    // Sourced from https://discourse.webflow.com/t/auto-detecting-city-from-zip-code-entry-in-a-form-field/156760
    $("#zip").keyup(function() {
        let zip_in = $(this);
        let zip_box = $('#zipbox');
        console.log('Zip Code after zip_in:', zip_in.val())
        if (zip_in.val().length < 5) {
            zip_box.removeClass('error success');
        } else if (zip_in.val().length > 5) {
            zip_box.addClass('error').removeClass('success');
        } else if(zip_in.val().length === 5) {
            
            // Make HTTP request
            $.ajax({
                url: "https://api.zippopotam.us/us/" + zip_in.val(),
                cache: false,
                dataType: "json",
                type: "GET",
                success: function(result, success) {
                    // US Zip Code Records Officially Map to only 1 Primary Location
                    places = result['places'][0];
                    console.log('places:',places);
                    $("#city").val(places['place name']);
                    //$("#state").val(places['state']);
                    $("#state").val(places['state abbreviation']);
                    zip_box.addClass('success').removeClass('error');
                },
                error: function(result, success) {
                    zip_box.removeClass('success').addClass('error');
                }
            });
        }
    });
    
    //Fx to display timestamps the way we want
    function displayDateTime(date, AddorDel) {
        if(AddorDel){ //do if true
            if(date === undefined || date === null) {
                return date = " ";
            }
            let timestamp = date.split("T");
            usdate = timestamp[0].replace(/(\d{4})\-(\d{2})\-(\d{2}).*/, '$2-$3-$1');
            return usdate;
        }
        if(date === undefined || date === null) {
            return date = " ";
        }
        let timestamp = date.split("T");
        // console.log("deleted_at:", date) // TODO: remove console.log
        let dateDeleted = timestamp[0].replace(/(\d{4})\-(\d{2})\-(\d{2}).*/, '$2-$3-$1');
        let timeDeleted = timestamp[1].replace(/(\d{2})\:(\d{2})\:(\d{2}).*/,'$1:$2:$3');
        newDeleted_at = "Time: "+ timeDeleted + " " +  "Date: " + dateDeleted;
        return newDeleted_at;
    }

    // fetch customer list from db
    fetch("/map/") 
    .then(response => {
        return response.json();
    })
    .then(data => {
        const customers = data;
        // create a list of customer address to display on map


    })
})