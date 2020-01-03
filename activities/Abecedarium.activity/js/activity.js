

define(["sugar-web/activity/activity","sugar-web/datastore","tutorial","sugar-web/env","webL10n"], function (activity, datastore, tutorial, env, webL10n) {
	if (!Abcd) {
		Abcd = {};
	}
	Abcd.activity = activity;
	Abcd.datastore = datastore;
	app = null;

	// Manipulate the DOM only when it is ready.
	requirejs(['domReady!'], function (doc) {
		// Initialize the activity
		Abcd.activity.setup();

		env.getEnvironment(function(err, environment) {
			currentenv = environment;
		
			// Set current language to Sugarizer
			var defaultLanguage = (typeof chrome != 'undefined' && chrome.app && chrome.app.runtime) ? chrome.i18n.getUILanguage() : navigator.language;
			var language = environment.user ? environment.user.language : defaultLanguage;
			webL10n.language.code = language;
		});

		// Create sound component
		Abcd.sound = new Abcd.Audio();
		Abcd.sound.renderInto(document.getElementById("header"));

		// Load Database
		Abcd.loadDatabase(function(err) {
			// Init localization 
			Abcd.initL10n();

			// Create and display first screen
			app = new Abcd.App().renderInto(document.getElementById("body"));

			// Load context
			Abcd.loadContext(function() {
				app.restartLastGame();
			});
		});

		// Stop sound at end of game to sanitize media environment, specifically on Android
		document.getElementById("stop-button").addEventListener('click', function (event) {
			Abcd.sound.pause();
		});

		// Launch tutorial
		document.getElementById("help-button").addEventListener('click', function(e) {
			tutorial.start();
		});
	});

});
