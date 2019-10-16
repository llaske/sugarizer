// Utility functions


// Namespace
Util = {};


// Activity context handling
var app;
Util.context = {
	filter: {category: "", text: "", favorite: false},
	libraries: null,
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
		requirejs(["sugar-web/env"], function (env) {
			env.getEnvironment(function(err, environment) {
				if (environment.objectId) {
					var datastoreObject = app.activity.getDatastoreObject();
					datastoreObject.loadAsText(function (error, metadata, data) {
						//console.log("LOAD CONTEXT <"+data+">");
						var context = JSON.parse(data);
						if (context) {
							Util.context = context;
							app.loadDatabase();
						} else {
							app.loadLibraries();
						}
						callback();
					});
				} else {
					app.loadLibraries();
				}
			});
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
Util.loadLibraries = function(response, error) {
	Util.getLanguage(function(language) {
		var ajax = new enyo.Ajax({
			url: constant.librariesUrl+"?lang="+language,
			method: "GET",
			handleAs: "json"
		});
		ajax.response(function(sender, data) {
			Util.context.libraries = data;
			response();
		});
		ajax.error(error);
		ajax.go();
	});
}
Util.loadDatabase = function(response, error) {
	if (Util.context.library == null)
		return;
	Util.getLanguage(function(language) {
		var url = Util.context.library.database.replace(new RegExp("%language%", "g"),language);
		if (document.location.protocol == "https:") {
			url = url.replace("http://", "https://");
		}
		var ajax = new enyo.Ajax({
			url: url,
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

// Encoding functions taken from
// https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding
function uint6ToB64 (nUint6) {
	return nUint6 < 26 ?
		nUint6 + 65 : nUint6 < 52 ?
		nUint6 + 71 : nUint6 < 62 ?
		nUint6 - 4 : nUint6 === 62 ?
		43 : nUint6 === 63 ?
		47 : 65;
}
Util.toBase64 = function(aBytes) {
	var eqLen = (3 - (aBytes.length % 3)) % 3, sB64Enc = "";
	for (var nMod3, nLen = aBytes.length, nUint24 = 0, nIdx = 0; nIdx < nLen; nIdx++) {
		nMod3 = nIdx % 3;
		nUint24 |= aBytes[nIdx] << (16 >>> nMod3 & 24);
		if (nMod3 === 2 || aBytes.length - nIdx === 1) {
			sB64Enc += String.fromCharCode(uint6ToB64(nUint24 >>> 18 & 63), uint6ToB64(nUint24 >>> 12 & 63), uint6ToB64(nUint24 >>> 6 & 63), uint6ToB64(nUint24 & 63));
			nUint24 = 0;
		}
	}
	return  eqLen === 0 ? sB64Enc : sB64Enc.substring(0, sB64Enc.length - eqLen) + (eqLen === 1 ? "=" : "==");
}
