// Interface to history
define(["sugar-web/datastore"], function(datastore) {
	var historic = {};

	var content = datastore.localStorage.getValue('sugar_history');

	// Return history content
	historic.get = function() {
		return content;
	}

	// Add an user in history
	historic.addUser = function(user) {
		//var user = { name: this.name, color: this.color, server: this.server };
		var history = !content ? [] : content;
		for (var i = 0 ; i < history.length ; i++) {
			if (user.name.toLowerCase() == history[i].name.toLowerCase() &&
					((user.server == null && history[i].server == null) ||
					(user.server && user.server.url && history[i].server && history[i].server.url && user.server.url == history[i].server.url))
				) {
				history[i] = history[history.length-1];
				history[history.length-1] = user;
				datastore.localStorage.setValue('sugar_history', history);
				content = history;
				return;
			}
		}
		history.push(user);
		if (history.length > constant.maxUserHistory) {
			var newHistory = [];
			for (var i = 0 ; i < history.length-1 ; i++) {
				newHistory.push(history[i+1]);
			}
			history = newHistory;
		}
		datastore.localStorage.setValue('sugar_history', history);
		content = history;
	}

	// Remove an user from history
	historic.removeUser = function(user) {
		var history = !content ? [] : content;
		var newHistory = [];
		var found = false;
		for (var i = 0 ; i < history.length ; i++) {
			if (user.name.toLowerCase() == history[i].name.toLowerCase() &&
					((user.server == null && history[i].server == null) ||
					(user.server && user.server.url && history[i].server && history[i].server.url && user.server.url == history[i].server.url))
				) {
				found = true;
			} else {
				newHistory.push(history[i])
			}
		}
		if (found) {
			content = newHistory;
			datastore.localStorage.setValue('sugar_history', content);
		}
		return found;
	}

	// Remove all history
	historic.clean = function() {
		datastore.localStorage.removeValue('sugar_history');
	}

	return historic;
});
