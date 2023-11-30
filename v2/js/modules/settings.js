
// Interface to settings
define([], function() {

	var settings = {};

	// Load user settings
	settings.getUser = function() {
		var sugar = localStorage.getItem("sugar_settings");
		if (sugar !== null && sugar !== undefined && sugar !== "{}") {
			return JSON.parse(sugar);
		}
		return null;
	}

	// Save user settings
	settings.setUser = function(data) {
		var sugar = localStorage.getItem("sugar_settings");
		if (sugar !== null && sugar !== undefined && sugar !== "{}") {
			settings = JSON.parse(sugar);
			for (var key in data) {
				settings[key] = data[key];
			}
			localStorage.setItem('sugar_settings', JSON.stringify(settings));
		} else {
			localStorage.setItem('sugar_settings', JSON.stringify(data));
		}
	}

	// Remove user settings
	settings.removeUser = function() {
		localStorage.removeItem("sugar_settings");
	}

	// Load history
	settings.getHistory = function() {
		var history = localStorage.getItem("sugar_history");
		if (history !== null && history !== undefined && history !== "{}") {
			return JSON.parse(history);
		}
		return [];
	}
	
	return settings;
});