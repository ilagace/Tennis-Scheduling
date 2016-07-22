var express = require('express');

var mongodb = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;

var bookrouter = express.Router();

var router = function(nav) {
    var bookService = require('../services/goodreadsServices')();
    var bookController = require('../controllers/bookController')(bookService, nav);

    bookrouter.use(bookController.middleware);

    bookrouter.route('/').get(bookController.getIndex);

    bookrouter.route('/:id').get(bookController.getByID);

    return bookrouter;

};

module.exports = router;