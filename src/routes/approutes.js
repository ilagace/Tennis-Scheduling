var express = require('express');

var mongodb = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;

var passport = require('passport');

var approuter = express.Router();

var router = function(delayMobile, delayDesktop, court) {

    var appController = require('../controllers/appController')(delayMobile, delayDesktop, court);

    approuter.use(appController.middleware);

    approuter.route('/calendarH67/:id').get(appController.getApp);

    approuter.route('/court/:id/:page').get(appController.getCourt);

    approuter.route('/:id').get(appController.getPage);

    //  User must sign-in to access the scheduler
    approuter.route('/H67signin').post(passport.authenticate('local-signin',
            {failureRedirect: '/H67signin', successRedirect: '/calendarH67/0', failureFlash: true, badRequestMessage: 'Missing Information'}));

    approuter.route('/H67signup').post(passport.authenticate('local-signup',
            {failureRedirect: '/H67signup', successRedirect: '/calendarH67/0', failureFlash: true, badRequestMessage: 'Missing Information'}));

    approuter.route('/calendarH67/data/:id').get(appController.getcalendarH67);

    approuter.route('/calendarH67/data/:id').post(appController.postcalendarH67);

    return approuter;

};

module.exports = router;