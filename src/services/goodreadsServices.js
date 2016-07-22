var http = require('http');
var xml2js = require('xml2js');
var parser = xml2js.Parser({explicitArray: false});

var goodreadsServices = function() {
    var getBookByID = function(id, cb) {
        var options = {
            host: 'www.goodreads.com',
            path: '/book/show/' + id + '?format=xml&key=nEmT3ABWlrYkFL09vLC9g'
        };
        var callback = function(response) {
            var str = '';
            response.on('data', function(chunk) {
                str += chunk;
            });
            response.on('end', function() {
                parser.parseString(str, function(err, results) {
                    console.log(results.GoodreadsResponse.book);
                    cb(null, results.GoodreadsResponse.book);
                });
            });
        };
        http.request(options, callback).end();
    };
    return {
        getBookByID: getBookByID
    };
};

module.exports = goodreadsServices;
