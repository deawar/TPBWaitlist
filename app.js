// if (process.env.NODE_ENV !== 'production') {
//   require('dotenv').config()
// }
const dotenv = require('dotenv').config()
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const { MongoClient } = require('mongodb');
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');
const MemoryStore = require('memorystore')(session)
const os = require('os');
const chalk = require('chalk');
const { pid } = process;
const hostname = os.hostname();
const morgan = require('morgan');

const app = express();

// Chaulk Config
const connected = chalk.bold.cyan;
const error = chalk.bold.yellow;
const disconnected = chalk.bold.red;
const termination = chalk.bold.magenta;
const RedUL = chalk.bold.red.underline;

// Passport Config
require('./config/passport')(passport);

// DB Config
const db = require('./config/keys').mongoURI;

// Connect to MongoDB
//if (process.env.NODE_ENV !== 'production') {
// dev connect via mongoose
  // const uri = process.env.MONGODB_URI;
  // console.log('MongoDB Access string: ', uri);
  // const client = new MongoClient(uri, { useNewUrlParser: true }, { useUnifiedTopology: true });
  mongoose
    .connect(
      db,
      { useNewUrlParser: true ,useUnifiedTopology: true}
    )
    .then(() => console.log(connected('MongoDB Connected')))
    .catch(err => console.log(disconnected(err)));
    // client.connect((err) => {
    //   if (err) throw err;
    //   // const collection = client.db('test').collection('devices');
    //   client.db('test').collection('devices');
    //   // perform actions on the collection object
    //   client.close();
    // });
    process.on('SIGINT', () => {
      mongoose.connection.close(() => {
        console.log(termination('Mongoose default connection is disconnected due to application termination'));
        process.exit(0);
      });
    });
//} else {

  // Atlas DB conncetion codeblock
  // const { MongoClient } = require('mongodb');
  // const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.jvlgi.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
  // const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  // client.connect(err => {
  //   const collection = client.db("test").collection("devices");
  //   // perform actions on the collection object
  //       console.log(connected('MongoDB Connected'));
  //   client.close();
  // });
// }

// EJS
app.use(expressLayouts);
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');

// Morgan Dev Logs
app.use(morgan('dev'));

// Express body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Express session
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    store: new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    resave: true,
    saveUninitialized: true
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

// Routes
app.use('/', require('./routes/index.js'));
app.use('/maps', require('./routes/maps.js'));
app.use('/users', require('./routes/users.js'));
app.use('/send', require('./routes/users.js'));
app.use('/verify', require('./routes/users.js'));
app.use('/waitlist', require('./routes/waitlist.js'));

const PORT = process.env.PORT || 5000;

// app.listen(PORT, console.log(`Server running on  ${PORT}`));
app.listen(PORT, () => {
  console.log(connected(`PID: `+RedUL(`${pid}\n`)));
  console.log(connected(
    `==> 🌎  Listening on port `+RedUL(`${PORT}`)+ `. Visit `+RedUL(`http://${hostname}:${PORT}/`)+` in your browser.`));
});
