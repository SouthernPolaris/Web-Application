var express = require("express");
const { recaptchaenterprise } = require("googleapis/build/src/apis/recaptchaenterprise");
var router = express.Router();
// var session = require("express-session");
// var bcrypt = require("bcryptjs");
const passport = require("passport");


router.post('/signup', (req, res, next) => {
    passport.authenticate('local-signup', (err, user, info) => {
        if (err) {
            console.log('Authentication error:', err);
            return next(err);
        }
        if (!user) {
            console.log('Signup failed:', info.message);
            return res.status(400).send({ message: info.message });
        }
        req.logIn(user, (err) => {
            if (err) {
                console.log('Login error:', err);
                return next(err);
            }
            console.log('Redirecting to profile');
            res.redirect('/');
        });
    })(req, res, next);
});

router.get('/profile', function(req, res) {
    if(req.isAuthenticated()) {


        res.redirect(302,"/");
    } else {
        res.sendStatus(403,"./LoginPage.html");
    }
});

router.get('/auth-check', function(req, res) {
    if(req.isAuthenticated()) {


        res.sendStatus(200);
    } else {
        res.redirect(403,"/LoginPage.html");
    }
});


router.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/users/profile',
    failureRedirect: '/user/profile',
    failureFlash: true
}));

router.post('/login', (req, res, next) => {
  passport.authenticate('local-login', (err, user, info) => {
    if (err) {
      console.log('Authentication error:', err);
      return next(err);
    }
    if (!user) {
      console.log('Login failed:', info.message);
      return res.status(400).send({ message: info.message });
    }
    req.logIn(user, (err) => {
      if (err) {
        console.log('Login error:', err);
        return next(err);
      }
      console.log('Login successful, redirecting...');
      return res.status(200).send({ message: 'Login successful', user });
    });
  })(req, res, next);
});
router.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.redirect('/');
    });
  });


router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']

}), function(req, res) {
    console.log("success");
});

router.get('/google/callback', passport.authenticate('google', {
    failureRedirect: '/'
}), function(req, res) {



    console.log("successful google signin");
    res.redirect('/');
});



router.get("/user",  (req, res) => {
  if(!req.isAuthenticated()) res.status(403).send();
    const userId = req.user.id;

    req.pool.query(
      "SELECT * FROM User WHERE UserID = ?",
      [userId],
      (error, results) => {
        if (error) {
          res.status(500).json({ error: "Database error" });
          return;
        }

        if (results.length === 0) {
          res.status(404).json({ error: "User not found" });
          return;
        }

        const currentUser = results[0];
        res.status(200).json(currentUser);
      }
    );
  });

  router.put("/user", (req, res) => {

    const userId = req.user.id;
    const { GivenName, LastName, PhoneNumber, EmailAddress,  ReceiveEmailNews,ReceiveEmailEvents} = req.body;
    console.log(ReceiveEmailEvents,"here");
    const sqlQuery = `
      UPDATE User
      SET
        GivenName = ?,
        LastName = ?,
        PhoneNumber = ?,
        EmailAddress = ?,
        ReceiveEmailNews=?,
        ReceiveEmailEvents=?
      WHERE
        UserID = ?`;

    req.pool.query(
      sqlQuery,
      [GivenName, LastName, PhoneNumber, EmailAddress, ReceiveEmailNews,ReceiveEmailEvents,userId],
      (error, results) => {
        if (error) {
          res.status(500).json({ error: "Database error" });
          return;
        }

        if (results.affectedRows === 0) {
          res.status(404).json({ error: "User not found" });
          return;
        }

        res.status(200).json({ message: "User updated successfully" });
      }
    );
  });


  router.delete("/delete", (req, res,next) => {
    const userId = req.user.id;
    req.logout((err) => {
        if (err) {
            return next(err);
        }
       return;
    });


    const deleteEventUserLinkQuery = `
        DELETE FROM EventUserLink
        WHERE UserID = ?`;

    const deleteSessionQuery = `
        DELETE FROM Session
        WHERE UserID = ?`;

    const deleteUserQuery = `
        DELETE FROM User
        WHERE UserID = ?`;

    req.pool.getConnection((err, connection) => {
      if (err) {
        console.error("Database connection error:", err);
        res.status(500).send("Internal server error");
        return;
      }

      connection.beginTransaction((error) => {
        if (error) {
          console.error("Transaction begin error:", error);
          connection.release();
          res.status(500).send("Internal server error");
          return;
        }

        // Delete associated rows in EventUserLink
        connection.query(deleteEventUserLinkQuery, [userId], (error, results) => {
          if (error) {
            console.error("Error deleting from EventUserLink:", error);
            return connection.rollback(() => {
              connection.release();
              res.status(500).send("Internal server error");
            });
          }

          // Delete associated rows in Session
          connection.query(deleteSessionQuery, [userId], (error, results) => {
            if (error) {
              console.error("Error deleting from Session:", error);
              return connection.rollback(() => {
                connection.release();
                res.status(500).send("Internal server error");
              });
            }

            // Delete the user from User table
            connection.query(deleteUserQuery, [userId], (error, results) => {
              if (error) {
                console.error("Error deleting from User:", error);
                return connection.rollback(() => {
                  connection.release();
                  res.status(500).send("Internal server error");
                });
              }

              // Commit the transaction
              connection.commit((error) => {
                if (error) {
                  console.error("Transaction commit error:", error);
                  return connection.rollback(() => {
                    connection.release();
                    res.status(500).send("Internal server error");
                  });
                }

                connection.release();
                res.redirect(200,"/");
              });
            });
          });
        });
      });
    });



  });

  router.put("/set_branch",(req,res)=>{
    const userId = req.user.id;
    const { BranchID } = req.body;

    const sqlQuery = `
      UPDATE User
      SET
      BranchID=?
      WHERE
        UserID = ?`;

    req.pool.query(
      sqlQuery,
      [BranchID, userId],
      (error, results) => {
        if (error) {
          res.status(500).json({ error: "Database error" });
          return;
        }


        if (results.affectedRows === 0) {
          res.status(404).json({ error: "User not found" });
          return;
        }
        if(req.user.type==="manager"){
          const query="UPDATE User SET UserType='user' WHERE UserID=?";
          req.pool.query(
          query,
            [userId],
            (error, results) => {
              if (error) {
                res.status(500).json({ error: "Database error" });
                return;
              }


              if (results.affectedRows === 0) {
                res.status(404).json({ error: "User not found" });
                return;
              }
            console.log("Manger removed");
        });

        }

        res.status(200).json({ message: "User updated successfully" });
      }
    );

  });



module.exports = router;