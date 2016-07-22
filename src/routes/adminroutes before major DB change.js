var express = require('express');

var mongodb = require('mongodb').MongoClient;

var adminrouter = express.Router();


var router = function() {

    adminrouter.route('/addphotos').get(function(req, res) {

        //  To do a walkthrough of all the photos for my web site
        var walk = require('walk'),
            options, walker;

        options = {
            followLinks: false,
            // directories with these keys will be skipped                 ,
            filters: ['thumb']
        };

        //  To read the exif data on most recent photos
        var ExifImage = require('exif').ExifImage;

        // To read the txt file with description
        var fs = require('fs');

        var GoogleMapsAPI = require('googlemaps');

        //  Setup Google Maps API
        var publicConfig = {
            key: 'AIzaSyAhPi1zmHW0g3PdQgTs9rcO-3FweDPiT-U',
        };
        var gmAPI = new GoogleMapsAPI(publicConfig);

        //  Google Maps reverse geocode API
        var reverseGeocodeParams = {
            'latlng':        '0,0',
            'language':      'en'
        };

        //  Build an array of data for each photos on the web site
        var imagetype = ['.jpg', 'JPG','.bmp'];
        var photocounter = 0;
        var totalCount = 0;
        var connectErrorNum = 0;
        var recordCheck = 0;
        var recordFound = 0;

        //  Here is the database
        var url = 'mongodb://localhost:27017/library';

        //  This code is meant to be run on the local machine to update the database and then copy the database to the web server
        //  because the subfolders exists only on the local machine
//        walker = walk.walk('D:\\Web\\Web site\\Famille\\Alaska\ 2005\ v3\ Denali', options);
//        walker = walk.walk('D:\\Web\\Web site\\Yvan\\Agra\ 1990', options);
        walker = walk.walk('D:\\Web\\Web site\\Yvan\\Bahamas\ Diving\ March\ 2011', options);

        walker.on('directories', function(root, dirStatsArray, next) {
            // dirStatsArray is an array of `stat` objects with the additional attributes
            // * type
            // * error
            // * name
            next();
        });

        walker.on('file', function(root, fileStats, next) {
            //  check for images
            var typetest = false;
            for (var i = 0; i < imagetype.length; i++) {
                typetest = typetest || fileStats.name.indexOf(imagetype[i]) !== -1;
            }
            //  All images are kept in the v8x6 folder
            if (root.indexOf('v8x6') !== -1 && typetest) {
                recordCheck += 1;
                var dirSplit = root.split('\\');
                var path = dirSplit[0] +  '\\' + 'Web Photos\\my photos' + '\\' + dirSplit[3] +  '\\' + dirSplit[4] +  '\\' + fileStats.name;

                // Get the text for the description if it exists
                var pathtxt = root.slice(0,root.indexOf(dirSplit[5])) +
                            fileStats.name.slice(0,fileStats.name.indexOf('.')) +
                            '.txt';
                var text = null;
                if (fs.existsSync(pathtxt)) {
                    text = String(fs.readFileSync(pathtxt));
                    if (text.includes('Aucune description')) {
                        text = null;
                    }
                    fs.close();
                }
                // We are now inside the image folder and we check first if photo/video already in database
                mongodb.connect(url, function(err,db) {
                    if (err) {
                        connectErrorNum += 1;
                        console.log(err.message,fileStats.name,connectErrorNum);
                    } else {
                        var collection = db.collection('IvanPhotos');
                        collection.findOne({theme: dirSplit[3], folder: dirSplit[4], subfolder: dirSplit[5], filename: fileStats.name}, function(err, results) {
                            if (!results) {
                                // if not in database build the complete data record
                                photocounter += 1;
                                try {
                                    var exifStat = new ExifImage({image : path}, function (error, exifData) {
                                        if (error) {
                                            // No exif data, get image size using image-size module
                                            var sizeOf = require('image-size');
                                            var dimensions = sizeOf(path);
                                            var fsmtime = JSON.stringify(fileStats.mtime);
                                            // Look up the photo year in folder name if no exif
                                            var yearind99 = dirSplit[4].indexOf(' 19');
                                            var yearind20 = dirSplit[4].indexOf(' 20');
                                            var yeardata = '1900';
                                            if (yearind99 !== -1) {
                                                yeardata = dirSplit[4].substring(yearind99 + 1,yearind99 + 5);
                                            }
                                            if (yearind20 !== -1) {
                                                yeardata = dirSplit[4].substring(yearind20 + 1,yearind20 + 5);
                                            }
                                            var datanoexif = {theme: dirSplit[3],
                                                        folder: dirSplit[4],
                                                        subfolder: dirSplit[5],
                                                        filename: fileStats.name,
                                                        description: text,
                                                        weblink: null,
                                                        exifDate: fsmtime.slice(1,11) + ' ' + fsmtime.slice(12,20),
                                                        year: yeardata,
                                                        photoDimW: dimensions.width,
                                                        photoDimH: dimensions.height,
                                                        camera: 'Scanned',
                                                        gpsLatRef: null,
                                                        gpsLat: null,
                                                        gpsLongRef: null,
                                                        gpsLong: null,
                                                        reverseGeo: null,
                                                        mediaType: 'photo',
                                                        category: null
                                                        };
                                            collection.insertOne(datanoexif, function(err, result) {
                                                photocounter -= 1;
                                                totalCount += 1;
                                                db.close();
                                                if (photocounter === 0) {
                                                    console.log('A total of ' + totalCount + 'records were added.');
    //                                                res.redirect('/');
                                                }
                                            });
                                        } else {
                                            // We have some exif data here
                                            var yearexif = exifData.exif.DateTimeOriginal.slice(0,4);
                                            var dataexif = {theme: dirSplit[3],
                                                    folder: dirSplit[4],
                                                    subfolder: dirSplit[5],
                                                    filename: fileStats.name,
                                                    description: text,
                                                    weblink: null,
                                                    exifDate: exifData.exif.DateTimeOriginal,
                                                    year: yearexif,
                                                    photoDimW: exifData.exif.ExifImageWidth,
                                                    photoDimH: exifData.exif.ExifImageHeight,
                                                    camera: exifData.image.Model,
                                                    gpsLatRef: exifData.gps.GPSLatitudeRef,
                                                    gpsLat: exifData.gps.GPSLatitude,
                                                    gpsLongRef: exifData.gps.GPSLongitudeRef,
                                                    gpsLong: exifData.gps.GPSLongitude,
                                                    reverseGeo: null,
                                                    mediaType: 'photo',
                                                    category: null
                                            };
                                            //  Now do a Google Maps reverse Geocode to get approximate address
                                            if (dataexif.gpsLat) {
                                                var latstr = dataexif.gpsLat.slice(',');
                                                var latfloat = parseInt(latstr[0]) + parseInt(latstr[1]) / 60 + parseInt(latstr[2]) / 3600;
                                                var longstr = dataexif.gpsLong.slice(',');
                                                var longfloat = parseInt(longstr[0]) + parseInt(longstr[1]) / 60 + parseInt(longstr[2]) / 3600;
                                                if (dataexif.gpsLatRef === 'S') {
                                                    latfloat = -latfloat;
                                                }
                                                if (dataexif.gpsLongRef === 'W') {
                                                    longfloat = -longfloat;
                                                }
                                                reverseGeocodeParams.latlng = latfloat + ',' + longfloat;
                                                gmAPI.reverseGeocode(reverseGeocodeParams, function(err, gpsresult) {
                                                    if (!err && gpsresult.status === 'OK') {
                                                        dataexif.reverseGeo = 'GPS:' + gpsresult.results[0].formatted_address;
                                                    }
                                                    collection.insertOne(dataexif, function(err, result) {
                                                        photocounter -= 1;
                                                        totalCount += 1;
                                                        db.close();
                                                        if (photocounter === 0) {
                                                            console.log('A total of ' + totalCount + ' records were added.');
    //                                                        res.redirect('/');
                                                        }
                                                    });
                                                });
                                            } else {
                                                collection.insertOne(dataexif, function(err, result) {
                                                    photocounter -= 1;
                                                    totalCount += 1;
                                                    console.log(photocounter,totalCount);
                                                    db.close();
                                                    if (photocounter === 0) {
                                                        console.log('A total of ' + totalCount + ' records were added.');
    //                                                    res.redirect('/');
                                                    }
                                                });
                                            }
                                        }
                                    });
                                } catch (error) {
                                    console.log('Error try: ' + error.message);
                                }
                            } else {
                                recordFound += 1;
                                db.close();
                            }
                        });
                    }
                });
            }
            next();
        });

        walker.on('errors', function(root, nodeStatsArray, next) {
            next();
        });

        walker.on('end', function() {
            console.log('folder walk completed with ',recordCheck, ' records checked, records found: ',recordFound);
        });
    });

    adminrouter.route('/contact').get(function(req, res) {
        res.render('contact');
    });

    return adminrouter;

};

module.exports = router;
