const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

// Email Validator fx
const validateEmail = function (email) {
  const re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return re.test(email);
};

// Phone number Validator Fx
const validatePhone = function (phone) {
  const re = /^(?:(?:\+?1\s*(?:[.-]\s*)?)?(?:\(\s*([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9])\s*\)|([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9]))\s*(?:[.-]\s*)?)?([2-9]1[02-9]|[2-9][02-9]1|[2-9][02-9]{2})\s*(?:[.-]\s*)?([0-9]{4})(?:\s*(?:#|x\.?|ext\.?|extension)\s*(\d+))?$/;
  return re.test(phone);
};

// secretToken Generator
const secretTokenGen = function () {
  const secretToken = randomstring.generate({ length: 64, charset: 'alphanumeric' }, this.secretToken);
  return secretToken;
};

const UserSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: true
  },
  last_name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
    required: 'Email address is required',
    validate: [validateEmail, 'Please fill a valid email address'],
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],
  },
  phone: {
    type: String,
    trim: true,
    required: 'Please enter a Phone number.',
    validate: [validatePhone, 'Please fill in a valid phone number.'],
    // match: [/^\(([2-9])(?!\1\1)\d\d\) [2-9]\d\d-\d{4}$/, 'Please fill in a valid phone number.'],
  },
  password: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  secretToken: {
    type: String,
    // validate: [secretTokenGen],
  },
  active: {
    type: Boolean,
  },
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
