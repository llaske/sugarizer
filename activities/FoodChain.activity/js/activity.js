

define(function (require) {
	l10n = require("webL10n");
    FoodChain.activity = require("sugar-web/activity/activity");
	var radioButtonsGroup = require("sugar-web/graphics/radiobuttonsgroup");
    var datastore = require("sugar-web/datastore");
	var app = null;

    // Manipulate the DOM only when it is ready.
    require(['domReady!'], function (doc) {
		// Initialize the activity
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
		document.getElementById("stop-button").onclick = function() {
			FoodChain.saveContext();
		}
		
		// Wait for locale load
		window.addEventListener('localized', function() {
			// Init activity
			if (app == null) {
				// Load context
				FoodChain.loadContext();
				
				// Init sound component
				FoodChain.sound = new FoodChain.Audio();
				FoodChain.sound.renderInto(document.getElementById("header"));

				// Create and display first screen
				FoodChain.context.home = app = new FoodChain.App().renderInto(document.getElementById("body"));	
				FoodChain.setLocale();
			} else {
				// Just change locale
				FoodChain.setLocale();
			}
		}, false);
    });

});
