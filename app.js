var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const flash = require('connect-flash');
// const http = require('http');
// const https = require("https");
// const fs = require('fs');



var dbConnectionPool = require('./database');

const passport = require("passport");

var session = require("express-session");


var environment = require('dotenv').config();


var app = express();

// attempted to make HTTPS for security but constant self-signed security key
// warnings made website unusable. Keeping it here because it shows attempted security improvement

// const options = {

//     key: fs.readFileSync('server.key', 'utf8'),
//     cert: fs.readFileSync('server.crt', 'utf8')

// };

// app.enable('trust proxy');

// const httpsServer = https.createServer(options, app)
// .listen(443, () => {
//     console.log('server running at 443');
// });


app.use(function(req, res, next) {

    req.pool = dbConnectionPool;
    next();

});




app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: false
  }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(flash());

  require('./passport-setup.js');


var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var eventRouter = require("./routes/event");
var ManagerRouter = require("./routes/manager");
var NewsRouter = require("./routes/news");
var branchRouter = require("./routes/branch");
var adminRouter = require("./routes/admin");

var contactRouter = require("./routes/contact");
const { profile } = require("console");
const { callbackify } = require("util");


app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));



app.use("/users", usersRouter);
app.use("/", indexRouter);
app.use("/event", eventRouter);

app.use("/admin", adminRouter);

app.use("/contact", contactRouter);
app.use("/manager", ManagerRouter);

app.use("/news", NewsRouter);
app.use("/branch", branchRouter);




app.get('/env', function(req, res) {
    res.json({
        apiKeyGoogle: process.env.GOOGLE_CLIENT_OAUTH,
        apiSecret: process.env.GOOGLE_SECRET_OAUTH
    });
});

app.use(function(err, req, res, next) {
    // console.log(err);
});


module.exports = app;
