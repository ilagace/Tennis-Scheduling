var	http = require('http');
var faye = require("faye");

var server = http.createServer(function(req, res){});

var bayeux = new faye.NodeAdapter({mount: '/sync', timeout: 45 });
bayeux.attach(server);

bayeux.getClient().subscribe('/broadcast', function(data) {
	bayeux.getClient().publish('/update', data);
});

server.listen(8008);
console.log('Server running at 8008');