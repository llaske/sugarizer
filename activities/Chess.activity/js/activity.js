define(["sugar-web/activity/activity", "sugar-web/env", "sugar-web/graphics/icon", "webL10n","sugar-web/graphics/presencepalette","tutorial", "sugar-web/datastore","sugar-web/graphics/journalchooser","chesspalette"], function (activity, env, icon, webL10n, presencepalette,tutorial, datastore, journalchooser,chesspalette) {

	// Manipulate the DOM only when it is ready.
	requirejs(['domReady!'], function (doc) {

		// Initialize the activity.
		activity.setup();
		env.getEnvironment(function(err, environment) {
			currentenv = environment;
		
			// Set current language to Sugarizer
			var defaultLanguage = (typeof chrome != 'undefined' && chrome.app && chrome.app.runtime) ? chrome.i18n.getUILanguage() : navigator.language;
			var language = environment.user ? environment.user.language : defaultLanguage;
			webL10n.language.code = language;
		
			// Load from datatore
		
		
			// Shared instances
			if (environment.sharedId) {
				console.log("Shared instance");
				presence = activity.getPresenceObject(function(error, network) {
					network.onDataReceived(onNetworkDataReceived);
				});
			}
		});
	
		// Link presence palette
		var presence = null;
		var palette = new presencepalette.PresencePalette(document.getElementById("network-button"), undefined);
		palette.addEventListener('shared', function() {
			palette.popDown();
			console.log("Want to share");
			presence = activity.getPresenceObject(function(error, network) {
				if (error) {
					console.log("Sharing error");
					return;
				}
				network.createSharedActivity('org.sugarlabs.Chess', function(groupId) {
					console.log("Activity shared");
				});
				network.onDataReceived(onNetworkDataReceived);
			});
		});

		var onNetworkDataReceived = function(msg) {
			if (presence.getUserInfo().networkId === msg.user.networkId) {
				return;
			}
			switch (msg.content.action) {
				case 'init':
					pawns = msg.content.data;
					drawPawns();
					break;
				case 'update':
					pawns.push(msg.content.data);
					drawPawns();
					document.getElementById("user").innerHTML = "<h1>"+webL10n.get("Played", {name:msg.user.name})+"</h1>";
					break;
			}
		};

		document.getElementById("help-button").addEventListener('click', function(e) {
			tutorial.start();
		});

		document.getElementById("picture-button").addEventListener('click', function (e) {
			journalchooser.show(function (entry) {
				// No selection
				if (!entry) {
					return;
				}
				// Get object content
				var dataentry = new datastore.DatastoreObject(entry.objectId);
				dataentry.loadAsText(function (err, metadata, data) {
					document.getElementById("canvas").style.backgroundImage = "url('"+data+"')";
				});
			}, { mimetype: 'image/png' }, { mimetype: 'image/jpeg' });
		});
		
		var addpalette = new chesspalette.ChessPalette(document.getElementById("dif-button"), "Levels");

	});

});

