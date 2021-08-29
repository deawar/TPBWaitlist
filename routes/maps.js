const express = require('express');
const router = express.Router();
const passport = require('passport');
const mongoose = require('mongoose');
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
const os = require('os');
const PORT = process.env.PORT

// To Load Host the app is working on
const hostname = os.hostname();


// Maps Page  ensureAuthenticated, 
router.get('/', ensureAuthenticated, (req, res) =>
    res.render('map', {
    user: req.user
    })

    .catch(err =>  {
        console.log(err);
        res.status(500).json({
            error: err
        });
    })
);

module.exports = router;