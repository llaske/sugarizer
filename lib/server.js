// Interface to server
define(["settings"], function(preferences) {

	var server = {};
	var defaultPassword = 'pass'; // HACK: Force until login screen

	// Set header util
	var setHeader = function(request, token) {
		request.setHeaders({ 'x-key' : token.x_key, 'x-access-token' : token.access_token });
	}

	// Retrieve current server name
	server.getServer = function() {
		/*var hserver = 'localhost:8484';
		var url = window.location.href.substr(document.location.protocol.length+2);
		console.log(url.substring(0, url.lastIndexOf('/')));
		return hserver;*/
		var url = preferences.getServer();
		if (url != null)
			return url;
		return (util.getClientType() == constant.webAppType) ? util.getCurrentServerUrl() : "localhost";
	}

	// Retrieve current server URL
	server.getServerUrl = function() {
		return constant.http + server.getServer();
	}

	// Get URL to retrieve activities from server
	server.getActivitiesUrl = function() {
		var params = preferences.getToken();
		return server.getServerUrl() + constant.dynamicInitActivitiesURL + "?x_key="+params.x_key+"&access_token="+params.access_token;
	}

	// Get user information
	server.getUser = function(userId, response, error, optserver) {
		// HACK: Force an autologin to get the token
		var user = {"name": preferences.getName(), "password": defaultPassword};
		server.loginUser(user, function(inSender, inResponse) {
			preferences.setToken({'x_key': userId, 'access_token': inResponse.token});
			var ajax = new enyo.Ajax({
				url: (optserver ? optserver : server.getServerUrl()) + constant.initNetworkURL + userId,
				method: "GET",
				handleAs: "json"
			});
			setHeader(ajax, preferences.getToken());
			ajax.response(response);
			ajax.error(error);
			ajax.go();
		}, error);
	}

	// Create a new user
	server.postUser = function(user, response, error) {
		var ajax = new enyo.Ajax({
			url: server.getServerUrl() + constant.signupURL,
			method: "POST",
			handleAs: "json",
			postBody: {
				user: JSON.stringify(user)
			}
		});
		ajax.response(function(inSender, inResponse) {
			var newuser = {"name": user.name, "password": user.password};
			server.loginUser(newuser, function(loginSender, loginResponse) {
				preferences.setToken({'x_key': inResponse._id, 'access_token': loginResponse.token});
			});
			if (response) response(inSender, inResponse);
		});
		ajax.error(error);
		ajax.go();
	}

	// Create a new user
	server.loginUser = function(user, response, error) {
		var ajax = new enyo.Ajax({
			url: server.getServerUrl() + constant.loginURL,
			method: "POST",
			handleAs: "json",
			postBody: {
				user: JSON.stringify(user)
			}
		});
		ajax.response(response);
		ajax.error(error);
		ajax.go();
	}

	// Update user
	server.putUser = function(userId, settings, response, error) {
		var ajax = new enyo.Ajax({
			url: server.getServerUrl() + constant.initNetworkURL + userId,
			method: "PUT",
			handleAs: "json",
			postBody: {
				user: JSON.stringify(settings)
			}
		});
		setHeader(ajax, preferences.getToken());
		ajax.response(response);
		ajax.error(error);
		ajax.go();
	}

	// Get journal content optionally filter by typeactivity
	server.getJournal = function(journalId, typeactivity, field, response, error) {
		var url = server.getServerUrl() + constant.sendCloudURL + journalId;
		var params = {};
		if (typeactivity !== undefined) {
			params.aid = typeactivity;
		}
		var ajax = new enyo.Ajax({
			url: url,
			method: "GET",
			handleAs: "json"
		});
		setHeader(ajax, preferences.getToken());
		ajax.response(response);
		ajax.error(error);
		ajax.go(params);
	}

	// Get an entry in a journal
	server.getJournalEntry = function(journalId, objectId, response, error) {
		var params = {};
		var ajax = new enyo.Ajax({
			url: server.getServerUrl() + constant.sendCloudURL + journalId,
			method: "GET",
			handleAs: "json"
		});
		params.oid = objectId;
		setHeader(ajax, preferences.getToken());
		ajax.response(response);
		ajax.error(error);
		ajax.go();
	}

	// Add an entry in a journal
	server.postJournalEntry = function(journalId, entry, response, error) {
		var token = preferences.getToken();
		entry.metadata.user_id = token.x_key;
		var ajax = new enyo.Ajax({
			url: server.getServerUrl() + constant.sendCloudURL + journalId,
			method: "POST",
			handleAs: "json",
			postBody: {
				journal: JSON.stringify(entry)
			}
		});
		setHeader(ajax, token);
		ajax.response(response);
		ajax.error(error);
		ajax.go();
	}

	// Update an entry in a journal
	server.putJournalEntry = function(journalId, objectId, entry, response, error) {
		var params = {};
		var token = preferences.getToken();
		entry.metadata.user_id = token.x_key;
		var ajax = new enyo.Ajax({
			url: server.getServerUrl() + constant.sendCloudURL + journalId,
			method: "PUT",
			handleAs: "json",
			postBody: {
				journal: JSON.stringify(entry)
			}
		});
		setHeader(ajax, token);
		ajax.response(response);
		ajax.error(error);
		params.oid = objectId;
		ajax.go(params);
	}

	// Delete an entry in a journal
	server.deleteJournalEntry = function(journalId, objectId, response, error) {
		var params = {};
		var ajax = new enyo.Ajax({
			url: server.getServerUrl() + constant.sendCloudURL + journalId,
			method: "DELETE",
			handleAs: "json"
		});
		setHeader(ajax, preferences.getToken());
		ajax.response(response);
		ajax.error(error);
		params.oid = objectId;
		params.type = 'partial';
		ajax.go(params);
	}

	return server;
});
