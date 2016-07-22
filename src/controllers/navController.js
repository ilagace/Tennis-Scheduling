var mongodb = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;

var navController = function(basenav, localbasenav, indexnav, indexskip, pagesize) {

    var middleware = function(req, res, next) {
        next();
    };

    var getRoot = function (req, res) {
        res.render('navigation', {nav: basenav, link: '/navigation/'});
    };

    var getByTheme = function (req, res) {
        indexnav = req.params.id;
        var theme = localbasenav[indexnav];
        var url = 'mongodb://localhost:27017/library';
        mongodb.connect(url, function(err, db) {
            var collection = db.collection('IvanPhotos');
            collection.distinct('folder', {theme: theme}, function(err, results) {
                if (results) {
                    res.render('navfolder', {nav: results.sort(), link: '/navigation/folder/'});
                } else {
                    res.render('navigation', {nav: basenav, link: '/navigation/'});
                }
            });
        });
    };
    var getSkipIndex = function (req, res) {
        var folder = req.params.id;
        indexskip = req.params.page;
        if (indexskip === '0') {
            indexnav = 0;
        } else {
            if (indexskip === '+') {
                indexnav += pagesize;
            } else {
                if (indexskip === '-') {
                    indexnav -= pagesize;
                }
            }
        }
        res.redirect('/navigation/folder/' + folder);
    };

    var getInFolder = function (req, res) {
        var folder = req.params.id;
        var url = 'mongodb://localhost:27017/library';
        mongodb.connect(url, function(err, db) {
            var collection = db.collection('IvanPhotos');
            var photocount = 0;
            var isMovie = false;
            collection.findOne({folder: folder, mediaType: 'video'}, function(err, results) {
                if (results) {
                    // Test for movies and remove them but set the flag
                    isMovie = true;
                }
                collection.count({folder: folder, mediaType: 'photo'}, function(err, results) {
                    photocount = results;
                    collection.find({folder: folder, mediaType: 'photo'}).sort({exifdate: 1, filename: 1}).limit(pagesize).skip(indexnav).toArray(function(err, results) {
                        if (results && results[0] !== undefined) {
                            var themeid = localbasenav.indexOf(results[0].theme);
                            //  check if we are at the end of the folder
                            var photoend = true;
                            if (photocount > (indexnav + results.length)) {
                                photoend =  false;
                            }
                            res.render('photos',  {nav: ['Back', 'Theme'],
                                        link: ['/navigation/' + themeid, '/navigation/'] ,
                                        theme: basenav[themeid], results: results,
                                        pagesize: pagesize, indexnav: indexnav, photoend: photoend,
                                        isMovie: isMovie
                                        });
                        } else {
                            res.render('navigation', {nav: basenav, link: '/navigation/'});
                        }
                        db.close();
                    });
                });
            });
        });
    };

    var showVideo = function (req, res) {
        var folder = req.params.id;
        var url = 'mongodb://localhost:27017/library';
        mongodb.connect(url, function(err, db) {
            var collection = db.collection('IvanPhotos');
            var photocount = 0;
            collection.count({folder: folder}, function(err, results) {
                photocount = results;
            });
            collection.find({folder: folder, mediaType: 'video'}).sort({exifdate: 1, filename: 1}).toArray(function(err, results) {
                if (results) {
                    var themeid = localbasenav.indexOf(results[0].theme);
                    //  check if we are at the end of the folder
                    var photoend = true;
                    res.render('videos',  {nav: ['Back', 'Theme'],
                                link: ['/navigation/' + themeid, '/navigation/'] ,
                                theme: basenav[themeid], results: results,
                                pagesize: pagesize, indexnav: indexnav, photoend: photoend
                                });
                } else {
                    res.render('navigation', {nav: basenav, link: '/navigation/'});
                }
                db.close();
            });
        });
    };

    return {
        getRoot: getRoot,
        getByTheme: getByTheme,
        getSkipIndex: getSkipIndex,
        getInFolder: getInFolder,
        showVideo: showVideo,
        middleware: middleware
    };
};

module.exports = navController;