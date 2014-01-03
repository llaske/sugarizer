

// Desktop handling
define(function (require) {
	l10n = require("webL10n");
	iconLib = require("sugar-web/graphics/icon");
	xoPalette = require("sugar-web/graphics/xocolor");
	radioButtonsGroup = require("sugar-web/graphics/radiobuttonsgroup");
	datastore = require("sugar-web/datastore");
	preferences = require("settings");
	util = require("util");
	
	// Default language
	l10n.language.code = "en";

    // Manipulate the DOM only when it is ready.
    require(['domReady!'], function (doc) {
		// Load settings
		preferences.load();
		
	    // Initialize the desktop
		app = new Sugar.Desktop();
		var viewRadio = new radioButtonsGroup.RadioButtonsGroup([
			document.getElementById("view-radial-button"),
			document.getElementById("view-list-button")]
		);
		document.getElementById("view-radial-button").onclick = function() { app.showView(constant.radialView); };
		document.getElementById("view-list-button").onclick = function() { app.showView(constant.listView); };
		document.getElementById("view-desktop-button").onclick = function() { app.showView(constant.radialView); };
        app.renderInto(document.getElementById("canvas"));
    });

});
