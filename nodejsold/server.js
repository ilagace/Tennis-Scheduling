var	http = require('http');
var	sys = require('sys');
var posix = require('fs');

var faye = require("./faye-node");
var stat = require('./node-static');

var file = new(stat.Server)('.', { cache: 7200 });

var server = http.createServer(function(request, response){
	request.addListener('end', function () {
		file.serve(request, response, function (err, res) {
			if (err) { // An error as occured
				sys.error("> Error serving " + request.url + " - " + err.message);
				response.writeHead(err.status, err.headers);
				response.end();
			} else { // The file was served successfully
				sys.puts("> " + request.url + " - " + res.message);
			}
		});
	}); 
});

var bayeux = new faye.NodeAdapter({mount: '/sync', timeout: 45 });
bayeux.attach(server);
bayeux.getClient().subscribe('/broadcast', function(data) {
	bayeux.getClient().publish('/update', data);
});
server.listen(8008);

sys.puts('Server running');