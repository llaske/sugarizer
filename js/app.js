

// Desktop handling
define(["l10n", "sugar-web/graphics/icon", "sugar-web/graphics/xocolor", "sugar-web/graphics/radiobuttonsgroup", "sugar-web/datastore", "sugar-web/presence", "settings", "server", "humane", "util", "tutorial", "stats", "autosync", "history", "activities"], function (_l10n, _iconLib, _xoPalette, _radioButtonsGroup, _datastore, _presence, _preferences, _myserver, _humane, _util, _tutorial, _stats, _autosync, _historic, _activities) {
	// Load required library
	l10n = _l10n;
	iconLib = _iconLib;
	xoPalette = _xoPalette;
	radioButtonsGroup = _radioButtonsGroup;
	datastore = _datastore;
	presence = _presence;
	preferences = _preferences;
	myserver = _myserver;
	humane = _humane;
	tutorial = _tutorial;
	stats = _stats;
	autosync = _autosync;
	historic = _historic;
	activities = _activities;
	util = _util;
	var toload = 1;
	var preferenceset = false;

	// Main program
	var main = function() {
		if (!preferenceset) {
			app = new Sugar.FirstScreen();
		} else {
			app = new Sugar.Desktop();
		}
		document.onmousemove = function(e) { mouse.position = {x: e.pageX, y: e.pageY}; } // Save mouse position
		util.handleVolumeButtons();
		app.renderInto(document.getElementById("canvas"));
	}

	// Connect to server if an user is connected
	var connectToServer = function(callback) {
		if (!preferences.isUserConnected()) {
			callback(true);
			return;
		}
		var networkId = preferences.getNetworkId();
		var that = this;
		myserver.getUser(
			networkId,
			function(inSender, inResponse) {
				preferences.merge(inResponse);
				util.updateFavicon();
				callback(true);
			},
			function() {
				var token = preferences.getToken();
				if (token && token.expired) {
					callback(true);
				} else {
					preferences.setToken({...token, expired: true});
					console.log("WARNING: Can't read network user settings, force token expiration");
					callback(true);
				}
			}
		);
	};

	// Load activities list if an user is connected
	var loadActivities = function(callback) {
		if (!preferences.isInitialized()) {
			callback();
			return;
		}
		activities.load().then(function(data) {
			callback();
		}).catch(function(error) {
			console.log("Error loading init activities");
			util.cleanDatastore(null, function() {
				util.restartApp();
			});
		});
	};

	// Wait for preferences
	var loadpreference = function() {
		var getUrlParameter = function(name) {
			var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
			return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
		};
		var rst = getUrlParameter('rst');
		preferences.load(function(load) {
			preferenceset = (load != null);
			if (util.getClientType() == constant.appType && (util.platform.electron || util.platform.android)) {
				if (rst == 1) {
					// Restart from a fresh install, use from Electon option --init
					util.cleanDatastore(true);
					preferenceset = false;
				} else if (rst == 2) {
					// Sugarizer OS auto logoff or Electron option --logoff
					if (preferences.isConnected()) {
						util.cleanDatastore(null);
						preferenceset = false;
					}
				}
			}
			connectToServer(function(success) {
				if (success) {
					loadActivities(function() {
						if (!preferences.isUserConnected() || window.sugarizerOS) {
							// Update favorites
							var list = activities.get();
							for(var i = 0 ; i < list.length ; i++) {
								for (var j = 0 ; j < load.activities.length ; j++) {
									if (load.activities[j].id == list[i].id) {
										list[i].favorite = load.activities[j].favorite;
									}
								}
							}
						}
						main();
					})
				}
			});
		});
	}

	// Wait for localized strings are here
	window.addEventListener('localized', function() {
		if (app) {
			var toLocalize = app.getToolbar ? app.getToolbar() : app;
			toLocalize.localize();
			app.render();
		} else if (--toload == 0) {
			loadpreference();
		}
	}, false);

	// HACK: on iOS, create a media to initialize sound
	if (util.platform.ios && document.location.protocol.substr(0,4) != "http") {
		document.addEventListener("deviceready", function() {
			var release = function() { media.release(); }
			var media = new Media("audio/silence.mp3", release, release, release);
			media.play();
		});
	}

	// Wait for DOM is ready.
	requirejs(['domReady!'], function (doc) {
		if (--toload == 0) {
			loadpreference();
		}
	});
});
