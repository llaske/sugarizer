

define(["sugar-web/activity/activity","l10n","sugar-web/graphics/radiobuttonsgroup","sugar-web/datastore","tutorial", "sugar-web/env"], function (activity, l10n, radioButtonsGroup, datastore, tutorial, env) {
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
			l10n.init("en");
			FoodChain.setLocale();
		};
		document.getElementById("fr-button").onclick = function() {
			l10n.init("fr");
			FoodChain.setLocale();
		};
		document.getElementById("pt_BR-button").onclick = function() {
			l10n.init("pt_BR");
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
				env.getEnvironment(function(err, environment) {
					// Set current language to Sugarizer
					var defaultLanguage = (typeof chrome != 'undefined' && chrome.app && chrome.app.runtime) ? chrome.i18n.getUILanguage() : navigator.language;
					var language = environment.user ? environment.user.language : defaultLanguage;
					if (language == 'fr' || language == 'en') {
						l10n.init(language);
					} else if (language == 'pt') {
						l10n.init("pt_BR");
					}

					// Init sound component
					FoodChain.sound = new FoodChain.Audio();
					FoodChain.sound.renderInto(document.getElementById("header"));

					// Create and display first screen
					FoodChain.context.home = app = new FoodChain.App().renderInto(document.getElementById("body"));
					FoodChain.setLocale();

					// Load context
					FoodChain.loadContext(function() {
						if(FoodChain.context.game!=""){
							app.playGame({
								name: FoodChain.context.game.replace("FoodChain.", ""),
								level: FoodChain.context.level
							});
							FoodChain.context.object.pause();
							FoodChain.context.object.play();
						}
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
			FoodChain.saveContext();
        });

	// Add Fullscreen/Unfullscreen functionality
        document.getElementById("fullscreen-button").addEventListener('click', function() {
			document.getElementById("main-toolbar").style.opacity = 1;
			document.getElementById("canvas").style.top = "0px";
			document.getElementById("unfullscreen-button").style.visibility = "visible";
        });
        document.getElementById("unfullscreen-button").addEventListener('click', function() {
			document.getElementById("main-toolbar").style.opacity = 1;
			document.getElementById("canvas").style.top = "55px";
			document.getElementById("unfullscreen-button").style.visibility = "hidden";
        });
    });

});
