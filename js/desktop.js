

// Desktop handling
define(function (require) {
	iconLib = require("sugar-web/graphics/icon");
	xoPalette = require("sugar-web/graphics/xocolor");
	radioButtonsGroup = require("sugar-web/graphics/radiobuttonsgroup");
	datastore = require("sugar-web/datastore");
	preferences = require("settings");

    // Manipulate the DOM only when it is ready.
    require(['domReady!'], function (doc) {
		// Load settings
		preferences.load();
		
	    // Initialize the desktop
		var app = new Sugar.Desktop();
		var viewRadio = new radioButtonsGroup.RadioButtonsGroup([
			document.getElementById("view-radial-button"),
			document.getElementById("view-list-button")]
		);
		document.getElementById("view-radial-button").onclick = function() { app.switchView(); };
		document.getElementById("view-list-button").onclick = function() { app.switchView(); };
        app.renderInto(document.getElementById("canvas"));
    });

});
