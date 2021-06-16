// Interface to stats
define(["settings","sugar-web/datastore"], function(preferences, datastore) {
	var stats = {};
	var source = 'Sugarizer';

	// Compute stat
	function computeStat(object, action, label, value) {
		var stat = {};
		stat.user_id = preferences.getNetworkId();
		stat.user_agent = navigator.userAgent;
		stat.timestamp = new Date().getTime();
		stat.client_type = util.getClientName();
		stat.event_source = source;
		stat.event_object = object;
		stat.event_action = action;
		stat.event_label = label;
		stat.event_value = value;
		return stat;
	}

	// Send log to the API
	function sendStats(statslist, ok, notOk) {
		myserver.postStats(statslist, function() {
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
		if (!preferences.getOptions("stats")) {
			return false;
		}

		// Not connected
		if (!preferences.isConnected()) {
			return false;
		}

		// Statistics not active on server
		var info = preferences.getServer();
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
		var statslist = datastore.localStorage.getValue('sugar_stats');
		if (!statslist) {
			statslist = [];
		}
		statslist.push(stat);

		// Send stats to server when package size reached
		datastore.localStorage.setValue('sugar_stats', statslist);
		if (statslist.length >= constant.statPackageSize) {
			console.log(source+": "+"Send stat to server");
			sendStats(statslist, function() {
				datastore.localStorage.setValue('sugar_stats', []);
			}, function() {
				// Ensure local array don't grow for ever
				if (statslist.length > constant.statMaxLocalSize) {
					statslist.shift();
					datastore.localStorage.setValue('sugar_stats', statslist);
				}
			});
		}
	}

	// Clean all stats
	stats.clean = function() {
		datastore.localStorage.removeValue('sugar_stats');
	}

	return stats;
});
