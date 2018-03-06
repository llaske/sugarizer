// Utility functions


// Namespace
Abcd = {};


// Game context handling
var app;
Abcd.context = {
	database: "",
	home: null,
	object: null,
	screen: "",
	lang: "es",
	casevalue: 0,
	screenContext: null
};
Abcd.saveContext = function() {
	var values = [];
	values.push(Abcd.context.object!=null?Abcd.context.object.kindName:"");
	values.push(Abcd.context.lang);
	values.push(Abcd.context.casevalue);
	values.push(Abcd.context.object!=null?Abcd.context.object.saveContext():"");
	var datastoreObject = Abcd.activity.getDatastoreObject();
	var jsonData = JSON.stringify({context:values.join("#"), database:Abcd.context.getDatabase()});
	datastoreObject.setDataAsText(jsonData);
	datastoreObject.save(function() {});
};
Abcd.loadContext = function(callback) {
	var datastoreObject = Abcd.activity.getDatastoreObject();
	datastoreObject.loadAsText(function (error, metadata, data) {
		var context = JSON.parse(data);
		if (context) {
			var values = context.context.split('#');
			Abcd.context.screen = values[0];
			Abcd.context.lang = values[1];
			Abcd.context.casevalue = values[2];
			Abcd.context.screenContext = values[3];
			Abcd.setLocale(Abcd.context.lang);
			callback();
		}
	});
};


// Init Sugar interface
Abcd.setLocale = function(lang) {
	var texts = Abcd.getTextsFromLocal(lang);
    __$FC_l10n_set(texts);
	Abcd.letters = Abcd[lang+"Letters"];
	if (Abcd.context.object != null)
		Abcd.context.object.setLocale();
}

Abcd.getTextsFromLocal = function(lang) {
    switch (lang) {
    case "fr":
        return Abcd.frTexts;
    case "es":
        return Abcd.esTexts;
    default:
        return Abcd.enTexts;
    }
}

Abcd.getLettersFromLocal = function(lang) {
    switch (lang) {
    case "fr":
        return Abcd.frLetters;
    case "es":
        return Abcd.esLetters;
    default:
        return Abcd.enLetters;
    }
}

Abcd.setCase = function(casevalue) {
	Abcd.context.casevalue = casevalue;
	if (Abcd.context.object != null)
		Abcd.context.object.setCase();
}
Abcd.log = function(msg) {
	console.log(msg);
};


// Home handling
Abcd.goHome = function() {
	if (Abcd.context.home != null) {
		if (Abcd.context.object == null)
			return;
		Abcd.context.screen = "";
		Abcd.context.home.renderInto(document.getElementById("body"));
		Abcd.context.home.playTheme();
	}
};


//--- Utilities

// Change visibility of a set of controls
Abcd.changeVisibility = function(object, items) {
	for(var item in items) {
		if (items[item])
			object.$[item].show();
		else
			object.$[item].hide();
	}
}

// Randomly get an entry in the current language
Abcd.randomEntryIndex = function(excludes, filter) {
	// Get first level
	var value = null;
	if (filter != null && filter.kind == "Abcd.Collection") {
		// Get the collection
		var collection = Abcd.collections[filter.index];
		var length = collection.entries.length;
		value = [];
		for (var i = 0 ; i < length ; i++) {
			var entry = collection.entries[i];
			if (Abcd.entries[entry][Abcd.context.lang] == 1)
				value.push(entry);
		}
	} else {
		// Choose a letter
		var firstlen = 0;
		var firstindex = -1;
		for(var key in Abcd.letters) {
			if (filter != null && filter.letter == key) {
				firstindex = firstlen;
				break;
			}
			if (Abcd.letters.hasOwnProperty(key)) firstlen++;
		}
		if (firstindex == -1)
			firstindex = Math.floor(Math.random()*firstlen);

		// Choose an index
		var i = 0;
		for(var key in Abcd.letters) {
			if (i++ == firstindex) {
				value = Abcd.letters[key];
				break;
			}
		}
	}

	// Copy without excludes
	var array = [];
	for (var i = 0 ; i < value.length ; i++) {
		var found = false;
		if (excludes !== undefined) {
			for (var j = 0 ; !found && j < excludes.length ; j++) {
				if (value[i] == excludes[j])
					found = true;
			}
		}
		if (!found)
			array.push(value[i]);
	}

	// Select one randomely
	var secondlen = array.length;
	var secondindex = Math.floor(Math.random()*secondlen);
	return array[secondindex];
}

// Mix an array into a new one
Abcd.mix = function(chain) {
	// Check size
	if (chain.length < 2) {
		return chain;
	}

	// Mix cards
	var mixedchain = [];
	var tomix = enyo.cloneArray(chain);
	while (tomix.length != 1) {
		// Take a card
		var i = Math.floor(Math.random()*tomix.length);
		mixedchain.push(tomix[i]);
		tomix[i] = null;

		// Remix
		var newmix = [];
		for (var j = 0 ; j < tomix.length ; j++) {
			if (tomix[j] != null)
				newmix.push(tomix[j]);
		}
		tomix = newmix;
	}
	mixedchain.push(tomix[0]);

	return mixedchain;
};
