const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');

// Welcome Page
router.get('/', forwardAuthenticated, (req, res) => res.render('welcome'));

// Dashboard
router.get('/dashboard', ensureAuthenticated, (req, res) =>
  res.render('dashboard', {
    user: req.user
  })
);

// router.get('/waitlist', ensureAuthenticated, (req, res) =>
//   res.render('waitlist', {
//     user: req.user
//   }) 
// );

router.get('/addcustomer', ensureAuthenticated, (req, res) =>
  res.render('addcustomer', {
    user: req.user
  }) 
);

// // Maps Page  ensureAuthenticated, 
// router.get('/maps', ensureAuthenticated, (req, res) =>
//     res.render('map', {
//     user: req.user
//     })

//     .catch(err =>  {
//         console.log(err);
//         res.status(500).json({
//             error: err
//         });
//     })
// );

module.exports = router;
