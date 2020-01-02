

define(["sugar-web/activity/activity","webL10n","sugar-web/graphics/radiobuttonsgroup","sugar-web/datastore","tutorial"], function (activity, _l10n, radioButtonsGroup, datastore, tutorial) {
	l10n = _l10n;
	var app = null;

    // Manipulate the DOM only when it is ready.
    requirejs(['domReady!'], function (doc) {
		// Initialize the activity
		FoodChain.activity = activity;
		FoodChain.activity.setup();

		// Initialize buttons
		var languageRadio = new radioButtonsGroup.RadioButtonsGroup([
			document.getElementById("en-button"),
			document.getElementById("fr-button")]
		);
		document.getElementById("en-button").onclick = function() {
			l10n.language.code = "en";
			FoodChain.setLocale();
		};
		document.getElementById("fr-button").onclick = function() {
			l10n.language.code = "fr";
			FoodChain.setLocale();
		};
		document.getElementById("pt_BR-button").onclick = function() {
			l10n.language.code = "pt_BR";
			FoodChain.setLocale();
		};
		// Launch tutorial
		document.getElementById("help-button").addEventListener('click', function(e) {
			tutorial.start();
		});

		// Wait for locale load
		var localized_received = function() {
			// Init activity
			if (app == null) {
				// Init sound component
				FoodChain.sound = new FoodChain.Audio();
				FoodChain.sound.renderInto(document.getElementById("header"));

				// Create and display first screen
				FoodChain.context.home = app = new FoodChain.App().renderInto(document.getElementById("body"));
				FoodChain.setLocale();

				// Load context
				FoodChain.loadContext(function() {
					app.playGame({
						name: FoodChain.context.game.replace("FoodChain.", ""),
						level: FoodChain.context.level
					});
				});
			} else {
				// Just change locale
				FoodChain.setLocale();
			}
		};
		window.addEventListener('localized', localized_received, false);

        // Stop sound at end of game to sanitize media environment, specifically on Android
        document.getElementById("stop-button").addEventListener('click', function (event) {
			FoodChain.sound.pause();
        });
    });

});
