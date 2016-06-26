define(function (require) {
    var activity = require("sugar-web/activity/activity");
	var env = require("sugar-web/env");
	var filterpalette = require("filterpalette");
	var isFavorite = false;

    // Manipulate the DOM only when it is ready.
    require(['domReady!'], function (doc) {
        // Initialize the activity.
        activity.setup();

		// Create palette
        var filterButton = document.getElementById("filter-button");
		filterpalette = new filterpalette.FilterPalette(filterButton, undefined);
		filterpalette.addEventListener('filter', function() {
			app.setFilter({category: filterpalette.getFilter()});
			Util.saveContext();
			filterpalette.popDown();
		});
		document.getElementById("favorite-button").onclick = function(s, e) {
			var invoker = s.toElement;
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
