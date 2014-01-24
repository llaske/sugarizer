

define(function (require) {
    var activity = require("sugar-web/activity/activity");
	l10n = require("webL10n");
    var datastore = require("sugar-web/datastore");

    // Manipulate the DOM only when it is ready.
    require(['domReady!'], function (doc) {
		// Initialize the activity.
		activity.setup();
		var datastoreObject = activity.getDatastoreObject();

		// Ready to receive Python message
        FoodChain.loadContext({});
		l10n.language.code = "fr";

		// Load locale
		window.addEventListener('localized', function() {
			// Create sound component
			FoodChain.sound = new FoodChain.Audio();
			FoodChain.sound.renderInto(document.getElementById("header"));

			// Create and display first screen
			new FoodChain.App().renderInto(document.getElementById("body"));			
		}, false);
    });

});
