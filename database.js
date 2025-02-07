var mysql = require('mysql');

var dbConnectionPool = mysql.createPool({

    host: 'localhost',
    database: 'test-db' // change name to actual db

});

module.exports = dbConnectionPool;