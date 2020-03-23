define(["sugar-web/activity/activity", "sugar-web/env", "sugar-web/graphics/icon", "webL10n","sugar-web/graphics/presencepalette","sugar-web/datastore","sugar-web/graphics/journalchooser"], function (activity, env, icon, webL10n, presencepalette, datastore, journalchooser) {

	// Manipulate the DOM only when it is ready.
	requirejs(['domReady!'], function (doc) {

		// Initialize the activity.
		activity.setup();
		var pawns = [];
var drawPawns = function() {
	document.getElementById("pawns").innerHTML = '';
	for (var i = 0 ; i < pawns.length ; i++) {
		var pawn = document.createElement("div");
		pawn.className = "pawn";

		document.getElementById("pawns").appendChild(pawn);
		icon.colorize(pawn, pawns[i]);
	}
}

// Handle click on add
document.getElementById("add-button").addEventListener('click', function (event) {

	pawns.push(currentenv.user.colorvalue);
	drawPawns();

	document.getElementById("user").innerHTML = "<h1>"+webL10n.get("Played", {name:currentenv.user.name})+"</h1>";

	if (presence) {
		presence.sendMessage(presence.getSharedInfo().id, {
			user: presence.getUserInfo(),
			content: currentenv.user.colorvalue
		});
	}
});
document.getElementById("stop-button").addEventListener('click', function (event) {
	console.log("writing...");
	var jsonData = JSON.stringify(pawns);
	activity.getDatastoreObject().setDataAsText(jsonData);
	activity.getDatastoreObject().save(function (error) {
		if (error === null) {
			console.log("write done.");
		} else {
			console.log("write failed.");
		}
	});
});
env.getEnvironment(function(err, environment) {
	currentenv = environment;

	// Set current language to Sugarizer
	var defaultLanguage = (typeof chrome != 'undefined' && chrome.app && chrome.app.runtime) ? chrome.i18n.getUILanguage() : navigator.language;
	var language = environment.user ? environment.user.language : defaultLanguage;
	webL10n.language.code = language;

	// Load from datatore
	if (!environment.objectId) {
		console.log("New instance");
	} else {
		activity.getDatastoreObject().loadAsText(function(error, metadata, data) {
			if (error==null && data!=null) {
				pawns = JSON.parse(data);
				drawPawns();
			}
		});
		if (environment.sharedId) {
			console.log("Shared instance");
			presence = activity.getPresenceObject(function(error, network) {
				network.onDataReceived(onNetworkDataReceived);
			});
		}
	}
});
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
				data: pawns
			}
		});
	}
	console.log("User "+msg.user.name+" "+(msg.move == 1 ? "join": "leave"));
}; 
network.onSharedActivityUserChanged(onNetworkUserChanged);
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

activity.getDatastoreObject().loadAsText(function(error, metadata, data) {
	if (error==null && data!=null) {
		pawns = JSON.parse(data);
	}
});
if (!environment.objectId) {
	console.log("New instance");
} else {
	activity.getDatastoreObject().loadAsText(function(error, metadata, data) {
		if (error==null && data!=null) {
			pawns = JSON.parse(data);
			drawPawns();
		}
	});
}
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
		network.createSharedActivity('org.sugarlabs.Pawn', function(groupId) {
			console.log("Activity shared");
		});
		network.onDataReceived(onNetworkDataReceived);
	});
});
	});

});