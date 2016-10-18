define(["sugar-web/activity/activity","sugar-web/graphics/palette","sugar-web/graphics/presencepalette"], function (activity,palette,presencepalette) {
    var activity = require("sugar-web/activity/activity");

    // Manipulate the DOM only when it is ready.
    require(['domReady!'], function (doc) {

        // Initialize the activity.
        activity.setup();

        var form = document.getElementById('message-form');
        var messageField = document.getElementById('message');
        var messagesList = document.getElementById('messages');
        var socketStatus = document.getElementById('status');
        var messageContent = document.getElementById('content');

		var userSettings = null;

		// Connect to network
        var presenceObject;
		function shareActivity() {
			presenceObject = activity.getPresenceObject(function (error, presence) {
				// Unable to join
				if (error)  {
					socketStatus.innerHTML = 'Error';
					socketStatus.className = 'error';
					return;
				}

				// Store settings
				userSettings = presence.getUserInfo();
				socketStatus.innerHTML = 'Connected';
				socketStatus.className = 'open';
				messageField.readOnly = false;

				// Not found, create a new shared activity
				if (!window.top.sugar.environment.sharedId) {
					presence.createSharedActivity('org.sugarlabs.ChatPrototype', function (groupId) {
					});
				}

				// Show a disconnected message when the WebSocket is closed.
				presence.onConnectionClosed(function (event) {
					console.log("Connection closed");
					socketStatus.innerHTML = 'Disconnected from WebSocket.';
					socketStatus.className = 'closed';
				});

				// Display connection changed
				presence.onSharedActivityUserChanged(function (msg) {
					var userName = msg.user.name.replace('<','&lt;').replace('>','&gt;');
					messagesList.innerHTML += '<li class="received" style = "color:blue">' + userName + (msg.move>0?' join':' leave') + ' the chat</li>';
				});

				// Handle messages received
				presence.onDataReceived(function (msg) {
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
			});
		}

		// Create network palette
        var networkButton = document.getElementById("network-button");
		presencepalette = new presencepalette.PresencePalette(networkButton, undefined);
		presencepalette.addEventListener('shared', shareActivity);

		// Launched with a shared id, activity is already shared
		if (window.top.sugar.environment.sharedId) {
			shareActivity();
			presencepalette.setShared(true);
		}

		// Handle message text update
        messageField.onkeydown = function (e) {
            if (e.keyCode === 13) {
				var message = messageField.value;

				// Send the message through the WebSocket.
				var toSend = {user: userSettings, content: message};
				presenceObject.sendMessage(presenceObject.getSharedInfo().id, toSend);

                // Clear out the message field
				messageField.placeholder = "Write your message here...";
                messageField.value = "";
				messageField.setSelectionRange(0,0);
				return false;
            }
        };

    });

});
