var app;
var sound;

define(["sugar-web/activity/activity", "tutorial"], function (activity, tutorial) {

	// Launch tutorial
	document.getElementById("help-button").addEventListener('click', function (e) {
		tutorial.start();
	});

	// Manipulate the DOM only when it is ready.
	requirejs(['domReady!'], function (doc) {
		// Initialize the activity.
		activity.setup();

		// Create sound component
		sound = new TamTam.Audio();
		sound.renderInto(document.getElementById("audio"));

		// Launch main screen
		app = new TamTam.App({activity: activity});
		app.renderInto(document.getElementById("keyboard"));

		// Stop sound at end of game to sanitize media environment, specifically on Android
		document.getElementById("stop-button").addEventListener('click', function (event) {
			sound.pause();
		});
	});
});
