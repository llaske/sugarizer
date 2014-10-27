define(function (require) {
	// Message type constants
	var msgInit = 0;
	var msgListUsers = 1;
	var msgListExistingGroups = 2;
	var msgSendMessage = 3;
	
	// Array for callbacks on each type
    var callbackArray = [];

	// Connection object
	function SugarPresence() {
		// Init callbacks
		var emptyCallback = function() {};
		var listUsersCallback = emptyCallback;
		var receivedDataCallback = emptyCallback;
		var serverMessages = emptyCallback;
		callbackArray = [emptyCallback, listUsersCallback, receivedDataCallback, serverMessages];
		
		// Handle message received from server
		this.onMessageReceived = function() {
			// Get message content
			this.socket.onmessage = function(event) {
				// Convert message to JSON
				var edata = event.data;
				try {
					var json = JSON.parse(edata);
				} catch (e) {
					console.log('Presence API error, this doesn\'t look like a valid JSON: ', edata);
					return;
				}

				// Call the matching callback
				if (json.type < callbackArray.length)
					callbackArray[json.type](json.data);
				else
					console.log('Presence API error, unknown callback type:'+json.type);

			};
		}

		// Register user to the server
		this.registerUser = function(userInfo) {
			this.socket.send(userInfo);
		}    

	}

	// Create presence object
	var presence = new SugarPresence();
	
	// Join network function
    SugarPresence.prototype.joinNetwork = function(callback) {
		// Get server name
		var server = location.hostname;
		if (localStorage.sugar_settings) {
			var sugarSettings = JSON.parse(localStorage.sugar_settings);
			if (sugarSettings.server) {
				server = sugarSettings.server;
				var endName = server.indexOf(':')
				if (endName == -1) endName = server.indexOf('/');
				if (endName == -1) endName = server.length;
				server = server.substring(0, endName);
			}
		}
		
		// Connect to server
        this.socket = new WebSocket('ws://'+server+':8039');
        console.log('Created socket ws://'+server+':8039');
        this.socket.onerror = function(error) {
            console.log('WebSocket Error: ' + error);
			callback(error, null);
        };
		
		// When connection open, send user info
        var that = this;
        this.onConnectionOpen(function (event) {
			var userInfo = localStorage.sugar_settings;
            that.registerUser(userInfo);
			callback(null, userInfo);
        });
    }

	// Leave network
    SugarPresence.prototype.leaveNetwork = function() {
        this.socket.close();
    }

	// List all users
    SugarPresence.prototype.listUsers = function(callback) {
		// Register call back
        callbackArray[msgListUsers] = callback;
		
		// Send list user message
        var sjson = JSON.stringify({
            type: msgListUsers
        });
        this.socket.send(sjson);
    }
	
    SugarPresence.prototype.onConnectionOpen = function(callback) {
        this.onMessageReceived();
        this.socket.onopen = function(event) {
            callback(event);
        };
    }

    SugarPresence.prototype.onDataReceived = function(callback) {
        callbackArray[0] = callback;
    }

    SugarPresence.prototype.onConnectionClose = function(callback) {
        this.socket.onclose = function(event) {
            callback(event);
        };
    }

    SugarPresence.prototype.onServerMessage = function(callback) {
        callbackArray[2] = callback;
    }

    SugarPresence.prototype.sendMessage = function(mdata) {
        console.log(mdata);
        var sjson = JSON.stringify({
            type: msgSendMessage,
            data: mdata
        });
        this.socket.send(sjson);
    }
	
	return presence;
});
