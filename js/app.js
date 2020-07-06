

// Desktop handling
define(["webL10n", "sugar-web/graphics/icon", "sugar-web/graphics/xocolor", "sugar-web/graphics/radiobuttonsgroup", "sugar-web/datastore", "sugar-web/presence", "settings", "server", "humane", "util", "tutorial", "stats", "autosync"], function (_l10n, _iconLib, _xoPalette, _radioButtonsGroup, _datastore, _presence, _preferences, _myserver, _humane, _util, _tutorial, _stats, _autosync) {
	// Load required library
	l10n = _l10n;
	l10n.start();
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
	util = _util;
	var toload = 2;
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

	// Wait for preferences
	var loadpreference = function() {
		enyo.platform.electron = /Electron/.test(navigator.userAgent);
		if (util.getClientType() == constant.appType && !enyo.platform.android && !enyo.platform.androidChrome && !enyo.platform.ios) {
			var getUrlParameter = function(name) {
				var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
				return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
			};
			var rst = getUrlParameter('rst');
			if (rst == 1) {
				// Electron app parameter to start from a fresh install
				util.cleanDatastore(true);
			} else if (rst == 2) {
				// Sugarizer OS auto logoff
				util.cleanDatastore(null);
			}
		}
		preferences.load(function(load) {
			preferenceset = load;
			main();
		});
	}

	// Wait for localized strings are here
	window.addEventListener('localized', function() {
		if (app) {
			app.getToolbar().localize();
			app.render();
		} else if (--toload == 0) {
			loadpreference();
		}
	}, false);

	// HACK: on iOS, create a media to initialize sound
	if (enyo.platform.ios && document.location.protocol.substr(0,4) != "http") {
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
