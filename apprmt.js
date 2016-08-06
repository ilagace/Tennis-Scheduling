var express = require('express');

var app = express();

var port = process.env.PORT || 3001;

var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var passport = require('passport');
var session = require('express-session');
var flash = require('connect-flash');
var delayMobile = 60000;
var delayDesktop = 30000;
var fullname = '';

var approuter = require('./src/routes/approutes')(delayMobile, delayDesktop, fullname);

app.use(express.static(__dirname + 'public'));
app.use('/', express.static('public'));

app.set('views','./src/views');

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({secret: 'ivanlibrary'}));
app.use(flash());

require('./src/config/passport')(app);

app.set('view engine','ejs');

app.use('//', approuter);
app.use('/', approuter);

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
    // if user is authenticated in the session, carry on
    if (req.isAuthenticated()) {
        return next();
    }
    // if they aren't redirect them to the signin page
    req.flash('error','You must Login to access the Scheduler');
    res.render('H67signin', {error: req.flash('error')});
}

app.get('/', function(req, res) {
    req.flash('error','You must Login to access the Scheduler');
    res.render('H67signin', {error: req.flash('error')});
});

app.listen(port, function (err) {
    console.log('running server on port ' + port);
});