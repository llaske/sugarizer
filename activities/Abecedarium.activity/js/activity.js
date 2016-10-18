

define(["sugar-web/activity/activity"], function (activity) {
	Abcd.activity = activity;
	app = null;

	// Manipulate the DOM only when it is ready.
	require(['domReady!'], function (doc) {
		// Initialize the activity
		Abcd.activity.setup();

		// Create sound component
		Abcd.sound = new Abcd.Audio();
		Abcd.sound.renderInto(document.getElementById("header"));

		// Create and display first screen
		app = new Abcd.App().renderInto(document.getElementById("body"));

		// Load context
		Abcd.loadContext(function() {
			app.restartLastGame();
		});

		// Stop sound at end of game to sanitize media environment, specifically on Android
		document.getElementById("stop-button").addEventListener('click', function (event) {
			Abcd.sound.pause();
		});
	});

});
