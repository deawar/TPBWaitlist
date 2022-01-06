const chalk = require('chalk');
// Chaulk Config
const connected = chalk.bold.cyan;
const error = chalk.bold.yellow;
const disconnected = chalk.bold.red;
const termination = chalk.bold.magenta;
const RedUL = chalk.bold.red.underline;

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
    const DB_URI = process.env.LOCALMONGODB_URI;
    dbPassword = DB_URI;
} else {
  //const DB_URI = process.env.MONGODB_URI;
  const DB_URI = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}${process.env.DB_NAME}?retryWrites=true&w=majority`
  dbPassword = DB_URI;
}



console.log(connected('Connected to DB: ', dbPassword));  // TODO: Remove console.log

module.exports = {
    mongoURI: dbPassword
};
