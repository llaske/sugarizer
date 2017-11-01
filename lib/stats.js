// Interface to stats
define(["settings"], function(preferences) {
	var stats = {};
	var source = 'Sugarizer';
	var logging = true;

	// Send log to the API
	function sendLog(object, action, label, value) {
		// Compute stats
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
		var stats = [];
		stats.push(stat);

		// Post stats
		myserver.postStats(stats, function() {
		}, function(response, error) {
			if (response.code != 20) {
				console.log("Error sending log");
			}
		});
	}

	// Trace an action
	stats.trace = function(object, action, label, value) {
		// No logging privacy
		if (!logging) {
			return;
		}

		// Not connected
		if (!preferences.isConnected()) {
			return;
		}

		// Statistics not active on server
		var info = preferences.getServer();
		if (!info || !info.options || !info.options.statistics) {
			return;
		}

		// Send stats to server
console.log(source+": "+action+"("+object+", "+label+", "+value+")");
		sendLog(object, action, label, value);
	}

	return stats;
});
