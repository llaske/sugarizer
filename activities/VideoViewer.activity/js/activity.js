define(["sugar-web/activity/activity","sugar-web/env","filterpalette","tutorial", "webL10n"], function (activity, env, filterpalette, tutorial, webL10n) {
	var isFavorite = false;

	// Manipulate the DOM only when it is ready.
	requirejs(['domReady!'], function (doc) {
		// Initialize the activity.
		activity.setup();

		env.getEnvironment(function(err, environment) {
			currentenv = environment;
			// Set current language to Sugarizer
			var defaultLanguage = (typeof chrome != 'undefined' && chrome.app && chrome.app.runtime) ? chrome.i18n.getUILanguage() : navigator.language;
			var language = environment.user ? environment.user.language : defaultLanguage;
			webL10n.language.code = language;
		
		});

		// Create palette
		var filterButton = document.getElementById("filter-button");
		filterpalette = new filterpalette.FilterPalette(filterButton, undefined);
		filterpalette.addEventListener('filter', function() {
			app.setFilter({category: filterpalette.getFilter()});
			Util.saveContext();
			filterpalette.popDown();
		});
		document.getElementById("favorite-button").onclick = function(s, e) {
			var invoker = s.toElement || s.explicitOriginalTarget || s.currentTarget;
			isFavorite = !isFavorite;
			if (isFavorite)
				invoker.style.backgroundImage = 'url(icons/favorite.svg)';
			else
				invoker.style.backgroundImage = 'url(icons/notfavorite.svg)';
			app.setFilter({favorite: isFavorite});
		};
		document.getElementById("library-button").onclick = function(s, e) {
			app.showLibraries();
		};
		document.getElementById("help-button").onclick= function(e) {
			tutorial.start();
		};

		// Launch main screen
		app = new VideoViewer.App({activity: activity, filter: filterpalette});
		app.renderInto(document.getElementById("viewer"));
		var search = new Sugar.SearchField();
		search.renderInto(document.getElementById("search"));

		// Load context
		Util.loadContext(function() {
			app.draw();
		});
	});

});
