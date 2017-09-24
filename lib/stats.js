// Interface to stats
define(["settings"], function(preferences) {
	var stats = {};
	var source = 'Sugarizer';
	var logging = true;

	// Send log to the API
	function sendLog(object, action, label, value) {
		// Compute URL
		var url = preferences.getServer();
		if (url == null) {
			url = (util.getClientType() == constant.webAppType) ? util.getCurrentServerUrl() : "localhost";
		}
		url += constant.statsURL;
		url = constant.http + url;

		// Compute request
		var req = new XMLHttpRequest();
		req.open('POST', url, true);
		var token = preferences.getToken();
		req.setRequestHeader('Content-Type', 'application/json');
		req.setRequestHeader('x-key', token.x_key);
		req.setRequestHeader('x-access-token', token.access_token);
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
		var body = {};
		var content = [];
		content.push(stat);
		body.stats = JSON.stringify(content);

		// Send request
console.log(source+": "+action+"("+object+", "+label+", "+value+")");
		req.onreadystatechange = function() {
			if (this.readyState === 4) {
				if (this.status === 200) {
				} else {
					if (!this.response || this.response.indexOf("inactive") == -1) {
						console.log("Error sending log");
					}
				}
			}
		};
		req.send(JSON.stringify(body));
	}

	// Trace an action
	stats.trace = function(object, action, label, value) {
		if (logging) {
			sendLog(object, action, label, value);
		}
	}

	return stats;
});
