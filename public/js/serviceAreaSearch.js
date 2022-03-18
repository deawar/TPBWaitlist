require([
    "esri/config",
    "esri/Map",
    "esri/views/MapView",
    "esri/rest/serviceArea",
    "esri/rest/support/ServiceAreaParameters",
    "esri/rest/support/FeatureSet",
    "esri/Graphic",
    "esri/layers/GraphicsLayer",
    "esri/widgets/Search"
  ], function(esriConfig,Map, MapView, serviceArea, ServiceAreaParams, FeatureSet, Graphic, GraphicsLayer, Search) {

  esriConfig.apiKey = "A_Key_That_Should_Not_Be_Public";

    const map = new Map({
      basemap: "arcgis-navigation"
      //basemap: "arcgis-topographic"
    });

    const view = new MapView({
      map: map,
      center: [-83.84221905330062, 33.82017702602581], // Longitude, latitude Old Broadnax Mill Rd, Loganville, GA
      zoom: 13, // Zoom level
      //container: "viewDiv" // Div element
      container: "map"
    });
    
    const marker = {
      type: "picture-marker",
      url: "https://tpbwaitlist.ssccbogart.info/assets/Truck.svg",
      width: 794,
      height: 1123
    };

    const search = new Search({  //Add Search widget
      view: view
    });
    
    view.ui.add(search, "top-right"); //Add to the map
    
    const serviceAreaUrl = "https://route-api.arcgis.com/arcgis/rest/services/World/ServiceAreas/NAServer/ServiceArea_World/solveServiceArea";
    
    view.on("click", function(event){
      const locationGraphic = createGraphic(event.mapPoint);
      const driveTimeCutoffs = [15,25,35]; // Minutes
      const serviceAreaParams = createServiceAreaParams(locationGraphic, driveTimeCutoffs, view.spatialReference);
      solveServiceArea(serviceAreaUrl, serviceAreaParams);
    });
    
    // Create the location graphic
    function createGraphic(point) {
      view.graphics.removeAll();
      const graphic = new Graphic({
        geometry: point,
        symbol: {
          type: "simple-marker",
          //type: "pushpin-marker"
          color: "blue",
          size: 8
        }
    });

      view.graphics.add(graphic);
      return graphic;
    }
    
    function createServiceAreaParams(locationGraphic, driveTimeCutoffs, outSpatialReference) {
      
      // Create one or more locations (facilities) to solve for
      const featureSet = new FeatureSet({
        features: [locationGraphic]
      });
      
      // Set all of the input parameters for the service
      const taskParameters = new ServiceAreaParams({
        facilities: featureSet,
        defaultBreaks: driveTimeCutoffs,
        trimOuterPolygon: true,
        outSpatialReference: outSpatialReference
      });
      return taskParameters;

    }
    
    function solveServiceArea(url, serviceAreaParams) {
      return serviceArea.solve(url, serviceAreaParams)
        .then(function(result){
          if (result.serviceAreaPolygons.length) {
            // Draw each service area polygon
            result.serviceAreaPolygons.forEach(function(graphic){
              graphic.symbol = {
                type: "simple-fill",
                color: "rgba(255,50,50, .25)"
              }
            //   if(serviceAreaParams.driveTimeCutoffs[0] === 15) {
            //     graphic.symbol.color = 'hsl(147, 100%, 78%)'; //Green
            //   } else if(serviceAreaParams.driveTimeCutoffs[1] === 25) {
            //     graphic.symbol.color = "hsl(56, 100%, 80%)"; //Yellow
            //   } else {
            //     graphic.symbol.color = "hsl(0, 100%, 67%)"; //Red
            //   }
            //   return graphic;
              console.log('graphic.symbol.color:',graphic.symbol.color);
              console.log('serviceAreaParams.driveTimeCutoffs:', serviceAreaParams.driveTimeCutoffs)
              view.graphics.add(graphic,0);
            });
          }
        }, function(error){
          console.log(error);
        });

    }
    
});