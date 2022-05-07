const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
// Get the Schema constructor
const { Schema } = mongoose;

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

// Creating our Waitlist Schema
const WaitlistSchema = new Schema({
    date: { 
        type: Date, 
        default: Date.now 
    },
    _id: mongoose.Schema.Types.ObjectId,
    customer: {
        type: String,
        trim: true,
        required: true,
    },
    phone_mobile: {
        type: String,
        trim: true,
        required: 'Please enter a Phone number.',
        //validate: [validatePhone, 'Please fill in a valid phone number.'],
        //match: [/^\(([2-9])(?!\1\1)\d\d\) [2-9]\d\d-\d{4}$/, 'Please fill in a valid phone number.'],
    },
    phone_other: {
        type: String,
        trim: true,
        //validate: [validatePhone, 'Please fill in a valid phone number.'],
        // match: [/^\(([2-9])(?!\1\1)\d\d\) [2-9]\d\d-\d{4}$/, 'Please fill in a valid phone number.'],
    },
    address: {
        type: String,
        trim: true,
        required: true,
    },
    address2: {
        type: String,
        trim: true,
    },
    city: {
        type: String,
        trim: true,
        required: true,
    },
    state: {
        type: String,
        trim: true,
        required: true,
    },
    zip: {
        type: String,
        required: true,
        min: 5,
    },
    geocode: {
        type: String
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        validate: [validateEmail, 'Please fill a valid email address'],
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],
    },
    pets: {
        type: Array,
    },
    preferred_days: {
        type: Array,
    },
    deleted_at: {
        type: Date,
    },
    location: {
        type: String,
        trim: true,
    }
});

const Waitlist = mongoose.model('Waitlist', WaitlistSchema);
// const waitlist = new Waitlist({ type: 'waitlist' });

// Adding a 'text' index to the waitlist schema
WaitlistSchema.index({ '$**': 'text' });

module.exports.getWaitlistById = function (id, callback) {
    Waitlist.findById(id, callback);
};

module.exports.getWaitlistByEmail = function (email, callback) {
    const query = { email };
    Waitlist.findOne(query, callback);
};

WaitlistSchema.plugin(uniqueValidator, {
    message: 'Sorry, {PATH} needs to be unique',
});

module.exports = mongoose.model('Waitlist', WaitlistSchema);