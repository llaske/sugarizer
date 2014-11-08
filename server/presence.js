

// websocket and http servers
var webSocketServer = require('websocket').server;
var http = require('http');

exports.init = function (settings) {
    /**
     * Global variables
     */
    // List of currently connected clients (users)
    var clients = [];
	
	// List of shared activities
	var sharedActivities = [];
	
    /**
     * Message types
     */
	var msgInit = 0;
	var msgListUsers = 1;
	var msgCreateSharedActivity = 2;
	var msgListSharedActivities = 3;
	var msgJoinSharedActivity = 4;
	var msgLeaveSharedActivity = 5;
	var msgOnConnectionClosed = 6;
	var msgOnSharedActivityUserChanged = 7;
	var msgSendMessage = 8;
	 
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
		
        // Add client to array, wait for userId
        var userIndex;
        var userId = false;

        // An user sent some message
        connection.on('message', function (message) {
			// Accept only text
            if (message.type === 'utf8') {
				// First message sent is user settings
                if (userId === false) {
					// Get user settings
                    var rjson = JSON.parse(message.utf8Data);
					
					// Forbid user arlready connected on another device
					if (findClient(rjson.networkId) != -1) {
						// Reject user
						connection.close();
						console.log('User ' + rjson.networkId + ' rejected, already connected');						
					}
					else {
						// Add client
						userIndex = addClient(connection)
						clients[userIndex].settings = rjson;
					
						// Get user name
						userId = rjson.networkId;
						console.log('User ' + userId + ' join the network');
					}
                } else { 
					// Get message content
                    var rjson = JSON.parse(message.utf8Data);

					// Process message depending of this type
                    switch (rjson.type) {
						// MESSAGE: listUsers
						case msgListUsers:
						{
							// Compute connected user list
							var connectedUsers = [];
							for (var i = 0; i < clients.length; i++) {
								if (clients[i] != null)	{
									connectedUsers.push(clients[i].settings);
								}
							}

							// Send the list
							connection.sendUTF(JSON.stringify({
								type: msgListUsers,
								data: connectedUsers
							}));							
							break;
						}
						
						// MESSAGE: createSharedActivity
						case msgCreateSharedActivity:
						{
							// Create shared activities
							var activityId = rjson.activityId;
							var groupId = createSharedActivity(activityId, userId);
							console.log('Shared group ' + groupId + " (" + activityId + ") created");
							
							// Add user into group
							addUserIntoGroup(groupId, userId);

							// Send the group id
							connection.sendUTF(JSON.stringify({
								type: msgCreateSharedActivity,
								data: groupId
							}));							
							break;
						}
						
						// MESSAGE: listSharedActivities
						case msgListSharedActivities:
						{
							// Compute shared activities list
							var listShared = [];
							for (var i = 0; i < sharedActivities.length; i++) {
								if (sharedActivities[i] != null) {
									listShared.push(sharedActivities[i]);
								}
							}

							// Send the list
							connection.sendUTF(JSON.stringify({
								type: msgListSharedActivities,
								data: listShared
							}));							
							break;
						}
						
						// MESSAGE: joinSharedActivity
						case msgJoinSharedActivity:
						{
							// Update group
							var groupId = rjson.group;
							var groupProperties = addUserIntoGroup(groupId, userId);

							// Send the group properties
							connection.sendUTF(JSON.stringify({
								type: msgJoinSharedActivity,
								data: groupProperties
							}));							
							break;
						}
						
						// MESSAGE: leaveSharedActivity
						case msgLeaveSharedActivity:
						{
							// Update group
							var groupId = rjson.group;
							removeUserFromGroup(groupId, userId);							
							break;
						}
						
						// MESSAGE: sendMessage
						case msgSendMessage:
						{
							// Get arguments
							var groupId = rjson.group;
							var data = rjson.data;

							// Send the group properties
							var message = { type: msgSendMessage, data: data };
							broadcastToGroup(groupId, message);
							break;
						}
						
                    default:
                        console.log("Unrecognized received json type");
						break;
                    }
                }
            }
        });

        // user disconnected
        connection.on('close', function (connection)
        {
            if (userId !== false)
            {
                console.log("User " + userId + " disconnected");
				removeClient(userIndex);
            }
        });

    });

	
    /**
     * Utility functions
     */
	 
    // Create a uuid
    function createUUID() {
        var s = [];
        var hexDigits = "0123456789abcdef";
        for (var i = 0; i < 36; i++) {
            s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
        }
        s[14] = "4";
        s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);
        s[8] = s[13] = s[18] = s[23] = "-";

        var uuid = s.join("");
        return uuid;
    };
	
	// Find client by id
	function findClient(userId) {
		for (var i = 0 ; i < clients.length ; i++) {
			if (clients[i] != null && clients[i].settings.networkId == userId)
				return i;
		}
		return -1;
	}
	
	// Add a new client in the client array
	function addClient(connection) {
		// Create client
		var client = { connection: connection };
		
		// Find a free space in array
		for (var i = 0 ; i < clients.length ; i++) {
			// Found, use it to store user
			if (clients[i] == null) {
				clients[i] = client;
				return i;
			}
		}
		
		// Not found, increase array to store user
		return clients.push(client) - 1;
	}
	
	// Remove a client from the client array
	function removeClient(index) {
		// Iterate on each shared activities
		var userId = clients[index].settings.networkId;		
		for (var i = 0 ; i < sharedActivities.length ; i++) {
			if (sharedActivities[i] == null)
				continue;
				
			// Remove user from group
			removeUserFromGroup(sharedActivities[i].id, userId);
		}
		
		// Clean array		
		clients[index] = null;		
	}
	
	// Create a new shared activity 
	function createSharedActivity(activityId, user) {
		// Create a new group
		var group = { id: createUUID(), activityId: activityId, users: [] };
		
		// Find a free space in array
		for (var i = 0 ; i < sharedActivities.length ; i++) {
			// Found, use it to store group
			if (sharedActivities[i] == null) {
				sharedActivities[i] = group;
				break;
			}
		}
		if (i >= sharedActivities.length) {
			// Not found, increase array size
			sharedActivities.push(group);
		}
		
		// Fill activity color with user color
		var userIndex = findClient(user);
		if (userIndex != -1 && clients[userIndex]) {
			group.colorvalue = clients[userIndex].settings.colorvalue;
		}
	
		return group.id;
	}
	
	// Find a group by Id
	function findGroup(groupId) {
		for (var i = 0 ; i < sharedActivities.length ; i++) {
			// Found, use it to store group
			if (sharedActivities[i] == null)
				continue;
			if (sharedActivities[i].id == groupId)
				return i;
		}	
		return -1;
	}
	
	// Add user into a group id
	function addUserIntoGroup(groupId, userId) {
		// Find the group
		var groupIndex = findGroup(groupId);
		if (groupIndex == -1)
			return null;

		// Add the user in group if not already there
		var usersInGroup = sharedActivities[groupIndex].users;
		var foundUser = false;
		for (var j = 0 ; j < usersInGroup.length ; j++) {
			// Check if client is in the group
			if (usersInGroup[j] == userId) {
				foundUser = true;
				break;
			}	
		}
		if (!foundUser) {
			sharedActivities[groupIndex].users.push(userId);
			console.log('User ' + userId + ' join group ' + groupId);
			var userIndex = findClient(userId);				
			var message = { type: msgOnSharedActivityUserChanged, data: { user: clients[userIndex].settings, move: +1 } };
			broadcastToGroup(groupId, message);			
		}

		// Return group properties
		return sharedActivities[groupIndex];
	}
	
	// Remove an user from a group id
	function removeUserFromGroup(groupId, userId) {
		// Find the group
		var groupIndex = findGroup(groupId);
		if (groupIndex == -1)
			return null;
		
		// Remove the userId
		var usersInGroup = sharedActivities[groupIndex].users;
		var newUsersInGroup = [];
		for (var j = 0 ; j < usersInGroup.length ; j++) {
			// Check if client is in the group
			var currentUser = usersInGroup[j];
			if (currentUser != userId)
				newUsersInGroup.push(currentUser);
			else {
				console.log('User ' + userId + ' leave group ' + groupId);
				var userIndex = findClient(userId);				
				var message = { type: msgOnSharedActivityUserChanged, data: { user: clients[userIndex].settings, move: -1 } };
				broadcastToGroup(groupId, message);
			}
		}
		
		// If the group is now empty, remove it
		sharedActivities[groupIndex].users = newUsersInGroup;
		if (newUsersInGroup.length == 0) {
			console.log('Shared group ' + groupId + " removed");	
			sharedActivities[groupIndex] = null;				
		}		
	}
	
	// Broadcast a message to all group member
    function broadcastToGroup(groupId, json) {
		// Find the group
		var groupIndex = findGroup(groupId);
		if (groupIndex == -1)
			return;
			
		// For each user in the group
		var usersInGroup = sharedActivities[groupIndex].users;
		for (var j = 0 ; j < usersInGroup.length ; j++) {
			// Get client
			var clientIndex = findClient(usersInGroup[j]);
			if (clientIndex == -1)
				return;
				
			// Send message
			var connection = clients[clientIndex].connection;
			connection.sendUTF(JSON.stringify(json));	
		}
    }
}