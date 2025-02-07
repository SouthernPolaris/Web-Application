var express = require("express");
var router = express.Router();
const path = require('path');

router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../staticHTML', 'home.html'));
});

router.get('/loginPage', (req, res) => {
  if (req.isAuthenticated()) {
    res.sendFile(path.join(__dirname, '../staticHTML', 'Profile.html'));
  } else {
    res.sendFile(path.join(__dirname, '../staticHTML', 'LoginPage.html'));
  }
});

router.get('/events', (req, res) => {
  if (req.isAuthenticated()) {
    res.sendFile(path.join(__dirname, '../staticHTML', 'Events.html'));
  } else {
    res.redirect('/loginPage');
  }
});

router.get('/faq', (req, res) => {

    res.sendFile(path.join(__dirname, '../staticHTML', 'faq.html'));


});

router.get('/findUs', (req, res) => {

    res.sendFile(path.join(__dirname, '../staticHTML', 'FindUs.html'));

});

router.get('/joinUs', (req, res) => {
  res.sendFile(path.join(__dirname, '../staticHTML', 'JoinUs.html'));
});

router.get('/loginPage', (req, res) => {
  res.sendFile(path.join(__dirname, '../staticHTML', 'LoginPage.html'));
});

router.get('/news', (req, res) => {
  res.sendFile(path.join(__dirname, '../staticHTML', 'News.html'));
});

router.get('/privacyPolicy', (req, res) => {
  res.sendFile(path.join(__dirname, '../staticHTML', 'privacyPolicy.html'));
});

router.get('/profile', (req, res) => {
  if (req.isAuthenticated()) {
    res.sendFile(path.join(__dirname, '../staticHTML', 'Profile.html'));
  } else {
    res.redirect('/loginPage');
  }
});

router.get('/termsOfService', (req, res) => {
  res.sendFile(path.join(__dirname, '../staticHTML', 'termsOfService.html'));
});



router.get("/articles", function(req,res,next) {
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


module.exports = router;
