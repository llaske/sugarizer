// Utility functions


// Namespace
Util = {};


// Activity context handling
var app;
Util.context = {
	filter: {category: "", text: "", favorite: false},
	libraries: constant.libraries,
	library: null,
	favorites: {},
	readtimes: {},
	currentindex: 0
};
Util.saveContext = function() {
	if (Util.onSugar() || !app || !app.activity) return;
	var datastoreObject = app.activity.getDatastoreObject();
	var jsonData = JSON.stringify(Util.context);
	datastoreObject.setDataAsText(jsonData);
	//console.log("SAVE CONTEXT <"+jsonData+">");
	datastoreObject.save(function() {});
};
Util.loadContext = function(callback, loaded) {
	if (!Util.onSugar()) {
		var datastoreObject = app.activity.getDatastoreObject();
		app.showLibraries();
		datastoreObject.loadAsText(function (error, metadata, data) {
			//console.log("LOAD CONTEXT <"+data+">");
			var context = JSON.parse(data);
			if (context) {
				Util.context = context;
				app.loadDatabase();
				app.hideLibraries();
			}
			callback();
		});
	} else {
		Util.context = loaded;
		app.loadDatabase();
		app.hideLibraries();
	}
};

// Context update
Util.setFilter = function(newfilter) {
	if (newfilter.favorite !== undefined) Util.context.filter.favorite = newfilter.favorite;
	if (newfilter.category !== undefined) Util.context.filter.category = newfilter.category;
	if (newfilter.text !== undefined) Util.context.filter.text = newfilter.text;
	app.filterChanged();
}
Util.getFilter = function() {
	return Util.context.filter;
}

Util.getCollection = function() {
	var database = Util.database;
	var filter = [];
	for (var i = 0 ; i < database.length ; i++) {
		if (Util.context.filter.favorite && !Util.getFavorite(database[i].id))
			continue;
		if (Util.context.filter.category.length > 0 && database[i].category != Util.context.filter.category )
			continue;
		if (Util.context.filter.text.length > 0 && database[i].title.toLowerCase().indexOf(Util.context.filter.text.toLowerCase()) == -1)
			continue;
		filter.push(database[i]);
	}
	return filter;
}

Util.setFavorite = function(id, value) {
	if (value)
		Util.context.favorites[id] = value;
	else
		Util.context.favorites[id] = undefined;
}
Util.getFavorite = function(id) {
	return Util.context.favorites[id];
}

Util.setReadTime = function(id, time) {
	if (time)
		Util.context.readtimes[id] = time;
	else
		Util.context.readtimes[id] = undefined;
}
Util.getReadTime = function(id) {
	return Util.context.readtimes[id];
}

Util.database = [];
Util.categories = [];
Util.loadDatabase = function(response, error) {
	if (Util.context.library == null)
		return;
	Util.getLanguage(function(language) {
		var ajax = new enyo.Ajax({
			url: Util.context.library.database.replace(new RegExp("%language%", "g"),language),
			method: "GET",
			handleAs: "json"
		});
		ajax.response(function(sender, data) {
			// Store date base loaded
			Util.database = data;

			// Store categories
			Util.categories = [];
			for (var i = 0 ; i < data.length ; i++) {
				var category = data[i].category;
				if (category !== undefined) {
					var found = false;
					for (var j = 0 ; !found && j < Util.categories.length ; j++) {
						if (category == Util.categories[j].id) found = true;
					}
					if (!found) Util.categories.push({id: category, title: category});
				}
			}
			app.getFilter().setCategories(Util.categories);
			response(data);
		});
		ajax.error(error);
		ajax.go();
	});
}
Util.getDatabase = function() {
	return Util.database;
}

Util.getVideos = function() {
	return Util.context.library.videos;
}
Util.getImages = function() {
	return Util.context.library.images;
}

Util.setIndex = function(index) {
	Util.context.currentindex = index;
}
Util.getIndex = function() {
	return Util.context.currentindex;
}

Util.setLibrary = function(library) {
	Util.context.library = library;
}
Util.getLibrary = function() {
	return Util.context.library;
}
Util.addLibrary = function(library) {
	Util.context.libraries.push(library);
}
Util.removeLibrary = function(library) {
	if (Util.context.library == library || Util.context.libraries.length == 1)
		return;
	var newlibraries = [];
	for (var i = 0 ; i < Util.context.libraries.length ; i++) {
		if (Util.context.libraries[i] != library)
			newlibraries.push(Util.context.libraries[i]);
	}
	Util.context.libraries = newlibraries;
}

// Misc
Util.onSugar = function() {
	var getUrlParameter = function(name) {
		var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
		return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
    };
	return getUrlParameter("onsugar");
}

Util.getLanguage = function(callback) {
	if (Util.onSugar()) {
		callback(navigator.language);
		return;
	}
	if (typeof chrome != 'undefined' && chrome.app && chrome.app.runtime) {
		chrome.storage.local.get('sugar_settings', function(values) {
			callback(JSON.parse(values.sugar_settings).language);
		}); 
	} else {
		callback(JSON.parse(localStorage.sugar_settings).language);
	}
}
