const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
require('dotenv').config();
const pool = require('./database');
const uuid = require('uuid');

function generateNumericID() {
    const uuidv4 = uuid.v4();
    return uuidv4;
}

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_OAUTH,
    clientSecret: process.env.GOOGLE_SECRET_OAUTH,
    callbackURL: "http://localhost:8080/users/google/callback"
},
function(accessToken, refreshToken, profile, done) {
    pool.getConnection(function(err, connection) {
        if (err) {
            return done(err);
        }

        const email = profile._json.email;
        const givenName = profile._json.given_name;
        const familyName = profile._json.family_name;

        connection.query("SELECT * FROM User WHERE EmailAddress = ?", [email], function(error, rows) {
            if (error) {
                connection.release();
                return done(error);
            }

            if (rows.length > 0) {
                connection.release();
                const newUser = {
                    id: rows[0].UserID,
                    type: rows[0].UserType



                };
                console.log("here",rows[0]);
                return done(null, newUser);
            } else {
                const userID = generateNumericID();


                connection.query('INSERT INTO User (UserID, GivenName, LastName, EmailAddress,UserType) VALUES (?, ?, ?, ?,?)',
                [userID, givenName, familyName, email,"user"], function(error2, result) {
                    connection.release();
                    if (error2) {
                        return done(error2);
                    }
                    const newUser = {
                        id: userID,
                        type: "user"



                    };
                    console.log("New User Created:", newUser);
                    return done(null, newUser);
                });
            }
        });
    });
}));

module.exports=passport;