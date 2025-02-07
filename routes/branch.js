var express = require("express");
var router = express.Router();

router.get('/', function(req, res) {

    req.pool.getConnection(function(err, connection) {

        if(err) {
            console.log("Error Connecting to DB: ", err);
            res.sendStatus(500);
            return;
        }

        var query = `SELECT BranchID,Name, HouseNumber, StreetName, City, State, Postcode,EmailAddress,PhoneNumber
        FROM Branch
        INNER JOIN Address ON Branch.AddressID = Address.AddressID`;

        connection.query(query, function(error, rows, fields) {

            if(error) {
                connection.release();
                console.log("Query Error: ", error);
                res.sendStatus(500);
                return;
            }

            connection.release();
            console.log(rows);
            res.send(rows);

        });


    });

});


module.exports = router;