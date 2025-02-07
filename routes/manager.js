
var express = require("express");
var router = express.Router();

function isManager(req, res, next) {
  if ((req.isAuthenticated() && req.user.type === 'admin')||(req.isAuthenticated() && req.user.type === 'manager')) {
      return next();
  }
  return res.status(403).send('Forbidden');
}

router.get("/users-all",isManager, (req, res) => {

 const userId = req.user.id;

  req.pool.query("SELECT BranchID FROM User WHERE UserID = ?", [userId], (error, userResults) => {
    if (error) {

      res.status(500).json({ error: "Database error" });
      return;
    }

    if (userResults.length === 0) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const userBranchID = userResults[0].BranchID;



    req.pool.query("SELECT * FROM User WHERE BranchID = ?",[userBranchID], (error, results) => {
      if (error) {

        res.status(500).json({ error: "Database error" });
        return;
      }

      if (results.length === 0) {
        res.status(204).json({  });
        return;
      }

      res.status(200).json(results);
    });
  });
});

router.put("/remove_branch/:id",isManager, (req, res) => {
  const userId = req.params.id;


  const userTypeQuery = "SELECT UserType FROM User WHERE UserID = ?";
  req.pool.query(userTypeQuery, [userId], (error, userTypeResults) => {
    if (error) {

      res.status(500).json({ error: "Database error" });
      return;
    }

    if (userTypeResults.length === 0) {
      res.status(404).json({ error: "User to remove not found" });
      return;
    }

    const userTypeToRemove = userTypeResults[0].UserType;


    if ((userTypeToRemove === "manager" && req.user.type !== "admin")||userTypeToRemove === "admin" ) {
      res.status(403).json({ error: "Permission denied. Only admins can remove branch assignments for managers." });
      return;
    }


    const updateQuery = `
      UPDATE User
      SET BranchID = NULL, UserType = CASE WHEN UserType = 'manager' THEN 'user' ELSE UserType END
      WHERE UserID = ?`;

    req.pool.query(updateQuery, [userId], (error, updateResults) => {
      if (error) {

        res.status(500).json({ error: "Database error" });
        return;
      }

      if (updateResults.affectedRows === 0) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      res.status(200).json({ message: "User updated successfully" });
    });
  });
});

  module.exports = router;

