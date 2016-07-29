var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy;

var mongodb = require('mongodb').MongoClient;
var bcrypt   = require('bcrypt-nodejs');

module.exports = function() {
    passport.use('local-signup', new LocalStrategy({
            passReqToCallback : true // allows us to pass back the entire request to the callback
        }, function(req, username, password, done) {
            var url = 'mongodb://localhost:27017/library';
            mongodb.connect(url, function(err,db) {
                var collection = db.collection('tennisusers');
                collection.findOne({username: username}, function(err,user) {
                    console.log(err,user);
                    if (err) {
                        db.close();
                        return done(err);
                    }
                    // check to see if the fullname is available
                    if (!req.body.fullname || req.body.fullname.length <= 10) {
                        db.close();
                        return done(null, false, {message : 'A complete Name must be entered'});
                    }
                    // check to see if there is already a user with that email
                    if (user) {
                        db.close();
                        return done(null, false, {message : 'This Username already exists'});
                    } else {
                        // save the user
                        collection.insertOne({username:username,password:bcrypt.hashSync(password, bcrypt.genSaltSync(8),
                            null),fullname:req.body.fullname,activReserv:2}, function(err,user) {
                            if (err) {
                                throw err;
                            }
                            collection.findOne({username: username}, function(err,user) {
                                db.close();
                                return done(null, user);
                            });
                        });
                    }
                });
            });
        }));

    passport.use('local-signin', new LocalStrategy({
            passReqToCallback : true // allows us to pass back the entire request to the callback
        }, function(req, username, password, done) {
            var url = 'mongodb://localhost:27017/library';
            mongodb.connect(url, function(err,db) {
                var collection = db.collection('tennisusers');
                collection.findOne({username: username}, function(err,user) {
                    db.close();
                    if (err) {
                        return done(err);
                    }
                    if (!user) {
                        return done(null, false, {message : 'This Username does not exist'});
                    }
                    // if no user is found, return the message
                    if (!user.username) {
                        return done(null, false, {message : 'This Username does not exist'});
                    }
                    // if the user is found but the password is wrong
                    if (!bcrypt.compareSync(password, user.password)) {
                        return done(null, false, {message : 'The Password is incorrect'});
                    }
                    // all is well, return successful user
                    return done(null, user);
                });
            });
        }));
};