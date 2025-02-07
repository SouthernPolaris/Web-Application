var express = require("express");
var router = express.Router();
var axios = require("axios");
const { body , validationResult } = require('express-validator');
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

function isAdmin(req, res, next) {

  if (req.isAuthenticated() && req.user.type === 'admin' || req.isAuthenticated() && req.user.type === 'manager') {

      console.log(req.user.type);

      return next();
  }
  return res.status(403).send('Forbidden');
}

router.get('/article-all',function(req,res) {

  req.pool.getConnection(function(err, connection) {

    if (err) {
      res.sendStatus(500);
      return;
    }
    var query = `
      SELECT
      News.ArticleID,
      News.ArticleName,
      News.ArticleContent,
      News.Visibility,
      News.TimestampID,
      Branch.Name
      FROM News
      JOIN Branch ON News.BranchID = Branch.BranchID
      WHERE  News.Visibility = 1`;

    connection.query(query, function(err, rows, fields) {

    if (err) {
      console.log("query error!!!_", err);
      res.sendStatus(500);
      return;
    }

    connection.release();
    res.status(200).json(rows);

    });
  });

});






router.get('/article/:id', function(req,res) {

  const id=req.params.id;
    req.pool.getConnection(function(err, connection) {

      if (err) {
        res.sendStatus(500);
        return;
      }
      var query = `
        SELECT
        News.ArticleID,
        News.ArticleName,
        News.ArticleContent,
        News.Visibility,
        News.TimestampID,
        Branch.Name
        FROM News
        JOIN Branch ON News.BranchID = Branch.BranchID
        WHERE News.BranchID = ?`;

      connection.query(query, id,function(err, rows, fields) {

      if (err) {
        console.log("query error!!!_", err);
        res.sendStatus(500);
        return;
      }

      connection.release();
      res.status(200).json(rows);

      });
    });

  });

  router.post('/create_article', isAdmin,

    [
      body('ArticleName').trim().escape().not().isEmpty(),
      body('ArticleContent').trim().escape().not().isEmpty()
    ],

    function(req,res) {

      if(!validationResult(req).isEmpty()) {
        console.log("News Input Invalid");

        res.send("Invalid Inputs. Try Again").status(400);
        return;
      }


    req.pool.getConnection(function(err,connection) {

      if (err) {
        console.log(err);
        res.sendStatus(500);
        return;
      }

      var article = req.body;

      connection.beginTransaction( function(err) {

        if (err) {
          console.log(err);

          res.sendStatus(500);
          return;
        }


          var query = "INSERT INTO News (ArticleName, ArticleContent, Visibility, BranchID) VALUES (?,?,?,?)";


          connection.query(query, [article.ArticleName, article.ArticleContent, article.Visibility, article.BranchID], function(err,rows,fields) {

            if (err) {
              console.log(err);


              return connection.rollback(function() {
                res.sendStatus(500);
              });
            }

            connection.commit( function(err) {
              if (err) {
                console.log(err);

                return connection.rollback(function() {
                  res.sendStatus(500);
                });
              }

              // changed this query without testing. if any errors may be why. now adding functionality
              // to check if user checked to receive emails
              var userQuery = 'SELECT EmailAddress FROM User WHERE ReceiveEmailNews = true AND BranchID = ?';
              connection.query(userQuery, [article.BranchID], function(error, rows, fields) {

                if(error) {
                  connection.release();
                  res.sendStatus(500);
                }

                console.log("Rows: ", rows);
                connection.release();

                var email = [];

                if(rows !== null) {
                  var d = rows;
                  for(let i = 0; i < d.length; i++) {
                    email.push(d[i].EmailAddress);
                  }
                  // email.push("test");
                  console.log(email);

                  var sendingData = [email, article];
                  console.log(sendingData);

                  axios.post('http://localhost:8080/contact/news', sendingData)
                    .then(response => {
                        console.log("Axios response: ", response.data);
                        res.send(response.data);
                    }).catch (error => {
                        console.log(error);
                        res.status(500);
                  });
                }


              });

            });
        });

      });

      });
    });


  router.put('/edit_article/:id', isAdmin, function(req,res) {
    req.pool.getConnection(function(err,connection) {

      if (err) {
        console.log(err);
        res.sendStatus(500);
        return;
      }

      var article = req.body;

      var query = "UPDATE News SET ArticleName = ?, ArticleContent = ? WHERE ArticleID = ?";

      connection.query(query, [article.ArticleName, article.ArticleContent, req.params.id], function(err, rows, fields) {
        connection.release();

        if (err) {
          console.log(err);
          res.sendStatus(500);
          return;
        }

        res.sendStatus(200);
      });
    });
  });

  router.delete('/delete_article/:id', function(req,res) {
    req.pool.getConnection(function(err, connection) {
      if (err) {
        console.log(err);
        res.sendStatus(500);
        return;
      }

      var query = "DELETE FROM News WHERE ArticleID = ?";

      connection.query(query, [req.params.id], function(err, rows, fields) {
        connection.release();

        if (err) {
          console.log(err);
          res.sendStatus(500);
          return;
        }

        res.sendStatus(200);
      });
    });
  });


module.exports = router;