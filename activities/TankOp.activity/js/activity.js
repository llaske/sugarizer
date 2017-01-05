var app = null;
var l10n;
var preferences;
var play;
var sound;
var mouse = {};

define(["sugar-web/activity/activity"], function (activity) {

	// Manipulate the DOM only when it is ready.
	require(['domReady!',"settings"], function (doc, settings) {

		// Initialize the activity.
		activity.setup();

		// Save mouse position
		document.onmousemove = function(e) { mouse.position = {x: e.pageX, y: e.pageY}; }
		preferences = settings;
		preferences.load(function() {
			l10n = preferences.l10n;
			window.addEventListener('localized', function() {
				// Force language
				if (preferences.l10n.language.code != preferences.language) {
					preferences.l10n.language.code = preferences.language;
					return;
				}

				// Create sound component
				sound = new TankOp.Audio();
				sound.renderInto(document.getElementById("audio"));

				// Launch main screen
				app = new TankOp.App({activity: activity});
				app.load();
				app.renderInto(document.getElementById("board"));

				// Stop sound at end of game to sanitize media environment, specifically on Android
				document.getElementById("stop-button").addEventListener('click', function (event) {
					sound.pause();
				});
			});
		});
	});

});
