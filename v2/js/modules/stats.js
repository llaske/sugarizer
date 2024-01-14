// Interface to stats
define([], function() {
	var stats = {};
	var source = 'Sugarizer';
	var constant = {
		statPackageSize: 5,
		statMaxLocalSize: 20,
	};

	// Compute stat
	function computeStat(object, action, label, value) {
		var stat = {};
		stat.user_id = sugarizer.modules.server.getToken().x_key;
		stat.user_agent = navigator.userAgent;
		stat.timestamp = new Date().getTime();
		stat.client_type = sugarizer.getClientName();
		stat.version = sugarizer.getVersion();
		stat.event_source = source;
		stat.event_object = object;
		stat.event_action = action;
		stat.event_label = label;
		stat.event_value = value;
		return stat;
	}

	// Send log to the API
	function sendStats(statslist, ok, notOk) {
		sugarizer.modules.server.postStats(statslist, sugarizer.modules.user.getServerURL()).then(function() {
			if (ok) ok();
		}, function(response, error) {
			if (response.code != 20) {
				console.log("Error sending log");
			}
			if (notOk) notOk();
		});
	}

	// Test is stat is active
	stats.isActive = function() {
		// No logging privacy
		if (!sugarizer.modules.user.getOption("stats")) {
			return false;
		}

		// Not connected
		if (!sugarizer.modules.user.isConnected()) {
			return false;
		}

		// Statistics not active on server
		var info = sugarizer.modules.user.getServerInformation();
		if (!info || !info.options || !info.options.statistics) {
			return false;
		}

		return true;
	}

	// Trace an action
	stats.trace = function(object, action, label, value) {
		// Stat is active ?
		if (!stats.isActive()) {
			return;
		}

		// Compute stat
		console.log(source+": "+action+"("+object+", "+label+", "+value+")");
		var stat = computeStat(object, action, label, value);

		// Add stat to localStorage array
		var statslist = localStorage.getItem('sugar_stats');
		if (!statslist) {
			statslist = [];
		} else {
			statslist = JSON.parse(statslist);
		}
		statslist.push(stat);

		// Send stats to server when package size reached
		localStorage.setItem('sugar_stats', JSON.stringify(statslist));
		if (statslist.length >= constant.statPackageSize) {
			console.log(source+": "+"Send stat to server");
			sendStats(statslist, function() {
				localStorage.setItem('sugar_stats', JSON.stringify([]));
			}, function() {
				// Ensure local array don't grow for ever
				if (statslist.length > constant.statMaxLocalSize) {
					statslist.shift();
					localStorage.setItem('sugar_stats', JSON.stringify(statslist));
				}
			});
		}
	}

	// Clean all stats
	stats.clean = function(forceSave) {
		if (forceSave && stats.isActive()) {
			var statslist = localStorage.getItem('sugar_stats');
			if (statslist) {
				sendStats(JSON.parse(statslist));
			}
		}
		localStorage.removeItem('sugar_stats');
	}

	return stats;
});
