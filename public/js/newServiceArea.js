require([
    "esri/portal/Portal",
    "esri/identity/OAuthInfo",
    "esri/identity/IdentityManager",
    "esri/config",
    "esri/Map",
    "esri/views/MapView",
    "esri/rest/serviceArea",
    "esri/rest/support/ServiceAreaParameters",
    "esri/rest/support/FeatureSet",
    "esri/Graphic",
    "esri/widgets/Search"
  ], function(Portal, OAuthInfo, esriId, esriConfig, Map, MapView, serviceArea, ServiceAreaParams, FeatureSet, Graphic, Search) {

const info = new OAuthInfo({
    appId: "7hkJrw8TQi0fekCj",
    popup: false // the default
    });
    esriId.registerOAuthInfos([info]);
    
    esriId
    .checkSignInStatus(info.portalUrl + "/sharing")
    .then(() => {
        handleSignedIn();
    })
    .catch(() => {
        handleSignedOut();

    });

    document.getElementById("sign-in").addEventListener("click", function () {
        esriId.getCredential(info.portalUrl + "/sharing");
    });
    
    document.getElementById("sign-out").addEventListener("click", function () {
        esriId.destroyCredentials();
        window.location.reload();
    });

    function handleSignedIn() {

        const portal = new Portal();
        portal.load().then(() => {
            const results = { name: portal.user.fullName, username: portal.user.username };
            document.getElementById("results").innerText = JSON.stringify(results, null, 2);
        });
    }

    function handleSignedOut() {
        document.getElementById("results").innerText = 'Signed Out'
    }

    const map = new Map({
      basemap: "arcgis-navigation"
    });

    const view = new MapView({
      container: "viewDiv",
      map: map,
      center: [-83.84221905330062, 33.82017702602581], //Longitude, latitude
      zoom: 11
    });

    const search = new Search({  //Add Search widget
      view: view
    });
    
    view.ui.add(search, "top-right"); //Add to the map
    
    const serviceAreaUrl = "https://route-api.arcgis.com/arcgis/rest/services/World/ServiceAreas/NAServer/ServiceArea_World/solveServiceArea";
    
    view.on("click", function(event){
      const locationGraphic = createGraphic(event.mapPoint);
      const driveTimeCutoffs = [5,10,15,20,25]; // Minutes
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
                  console.log("result.serviceAreaPolygons: ", result.serviceAreaPolygons);
                  if(result.serviceAreaPolygons[0]){
                    graphic.symbol = {
                      type: "simple-fill",
                      color: "rgba(71, 153, 235, .1)"
                    }
                  }else if(result.serviceAreaPolygons[1]){
                    graphic.symbol = {
                      type: "simple-fill",
                      color: "rgba(0, 255, 149, .10)"
                    }
                  }else if(result.serviceAreaPolygons[2]){
                    graphic.symbol = {
                      type: "simple-fill",
                      color: "rgba(0, 255, 21, .10)"
                    }
                  }else if(result.serviceAreaPolygons[3]){
                    graphic.symbol = {
                      type: "simple-fill",
                      color: "rgba(98, 255, 0, .15)"
                    }
                  }else if(result.serviceAreaPolygons[4]){
                    graphic.symbol = {
                      type: "simple-fill",
                      color: "rgba(255, 145, 0, .15)"
                    }
                  }else if(result.serviceAreaPolygons.length === 25){
                    graphic.symbol = {
                        type: "simple-fill",
                        color: "rgba(255,50,50,.15)"
                    }
                  }
                  view.graphics.add(graphic,0);
                });
            }
        }, function(error){
            console.log(error);
        });

    }

});