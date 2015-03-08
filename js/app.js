

// Desktop handling
define(function (require) {
	// Load required library
	l10n = require("webL10n");
	l10n.start();
	iconLib = require("sugar-web/graphics/icon");
	xoPalette = require("sugar-web/graphics/xocolor");
	radioButtonsGroup = require("sugar-web/graphics/radiobuttonsgroup");
	datastore = require("sugar-web/datastore");
    presence = require("sugar-web/presence");	
	preferences = require("settings");
	myserver = require("server");
	util = require("util");
	var toload = 3;
	
	// Wait for localized strings are here
	window.addEventListener('localized', function() {
		if (--toload == 0)
			main();
	}, false);
	
	// Wait for DOM is ready.
	require(['domReady!'], function (doc) {	
		if (--toload == 0)
			main();
	});
	
	// Wait for preferences
	var preferenceset = false;
	preferences.load(function(load) {
		preferenceset = load;
		if (--toload == 0)
			main();	
	});
	
	// Main program
	var main = function() {
		if (!preferenceset) {
			app = new Sugar.FirstScreen();
		} else {
			app = new Sugar.Desktop();
		}
		document.onmousemove = function(e) { mouse.position = {x: e.pageX, y: e.pageY}; } // Save mouse position		
		app.renderInto(document.getElementById("canvas"));	
	}
});
