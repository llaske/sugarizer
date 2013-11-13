

// Desktop handling
define(function (require) {
	iconLib = require("sugar-web/graphics/icon");
	xoPalette = require("sugar-web/graphics/xocolor");

    // Manipulate the DOM only when it is ready.
    require(['domReady!'], function (doc) {
	    // Initialize the desktop
		var app = new SugarDesktop();
        app.renderInto(document.getElementById("canvas"));
    });

});
