

// websocket and http servers
var webSocketServer = require('websocket').server;
var http = require('http');

exports.init = function (settings) {
    /**
     * Global variables
     */
    // List of currently connected clients (users)
    var clients = [];
	var groups = [];
	
    /**
     * Message types
     */
	var msgInit = 0;
	var msgListUsers = 1;
	var msgListExistingGroups = 2;
	var msgSendMessage = 3;
	 
    /**
     * HTTP server
     */
    var server = http.createServer(function (request, response) {
    });
    server.listen(settings.presence.port, function () {
        console.log("Presence Server is listening on port " + settings.presence.port+"...");
    });

    /**
     * WebSocket server
     */
    var wsServer = new webSocketServer({
        httpServer: server
    });

    // Callback function called every time someone connect to the WebSocket server
    wsServer.on('request', function (request) {
        // Accept connection from your website
        var connection = request.accept(null, request.origin);
		
        // Add client to array, wait for userName
        var index = addClient(connection);
        var userName = false;

        // An user sent some message
        connection.on('message', function (message) {
			// Accept only text
            if (message.type === 'utf8') {
				// First message sent is user settings
                if (userName === false) {
					// Get user settings
                    var rjson = JSON.parse(message.utf8Data);
                    clients[index] = rjson;
					
					// Get user name
					userName = rjson.name;
                    console.log((new Date()) + ' User ' + userName + "(" + index + ") join the network");

                } else { 
					// Get message content
                    var rjson = JSON.parse(message.utf8Data);

					// Process message depending of this type
                    switch (rjson.type) {
					case msgListUsers:
						{
							// Compute connected user list
							var connectedUsers = [];
							for (var i = 0; i < clients.length; i++) {
								if (clients[i] != null)	{
									connectedUsers.push(clients[i]);
								}
							}

							// Send the list
							connection.sendUTF(JSON.stringify({
								type: msgListUsers,
								data: connectedUsers
							}));							
							break;
						}

                    default:
                        console.log("Unrecognised received json type");
						break;
						
                    /*case 0:
                        var json = JSON.stringify(
                        {
                            type: 0,
                            data: rjson.data,
                            author: userName
                        });

                        broadcast(clients, json);
                        break;*/
                    }

                }
            }

        });

        // user disconnected
        connection.on('close', function (connection)
        {
            if (userName !== false)
            {
                console.log((new Date()) + " User " + userName + "(" + index + ") disconnected.");
                clients[index] = null;
            }
        });

    });

	// Add a new client in the client array
	function addClient(connection) {
		// Find a free space in array
		for (var i = 0 ; i < clients.length ; i++) {
			// Found, use it
			if (clients[i] == null) {
				clients[i] = connection;
				return i;
			}
		}
		
		// Not found, increase array
		return clients.push(connection) - 1;
	}
	
	// Broadcast a message to all 
    function broadcast(clients, json) {
        for (var i = 0; i < clients.length; i++) {
            if (clients[i] != null)
                clients[i].sendUTF(json);
        }
    }

}