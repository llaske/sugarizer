// Interface to server
define(["settings"], function(preferences) {

	var server = {};

	// Set header util
	var setHeader = function(request, token) {
		request.setHeaders({ 'x-key' : token.x_key, 'x-access-token' : token.access_token });
	}

	// Get error code util
	var getErrorCode = function(response) {
		if (!response || !response.xhrResponse || !response.xhrResponse.body) {
			return 404;
		}
		try {
			var body = JSON.parse(response.xhrResponse.body);
			return body.code;
		} catch(e) {
			return 500;
		}
	}

	// Session expired
	var sessionExpired = function() {
		if (util.getClientType() == constant.webAppType) {
			// For web app, force deconnection
			util.cleanDatastore(null, function() {
				util.restartApp();
			});
			return true;
		} else {
			// For app, display a message and mark token expired
			window.setTimeout(function() {
				humane.log(l10n.get("SessionExpired"));
				if (app.toolbar && app.toolbar.showServerWarning) {
					app.toolbar.showServerWarning(true);
				}
			}, 500);
			var token = preferences.getToken();
			token.expired = true;
			preferences.setToken(token);
			return false;
		}
	}

	// Retrieve current server name
	server.getServer = function() {
		var info = preferences.getServer();
		if (info != null && info.url) {
			return info.url;
		}
		return (util.getClientType() == constant.webAppType) ? util.getCurrentServerUrl() : constant.http + "localhost";
	}

	// Retrieve current server URL
	server.getServerUrl = function() {
		var serverUrl = server.getServer();
		if (serverUrl.length && serverUrl[serverUrl.length-1] == '/') {
			serverUrl = serverUrl.substr(0, serverUrl.length-1);
		}
		return serverUrl;
	}

	// Get URL to retrieve activities from server
	server.getActivitiesUrl = function() {
		var params = preferences.getToken();
		if (!params) {
			sessionExpired();
			return "";
		}
		return server.getServerUrl() + constant.dynamicInitActivitiesURL + "?x_key="+params.x_key+"&access_token="+params.access_token;
	}

	// Get server information
	server.getServerInformation = function(serverurl, response, error) {
		var serverUrl = serverurl;
		if (serverUrl.length && serverUrl[serverurl.length-1] == '/') {
			serverUrl = serverUrl.substr(0, serverUrl.length-1);
		}
		var ajax = new enyo.Ajax({
			url: serverUrl + constant.serverInformationURL,
			method: "GET",
			handleAs: "json"
		});
		ajax.response(function(inSender, inResponse) {
			if (response) response(inSender, inResponse);
		});
		ajax.error(function(inResponse) {
			if (error) error(inResponse, getErrorCode(inResponse));
		});
		ajax.go();
	}

	// Get activities
	server.getActivities = function(response, error) {
		var ajax = new enyo.Ajax({
			url: server.getServerUrl() + constant.dynamicInitActivitiesURL,
			method: "GET",
			handleAs: "json"
		});
		setHeader(ajax, preferences.getToken());
		ajax.response(function(inSender, inResponse) {
			var newResponse = {data: inResponse};
			if (response) response(inSender, newResponse);
		});
		ajax.error(function(inResponse) {
			var code = getErrorCode(inResponse);
			if (code == 3) {
				if (sessionExpired()) {
					return;
				}
			}
			if (error) error(inResponse, code);
		});
		ajax.go();
	}

	// Get user information
	server.getUser = function(userId, response, error, optserver) {
		var ajax = new enyo.Ajax({
			url: (optserver ? optserver : server.getServerUrl()) + constant.initNetworkURL + userId,
			method: "GET",
			handleAs: "json"
		});
		setHeader(ajax, preferences.getToken());
		ajax.response(response);
		ajax.error(function(inResponse) {
			var code = getErrorCode(inResponse);
			if (code == 3) {
				if (sessionExpired()) {
					return;
				}
			}
			if (error) error(inResponse, code);
		});
		ajax.go();
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
		ajax.error(function(inResponse) {
			var code = getErrorCode(inResponse);
			if (code == 3) {
				if (sessionExpired()) {
					return;
				}
			}
			if (error) error(inResponse, code);
		});
		ajax.go();
	}

	// Create a new user
	server.loginUser = function(user, response, error) {
		var userValue = user;
		userValue.role = ["student","teacher"];
		var ajax = new enyo.Ajax({
			url: server.getServerUrl() + constant.loginURL,
			method: "POST",
			handleAs: "json",
			postBody: {
				user: JSON.stringify(userValue),
			}
		});
		ajax.response(response);
		ajax.error(function(inResponse) {
			var code = getErrorCode(inResponse);
			if (code == 3) {
				if (sessionExpired()) {
					return;
				}
			}
			if (error) error(inResponse, code);
		});
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
		ajax.error(function(inResponse) {
			var code = getErrorCode(inResponse);
			if (code == 3) {
				if (sessionExpired()) {
					return;
				}
			}
			if (error) error(inResponse, code);
		});
		ajax.go();
	}

	// Get journal content optionally filter by typeactivity, time, favorite, ...
	server.getJournal = function(journalId, request, response, error) {
		var typeactivity = request.typeactivity;
		var stime = request.stime;
		var favorite = request.favorite;
		var field = request.field;
		var limit = request.limit;
		var offset = request.offset;
		var title = request.title;
		var sort = request.sort;
		var url = server.getServerUrl() + constant.sendCloudURL + journalId + "?limit="+limit;
		var params = {};
		if (typeactivity !== undefined) {
			params.aid = typeactivity;
		}
		if (stime !== undefined) {
			params.stime = stime;
		}
		if (favorite !== undefined) {
			params.favorite = favorite;
		}
		if (offset !== undefined) {
			params.offset = offset;
		}
		if (title !== undefined) {
			params.title = title;
		}
		if (sort !== undefined) {
			params.sort = sort;
		} else {
			params.sort = "-timestamp";
		}
		var ajax = new enyo.Ajax({
			url: url,
			method: "GET",
			handleAs: "json"
		});
		setHeader(ajax, preferences.getToken());
		ajax.response(response);
		ajax.error(function(inResponse) {
			var code = getErrorCode(inResponse);
			if (code == 3) {
				if (sessionExpired()) {
					return;
				}
			}
			if (error) error(inResponse, code);
		});
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
		params.fields="text,metadata";
		setHeader(ajax, preferences.getToken());
		ajax.response(response);
		ajax.error(function(inResponse) {
			var code = getErrorCode(inResponse);
			if (code == 3) {
				if (sessionExpired()) {
					return;
				}
			}
			if (error) error(inResponse, code);
		});
		ajax.go(params);
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
		ajax.error(function(inResponse) {
			var code = getErrorCode(inResponse);
			if (code == 3) {
				if (sessionExpired()) {
					return;
				}
			}
			if (error) error(inResponse, code);
		});
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
		ajax.error(function(inResponse) {
			var code = getErrorCode(inResponse);
			if (code == 3) {
				if (sessionExpired()) {
					return;
				}
			}
			if (error) error(inResponse, code);
		});
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
		ajax.error(function(inResponse) {
			var code = getErrorCode(inResponse);
			if (code == 3) {
				if (sessionExpired()) {
					return;
				}
			}
			if (error) error(inResponse, code);
		});
		params.oid = objectId;
		params.type = 'partial';
		ajax.go(params);
	}

	// Create a new user
	server.postStats = function(stats, response, error) {
		var ajax = new enyo.Ajax({
			url: server.getServerUrl() + constant.statsURL,
			method: "POST",
			handleAs: "json",
			postBody: {
				stats: JSON.stringify(stats)
			}
		});
		setHeader(ajax, preferences.getToken());
		ajax.response(function(inSender, inResponse) {
			if (response) response(inSender, inResponse);
		});
		ajax.error(function(inResponse) {
			var code = getErrorCode(inResponse);
			if (error) error(inResponse, code);
		});
		ajax.go();
	}

	return server;
});
