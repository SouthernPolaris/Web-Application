const passport = require('passport');

require('dotenv').config();
const pool = require('./database');

function generateNumericID() {
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 9);
    // eslint-disable-next-line no-undef
    return BigInt(`${timestamp}${randomNum}`);
}

require("./google-login.js");
require("./local-login.js");


passport.serializeUser(function(user, done) {
    const serializedUser = {
        id: user.id,
        type: user.type
    };

    done(null, serializedUser);
});

passport.deserializeUser(function(serializedUser, done) {

    const userId = serializedUser.id;

    pool.getConnection(function(err, connection) {
        if (err) {
            return done(err);
        }
        connection.query("SELECT * FROM User WHERE UserID = ?", [userId], function(error, rows) {
            connection.release();
            if (error) {

                return done(error);
            }
            if (rows.length === 0) {

                return done(new Error("User not found"));
            }
            const deserializedUser = {
                id: rows[0].UserID,
                type: rows[0].UserType
            };

            done(null, deserializedUser);
        });
    });
});

module.exports = passport;