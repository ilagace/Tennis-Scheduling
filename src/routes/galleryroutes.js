var express = require('express');

var mongodb = require('mongodb').MongoClient;

var galleryrouter = express.Router();

var router = function(basenav, localbasenav, category) {

    //  Angular will handle the data for the page by calling /searchmedia
    galleryrouter.route('/:id').get(function(req, res) {
        var photoArray = [];
        var categ = category[req.params.id];
        if (!categ) {
            categ = 'Sea';
        }
        var url = 'mongodb://localhost:27017/library';
        mongodb.connect(url, function(err,db) {
            var collection = db.collection('IvanPhotos');
            collection.find({category: categ},{theme:1, folder:1, filename:1, category:1, description:1, reverseGeo:1}).toArray(function(err, results) {
                if (results) {
                    for (var i = 0; i < results.length; i++) {
                        photoArray.push(['assets/' + basenav[localbasenav.indexOf(results[i].theme)] + '/' +
                                        results[i].folder + '/' + results[i].filename, results[i].description, results[i].reverseGeo]);
                    }
                }
                console.log(photoArray);
                db.close();
                res.render('gallery', {photoArray: photoArray, category: category, categ: category.indexOf(categ)});
            });
        });
    });

    return galleryrouter;

};

module.exports = router;
