define(function (require) {
    var activity = require("sugar-web/activity/activity");
	var env = require("sugar-web/env");
	var settingspalette = require("settingspalette");
	var isFavorite = false;

    // Manipulate the DOM only when it is ready.
    require(['domReady!'], function (doc) {
        // Initialize the activity.
        activity.setup();

		// Create palette
        var settingsButton = document.getElementById("settings-button");
		settingspalette = new settingspalette.SettingsPalette(settingsButton, undefined);
		settingspalette.addEventListener('language', function() {
			Util.setLanguage(settingspalette.getLanguage());
			Util.saveContext();
			settingspalette.popDown();
		});
		settingspalette.addEventListener('remote', function() {
			settingspalette.popDown();
			app.remotePopUp();
		});
		document.getElementById("favorite-button").onclick = function(s, e) {
			var invoker = s.toElement;
			isFavorite = !isFavorite;
			if (isFavorite)
				invoker.style.backgroundImage = 'url(icons/favorite.svg)';
			else
				invoker.style.backgroundImage = 'url(icons/notfavorite.svg)';
			app.favoriteChanged(isFavorite);
		};
		
		// Launch main screen
		app = new KAView.App({activity: activity});
		app.renderInto(document.getElementById("viewer"));
		
		// Load context
		Util.loadContext(function() {
			app.localeChanged(Util.getIndex());
			app.draw();
		});
    });

});
