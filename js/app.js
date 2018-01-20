

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

	// Wait for DOM is ready.
	require(['domReady!'], function (doc) {
		if (--toload == 0) {
			loadpreference();
		}
	});
});
