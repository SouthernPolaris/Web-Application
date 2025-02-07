var express = require("express");
var router = express.Router();
const { body , validationResult } = require('express-validator');
const nodemailer = require("nodemailer");
const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;

const OAuth_client = new OAuth2(process.env.GOOGLE_CLIENT_OAUTH, process.env.GOOGLE_SECRET_OAUTH, process.env.GOOGLE_OAUTH_REDIRECT);
OAuth_client.setCredentials( {refresh_token: process.env.NODEMAILER_REFRESH_TOKEN} );

// REFRESH TOKENS NEED TO BE RECREATED EVERY NOW AND THEN THROUGH THE GOOGLE OAUTHPLAYGROND WEBPAGE
// If experiencing any errors from contacting users or the email contact form, that may be why
router.post("/",
  [
    body('email').trim().escape().isEmail().withMessage('Invalid Email').normalizeEmail(),
    body('subject').trim().escape().not().isEmpty(),
    body('text').trim().escape().not().isEmpty()
  ],
  function (req, res, next) {

    if(!validationResult(req).isEmpty()) {
      res.send("Invalid Inputs. Try Again").status(400);
      return;
    }

    const email = req.body.email;
    const subject = req.body.subject;
    const text = req.body.text;

    const accessToken = OAuth_client.getAccessToken();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: 'cs.bankfood@gmail.com',
        clientId: process.env.GOOGLE_CLIENT_OAUTH,
        clientSecret: process.env.GOOGLE_SECRET_OAUTH,
        refreshToken: process.env.NODEMAILER_REFRESH_TOKEN,
        accessToken: accessToken
      },
    });


    const message = {
        from: `BankFood <cs.bankfood@gmail.com>`, // sender address
        to: `${email}`, // list of receivers
        subject: `${subject}`, // Subject line
        text: `${text}`, // plain text body
        html: `<h1>${text}</h1>`
    };


    transporter.sendMail(message, function(error, result) {
      if(error) {
        console.log("Error: ", error);
      } else {
        console.log("Success: ", result);
      }
      transporter.close();
    });

    res.send("email sent");

});

router.post('/user-contact',

  [
    body('email').trim().escape().isEmail().withMessage('Invalid Email').normalizeEmail(),
    body('subject').trim().escape().not().isEmpty(),
    body('text').trim().escape().not().isEmpty()
  ],

  function(req, res, next) {

    if(!validationResult(req).isEmpty()) {
      res.send("Invalid Inputs. Try Again").status(400);
      return;
    }

  const requestBody = (req.body);
  // console.log(requestBody);

  const email = requestBody.email;
  const subject = requestBody.subject;
  const text = requestBody.text;

  const accessToken = OAuth_client.getAccessToken();

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: 'cs.bankfood@gmail.com',
      clientId: process.env.GOOGLE_CLIENT_OAUTH,
      clientSecret: process.env.GOOGLE_SECRET_OAUTH,
      refreshToken: process.env.NODEMAILER_REFRESH_TOKEN,
      accessToken: accessToken
    },
  });

  const message = {
    from: `User ${email}`, // sender address
    to: `<cs.bankfood@gmail.com>`, // list of receivers
    subject: `${subject}`, // Subject line
    text: `FROM ${email}: ${text}`, // plain text body
    html: `<h1>From ${email}:</h1><p>${text}</p>`
  };


  transporter.sendMail(message, function(error, result) {
    if(error) {
      console.log("Error: ", error);
    } else {
      console.log("Success: ", result);
    }
    transporter.close();
  });

  res.send("User email sent");
});

router.post('/news',

  [
    body('email.*').trim().escape().isEmail().withMessage('Invalid Email').normalizeEmail(),
    body('[1].ArticleName').trim().escape().not().isEmpty(),
    body('[1].ArticleContent').trim().escape().not().isEmpty()
  ],

  function(req, res, next) {

    console.log("This is the code: ", req.body);

    if(!validationResult(req).isEmpty()) {
      console.log(validationResult(req));
      res.send("Invalid Inputs. Try Again").status(400);
      return;
    }



  var toSend = req.body;

  console.log("Request Body: ", req.body);

  var emails = req.body[0];


  // Just a small max limit because I do not want to risk being flagged as a bot by google
  // If this application was actually deployed, it'll be much higher
  if(emails.length > 20) {
    res.send("Too many emails to send as a failsafe").status(500);
  }

  var subject = req.body[1].ArticleName;

  var text = req.body[1].ArticleContent;

  const accessToken = OAuth_client.getAccessToken();

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: 'cs.bankfood@gmail.com',
      clientId: process.env.GOOGLE_CLIENT_OAUTH,
      clientSecret: process.env.GOOGLE_SECRET_OAUTH,
      refreshToken: process.env.NODEMAILER_REFRESH_TOKEN,
      accessToken: accessToken
    },
  });


  const message = {
    from: `BankFood <cs.bankfood@gmail.com>`, // sender address
    // send to self to avoid leaking email of any recepients by targetting them as primary sender
    to: `cs.bankfood@gmail.com`,
    subject: `${subject}`, // Subject line
    text: `${text}`, // plain text body
    html: `<p>${text}</p>`,
    // OPTIMISING PERFORMANCE: BCC Emails at once to avoid creating new nodemailer instances
    // and messages for every single email in array. O(n) -> O(1)
    bcc: emails
  };

  console.log("Working...");

  transporter.sendMail(message, function(error, result) {
    if(error) {
      console.log("Error: ", error);
    } else {
      console.log("Success: ", result);
    }
    transporter.close();
  });

  res.send("News Emails Sent").status(200);
});



router.post('/events',

  // [
  //   body('email.*').trim().escape().isEmail().withMessage('Invalid Email').normalizeEmail(),
  //   body('[1].ArticleName').trim().escape().not().isEmpty(),
  //   body('[1].ArticleContent').trim().escape().not().isEmpty()
  // ],

  function(req, res, next) {

    console.log("This is the code: ", req.body);

    // if(!validationResult(req).isEmpty()) {
    //   console.log(validationResult(req));
    //   res.send("Invalid Inputs. Try Again").status(400);
    //   return;
    // }

  // console.log("Request Body: ", req.body);

  var emails = req.body.emails;
  var subject = req.body.subject;
  var text = req.body.text;
  var timestamp = req.body.timestamp;

  // Just a small max limit because I do not want to risk being flagged as a bot by google
  // If this application was actually deployed, it'll be much higher
  if(emails.length > 20) {
    res.send("Too many emails to send as a failsafe").status(500);
  }

  const accessToken = OAuth_client.getAccessToken();

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: 'cs.bankfood@gmail.com',
      clientId: process.env.GOOGLE_CLIENT_OAUTH,
      clientSecret: process.env.GOOGLE_SECRET_OAUTH,
      refreshToken: process.env.NODEMAILER_REFRESH_TOKEN,
      accessToken: accessToken
    },
  });

  const message = {
    from: `BankFood <cs.bankfood@gmail.com>`, // sender address
    // send to self to avoid leaking email of any recepients by targetting them as primary sender
    to: `cs.bankfood@gmail.com`,
    subject: `${subject}`, // Subject line
    text: `${text}`, // plain text body
    html: `<p>${text}</p><p>The Event Begins At: ${timestamp}</p>`,
    // OPTIMISING PERFORMANCE: BCC Emails at once to avoid creating new nodemailer instances
    // and messages for every single email in array. O(n) -> O(1)
    bcc: emails
  };

  console.log("Working...");

  transporter.sendMail(message, function(error, result) {
    if(error) {
      console.log("Error: ", error);
    } else {
      console.log("Success: ", result);
    }
    transporter.close();
  });

  res.send("Events Emails Sent").status(200);
});



module.exports = router;