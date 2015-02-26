

// Desktop handling
define(function (require) {
	// Load required library
	l10n = require("webL10n");
	iconLib = require("sugar-web/graphics/icon");
	xoPalette = require("sugar-web/graphics/xocolor");
	radioButtonsGroup = require("sugar-web/graphics/radiobuttonsgroup");
	datastore = require("sugar-web/datastore");
    presence = require("sugar-web/presence");	
	preferences = require("settings");
	myserver = require("server");
	util = require("util");
	var isLocalized = false;
	var isDomReady = false;
	
	// Initialize the desktop when localized strings are here
	window.addEventListener('localized', function() {
		if (isDomReady)
			main();
		else
			isLocalized = true;
	}, false);
	
	// Manipulate the DOM only when it is ready.
	require(['domReady!'], function (doc) {
		if (isLocalized)
			main();
		else
			isDomReady = true;
	});
	
	// Main program
	var loaded = preferences.load();
	var main = function() {
		if (!loaded) {
			app = new Sugar.FirstScreen();
		} else {
			app = new Sugar.Desktop();
		}
		document.onmousemove = function(e) { mouse.position = {x: e.pageX, y: e.pageY}; } // Save mouse position		
		app.renderInto(document.getElementById("canvas"));	
	}
});
