
define(["sugar-web/activity/activity", "sugar-web/env", "sugar-web/graphics/icon", "webL10n","sugar-web/graphics/presencepalette"], function (activity, env, icon, webL10n, presencepalette) {
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
			network.createSharedActivity('org.sugarlabs.LOL', function(groupId) {
				console.log("Activity shared");
			});
			network.onDataReceived(onNetworkDataReceived);
		});
	});
	
	// Handle click on add
	document.getElementById("add-button").addEventListener('click', function (event) {

		LOL.push(currentenv.user.colorvalue);
		drawLOL();

		document.getElementById("user").innerHTML = "<h1>"+webL10n.get("Played", {name:currentenv.user.name})+"</h1>";

		if (presence) {
			presence.sendMessage(presence.getSharedInfo().id, {
				user: presence.getUserInfo(),
				content: currentenv.user.colorvalue
			});
		}
	});
	
	env.getEnvironment(function(err, environment) {
		currentenv = environment;

		// Set current language to Sugarizer
		...

		// Load from datatore
		if (!environment.objectId) {
			...
		}

		// Shared instances
		if (environment.sharedId) {
			console.log("Shared instance");
			presence = activity.getPresenceObject(function(error, network) {
				network.onDataReceived(onNetworkDataReceived);
			});
		}
	});
	
	var onNetworkDataReceived = function(msg) {
		if (presence.getUserInfo().networkId === msg.user.networkId) {
			return;
		}
		switch (msg.content.action) {
			case 'init':
				LOL = msg.content.data;
				drawLOL();
				break;
			case 'update':
				LOL.push(msg.content.data);
				drawLOL();
				document.getElementById("user").innerHTML = "<h1>"+webL10n.get("Played", {name:msg.user.name})+"</h1>";
				break;
		}
	};
	
	network.onSharedActivityUserChanged(onNetworkUserChanged);
		
	var onNetworkUserChanged = function(msg) {
		console.log("User "+msg.user.name+" "+(msg.move == 1 ? "join": "leave"));
	};
	
	presence.sendMessage(presence.getSharedInfo().id, {
		user: presence.getUserInfo(),
		content: {
			action: 'update',
			data: currentenv.user.colorvalue
		}
	});
	
	var onNetworkUserChanged = function(msg) {
		if (isHost) {
			presence.sendMessage(presence.getSharedInfo().id, {
				user: presence.getUserInfo(),
				content: {
					action: 'init',
					data: LOL
				}
			});
		}
		console.log("User "+msg.user.name+" "+(msg.move == 1 ? "join": "leave"));
	};
	
	var isHost = false;
	palette.addEventListener('shared', function() {
		palette.popDown();
		console.log("Want to share");
		presence = activity.getPresenceObject(function(error, network) {
			if (error) {
				console.log("Sharing error");
				return;
			}
			network.createSharedActivity('org.sugarlabs.LOL', function(groupId) {
				console.log("Activity shared");
				isHost = true;
			});
			network.onDataReceived(onNetworkDataReceived);
			network.onSharedActivityUserChanged(onNetworkUserChanged);
		});
	});
		
define(["sugar-web/activity/activity", "sugar-web/graphics/radiobuttonsgroup"], function (activity, radioButtonsGroup) {
	var app;

    // Manipulate the DOM only when it is ready.
    require(['domReady!'], function (doc) {

        // Initialize the Sugar activity.
        activity.setup();

		// Initialize buttons
		document.getElementById("new-game-button").onclick = function() {
			app.doRenew();
		};
		var levelRadio = new radioButtonsGroup.RadioButtonsGroup([
			document.getElementById("level-easy-button"),
			document.getElementById("level-medium-button"),
			document.getElementById("level-hard-button")]
		);
		document.getElementById("switch-player-button").onclick = function() {
			app.switchPlayer();
		};

        // Initialize the game
		app = new LOLGameApp({activity: activity});
		app.load();
        app.renderInto(document.getElementById("canvas"));

    });

});
