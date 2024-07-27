
// Interface to settings
define(["sugar-web/datastore"], function(datastore) {

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

	// Clean localStorage: datastore and settings
	settings.reinitialize = function(full) {
		return new Promise((resolve) => {
			const results = datastore.find();
			datastore.localStorage.removeValue('sugar_settings');
			if (full) {
				sugarizer.modules.history.clean();
				sugarizer.modules.stats.clean();
			}

			let i = 0;
			const removeOneEntry = function(err) {
				if (++i < results.length) {
					datastore.remove(results[i].objectId, removeOneEntry);
				} else {
					resolve();
				}
			};

			if (results.length) {
				datastore.remove(results[i].objectId, removeOneEntry);
			} else {
				resolve();
			}
		});
	}
	
	return settings;
});
