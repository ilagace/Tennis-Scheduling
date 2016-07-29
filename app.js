var express = require('express');

var app = express();

var port = process.env.PORT || 3000;

var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var passport = require('passport');
var session = require('express-session');
var flash = require('connect-flash');
var delayMobile = 60000;
var delayDesktop = 30000;
var court = 0;

var approuter = require('./src/routes/approutes')(delayMobile, delayDesktop, court);

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

app.use('/court', express.static('public'));
app.use('/court/0', express.static('public'));
app.use('/court/1', express.static('public'));
app.use('/court/2', express.static('public'));
app.use('/calendarH67', express.static('public'));

app.set('views','./src/views');

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({secret: 'ivanlibrary'}));
app.use(flash());
//app.use(function(req, res, next) {
//    res.locals.message = req.flash();
//    next();
//});

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
    req.flash('error','You must Login to access the Scheduler');
    res.render('H67signin', {error: req.flash('error')});
}

app.get('/', isLoggedIn, function(req, res) {
    if (/Mobi/.test(req.headers['user-agent'])) {
        res.render('calendarH67/0',{delay:delayMobile, display:'day', court: court, page:0});
    } else {
        res.render('calendarH67/0',{delay:delayDesktop, display:'week', court: court, page:0});
    }
});

app.listen(port, function (err) {
    console.log('running server on port ' + port);
});