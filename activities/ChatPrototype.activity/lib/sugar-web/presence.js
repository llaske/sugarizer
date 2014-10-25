define(function (require) {
    var callbackArray = [];

        function SugarPresence() {
            var socket;

            var that = this;
            var listUsersCallback = function() {};
            var receivedDataCallback = function() {};
            var serverMessages = function() {};
            callbackArray = [listUsersCallback, receivedDataCallback, serverMessages];
            this.onMessageReceived = function(callback) {
                this.socket.onmessage = function(event) {

                    var edata = event.data;

                    try {
                        var json = JSON.parse(edata);
                    } catch (e) {
                        console.log('This doesn\'t look like a valid JSON: ', edata);
                        return;
                    }

                    if (json.type < callbackArray.length)
                        callbackArray[json.type](json); // Call the matching callback
                    else console.log("INVALID JSON TYPE!!");

                };
            } //will be called by functions to retrieve the message send from server

            this.registerUser = function(group_id, userInfo) {
        
                    var sjson = JSON.stringify({
                    data: userInfo
                    });
                this.socket.send(sjson);
             }    

        }

	var presence = new SugarPresence();
	
    SugarPresence.prototype.joinNetwork = function(userInfo, callback) {

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
        this.socket = new WebSocket('ws://'+server+':8039');
        console.log('Created socket ws://'+server+':8039');

        this.socket.onerror = function(error) {
            console.log('WebSocket Error: ' + error);
			callback(error, null);
        };
        var that = this;
        this.onConnectionOpen(function (event) {
            that.registerUser("sampleuserId",userInfo);
			callback(null, userInfo);
        });
    }

    SugarPresence.prototype.leaveNetwork = function() {
        this.socket.close();
        console.log('Socket closed');
    }

    SugarPresence.prototype.onConnectionOpen = function(callback) {
        this.onMessageReceived();
        this.socket.onopen = function(event) {
            callback(event);
        };
    }

    SugarPresence.prototype.onDataReceived = function(callback) {
        callbackArray[0] = callback;
        //this.receivedDataCallback = callback;
    } //for messages received from users

    SugarPresence.prototype.onConnectionClose = function(callback) {
        this.socket.onclose = function(event) {
            callback(event);
        };
    }

    SugarPresence.prototype.onServerMessage = function(callback) {
        callbackArray[2] = callback;
    }//for server alert messages. User joining/exiting/changing name

    SugarPresence.prototype.sendMessage = function(group_id, mdata) {
        
        console.log(mdata);
        var sjson = JSON.stringify({
            type: 0,
            data: mdata
        });
        this.socket.send(sjson);
    }

    SugarPresence.prototype.listUsers = function(group_id, callback) {
        var sjson = JSON.stringify({
            type: 1
        });
        callbackArray[1] = callback;
        //this.listUsersCallback = callback;
        this.socket.send(sjson);
    }

    SugarPresence.prototype.changeUserName = function(newUserName) {

        var sjson = JSON.stringify({
            type: 3,
            data: newUserName
        });
        this.socket.send(sjson);
    }
	
	return presence;
});
