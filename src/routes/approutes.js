var express = require('express');

var mongodb = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;

var passport = require('passport');

var approuter = express.Router();

var router = function() {

    var appController = require('../controllers/appController')();

    approuter.use(appController.middleware);

    approuter.route('/:id').get(appController.getApp);

    //  User must sign-in to access the scheduler
    approuter.route('/calendarH67/signin').post(passport.authenticate('local-signin',
            {failureRedirect: '/H67signin', successRedirect: '/calendarH67'}));

    approuter.route('/calendarH67/signup').post(passport.authenticate('local-signup',
            {failureRedirect: '/H67signup', successRedirect: '/calendarH67'}));

    approuter.route('/calendarH67/data').get(appController.getcalendarH67);

    approuter.route('/calendarH67/data').post(appController.postcalendarH67);

    return approuter;

};

module.exports = router;