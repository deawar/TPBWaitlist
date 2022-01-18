const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const passport = require('passport');
const randomstring = require('randomstring');
const os = require('os');
const getFQDN = require('get-fqdn');
const smtpTransport = require('../config/verify'); // { sendMail }

// Load User & Whitelist models
const User = require('../models/User');
const Whitelist = require('../models/Whitelist');
const { forwardAuthenticated } = require('../config/auth');

// Login Page
router.get('/login', forwardAuthenticated, (req, res) => res.render('login'));

// Register Page
router.get('/register', forwardAuthenticated, (req, res) => res.render('register'));

// SecretToken compare Fx
// Find secretToken to compare from DB
async function findOnebySecretToken(req, res, secretTokenPasted, done) {
  const user = User.findOne({ user: secretToken },
    function (err, data) {
      if (err) {
        return done(err);
      }
      console.log('Signup_controller Line 446 data: ', data);
      // const user = data;
      return done(null, user);
    });
  if (!user.secretToken || user.active === true || user.secretToken === ' ') {
    req.flash('success', 'You have either already confirmed your account OR you may need to register');
    return res.status(404).redirect('/signup', { title: 'Register Page' });
  }
  console.log('Line 454------->User db output user.dataValues.secretToken:', user.dataValues.secretToken);
  console.log('line 455 ------>User db active output user.dataValues.active:', user.dataValues.active);

  if (user.secretToken === secretTokenPasted) {
    console.log('Domain is matched. Information is from Authentic email. secretToken:',
      req.query.id === secretToken);
    console.log('email is verified');
    console.log('In Verify Route and user: ', user);
    if (!user) {
      console.log('*****************User NOT Found!!!****************');
      // res.;
      req.flash('Error, No user found.');
      res.status(401).redirect('/signup');
      return;
    }
    const condition = {
      where: {
        secretToken: secretTokenPasted,
      },
    };
    console.log('Condition----->: ', condition);
    const removed = await db.User.updateOne(condition,
      {
        secretToken: null,
        active: true,
      },
      function (err, result) {
        console.log('============>', result);
        if (err) {
          return done(err);
        }
        if (removed.active === true) {
          req.flash('Error', 'You have either already confirmed your account OR you may need to register', 'I did NOT find you in our database.');
          return res.status(404).end();
        }
        req.flash('Success', 'Thank you! Now you can Login.');
        res.redirect('/login').status(200);
      });

    req.flash('Success', 'Thank you! Now you can Login.');
    res.redirect('/users/login');
  } else {
    req.flash('Success', 'Thank you! Now you can Login.');
    res.redirect('/users/login');
  }
}

// New user Email confirmation
//function emailConfirm(email, user) {


// Register
router.post('/register', (req, res) => {
  const { first_name, last_name, phone, email, password, password2 } = req.body;
  let secretToken = randomstring.generate(64);
  let errors = [];

  if (!first_name || !last_name || !phone || !email || !password || !password2) {
    errors.push({ msg: 'Please enter all fields' });
  }

  if (password != password2) {
    errors.push({ msg: 'Passwords do not match' });
  }

  if (password.length < 8) {
    errors.push({ msg: 'Password must be at least 8 characters' });
  }

  if (errors.length > 0) {
    res.render('register', {
      errors,
      first_name,
      last_name,
      email,
      phone,
      password,
      password2
    });
  } else {
    User.findOne({ email: email }).then(user => {
      if (user) {
        errors.push({ msg: 'Email already exists' });
        res.render('register', {
          errors,
          first_name,
          last_name,
          email,
          phone,
          password,
          password2,
          secretToken,
          active: false,
        });
      } else {
        const newUser = new User({
          first_name,
          last_name,
          email,
          phone,
          password,
          secretToken,
          active: false,
        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              //register new user
              .then(user => {
                console.log('Line 87 users.js user.active = ',user.active);
                if (user.active === false) {
                  console.log('redirecting to /users/send....');
                  res.cookie('first_name', user.first_name);
                  res.cookie('user_id', user.id);                  
                  req.flash('success_msg', 'You must confirm your email account. Check your email for a confirmation link.');
                  console.log('email: ',email);
                  // Email Verification

                  //res.redirect('/users/send');
                  console.log('In fx emailConfirm: ',user);
                  let mailOptions;
                  let link;
                  let secrectToken;
                  // router.use(bodyParser.urlencoded({ extended: true }));
                  // router.use(bodyParser.json());
                  
                  // //Tell user to check email
                  // router.get('/sendemail', (req, res) => {
                  //   res.cookie('first_name', user.first_name);
                  //   res.cookie('user_id', user.id);
                  //   req.flash('success', 'You must confirm your email account. Check your email for a confirmation link.');
                  //   res.redirect('/users/sendemail');
                  // })
                  // Send Verification Email
                  
                  // router.post('/sendemail', (req, res) => {
                  //console.log('req.ensureAuthenticated():', req.ensureAuthenticated())
                  console.log('Line 113 in routes/users.js Email Verification Send Route.');
                  console.log('User to be email verified: ',user);
                  if (!user.active){
                  // if (req.ensureAuthenticated()) {
                    // const user = {
                    //   userInfo: user,
                    //   id: req.session.passport.user,
                    //   secretToken: user.secretToken,
                    //   isloggedin: req.ensureAuthenticated(),
                    // };
                    //console.log('Line 122 User Info', User.userInfo);
                    console.log('Line 123 os.hostname:', os.hostname());
                    const hostname = os.hostname();
                    const PORT = process.env.PORT;
                    //res.send(user.secretToken);
                    secretToken = user.secretToken;

                    if (process.env.NODE_ENV === 'development'|| process.env.NODE_ENV === 'test') {
                      link = `http://${hostname}:${PORT}/users/verify?id=${secretToken}`;
                    } else {
                      // eslint-disable-next-line prefer-template
                      //link = `https://TPBWaitlist.thepuppybarber.com/verify?id=` + secretToken;
                      //link = `http://${req.get(host)}/verify?id=${secretToken}`;
                      link = `http://${hostname}:${PORT}/users/verify?id=${secretToken}`;
                    }
                    console.log('Verify Return Link: ', link);
                    mailOptions = {
                      from: '"The Puppy Barber Waitlist" <support@thepuppybarber.com>',
                      to: user.email,
                      subject: 'The Puppy Barber Waitlist is asking you to confirm your Email Address',
                      //html: "<b>There is a new article. It's about sending emails, check it out!</b>", 
                      html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"><html data-editor-version="2" class="sg-campaigns" xmlns="http://www.w3.org/1999/xhtml">
                      <head>
                        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1">
                        <meta http-equiv="X-UA-Compatible" content="IE=Edge">
                        <link rel="shortcut icon" href="https://cdn.jsdelivr.net/gh/deawar/TPBWaitlist@master/public/assets/favicon.ico">
                        <style type="text/css">
                          html {
                            background-image: url(https://cdn.jsdelivr.net/gh/deawar/SAG-MongoDB@main/public/resources/backgroundImage.png);
                            -webkit-background-size: cover;
                            -moz-background-size: cover;
                            -o-background-size: cover;
                            background-size: cover;
                          }
                          body, p, div {
                            font-family: inherit;
                            font-size: 14px;
                          }
                          body {
                            color: #000000;
                          }
                          body a {
                            color: #1188E6;
                            text-decoration: none;
                          }
                          p { margin: 0; padding: 0; }
                          table.wrapper {
                            width:100% !important;
                            table-layout: fixed;
                            -webkit-font-smoothing: antialiased;
                            -webkit-text-size-adjust: 100%;
                            -moz-text-size-adjust: 100%;
                            -ms-text-size-adjust: 100%;
                          }
                          img.max-width {
                            max-width: 100% !important;
                          }
                          .column.of-2 {
                            width: 50%;
                          }
                          .column.of-3 {
                            width: 33.333%;
                          }
                          .column.of-4 {
                            width: 25%;
                          }
                          @media screen and (max-width:480px) {
                            .preheader .rightColumnContent,
                            .footer .rightColumnContent {
                              text-align: left !important;
                            }
                            .preheader .rightColumnContent div,
                            .preheader .rightColumnContent span,
                            .footer .rightColumnContent div,
                            .footer .rightColumnContent span {
                              text-align: left !important;
                            }
                            .preheader .rightColumnContent,
                            .preheader .leftColumnContent {
                              font-size: 80% !important;
                              padding: 5px 0;
                            }
                            table.wrapper-mobile {
                              width: 100% !important;
                              table-layout: fixed;
                            }
                            img.max-width {
                              height: auto !important;
                              max-width: 100% !important;
                            }
                            a.bulletproof-button {
                              display: block !important;
                              width: auto !important;
                              font-size: 80%;
                              padding-left: 0 !important;
                              padding-right: 0 !important;
                            }
                            .columns {
                              width: 100% !important;
                            }
                            .column {
                              display: block !important;
                              width: 100% !important;
                              padding-left: 0 !important;
                              padding-right: 0 !important;
                              margin-left: 0 !important;
                              margin-right: 0 !important;
                            }
                          }
                        </style>
                        <link href="https://fonts.googleapis.com/css?family=Muli&display=swap" rel="stylesheet">
                        <style>
                          body {font-family: 'Muli', sans-serif;}
                        </style>
                      </head>
                      <body>
                        <center class="wrapper" data-link-color="#1188E6" data-body-style="font-size:14px; font-family:inherit; color:#000000; background-color:#FFFFFF;">
                          <div class="webkit">
                            <table cellpadding="0" cellspacing="0" border="0" width="100%" class="wrapper" bgcolor="#FFFFFF">
                              <tbody><tr>
                                <td valign="top" bgcolor="#FFFFFF" width="100%">
                                  <table width="100%" role="content-container" class="outer" align="center" cellpadding="0" cellspacing="0" border="0">
                                    <tbody><tr>
                                      <td width="100%">
                                        <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                          <tbody><tr>
                                            <td>
                                                      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%; max-width:600px;" align="center">
                                                        <tbody><tr>
                                                          <td role="modules-container" style="padding:0px 0px 0px 0px; color:#000000; text-align:left;" bgcolor="#FFFFFF" width="100%" align="left"><table class="module preheader preheader-hide" role="module" data-type="preheader" border="0" cellpadding="0" cellspacing="0" width="100%" style="display: none !important; mso-hide: all; visibility: hidden; opacity: 0; color: transparent; height: 0; width: 0;">
                      <tbody><tr>
                        <td role="module-content">
                          <p></p>
                        </td>
                      </tr>
                    </tbody></table><table border="0" cellpadding="0" cellspacing="0" align="center" width="100%" role="module" data-type="columns" style="padding:30px 20px 30px 20px;" bgcolor="#f6f6f6">
                      <tbody>
                        <tr role="module-content">
                          <td height="100%" valign="top">
                            <table class="column" width="540" style="width:540px; border-spacing:0; border-collapse:collapse; margin:0px 10px 0px 10px;" cellpadding="0" cellspacing="0" align="left" border="0" bgcolor="">
                              <tbody>
                                <tr>
                                  <td style="padding:0px;margin:0px;border-spacing:0;"><table class="wrapper" role="module" data-type="image" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="72aac1ba-9036-4a77-b9d5-9a60d9b05cba">
                      <tbody>
                        <tr>
                          <td style="font-size:6px; line-height:10px; padding:0px 0px 0px 0px;" valign="top" align="center">
                            <img class="max-width" border="0" style="display:block; color:#000000; text-decoration:none; font-family:Helvetica, arial, sans-serif; font-size:16px;" width="240" alt="" data-proportionally-constrained="true" data-responsive="false" src="https://cdn.jsdelivr.net/gh/deawar/TPBWaitlist@master/public/assets/424736_final_ver.png">
                          </td>
                        </tr>
                      </tbody>
                    </table><table class="module" role="module" data-type="spacer" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="331cde94-eb45-45dc-8852-b7dbeb9101d7">
                      <tbody>
                        <tr>
                          <td style="padding:0px 0px 20px 0px;" role="module-content" bgcolor="">
                          </td>
                        </tr>
                      </tbody>
                    </table><table class="wrapper" role="module" data-type="image" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="d8508015-a2cb-488c-9877-d46adf313282">
                    
                    </table><table class="module" role="module" data-type="spacer" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="27716fe9-ee64-4a64-94f9-a4f28bc172a0">
                      <tbody>
                        <tr>
                          <td style="padding:0px 0px 30px 0px;" role="module-content" bgcolor="">
                          </td>
                        </tr>
                      </tbody>
                    </table><table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="948e3f3f-5214-4721-a90e-625a47b1c957" data-mc-module-version="2019-10-22">
                      <tbody>
                        <tr>
                          <td style="padding:50px 30px 18px 30px; line-height:36px; text-align:inherit; background-color:#ffffff;" height="100%" valign="top" bgcolor="#ffffff" role="module-content"><div><div style="font-family: inherit; text-align: center"><span style="font-size: 43px">Thanks for signing up!&nbsp;</span></div><div></div></div></td>
                        </tr>
                      </tbody>
                    </table><table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="a10dcb57-ad22-4f4d-b765-1d427dfddb4e" data-mc-module-version="2019-10-22">
                      <tbody>
                        <tr>
                          <td style="padding:18px 30px 18px 30px; line-height:22px; text-align:inherit; background-color:#ffffff;" height="100%" valign="top" bgcolor="#ffffff" role="module-content"><div><div style="font-family: inherit; text-align: center"><span style="font-size: 18px">Please verify your email address to</span><span style="color: #000000; font-size: 18px; font-family: arial,helvetica,sans-serif"> get access to The Puppy Barber Waitlist</span><span style="font-size: 18px">.</span></div>
                    <div style="font-family: inherit; text-align: center"><span style="color: #0011ff; font-size: 18px"><strong>Thank you!&nbsp;</strong></span></div><div></div></div></td>
                        </tr>
                      </tbody>
                    </table><table class="module" role="module" data-type="spacer" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="7770fdab-634a-4f62-a277-1c66b2646d8d">
                      <tbody>
                        <tr>
                          <td style="padding:0px 0px 20px 0px;" role="module-content" bgcolor="#ffffff">
                          </td>
                        </tr>
                      </tbody>
                    </table><table class="module" role="module" data-type="spacer" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="7770fdab-634a-4f62-a277-1c66b2646d8d.1">
                      <tbody>
                        <tr>
                          <td style="padding:0px 0px 50px 0px;" role="module-content" bgcolor="#ffffff">
                          </td>
                        </tr>
                      </tbody>
                    </table><table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="a265ebb9-ab9c-43e8-9009-54d6151b1600" data-mc-module-version="2019-10-22">
                      <tbody>
                        <tr>
                          <td style="padding:50px 30px 50px 30px; line-height:22px; text-align:inherit; background-color:#6e6e6e;" height="100%" valign="top" bgcolor="#6e6e6e" role="module-content"><div><div style="font-family: inherit; text-align: center"><span style="color: #ffffff; font-size: 18px"><strong>Here’s what happens next:</strong></span></div>
                    <div style="font-family: inherit; text-align: center"><br></div>
                    <div style="font-family: inherit; text-align: center"><span style="color: #ffffff; font-size: 18px">Copy this token:<br><b>${secretToken}</b><br><br>You will paste it into the Verification page at the link below that will show up when you click the Veriy Email button. Once the codes are confirmed we'll mark your account as verified and you will be ready to go!</span></div>
                    <div style="font-family: inherit; text-align: center"><br></div>
                    <table border="0" cellpadding="0" cellspacing="0" class="module" data-role="module-button" data-type="button" role="module" style="table-layout:fixed;" width="100%" data-muid="d050540f-4672-4f31-80d9-b395dc08abe1">
                    <tbody>
                      <tr>
                        <td align="center" bgcolor="#6e6e6e" class="outer-td" style="padding:0px 0px 0px 0px;">
                          <table border="0" cellpadding="0" cellspacing="0" class="wrapper-mobile" style="text-align:center;">
                            <tbody>
                              <tr>
                              <td align="center" bgcolor="#ffbe00" class="inner-td" style="border-radius:6px; font-size:16px; text-align:center; background-color:inherit;">
                                <a href=${link} style="background-color:#b71c1c; border:1px solid #b71c1c; border-color:#b71c1c; border-radius:0px; border-width:1px; color:#ffffff; display:inline-block; font-size:16px; font-weight:bold; letter-spacing:0px; line-height:normal; padding:12px 40px 12px 40px; text-align:center; text-decoration:none; border-style:solid; font-family:inherit;" target="_blank">Verify Email Now</a>
                                <div itemprop="handler" itemscope itemtype="http://schema.org/HttpActionHandler">
                                  <link itemprop="url" href="${link}"/></div>
                              </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                    </table>
                    <div style="font-family: inherit; text-align: center"><br></div>
                    <div style="font-family: inherit; text-align: center"><span style="color: #ffffff; font-size: 18px">Need support? Our support team is always</span></div>
                    <div style="font-family: inherit; text-align: center"><span style="color: #ffffff; font-size: 18px">ready to help!&nbsp;</span></div><div></div></div></td>
                        </tr>
                      </tbody>
                    </table><table border="0" cellpadding="0" cellspacing="0" class="module" data-role="module-button" data-type="button" role="module" style="table-layout:fixed;" width="100%" data-muid="d050540f-4672-4f31-80d9-b395dc08abe1.1">
                        <tbody>
                          <tr>
                            <td align="center" bgcolor="#6e6e6e" class="outer-td" style="padding:0px 0px 0px 0px;">
                              <table border="0" cellpadding="0" cellspacing="0" class="wrapper-mobile" style="text-align:center;">
                                <tbody>
                                  <tr>
                                  <td align="center" bgcolor="#ffbe00" class="inner-td" style="border-radius:6px; font-size:16px; text-align:center; background-color:inherit;">
                                    <a href="" style="background-color:#ffbe00; border:1px solid #ffbe00; border-color:#ffbe00; border-radius:0px; border-width:1px; color:#000000; display:inline-block; font-size:14px; font-weight:normal; letter-spacing:0px; line-height:normal; padding:12px 40px 12px 40px; text-align:center; text-decoration:none; border-style:solid; font-family:inherit;" target="_blank">Contact Support</a>
                                  </td>
                                  </tr>
                                </tbody>
                              </table>
                            </td>
                          </tr>
                        </tbody>
                      </table><table class="module" role="module" data-type="spacer" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="c37cc5b7-79f4-4ac8-b825-9645974c984e">
                      <tbody>
                        <tr>
                          <td style="padding:0px 0px 30px 0px;" role="module-content" bgcolor="6E6E6E">
                          </td>
                        </tr>
                      </tbody>
                    </table></td>
                                </tr>
                              </tbody>
                            </table>
                            
                          </td>
                        </tr>
                      </tbody>
                    </table><div data-role="module-unsubscribe" class="module" role="module" data-type="unsubscribe" style="color:#444444; font-size:12px; line-height:20px; padding:16px 16px 16px 16px; text-align:Center;" data-muid="4e838cf3-9892-4a6d-94d6-170e474d21e5">
                                                              <div class="Unsubscribe--addressLine"><p class="Unsubscribe--senderName" style="font-size:12px; line-height:20px;">The Puppy Barber Waitlist</p><p style="font-size:12px; line-height:20px;"><span class="Unsubscribe--senderCity">Statham</span>, <span class="Unsubscribe--senderState">GA</span> <span class="Unsubscribe--senderZip">30666</span></p></div>
                                                              <p style="font-size:12px; line-height:20px;"><a>Unsubscribe - This is a one time email solely for the purposes of verifing your email address.</a></p>
                                                            </div><table border="0" cellpadding="0" cellspacing="0" class="module" data-role="module-button" data-type="button" role="module" style="table-layout:fixed;" width="100%" data-muid="550f60a9-c478-496c-b705-077cf7b1ba9a">
                        <tbody>
                          <tr>
                            <td align="center" bgcolor="" class="outer-td" style="padding:0px 0px 20px 0px;">
                              <table border="0" cellpadding="0" cellspacing="0" class="wrapper-mobile" style="text-align:center;">
                                <tbody>
                                  <tr>
                                  <td align="center" bgcolor="#f5f8fd" class="inner-td" style="border-radius:6px; font-size:16px; text-align:center; background-color:inherit;"><a href="https://sendgrid.com/" style="background-color:#f5f8fd; border:1px solid #f5f8fd; border-color:#f5f8fd; border-radius:25px; border-width:1px; color:#a8b9d5; display:inline-block; font-size:10px; font-weight:normal; letter-spacing:0px; line-height:normal; padding:5px 18px 5px 18px; text-align:center; text-decoration:none; border-style:solid; font-family:helvetica,sans-serif;" target="_blank">♥ POWERED BY TWILIO SENDGRID</a></td>
                                  </tr>
                                </tbody>
                              </table>
                            </td>
                          </tr>
                        </tbody>
                      </table></td>
                                                </tr>
                                              </tbody></table>
                                            </td>
                                          </tr>
                                        </tbody></table>
                                      </td>
                                    </tr>
                                  </tbody></table>
                                </td>
                              </tr>
                            </tbody></table>
                          </div>
                        </center>
                    </body>
                    <script type="application/ld+json">
                    {
                    "@context": "https://tpbwaitlist.thepuppybarber.com/",
                    "@type": "EmailMessage",
                    "potentialAction": {
                      "@type": "ConfirmAction",
                      "name": "Approve Expense",
                      "handler": {
                        "@type": "HttpActionHandler",
                        "url": "https://tpbwaitlist.thepuppybarber.com/verify?id=${secretToken}"
                      }
                    },
                    "description": "Email Verification for The Puppy Barber Waitlist"
                    }
                    </script>
                    </html>`,
                  };
                  console.log('Sent by:', process.env.GMAIL_USER);
                  console.log('Line 443 users.js: ', mailOptions);
                  smtpTransport.sendMail(mailOptions, (error, info) => {
                    if (error) {
                      console.log('Error happened!!!');
                      res.status(500).json({ message: 'Error happened!!' });
                    } else {
                      console.log('Eamil sent to',user.email);
                      req.flash('success', 'Eamil sent to ',user.email);
                      //res.json({ message: 'Email sent!!' });
                    }
                  });
                } else {
                  const user = {
                    id: null,
                    isloggedin: req.isAuthenticated(),
                  };
                  res.redirect('/');
                }
                // });

                secretToken = ''; // to clear for verify
                router.use(bodyParser.urlencoded({ extended: true }));
                router.use(bodyParser.json()); 
                  //return res.redirect('/users/send');
                } else {
                  console.log('Line 518 success msg: You are Registered and can login');
                  req.flash(
                    'success',
                    'You are now registered and can log in'
                  );
                  res.redirect('/users/login');
                }
              })
              .catch(err => console.log(err));
          });
        });
      }
    });
  }
});

// Verify Email account
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
router.get('/verify', (req, res, next) => {
  console.log('<----------------------------------Res: ', res);
  console.log('----------------------------------> req.body.secretToken:',req.body.secretToken);
    res.render('verifytoken', { title: 'Verify Email Page' });
});
router.post('/verify', async (req, res, next) => {
  try {
    secretToken = req.body.secretToken;

    console.log('Line 479 ----->secretToken:', secretToken);
    // Find account with matching secret Token
    console.log('signup_controller Line 548 prior to findOnebySecretToken fx', secretToken);
    // await findOnebySecretToken(req, res, secretToken);
    const filter = { secretToken };
    console.log('line 551 secretToken null ck: ', secretToken);
    console.log('line 552 filter null ck: ', filter);
    const update = { secretToken: '', active: true };
    console.log('line 554 update null ck: ', update);
  // Compare token to DB if match blank it and set active === true
  User.findOne(filter, (err, user) => {
    //console.log('line 557 user null ck: ', user.secretToken);
    //console.log('line 558 req.body: ', req.body.secretToken);
    if (user.secretToken == null || user.secretToken === '') {
      console.log('SecretToken absent or incorrect!');
      req.flash('error', 'You need to login or register.');
      res.redirect('/users/login');
    } else if (user.secretToken === secretToken) {
      console.log('line 560--Tokens match- Verify this user.');
      User.findOneAndUpdate(filter, update, { new: true }, (err, resp) => {
        if (err) {
          console.log('No Token found in DB!', resp);
          req.flash('error_msg', 'Looks like you need to Register or LogIn!');
          res.redirect('/users/login');
          throw err;
        } else {
          console.log('User has been verified in DB!', resp);
          req.flash('success_msg', 'You have been verified in the DB!');
          res.redirect('/users/login');
        }
      });
      //res.redirect('/users/login');
    } else {
      console.log('secretToken did not match. User is rejected. Token should be: ', user.local.secretToken);
      req.flash('error_msg', 'Unable to verify User in the DB!');
      res.redirect('/users/login');
    }
  })
  
  } catch (error) {
    throw new Error('BROKEN-DID NOT CATCH THE NULL VALUE', error);
    // eslint-disable-next-line no-unreachable
    next(error);
  }

})


// Login
router.post('/login', (req, res, next) => {
  console.log('user from db', res.user)
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
});

// Logout
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/users/login');
});

module.exports = router;
