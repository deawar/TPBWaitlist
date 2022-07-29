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

// Creating our Customers Schema
const CustomersSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    client_id: {
        type: Number,
        required: true, 
    },
    first_name: {
        type: String,
        trim: true,
        required: true,
    },
    last_name: {
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
    street: {
        type: String,
        trim: true,
        required: true,
    },
    apartment_number: {
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
        type: Object,
    },
    pets: [{
        petsName: {
            type: String,
            trim: true,
        },
        petsSpecies: {
            type: String,
            trim: true,
        },
        petsSex: {
            type: String,
            trim: true,
        },
        petsBreed: {
            type: String,
            trim: true,
        },
        petsAge: {
            type: String,
            trim: true,
        },
    }],
    preferred_days: {
        type: Array,
    },
    "Last Appt": { 
        type: String, 
        required: true,        
    }
});

const Customers = mongoose.model('Customers', CustomersSchema);
// const customers = new Customers({ type: 'customers' });

// Adding a 'text' index to the customers schema
CustomersSchema.index({ '$**': 'text' });

module.exports.getCustomersById = function (id, callback) {
    Customers.findById(id, callback);
};

module.exports.getCustomersByEmail = function (email, callback) {
    const query = { email };
    Customers.findOne(query, callback);
};

CustomersSchema.plugin(uniqueValidator, {
    message: 'Sorry, {PATH} needs to be unique',
});

module.exports = mongoose.model('Customers', CustomersSchema);