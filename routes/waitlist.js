const express = require('express');
const router = express.Router();
const passport = require('passport');
const mongoose = require('mongoose');
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
const os = require('os');

const PORT = process.env.PORT

// Load Waitlist model
const Waitlist = require('../models/Waitlist');

// To Load Host the app is working on
const hostname = os.hostname();

// Geocode addresses of new customers
//async function getLocation(address, address2, city, state, zip){
function getLocation(address, address2, city, state, zip){
const locationURL = `https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?SingleLine=${address}, ${address2}, ${city}, ${state} ${zip},USA&category=&outFields=*&forStorage=false&f=json`
    console.log('locationURL: ', locationURL);
    //return await fetch(locationURL,
    //await fetch(locationURL,
    fetch(locationURL,
    {
        method: "GET",
        headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        },
    })
    .then((response) => response.json())
    .then((responseData) => {
        console.log("Before Return: ", responseData.candidates[0].location);
        return responseData.candidates[0].location;
    })
    .catch(error => console.warn(error));
};  
  //getLocation().then(response => console.log(response));

// Waitlist Page
router.get('/', ensureAuthenticated, (req, res) =>
    res.render('waitlist', {
    user: req.user
    })

    // .catch(err =>  {
    //     console.log(err);
    //     res.status(500).json({
    //         error: err
    //     });
    // });
);

// API Get call that returns all waitlist items
router.get('/displaywaitlist', ensureAuthenticated,(req, res) => {
    Waitlist.find()
        .select('_id date customer first_name last_name phone_mobile phone_other address address2 city state zip email pets preferred_days location deleted_at')
        .exec()
        .then(docs => {
            const response = { 
                count: docs.length,
                waitlists: docs.map(doc => {
                    return {
                        id: doc._id,
                        date: doc.date,
                        customer: doc.customer,
                        email: doc.email,
                        phone_mobile: doc.phone_mobile,
                        phone_other: doc.phone_other,
                        geocode: doc.coor_location,
                        address: doc.address,
                        address2: doc.address2,
                        city: doc.city,
                        state: doc.state,
                        zip: doc.zip,
                        pets: doc.pets,
                        preferred_days: doc.preferred_days,
                        location: doc.location,
                        deleted_at: doc.deleted_at,
                        request: {
                            type: 'GET',
                            url: `http://${hostname}:${PORT}/waitlist/` + doc._id
                        }
                    }
                })
            }
            req.flash('success_msg', 'Current Waitlist displayed');
            res.status(200).json(response);        
        })
        .catch(err =>  {
            req.flash('error_msg', 'Sooo this happened...' + err);
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

// Search using query 
router. get('/find/:query', (req, res) => { // TODO: add 'ensureAuthenticated, ' for security
    let query = req.params.query;

    Waitlist.find({
        $text: {
            $search: query
        }
    }, function(err, result) {
        if (err) throw err;
        if (result) {
            req.flash('success_msg', `Found it: ${query}... This is what you wanted, right?!?`);
            res.json(result)
        } else {
            res.send(JSON.stringify({
                error:'Error'
            }))
        }
    })
})

// function to captur pets in json obj
function grabPets(req) {
    let pets= [];
    let pet = {};
    let len = req.body.petsNumber;
    for(let i=0; i < len; i++) {
        //petsNumber: req.body.petsNumber,
        console.log("--->in grabPets", req.body)
        for (var key in req.body) {
            if (req.body.hasOwnProperty(key)) {
                let value = req.body[key];
                console.log(`value for ${key} is ${value}`)
                if(key.includes('petsSpecies'+i)){
                    pet.pets_species = value;
                }
                if(key.includes('petsName'+i)){
                    pet.pets_name = value;
                }
                if(key.includes('petsSex'+i)){
                    pet.pets_sex = value;
                }
                if(key.includes('petsBreed'+i)){
                    pet.pets_breed = value;
                }
                if(key.includes('petsAge'+i)){
                    pet.pets_age = value;
                }
                if(key.includes('petsWeight'+i)){
                    pet.pets_weight = value;
                }

            }
        }
        pets.push(pet);
        pet = {};
        
    };
    console.log('in grabPets fx:',{pets})
    return pets;
}


// Create New Waitlist objects
router.post('/', ensureAuthenticated, (req, res, next) => {
    let pets= [];
    console.log('------------------>req.body: ',req.body);
    const waitlist =  new Waitlist({
        _id: new mongoose.Types.ObjectId(),  
        customer: req.body.first_name + ' ' + req.body.last_name,
        phone_mobile: req.body.phone_mobile,
        phone_other: req.body.phone_other,
        address: req.body.address,
        address2: req.body.address2,
        city: req.body.city,
        state: req.body.state,
        zip: req.body.zip,
        email: req.body.email,
        geocode: req.body.geocode,
        // petsNumber: req.body.petsNumber,
        preferred_days: req.body.preferred_days,
        deleted_at: req.body.deleted_at,
        location: req.body.current_facility,
    });
    
    waitlist.pets = grabPets(req);
    //let coor_location = getLocation(waitlist.address, waitlist.address2, waitlist.city, waitlist.state, waitlist.zip);
    //waitlist.coor_location = getLocation(waitlist.address, waitlist.address2, waitlist.city, waitlist.state, waitlist.zip);
    
    // if(!waitlist.coor_location){
    //     waitlist.coor_location = { coor_location : "empty object" };
    // }
    //console.log("Coordinates: ", waitlist.coor_location)
    console.log("New Waitlist object:", waitlist);
    waitlist
    .save()
    .then(result => {
        console.log(result);
        req.flash('success_msg', 'Created new Waitlist entry successfully');
        res.render('waitlist', {
            user: req.user
            })
        // res.status(201).json({
        //     message: 'Created new Waitlist entry successfully',
        //     newWaitlist : {
        //         _id: result._id,
        //         customer: result.customer,
        //         phone_mobile: result.phone_mobile,
        //         phone_other: result.phone_other,
        //         address: result.address,
        //         address2: result.address2,
        //         city: result.city,
        //         state: result.state,
        //         zip: result.zip,
        //         email: result.email,
        //         pets: result.pets,
        //         preferred_days: result.preferred_days,
        //         deleted_at: result.deleted_at,
        //         location: result.current_facility,
        //         request: {
        //             type: 'GET',
        //             url: `http://${hostname}:${PORT}/waitlist/` + result._id
        //         }
        //     } 
        // });
    })
    .catch(err =>  {
        console.log(err);
        req.flash('failure_msg', 'Entry NOT saved!!')
        res.status(500).json({
            error: err
        });
    });
});

// Get waitlist object by ID
router.get('/:waitlistId', ensureAuthenticated, (req, res, next) => {
    const id = req.params.waitlistId;
    Waitlist.findById(id)
    .select('_id customer first_name last_name phone_mobile phone_other address address2 city state zip email pets preferred_days deleted_at location date')
    .exec()
    .then(doc => {
        console.log("From the DB: ", doc);
        if (doc) {
            req.flash('success_msg', 'Search successful!');
            res.status(200).json({
                waitlist: doc,
                request: {
                    type: 'GET',
                    description: 'USE this Link to return All Waitlist Items.',
                    url: `http://${hostname}:${PORT}/waitlist/displaywaitlist`
                }
            });
        } else {
            req.flash('failure_msg', 'No valid data found for provided ID');
            res.status(404).json({
                message: 'No valid data found for provided ID'
            });
        }
    })
    .catch(err => {
        console.log(err)
        res.status(500).json({ 
            error:err 
        });
    });
});

// Edit an entry using ID must use [{ "propName": "location", "value": "TPB Trailer" }]
router.patch('/update/:waitlistId', ensureAuthenticated,  (req, res)=> {
    const id = req.params.waitlistId;
    console.log('in PATCH-id:',id)
    console.log('req.body:',req.body)
    const updateOps = {};
    for (const ops of req.body) {
        updateOps[ops.propName] = ops.value;
    }
    Waitlist.updateOne({ _id:id }, { $set: updateOps })
    .exec()
    .then(result => {
        console.log('what is result:',result);
        req.flash('success_msg', `Row id:${id} edited and operation marked as completed`);
        res.render('waitlist', {
            user: req.user
            })
        // res.status(200).json({
        //     message: 'Waitlist Item updated!', 
        //     request: { 
        //         type: 'GET', 
        //         url: `http://${hostname}:${PORT}/waitlist/` + id
        //     }
        // });
    })
    .catch(err => {
        console.log(err)
        req.flash('error_msg', 'Sooo this happened...' + err)
        res.status(500).json({ 
            error:err 
        });
    });
}); 

// Delete placed here for completeness only. Preference is to use UpdateOne and set 'deleted_at' field to date.
// Delete based on waitlist _id
router.delete('/delete/:waitlistId', ensureAuthenticated, (req, res, next) => {
    const id = req.params.waitlistId;
    Waitlist.remove({ _id:id })
    .exec()
    .then(result => {
        
        req.flash('success_msg', `Row id:${id} Deleted, as in, Gone Permanently...`);
        res.render('waitlist', {
            user: req.user
        })
        // req.flash('success_msg', `Row id:${id} Deleted, as in, Gone Permanently...`);
        // res.status(200).json({
        //     message: 'Waitlist Item Deleted!', 
        //     request: { 
        //         type: 'POST', 
        //         url: `http://${hostname}:${PORT}/waitlist/`,
        //         body: { first_name: 'String', last_name: 'String' }
        //     }
        // });
    })
    .catch(err => {
        console.log(err)
        req.flash('error_msg', 'Sooo this happened...' + err)
        res.status(500).json({ 
            error:err 
        });
    });
});
module.exports = router;