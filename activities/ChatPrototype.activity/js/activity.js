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

        var presenceObject = presence;

        presenceObject.joinNetwork(function (error, user) {
			if (error)  {
				socketStatus.innerHTML = 'Error';			
				socketStatus.className = 'error';
			} else {
				socketStatus.innerHTML = 'Connected';
				socketStatus.className = 'open';
				messageField.readOnly = false;
			}
		});

        // Handle messages received.
        presenceObject.onDataReceived(function (msg) {

            console.log(msg);
            var authorElem = '<span style = "color:' + msg.colour.stroke + '">' + msg.author + '</span>';

            myElem = document.createElement('li');
            myElem.class = 'received';
            myElem.style.background = msg.colour.fill;
            myElem.innerHTML = authorElem + msg.data;
            myElem.style.color = msg.colour.stroke;

            messagesList.appendChild(myElem);
            messageContent.scrollTop = messageContent.scrollHeight;
        });

        presenceObject.onServerMessage(function (msg) {
            messagesList.innerHTML += '<li class="received" style = "color:blue">' + msg.data + '</li>';

        });

        // Show a disconnected message when the WebSocket is closed.
        presenceObject.onConnectionClose(function (event) {
            socketStatus.innerHTML = 'Disconnected from WebSocket.';
            socketStatus.className = 'closed';
        });

        messageField.onkeydown = function (e) {
            if (e.keyCode === 13) {

				presenceObject.listUsers(function (data) {
					console.log(data);
				});
                /*var message = messageField.value;
                //sendBtn.innerHTML = "Send Message/Ping";

                presenceObject.sendMessage("SampleGroupId", message);
                // Send the message through the WebSocket.

                messageField.placeholder = "Write your message here...";
                // Clear out the message field.
                messageField.value = "";*/

            }
        };

    });

});