

define(function (require) {
    Abcd.activity = require("sugar-web/activity/activity");
	var app = null;

    // Manipulate the DOM only when it is ready.
    require(['domReady!'], function (doc) {	
		// Initialize the activity
		Abcd.activity.setup();
		
		// Load context
		Abcd.loadContext();
		document.getElementById("stop-button").onclick = function() {
			Abcd.saveContext();
		}
		
		// Create sound component
		Abcd.sound = new Abcd.Audio();
		Abcd.sound.renderInto(document.getElementById("header"));

		// Create and display first screen
		app = new Abcd.App().renderInto(document.getElementById("body"));
    });

});
