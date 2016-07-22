var mongodb = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;

var appController = function() {

    var middleware = function(req, res, next) {
        next();
    };

    var getApp = function (req, res) {
        var appName = req.params.id;
        res.render(appName);
    };

    var getcalendarH67 = function (req, res) {
        var url = 'mongodb://localhost:27017/library';
        mongodb.connect(url, function(err, db) {
            var collection = db.collection('H67tennis');
            collection.find().toArray(function(err, data) {
                //set id property for all records
                for (var i = 0; i < data.length; i++) {
                    data[i].id = data[i]._id;
                }
                //output response
                console.log('get',data[0]);
                res.send(data);
            });
        });
    };

    var postcalendarH67 = function (req, res) {
        var data = req.body;
        console.log(data);

        //get operation type
        var mode = data['!nativeeditor_status'];
        //get id of record
        var sid = data.id;
        var tid = sid;

        //remove properties which we do not want to save in DB
        delete data.id;
        delete data.gr_id;
        delete data['!nativeeditor_status'];

        //output confirmation response
        function update_response(err, result) {
            if (err) {
                mode = 'error';
            }
            else {
                if (mode === 'inserted') {
                    tid = data._id;
                }
            }

            res.setHeader('Content-Type','text/xml');
            res.send("<data><action type='" + mode + "' sid='" + sid + "' tid='" + tid + "'/></data>");
        }

        //run db operation
        var url = 'mongodb://localhost:27017/library';
        mongodb.connect(url, function(err, db) {
            var collection = db.collection('H67tennis');
            console.log(mode);
            if (mode === 'updated') {
                collection.update({_id: ObjectID(sid)}, data, update_response);
            }
            else {
                if (mode === 'inserted') {
                    collection.insert(data, update_response);
                }
                else {
                    if (mode === 'deleted') {
                        collection.remove({_id: ObjectID(sid)}, update_response);
                    }
                    else {
                        res.send('Not supported operation');
                    }
                }
            }
        });
    };

    return {
        getApp: getApp,
        getcalendarH67: getcalendarH67,
        postcalendarH67: postcalendarH67,
        middleware: middleware
    };
};

module.exports = appController;