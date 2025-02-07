

// // Desktop handling
// define(["l10n", "sugar-web/graphics/icon", "sugar-web/graphics/xocolor", "sugar-web/graphics/radiobuttonsgroup", "sugar-web/datastore", "sugar-web/presence", "settings", "server", "humane", "util", "tutorial", "stats", "autosync", "history", "activities"], function (_l10n, _iconLib, _xoPalette, _radioButtonsGroup, _datastore, _presence, _preferences, _myserver, _humane, _util, _tutorial, _stats, _autosync, _historic, _activities) {
// 	// Load required library
// 	l10n = _l10n;
// 	iconLib = _iconLib;
// 	xoPalette = _xoPalette;
// 	radioButtonsGroup = _radioButtonsGroup;
// 	datastore = _datastore;
// 	presence = _presence;
// 	preferences = _preferences;
// 	myserver = _myserver;
// 	humane = _humane;
// 	tutorial = _tutorial;
// 	stats = _stats;
// 	autosync = _autosync;
// 	historic = _historic;
// 	activities = _activities;
// 	util = _util;
// 	var toload = 1;
// 	var preferenceset = false;

// 	// Main program
// 	var main = function() {
// 		if (!preferenceset) {
// 			app = new Sugar.FirstScreen();
// 		} else {
// 			app = new Sugar.Desktop();
// 		}
// 		document.onmousemove = function(e) { mouse.position = {x: e.pageX, y: e.pageY}; } // Save mouse position
// 		util.handleVolumeButtons();
// 		app.renderInto(document.getElementById("canvas"));
// 	}

// 	// Connect to server if an user is connected
// 	var connectToServer = function(callback) {
// 		if (!preferences.isUserConnected()) {
// 			callback(true);
// 			return;
// 		}
// 		var networkId = preferences.getNetworkId();
// 		var that = this;
// 		myserver.getUser(
// 			networkId,
// 			function(inSender, inResponse) {
// 				preferences.merge(inResponse);
// 				util.updateFavicon();
// 				callback(true);
// 			},
// 			function() {
// 				var token = preferences.getToken();
// 				if (token && token.expired) {
// 					callback(true);
// 				} else {
// 					preferences.setToken({...token, expired: true});
// 					console.log("WARNING: Can't read network user settings, force token expiration");
// 					callback(true);
// 				}
// 			}
// 		);
// 	};

// 	// Load activities list if an user is connected
// 	var loadActivities = function(callback) {
// 		if (!preferences.isInitialized()) {
// 			callback();
// 			return;
// 		}
// 		activities.load().then(function(data) {
// 			callback();
// 		}).catch(function(error) {
// 			console.log("Error loading init activities");
// 			util.cleanDatastore(null, function() {
// 				util.restartApp();
// 			});
// 		});
// 	};

// 	// Wait for preferences
// 	var loadpreference = function() {
// 		var getUrlParameter = function(name) {
// 			var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
// 			return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
// 		};
// 		var rst = getUrlParameter('rst');
// 		preferences.load(function(load) {
// 			preferenceset = (load != null);
// 			if (util.getClientType() == constant.appType && (util.platform.electron || util.platform.android)) {
// 				if (rst == 1) {
// 					// Restart from a fresh install, use from Electon option --init
// 					util.cleanDatastore(true);
// 					preferenceset = false;
// 				} else if (rst == 2) {
// 					// Sugarizer OS auto logoff or Electron option --logoff
// 					if (preferences.isConnected()) {
// 						util.cleanDatastore(null);
// 						preferenceset = false;
// 					}
// 				}
// 			}
// 			connectToServer(function(success) {
// 				if (success) {
// 					loadActivities(function() {
// 						if (!preferences.isUserConnected() || window.sugarizerOS) {
// 							// Update favorites
// 							var list = activities.get();
// 							for(var i = 0 ; i < list.length ; i++) {
// 								for (var j = 0 ; j < load.activities.length ; j++) {
// 									if (load.activities[j].id == list[i].id) {
// 										list[i].favorite = load.activities[j].favorite;
// 									}
// 								}
// 							}
// 						}
// 						main();
// 					})
// 				}
// 			});
// 		});
// 	}

// 	// Wait for localized strings are here
// 	window.addEventListener('localized', function() {
// 		if (app) {
// 			var toLocalize = app.getToolbar ? app.getToolbar() : app;
// 			toLocalize.localize();
// 			app.render();
// 		} else if (--toload == 0) {
// 			loadpreference();
// 		}
// 	}, false);

// 	// HACK: on iOS, create a media to initialize sound
// 	if (util.platform.ios && document.location.protocol.substr(0,4) != "http") {
// 		document.addEventListener("deviceready", function() {
// 			var release = function() { media.release(); }
// 			var media = new Media("audio/silence.mp3", release, release, release);
// 			media.play();
// 		});
// 	}

// 	// Wait for DOM is ready.
// 	requirejs(['domReady!'], function (doc) {
// 		if (--toload == 0) {
// 			loadpreference();
// 		}
// 	});
// });





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

	// ==== NEW: Add UI Enhancements ====
	// Add CSS for loading spinner, status bar, and notifications
	var uiEnhancementsCSS = `
		/* Loading Spinner */
		#loading-spinner {
			position: fixed;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			border: 4px solid #f3f3f3;
			border-top: 4px solid #3498db;
			border-radius: 50%;
			width: 40px;
			height: 40px;
			animation: spin 1s linear infinite;
		}
		@keyframes spin {
			0% { transform: translate(-50%, -50%) rotate(0deg); }
			100% { transform: translate(-50%, -50%) rotate(360deg); }
		}

		/* Status Bar */
		#status-bar {
			position: fixed;
			bottom: 0;
			left: 0;
			width: 100%;
			background-color: #333;
			color: #fff;
			text-align: center;
			padding: 10px;
			font-size: 14px;
			z-index: 1000;
		}

		/* Notifications */
		#notification {
			position: fixed;
			bottom: 50px;
			right: 20px;
			background-color: #444;
			color: #fff;
			padding: 10px 20px;
			border-radius: 5px;
			display: none;
			z-index: 1000;
		}
	`;

	// Inject the CSS into the document
	var style = document.createElement('style');
	style.innerHTML = uiEnhancementsCSS;
	document.head.appendChild(style);

	// Create the loading spinner
	var loadingSpinner = document.createElement('div');
	loadingSpinner.id = 'loading-spinner';
	document.body.appendChild(loadingSpinner);

	// Create the status bar
	var statusBar = document.createElement('div');
	statusBar.id = 'status-bar';
	statusBar.innerText = 'Loading...';
	document.body.appendChild(statusBar);

	// Create the notification element
	var notification = document.createElement('div');
	notification.id = 'notification';
	document.body.appendChild(notification);

	// Function to show notifications
	function showNotification(message, duration = 3000) {
		notification.innerText = message;
		notification.style.display = 'block';
		setTimeout(() => {
			notification.style.display = 'none';
		}, duration);
	}
	// ==== END OF NEW UI ENHANCEMENTS ====

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

		// ==== NEW: Hide the loading spinner when the app is ready ====
		document.getElementById('loading-spinner').style.display = 'none';
		statusBar.innerText = 'Ready';
		showNotification('App loaded successfully!');
	}

	// Connect to server if an user is connected
	var connectToServer = function(callback) {
		// ==== NEW: Update status bar ====
		statusBar.innerText = 'Connecting to server...';
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
				// ==== NEW: Update status bar and show notification ====
				statusBar.innerText = 'Connected to server';
				showNotification('Connected to server successfully!');
				callback(true);
			},
			function() {
				var token = preferences.getToken();
				if (token && token.expired) {
					callback(true);
				} else {
					preferences.setToken({...token, expired: true});
					// ==== NEW: Update status bar and show notification ====
					statusBar.innerText = 'Failed to connect to server';
					showNotification('Failed to connect to server!', 5000);
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
			// ==== NEW: Show notification when activities are loaded ====
			showNotification('Activities loaded successfully!');
			callback();
		}).catch(function(error) {
			console.log("Error loading init activities");
			// ==== NEW: Show notification on error ====
			showNotification('Error loading activities!', 5000);
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