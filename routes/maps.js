const express = require('express');
const router = express.Router();
const passport = require('passport');
const mongoose = require('mongoose');
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
const os = require('os');

const esriConfig = import("@arcgis/core/config.js");
//const esriConfig = require('esriConfig');
esriConfig.assetsPath = "node_modules/@arcgis/core/assets"; // relative to when running in root
const PORT = process.env.PORT
const mapAPIKey = process.env.ArcGis_API_Key
const basemapEnum = "ArcGIS:Navigation";

// To Load Host the app is working on
const hostname = os.hostname();


// Maps Page  ensureAuthenticated, 
router.get('/', ensureAuthenticated, (req, res) => {
    const map = L.map('map',  {
        minZoom: 2
    }).setView([33.82017702602581, -83.84221905330062], 13);

    L.esri.Vector.vectorBasemapLayer(basemapEnum, {
        apiKey: mapAPIKey
    }).addTo(map);

    res.render('map', {
    user: req.user
    })

    .catch(err =>  {
        console.log(err);
        res.status(500).json({
            error: err
        });
    })
});

module.exports = router;