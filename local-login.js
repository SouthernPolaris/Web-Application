const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const pool = require('./database');
const uuid = require('uuid');

function generateNumericID() {
    const uuidv4 = uuid.v4();
    return uuidv4;
}



passport.use('local-signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function(req, email, password, done) {


    pool.query("SELECT * FROM User WHERE EmailAddress = ?", [email], function(error, rows) {
        if (error) {
            return done(error);
        }
        if (rows.length > 0) {
            return done(null, false, { message: 'Email is already registered' });
        } else {

            bcrypt.hash(password, 10, function(err, hash) {
                if (err) {
                    return done(err);
                }
                const userID=generateNumericID();
                const newUser={
                    id:userID,
                    type:"user"

                };

                pool.query("INSERT INTO User (UserID,EmailAddress, PasswordHash,GivenName,LastName,PhoneNumber,UserType) VALUES (?,?, ?,?,?,?,?)", [userID,email, hash,req.body.firstName,req.body.lastName,req.body.phoneNumber,"user"], function(err2, result) {
                    if (err2) {
                        return done(err2);
                    }

                    console.log("new user created",newUser);
                    return done(null, newUser);
                });
            });
        }
    });
}));


passport.use('local-login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function(req, email, password, done) {
    console.log('Login attempt:', email); // Debugging log
    pool.query("SELECT * FROM User WHERE EmailAddress = ?", [email], function(error, rows) {
        if (error) {
            console.error('Database error:', error); // Debugging log
            return done(error);
        }
        if (rows.length === 0) {
            console.log('User not found:', email); // Debugging log
            return done(null, false, { message: 'User not found' });
        }

        bcrypt.compare(password, rows[0].PasswordHash, function(err, result) {
            if (err) {
                console.error('Bcrypt error:', err); // Debugging log
                return done(err);
            }
            if (!result) {
                console.log('Incorrect password for user:', email); // Debugging log
                return done(null, false, { message: 'Incorrect password' });
            }

            const user={
                id:rows[0].UserID,
                type: rows[0].UserType
            };

            console.log('Login successful:', user); // Debugging log

            return done(null, user);
        });
    });
}));

module.exports = passport;