var express = require("express");
var router = express.Router();
const { param, body , validationResult } = require('express-validator');


/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

function isAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user.type === 'admin') {



      console.log(req.user.type);

      return next();
  }
  return res.status(403).send('Forbidden');
}

router.put('/updateType/:userId',isAdmin,
[
  param('userID').trim().escape().not().isEmpty()
],
(req,res)=>{
  if(!validationResult(req).isEmpty()) {
    res.send("Invalid Request").status(400);
    return;
  }
  const userID=req.params.userId;
  const {UserType}=req.body;

  const query=`   UPDATE User
  SET
  UserType=?
  WHERE
    UserID = ?`;
    req.pool.query(query, [UserType, userID], (err, result) => {
      if (err) {
        console.error('Error updating user type:', err);
        return res.status(500).json({ message: 'Internal server error' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.status(200).json({ message: 'User type updated successfully' });
    });

  });
router.delete("/delete/:userId", isAdmin,
[
  param('userID').trim().escape().not().isEmpty()
],
(req, res) => {
  if(!validationResult(req).isEmpty()) {
    res.send("Invalid Request").status(400);
    return;
  }
  const userId = req.params.userId;

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

      connection.query(deleteEventUserLinkQuery, [userId], (error, results) => {
        if (error) {
          console.error("Error deleting from EventUserLink:", error);
          return connection.rollback(() => {
            connection.release();
            res.status(500).send("Internal server error");
          });
        }

        connection.query(deleteSessionQuery, [userId], (error, results) => {
          if (error) {
            console.error("Error deleting from Session:", error);
            return connection.rollback(() => {
              connection.release();
              res.status(500).send("Internal server error");
            });
          }

          connection.query(deleteUserQuery, [userId], (error, results) => {
            if (error) {
              console.error("Error deleting from User:", error);
              return connection.rollback(() => {
                connection.release();
                res.status(500).send("Internal server error");
              });
            }

            connection.commit((error) => {
              if (error) {
                console.error("Transaction commit error:", error);
                return connection.rollback(() => {
                  connection.release();
                  res.status(500).send("Internal server error");
                });
              }

              connection.release();
              res.status(200).send("User deleted successfully");
            });
          });
        });
      });
    });
  });
});

router.get("/branches", isAdmin,(req, res) => {
    req.pool.query("SELECT b.*, a.* FROM Branch b INNER JOIN Address a ON b.AddressID = a.AddressID", (error, results) => {
      if (error) {
        console.error("Error retrieving branches:", error);
        return res.status(500).json({ error: "Database error" });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: "No branches found" });
      }

      const branches = results.map(branch => ({
        BranchID: branch.BranchID,
        name: branch.Name,
        address: {
          addressID: branch.AddressID,
          houseNumber: branch.HouseNumber,
          streetName: branch.StreetName,
          city: branch.City,
          state: branch.State,
          postcode: branch.Postcode
        },
        phone: branch.PhoneNumber,
        email: branch.EmailAddress
      }));

      res.status(200).json(branches);
    });
  });

router.delete("/deleteBranch/:branchID", isAdmin,
  [
    param('branchID').isInt().toInt()
  ],
  (req, res) => {

    if(!validationResult(req).isEmpty()) {
      res.send("Invalid Request").status(400);
      return;
    }

  const branchID = req.params.branchID;

  const deleteNews = `
      DELETE FROM News
      WHERE BranchID = ?`;

  const deleteEventsQuery = `
    DELETE FROM EventUserLink
     WHERE EventID IN
      (SELECT EventID FROM Events WHERE BranchID = ?)`;

  const deleteEventLink = `
      DELETE FROM Events
      WHERE BranchID = ?`;

  const delUser = `  UPDATE User
    SET BranchID = NULL
    WHERE BranchID = ?`;

  const delBranch = ` DELETE FROM Branch
    WHERE BranchID = ?`;

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


      connection.query(deleteNews, [branchID], (error, results) => {
        if (error) {
          console.error("Error deleting from EventUserLink:", error);
          return connection.rollback(() => {
            connection.release();
            res.status(500).send("Internal server error");
          });
        }

        connection.query(deleteEventsQuery, [branchID], (error, results) => {
          if (error) {
            console.error("Error deleting from Session:", error);
            return connection.rollback(() => {
              connection.release();
              res.status(500).send("Internal server error");
            });
          }

          connection.query(deleteEventLink, [branchID], (error, results) => {
            if (error) {
              console.error("Error deleting from User:", error);
              return connection.rollback(() => {
                connection.release();
                res.status(500).send("Internal server error");
              });
            }

            connection.query(delUser, [branchID], (error, results) => {
              if (error) {
                console.error("Error deleting from User:", error);
                return connection.rollback(() => {
                  connection.release();
                  res.status(500).send("Internal server error");
                });
              }

              connection.query(delBranch, [branchID], (error, results) => {
                if (error) {
                  console.error("Error deleting from User:", error);
                  return connection.rollback(() => {
                    connection.release();
                    res.status(500).send("Internal server error");
                  });
                }

                connection.commit((error) => {
                  if (error) {
                    console.error("Transaction commit error:", error);
                    return connection.rollback(() => {
                      connection.release();
                      res.status(500).send("Internal server error");
                    });
                  }

                  connection.release();
                  res.status(200).send("User deleted successfully");
                });
              });
            });
          });
        });
      });
    });
  });
});

router.post('/createBranch', isAdmin,

  [
    body('name').trim().escape().not().isEmpty(),
    body('address').trim().escape().not().isEmpty(),
    body('city').trim().escape().not().isEmpty(),
    body('state').trim().escape().not().isEmpty(),
    body('postcode').trim().escape().not().isEmpty(),
    body('phone').trim().escape().not().isEmpty(),
    body('email').trim().escape().not().isEmpty()
  ],

  (req, res) => {

    if(!validationResult(req).isEmpty()) {
      res.send("Invalid Request").status(400);
      return;
    }

    const { name,street, address, city, state, postcode, phone, email } = req.body;

    const connection = req.pool;

    if (!name || !address || !city || !state || !postcode || !phone || !email) {
        return res.status(400).send('All fields are required');
    }




    const addressSql = `INSERT INTO Address (HouseNumber, StreetName, City, State, Postcode) VALUES (?, ?, ?, ?, ?)`;
    const addressValues = [ address,street, city, state, postcode];

    connection.query(addressSql, addressValues, (addressErr, addressResult) => {
        if (addressErr) {
            console.error('Error inserting address into database:', addressErr);
            return res.status(500).send('Error inserting address into database');
        }


        const addressID = addressResult.insertId;


        const branchSql = `INSERT INTO Branch (Name, AddressID, PhoneNumber, EmailAddress) VALUES (?, ?, ?, ?)`;
        const branchValues = [name, addressID, phone, email];

        connection.query(branchSql, branchValues, (branchErr, branchResult) => {
            if (branchErr) {
                console.error('Error inserting branch into database:', branchErr);
                return res.status(500).send('Error inserting branch into database');
            }

            console.log('Branch inserted into database');
            res.status(200).send('Branch inserted into database');
        });
    });
});

router.put('/updateBranch/:branchId', isAdmin,

  param('branchId').isInt().toInt(),

  (req, res) => {

    if(!validationResult(req).isEmpty()) {
      res.send("Invalid Request").status(400);
      return;
    }

  const branchId = req.params.branchId;
  console.log(req.body);
  const { name, address,street, city, state, postcode, phone, email } = req.body;

  const connection = req.pool;

  if (!name || !address || !city || !state || !postcode || !phone || !email) {
      return res.status(400).send('All fields are required');
  }

  const getAddressIdSql = `SELECT AddressID FROM Branch WHERE BranchID = ?`;
  connection.query(getAddressIdSql, [branchId], (getAddressIdErr, getAddressIdResult) => {
      if (getAddressIdErr) {
          console.error('Error fetching address ID:', getAddressIdErr);
          return res.status(500).send('Error fetching address ID');
      }

      const addressId = getAddressIdResult[0].AddressID;

      const updateAddressSql = `UPDATE Address SET HouseNumber=?, StreetName = ?, City = ?, State = ?, Postcode = ? WHERE AddressID = ?`;
      const updateAddressValues = [address,street, city, state, postcode, addressId];

      connection.query(updateAddressSql, updateAddressValues, (updateAddressErr, updateAddressResult) => {
          if (updateAddressErr) {
              console.error('Error updating address:', updateAddressErr);
              return res.status(500).send('Error updating address');
          }

          const updateBranchSql = `UPDATE Branch SET Name = ?, PhoneNumber = ?, EmailAddress = ? WHERE BranchID = ?`;
          const updateBranchValues = [name, phone, email, branchId];

          connection.query(updateBranchSql, updateBranchValues, (updateBranchErr, updateBranchResult) => {
              if (updateBranchErr) {
                  console.error('Error updating branch:', updateBranchErr);
                  return res.status(500).send('Error updating branch');
              }

              console.log('Branch and address updated successfully');
              res.status(200).send('Branch and address updated successfully');
          });
      });
  });
});

router.get('/users-all/:search',isAdmin, (req, res) => {
  const searchID = req.params.search;

  const query = `
    SELECT * FROM User
    WHERE INSTR(CONCAT(GivenName, ' ', LastName), ?) > 0
  `;

  req.pool.query(query, [searchID], (error, results) => {
    if (error) {
      console.error('Database error:', error);
      res.status(500).json({ error: "Database error" });
      return;
    }

    if (results.length === 0) {
      res.status(204).send();
      return;
    }

    res.status(200).json(results);
  });
});

router.get('/branch-all/:search', isAdmin,

  [
    param('search').trim().escape().not().isEmpty(),
  ],

  (req, res) => {
  const searchID = req.params.search;

  if(!validationResult(req).isEmpty()) {
    res.send("Invalid Request").status(400);
    return;
  }

  const query = `
    SELECT b.*, a.*
    FROM Branch b
    INNER JOIN Address a ON b.AddressID = a.AddressID
    WHERE INSTR(b.Name, ?) > 0
  `;

  req.pool.query(query, [searchID], (error, results) => {
    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "No branches found" });
    }

    const branches = results.map(branch => ({
      BranchID: branch.BranchID,
      name: branch.Name,
      address: {
        addressID: branch.AddressID,
        houseNumber: branch.HouseNumber,
        streetName: branch.StreetName,
        city: branch.City,
        state: branch.State,
        postcode: branch.Postcode
      },
      phone: branch.PhoneNumber,
      email: branch.EmailAddress
    }));

    res.status(200).json(branches);
  });
});






module.exports = router;
