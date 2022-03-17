require([
    "esri/config",
    "esri/Map",
    "esri/views/MapView",
    "esri/rest/serviceArea",
    "esri/rest/support/ServiceAreaParameters",
    "esri/rest/support/FeatureSet",
    "esri/Graphic"
    ], function(esriConfig,Map, MapView, serviceArea, ServiceAreaParams, FeatureSet, Graphic) {
    const apiKey = "AAPKb4a6ea84516a4efba14c236d8f3177fehN7FDSaoVfKQTpy_yHeUIZylKtG_AZNOX623vQN3jJaWAQuNlrFUk5ivmHUo1jbO";
    const basemapEnum = "ArcGIS:Navigation";
    const currentFacility = "33.82017702602581, -83.84221905330062";
    const map = L.map('map', {
        minZoom: 2
    }).setView([33.82017702602581, -83.84221905330062], 13); // 2989 Old Broadnax Mill Rd

    L.esri.Vector.vectorBasemapLayer(basemapEnum, {
        apiKey: apiKey
    }).addTo(map);

    // Layer Group for source point
    const startLayerGroup = L.layerGroup().addTo(map);

    // Layer Group for service area results
    const layerGroup = L.layerGroup().addTo(map);

    // Create the arcgis-rest-js authentication object to use later.
    const authentication = new arcgisRest.ApiKey({
        key: apiKey
    });

    // When the map is clicked, call the service area REST service with the
    // clicked point and display the results.
    map.on("click", (e) => {
    //window.addEventListener('load', map, (e) => {
        // Clear the previous results
        startLayerGroup.clearLayers();
        layerGroup.clearLayers();

        // Add the source point
        L.marker(e.latlng).addTo(startLayerGroup);

        // Make the API request
        arcgisRest
            .serviceArea({
                endpoint: "https://route-api.arcgis.com/arcgis/rest/services/World/ServiceAreas/NAServer/ServiceArea_World/solveServiceArea?facilites=currentFacility",
                authentication,
                facilities: [[e.latlng.lng, e.latlng.lat]]
            })
            .then((response) => {
                // Show the result route on the map.
                L.geoJSON(response.saPolygons.geoJson, {
                style: (feature) => {
                    const style = {
                    fillOpacity: 0.5,
                    weight: 1
                    }
                    if(feature.properties.FromBreak === 0) {
                        style.color = 'hsl(147, 100%, 78%)'; //Green
                        // style.color = 'hsl(210, 80%, 40%)'; //Blue
                    } else if(feature.properties.FromBreak === 5) {
                    //   } else if(feature.properties.FromBreak === 5) {
                        style.color = "hsl(56, 100%, 80%)"; //Yellow
                        // style.color = "hsl(210, 80%, 60%)"; //Blue
                    } else {
                        style.color = "hsl(0, 100%, 67%)"; //Red
                        // style.color = "hsl(210, 80%, 80%)"; //Blue
                    }
                    return style;
                    }
                }).addTo(layerGroup);
            })
            .catch((error) => {
                console.error(error);
                alert("There was a problem using the route service. See the console for details.");
            });
    });
    //Adding Search to Service Area
    const searchControl = L.esri.Geocoding.geosearch({
        position: "topright",
        placeholder: "Enter an address or place e.g. 1 York St",
        useMapBounds: false,
        providers: [L.esri.Geocoding.arcgisOnlineProvider({
            apikey: apiKey,
            nearby: {
                lat: -33.8688,
                lng: 151.2093
            },
        })]
    }).addTo(map);
    const results = L.layerGroup().addTo(map);

    searchControl.on("results", (data) => {
        results.clearLayers();
        for (let i = data.results.length - 1; i >= 0; i--) {
            const lngLatString = `${Math.round(data.results[i].latlng.lng * 100000)/100000}, ${Math.round(data.results[i].latlng.lat * 100000)/100000}`;
            const marker = L.marker(data.results[i].latlng);
            marker.bindPopup(`<b>${lngLatString}</b><p>${data.results[i].properties.LongLabel}</p>`)
            results.addLayer(marker);
            marker.openPopup();
        }
    });
});
