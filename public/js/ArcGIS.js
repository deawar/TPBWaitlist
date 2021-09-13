const apiKey = "AAPKb4a6ea84516a4efba14c236d8f3177fehN7FDSaoVfKQTpy_yHeUIZylKtG_AZNOX623vQN3jJaWAQuNlrFUk5ivmHUo1jbO";
const basemapEnum = "ArcGIS:Navigation";

const map = L.map('map', {
  minZoom: 2
}).setView([33.82017702602581, -83.84221905330062], 13);

L.esri.Vector.vectorBasemapLayer(basemapEnum, {
  apiKey: apiKey
}).addTo(map);

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