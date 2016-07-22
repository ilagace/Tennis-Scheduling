var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy;

var mongodb = require('mongodb').MongoClient;
var bcrypt   = require('bcrypt-nodejs');

// load up the user model
var User = require('../../models/user');

module.exports = function() {
    passport.use('local-signup', new LocalStrategy({
            usernameField: 'username',
            passwordField: 'password',
            fullnameField: 'fullname',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        }, function(req, username, password, done) {
            var url = 'mongodb://localhost:27017/library';
            mongodb.connect(url, function(err,db) {
                var collection = db.collection('tennisusers');
                collection.findOne({local: {username: username}}, function(err,user) {
                    if (err) {
                        return done(err);
                    }
                    // check to see if theres already a user with that email
                    console.log(username, user);
                    if (user) {
                        return done(null, false);
                    } else {
                        // save the user
                        collection.insertOne({username:username,password:bcrypt.hashSync(password, bcrypt.genSaltSync(8), null)}, function(err,user) {
                            if (err) {
                                throw err;
                            }
                            return done(null, username);
                        });
                    }
                });
            });
        }));

    passport.use('local-signin', new LocalStrategy({
            usernameField: 'username',
            passwordField: 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        }, function(req, username, password, done) {
            var url = 'mongodb://localhost:27017/library';
            mongodb.connect(url, function(err,db) {
                var collection = db.collection('tennisusers');
                collection.findOne({username: username}, function(err,user) {
                    if (err) {
                        return done(err);
                    }
                    // if no user is found, return the message
                    if (!user.username) {
                        return done(null, false);
                    }
                    // if the user is found but the password is wrong
                    if (!bcrypt.compareSync(password, user.password)) {
                        return done(null, false);
                    }
                    // all is well, return successful user
                    return done(null, user);
                });
            });
        }));
};