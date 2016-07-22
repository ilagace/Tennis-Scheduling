var mongodb = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;

var bookController = function(bookService, nav) {

    var middleware = function(req, res, next) {
        next();
    };

    var getIndex = function (req, res) {
        var url = 'mongodb://localhost:27017/library';
        mongodb.connect(url, function(err,db) {
            var collection = db.collection('books');
            collection.find({}).toArray(function(err,results) {
                res.render('books', {title:'Books', nav:nav, books:results});
            });
        });
    };

    var getByID = function (req, res) {
        var id = new ObjectID(req.params.id);
        var url = 'mongodb://localhost:27017/library';
        mongodb.connect(url, function(err,db) {
            var collection = db.collection('books');
            collection.findOne({_id: id}, function(err, results) {
                if (results.bookId) {
                    bookService.getBookByID(results.bookId, function(err, book) {
                        results.book = book;
                        res.render('book', {title:'Books', nav:nav, book:results});
                    });
                } else {
                    res.render('book', {title:'Books', nav:nav, book:results});
                };
            });
        });
    };

    return {
        getIndex: getIndex,
        getByID: getByID,
        middleware: middleware
    };
};

module.exports = bookController;