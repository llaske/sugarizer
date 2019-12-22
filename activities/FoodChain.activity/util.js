// Utility functions


// Force Enyo to process ondragover event
document.ondragover = enyo.dispatch;


// Namespace
FoodChain = {};

// Game context handling
FoodChain.context = {
	score: 0,
	game: "",
	level: 0,
	language: "en",
	object: null
};
FoodChain.saveContext = function() {
	var datastoreObject = FoodChain.activity.getDatastoreObject();
	var jsonData = JSON.stringify({
		score: FoodChain.context.score,
		game: FoodChain.context.game,
		level: FoodChain.context.level,
		language: l10n.language.code
	});
	datastoreObject.setDataAsText(jsonData);
	datastoreObject.save(function() {
	});
};
FoodChain.loadContext = function(callback) {
	var datastoreObject = FoodChain.activity.getDatastoreObject();
	datastoreObject.loadAsText(function (error, metadata, data) {
		var context = JSON.parse(data);
		if (context == null) return;
		if (context.score) FoodChain.context.score = parseInt(context.score);
		if (context.game) FoodChain.context.game = context.game;
		if (context.level) FoodChain.context.level = parseInt(context.level);
		if (context.language) FoodChain.context.language = l10n.language.code = context.language;
		callback();
	});
};

// Home handling
FoodChain.goHome = function() {
	if (FoodChain.context.home != null) {
		FoodChain.context.game = "";
		FoodChain.context.home.setLocale()
		FoodChain.context.home.renderInto(document.getElementById("body"));
	}
};

// Sugar interface
FoodChain.setLocale = function() {
	document.getElementById("en-button").classList.remove('active');
	document.getElementById("fr-button").classList.remove('active');
	document.getElementById("pt_BR-button").classList.remove('active');
	if (l10n.language.code.indexOf("en") == 0) { document.getElementById("en-button").classList.add('active'); }
	else if (l10n.language.code.indexOf("fr") == 0) { document.getElementById("fr-button").classList.add('active'); }
	else if (l10n.language.code.indexOf("pt_BR") == 0) { document.getElementById("pt_BR-button").classList.add('active'); }
	if (FoodChain.context.object != null)
		FoodChain.context.object.setLocale();
};

FoodChain.log = function(msg) {
	console.log(msg);
};

// Add and remove a class to an element
FoodChain.addRemoveClass = function(element, toAdd, toRemove) {
	element.removeClass(toRemove);
	element.addClass(toAdd);
};

// "Old style" sleep function
FoodChain.sleep = function(delay) {
	var start = new Date().getTime();
	while (new Date().getTime() < start + delay);
};

// Create a object respecting a condition on a set of object
FoodChain.createWithCondition = function(create, condition, set) {
	var conditionValue;
	var newObject;
	var time = 0;
	do {
		conditionValue = true;
		newObject = create();
		for (var i = 0; conditionValue && i < set.length ; i++) {
			conditionValue = condition(newObject, set[i]);
		}
		time++;
	} while (!conditionValue && time < 12); // time to avoid infinite or too long loop in very complex situation
	if (!conditionValue)
		FoodChain.log("WARNING: out of pre-requisite creating "+newObject.id);
	return newObject;
};

// Test if two sound strings matchs ignoring audio directory
FoodChain.soundMatch = function(s1, s2) {
	var l1 = s1.length-1;
	while (l1 > 0 && s1[l1] != '/') l1--;
	var l2 = s2.length-1;
	while (l2 > 0 && s2[l2] != '/') l2--;
	return s1.substring(l1) == s2.substring(l2);
};

// Get zoom level
FoodChain.getZoomLevel = function() {
		var wsize = window.innerWidth;
		var zoom;
		if (wsize <= 480) {
			zoom = 0.4;
		} else if (wsize <= 640) {
			zoom = 0.5;
		} else if (wsize <= 854) {
			zoom = 0.62;
		} else if (wsize <= 960) {
			zoom = 0.72;
		} else if (wsize <= 1024) {
			zoom = 0.88;
		} else {
			zoom = 1;
		}
		return zoom;
};
