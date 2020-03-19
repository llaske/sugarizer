var app = null;
var l10n;
var preferences;
var play;
var sound;
var mouse = {};

define(["sugar-web/activity/activity", "tutorial"], function (activity, tutorial) {

	// Manipulate the DOM only when it is ready.
	requirejs(['domReady!',"settings"], function (doc, settings) {

		// Initialize the activity.
		activity.setup();

		// Save mouse position
		document.onmousemove = function(e) { mouse.position = {x: e.pageX, y: e.pageY}; }
		preferences = settings;
		preferences.load(function() {
			l10n = preferences.l10n;

			// Wait for locale load
			var localized_received = function() {
				// Init activity
				if (app == null) {
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

					// Full screen
					document.getElementById("fullscreen-button").addEventListener('click', function() {
						document.getElementById("main-toolbar").style.visibility = "hidden";
						document.getElementById("unfullscreen-button").style.visibility = "visible";
						document.getElementById("unfullscreen-button").style.top = "60px";
						var x = document.getElementsByClassName("body")
						for (i = 0; i < x.length; i++) {
							x[i].style.bottom = "50px"
						};
						if (play) {
							play.resize();
						}
					});

					// Launch tutorial
					document.getElementById("help-button").addEventListener('click', function(e) {
						tutorial.start(play);
					});

					document.getElementById("unfullscreen-button").addEventListener('click', function() {
						document.getElementById("main-toolbar").style.visibility = "visible";
						document.getElementById("unfullscreen-button").style.visibility = "hidden";
						var x = document.getElementsByClassName("body")
						for (i = 0; i < x.length; i++) {
							x[i].style.bottom = "0px"
						}
						if (play) {
							play.resize();
						}
					});

					// Stop sound at end of game to sanitize media environment, specifically on Android
					document.getElementById("stop-button").addEventListener('click', function (event) {
						sound.pause();
					});
				} else {
					// Just change locale
					app.setLocale();
				}
			};
			window.addEventListener('localized', localized_received, false);
		});
	});

});
