const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

// Load User & Whitelist models
const User = require('../models/User');
const Whitelist = require('../models/Whitelist');

module.exports = function(passport) {
  passport.use(
    new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {

      // Match Whitelist
      let whiteListParams = {'email':'email'};
      Whitelist.findOne({
        email: email
      }).then(user => {
        if (!user) {
          console.log(email,'is not in Whitelist');
          return done(null, false, { message: 'Please see your Admin to add you to the user list.' });
        } else {

          // Match user
          let userParams = {'email':'email'};
          User.findOne({
            email: email
          }).then(user => {
            if (!user) {
              return done(null, false, { message: 'That email is not registered' });
            // check for verified Email
            } else if (!user.active) {
              console.log("Passport.js Check for active status:", user.active )
              return done(null, false, { message: 'User must verify email address (Check your email for a message from TPBWaitlist)'});
            }
    
            // Match password
            bcrypt.compare(password, user.password, (err, isMatch) => {
              if (isMatch) {
                return done(null, user);
              } else {
                return done(null, false, { message: 'Incorrect Credentials' });
              }
            });
          }).catch(function (err) {
            console.error(err);
          });
        }
      }).catch(error => window.alert('Please see your administrator for access.'))


    })
  );

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  })
};
