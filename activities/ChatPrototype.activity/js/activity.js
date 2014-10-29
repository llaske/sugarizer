define(function (require) {
    var activity = require("sugar-web/activity/activity");
    var presence = require("sugar-web/presence");
    var palette = require("sugar-web/graphics/palette");
	
    // Manipulate the DOM only when it is ready.
    require(['domReady!'], function (doc) {

        // Initialize the activity.
        activity.setup();

        var form = document.getElementById('message-form');
        var messageField = document.getElementById('message');
        var messagesList = document.getElementById('messages');
        var socketStatus = document.getElementById('status');
        var closeBtn = document.getElementById('close');
        var sendBtn = document.getElementById('send');
        var connectedUsers = document.getElementById('listUsers');
        var messageContent = document.getElementById('content');
        var settingsButton = document.getElementById('settings-button');
		
		var userSettings;

		// Connect to network
        var presenceObject = presence;
        presenceObject.joinNetwork(function (error, user) {
			if (error)  {
				socketStatus.innerHTML = 'Error';			
				socketStatus.className = 'error';
			} else {
				userSettings = user;
				socketStatus.innerHTML = 'Connected';
				socketStatus.className = 'open';
				messageField.readOnly = false;
			}
		});

        // Show a disconnected message when the WebSocket is closed.
        presenceObject.onConnectionClosed(function (event) {
			console.log("Connection closed");
            socketStatus.innerHTML = 'Disconnected from WebSocket.';
            socketStatus.className = 'closed';
        });
		
		// Display connection changed
        presenceObject.onSharedActivityUserChanged(function (msg) {
			var userName = msg.user.name.replace('<','&lt;').replace('>','&gt;');
			messagesList.innerHTML += '<li class="received" style = "color:blue">' + userName + (msg.move>0?' join':' leave') + ' the chat</li>';
        });
		
        // Handle messages received.
        presenceObject.onDataReceived(function (msg) {
			var text = msg.content;
			var author = msg.user.name.replace('<','&lt;').replace('>','&gt;');
			var colour = msg.user.colorvalue;
			
            var authorElem = '<span style = "color:' + colour.stroke + '">' + author + '</span>';

            myElem = document.createElement('li');
            myElem.class = 'received';
            myElem.style.background = colour.fill;
            myElem.innerHTML = authorElem + text;
            myElem.style.color = colour.stroke;

            messagesList.appendChild(myElem);
            messageContent.scrollTop = messageContent.scrollHeight;
        });

        messageField.onkeydown = function (e) {
            if (e.keyCode === 13) {
				var message = messageField.value;
			
				if (message == 'l') {
					presenceObject.listUsers(function (users) {
						console.log(users);
					});
				}
				
				else if (message == 'g') {
					presenceObject.createSharedActivity('org.sugarlabs.ChatPrototype', function (groupId) {
						console.log(groupId);
					});
				}
				
				else if (message == 'lg') {
					presenceObject.listSharedActivities(function (shared) {
						console.log(shared);
					});
				}				
				
				else if (message[0] == 'j') {
					presenceObject.joinSharedActivity(message.substr(1), function (joined) {
						console.log(joined);
					});
				}
				
				else if (message[0] == 'q') {
					presenceObject.leaveSharedActivity(message.substr(2), function () {
						presenceObject.listSharedActivities(function (shared) {
							console.log(shared);
						});
					});
				}
				
				else if (message[0] == 's') {
					var toSend = {user: userSettings, content: "Hello world !"};
console.log(toSend);
					presenceObject.sendMessage(message.substr(1), toSend);
				}

                /*
                //sendBtn.innerHTML = "Send Message/Ping";

                presenceObject.sendMessage("SampleGroupId", message);
                // Send the message through the WebSocket.

                */
				
                // Clear out the message field
				messageField.placeholder = "Write your message here...";
                messageField.value = "";

            }
        };

    });

});