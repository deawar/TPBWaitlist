const express = require('express');
const router = express.Router();
const app = express();
const passport = require('passport');
const session = require("express-session");
const FileStore = require("session-file-store")(session);
const mongoose = require('mongoose');
// Load Waitlist model
const Customers = require('../models/Customers');
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
const os = require('os');
const CLIENT_ID = process.env.ARCGIS_CLIENT_ID;
const CLIENT_SECRET = process.env.ARCGIS_CLIENT_SECRET;
const SESSION_SECRET = process.env.SESSION_SECRET;
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const PORT = process.env.PORT;
// To Load Host the app is working on
const hostname = os.hostname();
const REDIRECT_URI = process.env.REDIRECT_URI
//const REDIRECT_URI = `https://tpbwaitlist.ssccbogart.info/maps/authenticate`;
//const REDIRECT_URI = `http://localhost:${PORT}/maps/authenticate`;
const ARCGIS_URL = "https://www.arcgis.com/sharing/rest/oauth2/token";
const ARCGIS_ONLINE_GEOCODING_URL = "https://geocode-api.arcgis.com/arcgis/rest/services/World/GeocodeServer/";
const ARCGIS_ONLINE_BULK_GEOCODING_URL = "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/";
const serviceAreaUrl = "https://route-api.arcgis.com/arcgis/rest/services/World/ServiceAreas/NAServer/ServiceArea_World/solveServiceArea";
require('cross-fetch/polyfill');
const FormData = require("isomorphic-form-data");
const { UserSession } = require("@esri/arcgis-rest-auth");
const { ApplicationSession } = require("@esri/arcgis-rest-auth");
const { request } = require("@esri/arcgis-rest-request");

// const { CLIENT_ID, SESSION_SECRET, ENCRYPTION_KEY, REDIRECT_URI } = require("./config.json");
const credentials = {
    clientId: CLIENT_ID,
    redirectUri: REDIRECT_URI
};

const authentication = new ApplicationSession({
    clientId: CLIENT_ID,
    clientSecret: CLIENT_SECRET
});

// url not accessible to anonymous users
const url = `https://route-api.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World`

//token will be appended by rest-js
request(url, {
    authentication
});


app.use(
    session({
        name: "ArcGIS REST JS server authentication for TPBWaitlist",
        secret: SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 2592000000 // 30 days in milliseconds
        },

        store: new FileStore({
            ttl: 2592000000 / 1000, // 30 days in seconds
            retries: 1,
            secret: ENCRYPTION_KEY,

            encoder: (sessionObj) => {
                // sessionObj is an object or string representing the session information
                if (typeof sessionObj.userSession !== "string") {
                sessionObj.userSession = sessionObj.userSession.serialize();
                }

                return JSON.stringify(sessionObj);
            },
            decoder: (sessionContents) => {
                // sessionContents is the full content of the session on
                if (!sessionContents) {
                    return { userSession: null };
                }

                const sessionObj = typeof sessionContents === "string" ? JSON.parse(sessionContents) : sessionContents;

                if (typeof sessionObj.userSession === "string") {
                    sessionObj.userSession = UserSession.deserialize(sessionObj.userSession);
                }

                return sessionObj;
            }

        })
    })
);

const esriConfig = import("@arcgis/core/config.js");
//const esriConfig = require('esriConfig');
esriConfig.assetsPath = "node_modules/@arcgis/core/assets"; // relative to when running in root
const mapAPIKey = process.env.ArcGis_API_Key
const basemapEnum = "ArcGIS:Navigation";

// Maps Page  ensureAuthenticated,
//router.get('/authenticate', ensureAuthenticated, (req, res) => { 
router.get('/sign-in', ensureAuthenticated, (req, res) => {
    UserSession.authorize(credentials, res);
    //authentication.authorize(credentials, res);
    console.log('Serverside ARCGIS Auth');
    console.log('REDIRECT_URI: ', REDIRECT_URI);
    let parameters = new FormData();
    parameters.append('f', 'json');
    parameters.append('client_id', CLIENT_ID);
    parameters.append('client_secret', CLIENT_SECRET);
    parameters.append('grant_type', 'client_credentials');
    parameters.append('expiration', 1440);

    fetch(
        ARCGIS_URL,
        { method: 'POST', 
            body: parameters 
        })
    .then(function(response) {
        response.json()
        .then(function(arcgisResponse) {
            if (arcgisResponse.error) {
                // response failed
                reject(new Error(arcgisResponse.error.message));
            } else {
                let access_token = arcgisResponse.access_token; // expires in 1440 minutes
                console.log("arcgis token: ", access_token);
            //             console.log(`https://services3.arcgis.com/whiqyCfO1iYZKDul/arcgis/rest/services/customer_addresses/FeatureServer/0`);
                        //return fetch(`http://${hostname}:${PORT}/map`)
                        return fetch(
                            serviceAreaUrl,
                            {
                                method: 'POST',
                                json: true,
                                form: {
                                    f: 'json',
                                    token: access_token,
                                    map: '[setView([-83.84221905330062, 33.82017702602581], 13)]'
                                }
                            }, function(error, response, body) {
                                console.log(body);
                            })
            }
            req.session.save((err) => {
                res.redirect('/maps');
                //res.redirect('/');
            });
        })
        .catch(function(error) {
            console.log(error);
            reject(error);
        })
    });
    
});

router.get("/sign-out", (req, res) => {
    //Currently only destroys the cookie and session file, but not tokens: https://github.com/Esri/arcgis-rest-js/issues/800
    req.session.destroy();
    res.redirect("/");
});

router.get("/authenticate", ensureAuthenticated, async (req, res) => {
    req.session.userSession = await UserSession.exchangeAuthorizationCode(
        {
            clientId: CLIENT_ID,
            redirectUri: REDIRECT_URI
        },
      req.query.code //The code from the redirect: exchange code for a token in instaniated user session.
    );
  
    req.session.save((err) => {
        res.redirect('/maps');
        //res.redirect('/');
    });
  
});
    
router.get('/', ensureAuthenticated, (req, res) => {
    //Redirect to homepage.
    if (req.session.userSession) {
        Customers.find()
            //.select('_id client_id first_name last_name phone_mobile street apartment_number city state zip Pets "Last Appt"')
            .exec()
            .then(docs => {
                const response = {
                    count: docs.length,
                    customers: docs.map(doc => {
                        return {
                            id: doc._id,
                            client_id: doc.client_id,
                            first_name: doc.first_name,
                            last_name: doc.last_name,
                            phone_mobile: doc.phone_mobile,
                            email: doc.email,
                            phone_other: doc.phone_other,
                            address: doc.address,
                            address2: doc.address2,
                            apartment_number: doc.apartment_number,
                            city: doc.city,
                            state: doc.state,
                            zip: doc.zip,
                            Pets: doc.Pets,
                            'Last Appt': doc['Last Appt'],
                            request: {
                                type: 'GET',
                                url: `http://${hostname}:${PORT}/maps/` + doc._id
                            }
                        }
                    })
                }
                console.log(`${count} of Customers accessed`)
                req.flash('success_msg', `${count} of Customers accessed`);
                let access_token = {
                    "access_token": req.session.userSession.token,
                    "expires_in": req.session.userSession.tokenDuration,
                    "refresh_token": req.session.userSession.refreshToken
                }
                //res.status(200).json(response); 
                res.render('map', {
                    layout: 'ARCGIS-load',
                    token: access_token
                    //token: req.session.userSession.token
                    //user: req.user
                })
                // res.send(`
                // <h1>Hi ${req.session.userSession.username}<h1>
                // <pre><code>${JSON.stringify(req.session.userSession, null, 2)}</code></pre>
                // <a href="/maps/sign-out">Sign Out<a>
                // `);
            
            })
            .catch(err =>  {
                req.flash('error_msg', 'Sooo umm I think something broke... ' + err);
                console.log(err);
                res.status(500).json({
                    error: err
                });
            });
    } else {
        res.send(`<a href="/maps/sign-in">Sign In<a>`);
    }
});
module.exports = router;
