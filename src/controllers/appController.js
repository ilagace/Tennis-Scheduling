var mongodb = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;

var appController = function(delayMobile, delayDesktop, fullname) {

    var middleware = function(req, res, next) {
        next();
    };

    var getApp = function (req, res) {
        fullname = req.user.fullname;
        var pageId = parseInt(req.params.page);
        var court = parseInt(req.params.court);
        if (/Mobi/.test(req.headers['user-agent'])) {
            res.render('calendarH67',{delay:delayMobile, display:'day', court: court, page:pageId, fulln:fullname});
        } else {
            res.render('calendarH67',{delay:delayDesktop, display:'week', court: court, page:0, fulln:fullname});
        }
    };

    var getCourt = function (req, res) {
        fullname = req.user.fullname;
        var court = parseInt(req.params.id);
        var pageId = parseInt(req.params.page);
        if (/Mobi/.test(req.headers['user-agent'])) {
            res.render('calendarH67',{delay:delayMobile, display:'day', court: court, page:pageId, fulln:fullname});
        } else {
            res.render('calendarH67',{delay:delayDesktop, display:'week', court: court, page:0, fulln:fullname});
        }
    };

    var getPage = function (req, res) {
        var appName = req.params.id;
        res.render(appName, {error: req.flash('error')});
    };

    var getcalendarH67 = function (req, res) {
        var court = parseInt(req.params.id);
        var courtObj = {};
        if (court !== 0) {
            courtObj = {'court': court};
        }
        var url = 'mongodb://localhost:27017/library';
        mongodb.connect(url, function(err, db) {
            var collection = db.collection('H67tennis');
            collection.find(courtObj).toArray(function(err, data) {
                db.close();
                //output response
                res.send(data);
            });
        });
    };

    var postcalendarH67 = function (req, res) {
        var court = parseInt(req.params.id);
        var errorMess = '';
        var data = req.body;
        //get operation type
        var mode = data['!nativeeditor_status'];
        //get id of record
        var sid = data.id;
        var tid = sid;
        var updateID = '';

        if (mode === 'inserted') {
            if (court === 0) {
                data.court = 1;
            } else {
                data.court = court;
            }
            data['ISODate'] = Date.parse(data['end_date']);
            data['fullname'] = req.user.fullname;
        }

        //remove properties which we do not want to save in DB
        delete data.gr_id;
        delete data['!nativeeditor_status'];

        var url = 'mongodb://localhost:27017/library';
        mongodb.connect(url, function(err, db) {
            var collection = db.collection('H67tennis');
            collection.findOne({id:sid.toString()}, function(err, result) {
                if (result) {
                    if (mode !== 'inserted') {
                        data['fullname'] = result.fullname;
                        data['court'] = result.court;
                        data['ISODate'] = result.ISODate;
                        updateID = result._id;
                    }
                    var messText = '';
                    if (mode === 'deleted') {
                        messText = ' delete ';
                    } else {
                        messText = ' move ';
                    }
                    if (data['fullname'] !== req.user.fullname) {
                        errorMess = 'You cannot' + messText + 'other people reservations';
                    }
                }
                //verify ownership before deleting
                if (mode === 'deleted') {
                    if (errorMess !== '') {
                        mode = 'errorMsg/' + errorMess;
                    } else {
                        collection.remove({_id: updateID});
                    }
                    res.setHeader("Content-Type","text/xml");
                    res.send("<data><action type='"+mode+"' sid='"+sid+"' tid='"+tid+"'/></data>");
                } else {
                    //verify that we do not exceed maximum number of reservations (2)
                    var coll2 = db.collection('tennisusers');
                    coll2.findOne({fullname:data['fullname']}, function(err, user) {
                        if (!user) {
                            console.log('Warning : Cannot find user ???');
                        }
                        var maxvalue = user.activReserv;
                        collection.find({fullname:data['fullname'], ISODate: {$gt: new Date().getTime()}}).toArray(function(err, result) {
                            if (!result) {
                                res.setHeader("Content-Type","text/xml");
                                res.send("<data><action type='"+mode+"' sid='"+sid+"' tid='"+tid+"'/></data>");
                            } else {
                                if (result.length >= maxvalue && mode === 'inserted') {
                                    errorMess = 'Exceeded maximum number of reservations allowed';
                                    mode = 'errorMsg/' + errorMess;
                                    res.setHeader("Content-Type","text/xml");
                                    res.send("<data><action type='"+mode+"' sid='"+sid+"' tid='"+tid+"'/></data>");
                                } else {
                                    //verify for overlap with existing appointment
                                    collection.find({court:data['court']}).toArray(function(err, result) {
                                        if (result) {
                                            if (result.length !== 0) {
                                                for (var i = 0; i < result.length; i++) {
                                                    var updtest = true;
                                                    if (mode === 'updated') {
                                                        updtest = result[i].id !== sid;
                                                    }
                                                    if (updtest && data['start_date'] >= result[i].start_date && data['start_date'] < result[i].end_date) {
                                                        errorMess = 'Overlap start date';
                                                    } else {
                                                        if (updtest && data['end_date'] > result[i].start_date && data['end_date'] <= result[i].end_date) {
                                                            errorMess = 'Overlap end date';
                                                        }
                                                    }
                                                }
                                                if (mode === 'updated') {
                                                    if (data['fullname'] !== fullname) {
                                                        errorMess = 'You cannot move other people reservations';
                                                    }
                                                }
                                                if (errorMess === '') {
                                                    //run db operation
                                                    if (mode === 'updated') {
                                                        collection.update({_id: updateID}, data);
                                                    }
                                                    if (mode === 'inserted') {
                                                        collection.insert(data);
                                                    }
                                                }
                                            } else {
                                                collection.insert(data);
                                            }
                                        }
                                        if (errorMess !== '') {
                                            mode = 'errorMsg/' + errorMess;
                                        }
                                        res.setHeader("Content-Type","text/xml");
                                        res.send("<data><action type='"+mode+"' sid='"+sid+"' tid='"+tid+"'/></data>");
                                    });
                                }
                            }
                        });
                    });
                }
            });
        });
    };

    return {
        getApp: getApp,
        getPage: getPage,
        getCourt: getCourt,
        getcalendarH67: getcalendarH67,
        postcalendarH67: postcalendarH67,
        middleware: middleware
    };
};

module.exports = appController;