

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

	// Manipulate the DOM only when it is ready.
	require(['domReady!'], function (doc) {
		// Load settings
		var loaded = preferences.load();

		// Initialize the desktop when localized strings are here
		window.addEventListener('localized', function() {
			if (!loaded) {
				app = new Sugar.FirstScreen();
			} else {
				app = new Sugar.Desktop();
			}
			document.onmousemove = function(e) { mouse.position = {x: e.pageX, y: e.pageY}; } // Save mouse position		
			app.renderInto(document.getElementById("canvas"));			
		}, false);
		
		// HACK: force translate at first load due to defered loading
		if (!loaded) l10n.language.code = preferences.getLanguage();		
	});
});
