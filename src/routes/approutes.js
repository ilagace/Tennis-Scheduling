var express = require('express');

var mongodb = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;

var passport = require('passport');

var approuter = express.Router();

var router = function(delayMobile, delayDesktop, fullname) {

    var appController = require('../controllers/appController')(delayMobile, delayDesktop, fullname);

    approuter.use(appController.middleware);

    approuter.route('/calendarH67/:page/:court').get(appController.getApp);

    approuter.route('/court/:id/:page').get(appController.getCourt);

    approuter.route('/:id').get(appController.getPage);

    //  User must sign-in to access the scheduler
    approuter.route('/H67signin/').post(passport.authenticate('local-signin',
            {failureRedirect: '/tennis/H67signin/', successRedirect: '/tennis/calendarH67/0/0/', failureFlash: true, badRequestMessage: 'Missing Information'}));

    approuter.route('/H67signup/').post(passport.authenticate('local-signup',
            {failureRedirect: '/tennis/H67signup/', successRedirect: '/tennis/H67signin/', failureFlash: true, badRequestMessage: 'Missing Information'}));

    approuter.route('/calendardata/:id').get(appController.getcalendarH67);

    approuter.route('/calendardata/:id').post(appController.postcalendarH67);

    return approuter;

};

module.exports = router;