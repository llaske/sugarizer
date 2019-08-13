// Database handling for the Abecedarium game


// Load all database files
Abcd.loadDatabase = function(callback) {
	var jsonFiles = [
		"database/db_url.json",
		"database/db_meta.json",
		"database/db_themes.json",
		"database/db_collections.json",
		"database/db_en.json",
		"database/db_en_letters.json",
		"database/db_fr.json",
		"database/db_fr_letters.json",
		"database/db_es.json",
		"database/db_es_letters.json"
	];
	var count = 0;
	var error = false;
	var initDatabase = function(url, value) {
		var index = -1;
		for (var j = 0 ; j < jsonFiles.length ; j++) {
			if (jsonFiles[j] == url) {
				index = j;
				break;
			}
		}
		if (index == 0) {
			Abcd.context.database = value;
		} else if (index == 1) {
			Abcd.entries = value;
		} else if (index == 2) {
			Abcd.themes = value;
		} else if (index == 3) {
			Abcd.collections = value;
		} else if (index == 4) {
			Abcd.enTexts = value;
		} else if (index == 5) {
			Abcd.enLetters = value;
		} else if (index == 6) {
			Abcd.frTexts = value;
			Abcd.texts = Abcd.frTexts;
		} else if (index == 7) {
			Abcd.frLetters = value;
			Abcd.letters = Abcd.frLetters;
		} else if (index == 8) {
			Abcd.esTexts = value;
		} else if (index == 9) {
			Abcd.esLetters = value;
		}
 	}
	for (var i = 0 ; i < jsonFiles.length ; i++) {
		var ajax = new enyo.Ajax({method: "GET",handleAs: "json"});
		ajax.url = jsonFiles[i];
		ajax.response(function(inSender, inResponse) {
			initDatabase(inSender.url, inResponse);
			if (++count == jsonFiles.length) {
				if (error) { Abcd.context.database = null; }
				callback(error);
			}
		});
		ajax.error(function(inResponse) {
			console.log("Error loading database");
			error = true;
			if (++count == jsonFiles.length) {
				if (error) { Abcd.context.database = null; }
				callback(error);
			}
		});
		ajax.go();
	}
}
