
define(["webL10n","sugar-web/env"], function (webL10n,env) {

	var settings = {};

	settings.l10n = webL10n;

	settings.load = function(callback) {
		// Load settings
		env.getEnvironment(function(err, environment) {
			var defaultLanguage = (typeof chrome != 'undefined' && chrome.app && chrome.app.runtime) ? chrome.i18n.getUILanguage() : navigator.language;
			var language = environment.user ? environment.user.language : defaultLanguage;
			settings.language = language;
			settings.l10n.language.code = language;
			callback();
		});

		// Stop sound at end of game to sanitize media environment, specifically on Android
		document.getElementById("stop-button").addEventListener('click', function (event) {
			sound.pause();
		});
	}

	// Get/Set state
	settings.getState = function() {
		var states = [];
		for(var i = 0 ; i < this.levels.length ; i++) {
			states.push(this.levels[i].completed);
		}
		return states;
	}
	settings.setState = function(states) {
		if (states == null || states.length != this.levels.length)
			return false;
		for (var i = 0 ; i < this.levels.length ; i++) {
			this.levels[i].completed = states[i];
		}
		return true;
	}


	// Game map
	settings.gameMap = function(map) {
		var width = constant.boardWidth, height = constant.boardHeight;
		if (map == "grass") {
			return	"---HOH-----H---" +		// - = Grass
					"----H----------" +		// H = Trees
					"---------------" +		// ^ = Mountain
					"---------------" +		// O = Lake
					"---------------" +
					"-----------H---" +
					"-----H---------" +
					"---------------" +
					"---------H-H---";
		 } else if (map == "trees") {
			return	"------H--HHHH^-" +
					"----H--H----HH-" +
					"------H---H----" +
					"---------------" +
					"---------------" +
					"---H-----------" +
					"-------HH------" +
					"-----H--H---H--" +
					"---HHH---HH--H-";
		} else if (map == "mountain") {
			return	"---HHH^^^HHH---" +
					"----HHH^^HH--H-" +
					"------H-HH-----" +
					"---H-----------" +
					"-------O-------" +
					"-----------H---" +
					"-----H-H-------" +
					"-----HHH^H-H---" +
					"----HHH^^^HHH--";
		}
		return new Array(width*height).join('-');
	}


	// Functions to generate tags
	settings.typeNumber = function() {
		var number = Math.floor(Math.random()*11);
		return { tag: ""+number, result: number };
	}

	settings.generateFunctionAddFromTo = function(start, end) {
		var difference = end-start+1;
		return function() {
			var number1 = start+Math.floor(Math.random()*difference);
			var number2 = start+Math.floor(Math.random()*difference);
			return { tag: ""+number1+"+"+number2, result: number1+number2 }
		}
	}

	settings.missingNumbers = function() {
		var number1 = Math.floor(Math.random()*11);
		var number2 = Math.floor(Math.random()*11);
		return { tag: ""+number1+"+?="+(number1+number2), result: number2 };
	}

	settings.generateFunctionSubstractFromTo = function(start, end, negative) {
		var difference = end-start+1;
		return function() {
			var number1 = start+Math.floor(Math.random()*difference);
			var number2 = start+Math.floor(Math.random()*difference);
			if (!negative && Math.abs(number2) > Math.abs(number1)) {
				var tmp = number1;
				number1 = number2;
				number2 = tmp;
			}
			return { tag: ""+number1+"-"+number2, result: number1-number2 }
		}
	}

	settings.additionSubtraction = function() {
		var number1 = Math.floor(Math.random()*21);
		var number2 = Math.floor(Math.random()*11);
		var sign = Math.floor(Math.random()*2);
		if (sign == 0)
			return { tag: ""+number1+"+"+number2, result: number1+number2 };
		else {
			if (Math.abs(number2) > Math.abs(number1)) {
				var tmp = number1;
				number1 = number2;
				number2 = tmp;
			}
			return { tag: ""+number1+"-"+number2, result: number1-number2 }
		}
	}


	// Play levels
	settings.levels = [
		{
			id: "Type",							// Id of level
			name: "Type",						// Name of level
			map: "mountain",					// Name of map, see in util.js
			defense: [4, 0, 4, 0, 0],			// Defense composition: #HQ, #Soldier, #Tank, #Canon, #Helo
			attack: 22,							// #Attacking units
			stats: [10, 10, 0, 9, 10],			// Attack stats composition a random number between 0-9 compared to array number for: HQ, Soldier, Tank, Canon, Helo
			generator: settings.typeNumber,		// Function to generate the value
			completed: false					// Use at runtime to see if completed
		},
		{
			id: "ADD3",
			name: "ADD3",
			map: "trees",
			defense: [4, 2, 2, 0, 0],
			attack: 20,
			stats: [10, 0, 8, 10, 10],
			generator: settings.generateFunctionAddFromTo(1, 3),
			completed: false
		},
		{
			id: "ADD5",
			name: "ADD5",
			map: "grass",
			defense: [4, 3, 1, 0, 0],
			attack: 30,
			stats: [10, 0, 8, 10, 9],
			generator: settings.generateFunctionAddFromTo(0, 5),
			completed: false
		},
		{
			id: "SUM10",
			name: "SUM10",
			map: "mountain",
			defense: [4, 0, 4, 0, 0],
			attack: 30,
			stats: [10, 10, 0, 8, 9],
			generator: settings.generateFunctionAddFromTo(0, 10),
			completed: false
		},
		{
			id: "SUM15",
			name: "SUM15",
			map: "trees",
			defense: [4, 2, 2, 0, 0],
			attack: 30,
			stats: [10, 0, 7, 10, 10],
			generator: settings.generateFunctionAddFromTo(0, 15),
			completed: false
		},
		{
			id: "SUM20",
			name: "SUM20",
			map: "grass",
			defense: [4, 3, 1, 0, 0],
			attack: 40,
			stats: [10, 0, 7, 10, 9],
			generator: settings.generateFunctionAddFromTo(0, 20),
			completed: false
		},
		{
			id: "TDN",
			name: "TDN",
			map: "mountain",
			defense: [4, 4, 4, 0, 0],
			attack: 40,
			stats: [10, 0, 1, 8, 9],
			generator: settings.generateFunctionAddFromTo(10, 20),
			completed: false
		},
		{
			id: "Missing",
			name: "Missing",
			map: "trees",
			defense: [4, 2, 2, 0, 0],
			attack: 40,
			stats: [10, 0, 7, 10, 10],
			generator: settings.missingNumbers,
			completed: false
		},
		{
			id: "S010",
			name: "S010",
			map: "grass",
			defense: [4, 0, 4, 0, 0],
			attack: 40,
			stats: [10, 10, 0, 9, 10],
			generator: settings.generateFunctionSubstractFromTo(0, 10, false),
			completed: false
		},
		{
			id: "S020",
			name: "S020",
			map: "trees",
			defense: [4, 2, 2, 0, 0],
			attack: 20,
			stats: [10, 0, 8, 10, 10],
			generator: settings.generateFunctionSubstractFromTo(0, 20, false),
			completed: false
		},
		{
			id: "STW",
			name: "STW",
			map: "mountain",
			defense: [4, 4, 4, 0, 0],
			attack: 30,
			stats: [10, 0, 1, 8, 9],
			generator: settings.generateFunctionSubstractFromTo(10, 30, false),
			completed: false
		},
		{
			id: "AAS",
			name: "AAS",
			map: "trees",
			defense: [4, 2, 2, 0, 0],
			attack: 40,
			stats: [10, 0, 7, 10, 10],
			generator: settings.additionSubtraction,
			completed: false
		}
	];

	return settings;
});
