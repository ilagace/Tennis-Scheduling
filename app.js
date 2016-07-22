var express = require('express');

var app = express();

var port = process.env.PORT || 3000;

var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var passport = require('passport');
var session = require('express-session');

var approuter = require('./src/routes/approutes')();

//Change starting directory as the call is via Windows Services, need to be changed on AWS so I use apprmt.js there
console.log('Starting directory:', process.cwd());
try {
    process.chdir('D:/Software\ Development\ Projects/Tennis\ Scheduling');
    console.log('New directory:', process.cwd());
}
catch (err) {
    console.log('chdir:',err);
}

app.use(express.static('public'));

app.use('calendarH67', express.static('public'));
app.use('calendarH67/data', express.static('public'));

app.set('views','./src/views');

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({secret: 'ivanlibrary'}));

require('./src/config/passport')(app);

app.set('view engine','ejs');

app.use('/', approuter);

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

app.get('/', isLoggedIn, function(req, res) {
    // console.log(req.headers['user-agent']);
    //  if (/Mobi/.test(req.headers['user-agent'])) {
    res.render('calendarH67');
});

app.listen(port, function (err) {
    console.log('running server on port ' + port);
});