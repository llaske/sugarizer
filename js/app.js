

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
    env = require("sugar-web/env");
    preferences = require("settings");
    myserver = require("server");
    util = require("util");

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
	app.renderInto(document.getElementById("canvas"));
    }
	
	// Wait for preferences
	var loadpreference = function() {
		preferences.load(function(load) {
			preferenceset = load;
			main();	
		});
	    //If we are in the SugarizerOS environment, then this method will load Android applications
	    if (env.isSugarizerOS()){
		sugarizerOS.initActivitiesPreferences();
	    }
	}
	
	// Wait for localized strings are here
	window.addEventListener('localized', function() {
		if (app) {
			app.getToolbar().render();
			app.render();
		} else if (--toload == 0)
			loadpreference();
	}, false);
	
	// Wait for DOM is ready.
	require(['domReady!'], function (doc) {
		if (--toload == 0)
			loadpreference();
	});
});
