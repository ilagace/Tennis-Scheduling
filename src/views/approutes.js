var express = require('express');

var mongodb = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;

var approuter = express.Router();

var passport = require('passport');

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
    console.log(req.isAuthenticated());
    // if user is authenticated in the session, carry on
    if (req.isAuthenticated()) {
        return next();
    }
    // if they aren't redirect them to the signin page
    res.render('H67signin');
}

var router = function() {

    var appController = require('../controllers/appController')();

    approuter.use(appController.middleware);

    approuter.route('/:id').get(appController.getApp);

    //  Must signin before accessing tennis scheduler
    approuter.route('/calendarH67/H67signin').post(passport.authenticate('local',
            {failureRedirect: '/H67signin', successRedirect: '/calendarH67/data'}));

    approuter.route('/calendarH67/H67signin').get(isLoggedIn, function(req, res) {
        res.redirect('/calendarH67/data');
    });

    //  Might be needed as reference to block direct access
    //adminrouter.route('/managemedia').get(isLoggedIn, function(req, res) {
    //    res.render('managemedia');
    //});

    approuter.route('/calendarH67/data').get(appController.getcalendarH67);

    approuter.route('/calendarH67/data').post(appController.postcalendarH67);

    return approuter;

};

module.exports = router;