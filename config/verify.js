const nodemailer = require('nodemailer');
// require('dotenv').config(); moved to dev-dependency
// must run with "nodemon -r dotenv/config app.js" or "npm run start"

const smtpTransport = nodemailer.createTransport({
  service: 'gmail',
  host: 'smpt.gmail.com',
  port: 587,
  // host: process.env.GMAIL_SERVICE_HOST,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PW,
  },
});
// Verify send works
smtpTransport.verify().then(console.log).catch(console.error); 

module.exports = {
  sendMail(mailOptions, cb) {
    smtpTransport.sendMail(mailOptions, function (error, data) {
      if (error) {
        cb(error, null);
      } else {
        cb(null, data);
      }
    });
  },
};