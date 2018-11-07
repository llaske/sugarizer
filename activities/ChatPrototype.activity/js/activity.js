define(["sugar-web/activity/activity","webL10n","sugar-web/graphics/palette","sugar-web/graphics/presencepalette"], function (activity,wl10n, palette,presencepalette) {
    var activity = requirejs("sugar-web/activity/activity");

    // Manipulate the DOM only when it is ready.
    requirejs(['domReady!'], function (doc) {

        // Initialize the activity.
		activity.setup();
		
		var tagBody = '(?:[^"\'>]|"[^"]*"|\'[^\']*\')*';
		//sanitize html messages
		var tagOrComment = new RegExp(
			'<(?:'
			// Comment body.
			+ '!--(?:(?:-*[^->])*--+|-?)'
			// Special "raw text" elements whose content should be elided.
			+ '|script\\b' + tagBody + '>[\\s\\S]*?</script\\s*'
			+ '|style\\b' + tagBody + '>[\\s\\S]*?</style\\s*'
			// Regular name
			+ '|/?[a-z]'
			+ tagBody
			+ ')>',
			'gi');
		function removeTags(html) {
			var oldHtml;
			do {
				oldHtml = html;
				html = html.replace(tagOrComment, '');
			} while (html !== oldHtml);
		return html.replace(/</g, '&lt;');
		}

        var form = document.getElementById('message-form');
        var messageField = document.getElementById('message');
        var messagesList = document.getElementById('messages');
        var socketStatus = document.getElementById('status');
        var messageContent = document.getElementById('content');

	document.getElementById("status").innerHTML = l10n_s.get("status");
	messageField.placeholder = l10n_s.get("WriteYourMessage");

	    var userSettings = null;

		// Connect to network
        var presenceObject;
		function shareActivity() {
			presenceObject = activity.getPresenceObject(function (error, presence) {
				// Unable to join
				if (error)  {
					socketStatus.innerHTML = l10n_s.get('Error');
					socketStatus.className = 'error';
					return;
				}

				// Store settings
				userSettings = presence.getUserInfo();
				socketStatus.innerHTML = l10n_s.get('Connected');
				socketStatus.className = 'open';
				messageField.readOnly = false;

				// Not found, create a new shared activity
				if (!window.top.sugar.environment.sharedId) {
					presence.createSharedActivity('org.sugarlabs.ChatPrototype', function (groupId) {
					});
				}

				// Show a disconnected message when the WebSocket is closed.
				presence.onConnectionClosed(function (event) {
					console.log(l10n_s.get("ConnectionClosed"));
					socketStatus.innerHTML = l10n_s.get('DisconnectedFromWebSocket');
					socketStatus.className = 'closed';
				});

				// Display connection changed
				presence.onSharedActivityUserChanged(function (msg) {
					var userName = msg.user.name.replace('<','&lt;').replace('>','&gt;');
					messagesList.innerHTML += '<li class="received" style = "color:blue">' + userName + ' ' + (msg.move>0?l10n_s.get('Join'):l10n_s.get('Leave')) + ' '+l10n_s.get('Chat')+'</li>';
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
				var message = removeTags(messageField.value);

				// Send the message through the WebSocket.
				var toSend = {user: userSettings, content: message};
				presenceObject.sendMessage(presenceObject.getSharedInfo().id, toSend);

                // Clear out the message field
				messageField.placeholder = l10n_s.get("WriteYourMessage");
                messageField.value = "";
				messageField.setSelectionRange(0,0);
				return false;
            }
        };

    });

});
