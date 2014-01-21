

// Desktop handling
define(function (require) {
	l10n = require("webL10n");
	iconLib = require("sugar-web/graphics/icon");
	xoPalette = require("sugar-web/graphics/xocolor");
	radioButtonsGroup = require("sugar-web/graphics/radiobuttonsgroup");
	datastore = require("sugar-web/datastore");
	preferences = require("settings");
	util = require("util");

    // Manipulate the DOM only when it is ready.
    require(['domReady!'], function (doc) {
		// Load settings
		preferences.load();

		// Initialize the desktop when localized strings are here
		window.addEventListener('localized', function() {
			app = new Sugar.Desktop();
			document.onmousemove = function(e) { mouse.position = {x: e.pageX, y: e.pageY}; } // Save mouse position		
			app.renderInto(document.getElementById("canvas"));		
		}, false);
		l10n.start();
    });

});
