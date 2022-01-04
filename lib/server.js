// Interface to server
define(["settings"], function(preferences) {

	var server = {};

	// Set header util
	var computeHeader = function(token) {
		return { 'x-key' : token.x_key, 'x-access-token' : token.access_token };
	}

	// Get error code util
	var getErrorCode = function(error) {
		if (!error || !error.response || !error.response.data) {
			return 404;
		}
		try {
			return error.response.data.code;
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
				if (app && app.toolbar && app.toolbar.showServerWarning) {
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
		var ajax = axios.create({
			responseType: "json"
		});
		ajax.get(serverUrl + constant.serverInformationURL).then(function(inResponse) {
			if (response) response(null, inResponse.data);
		}).catch(function(inResponse) {
			if (error) error(inResponse, getErrorCode(inResponse));
		});
	}

	// Get activities
	server.getActivities = function(response, error) {
		var ajax = axios.create({
			responseType: "json",
			headers: computeHeader(preferences.getToken())
		});
		ajax.get(server.getServerUrl() + constant.dynamicInitActivitiesURL).then(function(inResponse) {
			var newResponse = {data: inResponse.data};
			if (response) response(null, newResponse);
		}).catch(function(inResponse) {
			var code = getErrorCode(inResponse);
			if (code == 3) {
				if (sessionExpired()) {
					return;
				}
			}
			if (error) error(inResponse, code);
		});
	}

	// Get user information
	server.getUser = function(userId, response, error, optserver) {
		var ajax = axios.create({
			responseType: "json",
			headers: computeHeader(preferences.getToken())
		});
		ajax.get((optserver ? optserver : server.getServerUrl()) + constant.initNetworkURL + userId).then(function(inResponse) {
			response(null, inResponse.data);
		}).catch(function(inResponse) {
			var code = getErrorCode(inResponse);
			if (code == 3) {
				if (sessionExpired()) {
					return;
				}
			}
			if (error) error(inResponse, code);
		});
	}

	// Create a new user
	server.postUser = function(user, response, error) {
		var ajax = axios.create({
			responseType: "json"
		});
		ajax.post(server.getServerUrl() + constant.signupURL, {user: JSON.stringify(user)}).then(function(inResponse) {
			if(!user.beforeSignup) {
				var newuser = {"name": user.name, "password": user.password};
				server.loginUser(newuser, function(loginSender, loginResponse) {
					preferences.setToken({'x_key': inResponse._id, 'access_token': loginResponse.token});
				});
			}
			if (response) response(null, inResponse.data);
		}).catch(function(inResponse) {
			var code = getErrorCode(inResponse);
			if (code == 3) {
				if (sessionExpired()) {
					return;
				}
			}
			if (error) error(inResponse, code);
		});
	}

	// Create a new user
	server.loginUser = function(user, response, error) {
		var userValue = user;
		userValue.role = ["student","teacher"];
		var ajax = axios.create({
			responseType: "json"
		});
		ajax.post(server.getServerUrl() + constant.loginURL, {user: JSON.stringify(userValue)}).then(function(inResponse) {
			response(null, inResponse.data);
		}).catch(function(inResponse) {
			var code = getErrorCode(inResponse);
			if (code == 3) {
				if (sessionExpired()) {
					return;
				}
			}
			if (error) error(inResponse, code);
		});
	}

	// Update user
	server.putUser = function(userId, settings, response, error) {
		var ajax = axios.create({
			responseType: "json",
			headers: computeHeader(preferences.getToken())
		});
		ajax.put(server.getServerUrl() + constant.initNetworkURL + userId, {user: JSON.stringify(settings)}).then(function(inResponse) {
			response(null, inResponse.data);
		}).catch(function(inResponse) {
			var code = getErrorCode(inResponse);
			if (code == 3) {
				if (sessionExpired()) {
					return;
				}
			}
			if (error) error(inResponse, code);
		});
	}

	// Delete user
	server.deleteUser = function(userId, response, error) {
		var ajax = axios.create({
			responseType: "json",
			headers: computeHeader(preferences.getToken())
		});
		ajax.delete(server.getServerUrl() + constant.initNetworkURL + userId).then(function(inResponse) {
			response(null, inResponse.data);
		}).catch(function(inResponse) {
			var code = getErrorCode(inResponse);
			if (code == 3) {
				if (sessionExpired()) {
					return;
				}
			}
			if (error) error(inResponse, code);
		});
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
		var ajax = axios.create({
			responseType: "json",
			headers: computeHeader(preferences.getToken()),
			params: params
		});
		ajax.get(url).then(function(inResponse) {
			response(null, inResponse.data);
		}).catch(function(inResponse) {
			var code = getErrorCode(inResponse);
			if (code == 3) {
				if (sessionExpired()) {
					return;
				}
			}
			if (error) error(inResponse, code);
		});
	}

	// Get an entry in a journal
	server.getJournalEntry = function(journalId, objectId, response, error) {
		var params = {};
		var ajax = axios.create({
			responseType: "json",
			headers: computeHeader(preferences.getToken()),
			params: {
				oid: objectId,
				fields: "text,metadata"
			}
		});
		ajax.get(server.getServerUrl() + constant.sendCloudURL + journalId).then(function(inResponse) {
			response(null, inResponse.data);
		}).catch(function(inResponse) {
			var code = getErrorCode(inResponse);
			if (code == 3) {
				if (sessionExpired()) {
					return;
				}
			}
			if (error) error(inResponse, code);
		});
	}

	// Add an entry in a journal
	server.postJournalEntry = function(journalId, entry, response, error) {
		var token = preferences.getToken();
		entry.metadata.user_id = token.x_key;
		var ajax = axios.create({
			responseType: "json",
			headers: computeHeader(token)
		});
		ajax.post(server.getServerUrl() + constant.sendCloudURL + journalId, {journal: JSON.stringify(entry)}).then(function(inResponse) {
			response(null, inResponse.data);
		}).catch(function(inResponse) {
			var code = getErrorCode(inResponse);
			if (code == 3) {
				if (sessionExpired()) {
					return;
				}
			}
			if (error) error(inResponse, code);
		});
	}

	// Update an entry in a journal
	server.putJournalEntry = function(journalId, objectId, entry, response, error) {
		var token = preferences.getToken();
		entry.metadata.user_id = token.x_key;
		var ajax = axios.create({
			responseType: "json",
			params: {
				oid: objectId
			},
			headers: computeHeader(token)
		});
		ajax.put(server.getServerUrl() + constant.sendCloudURL + journalId, {journal: JSON.stringify(entry)}).then(function(inResponse) {
			response(null, inResponse.data);
		}).catch(function(inResponse) {
			var code = getErrorCode(inResponse);
			if (code == 3) {
				if (sessionExpired()) {
					return;
				}
			}
			if (error) error(inResponse, code);
		});
	}

	// Delete an entry in a journal
	server.deleteJournalEntry = function(journalId, objectId, response, error) {
		var ajax = axios.create({
			responseType: "json",
			params: {
				oid: objectId,
				type: 'partial'
			},
			headers: computeHeader(preferences.getToken())
		});
		ajax.delete(server.getServerUrl() + constant.sendCloudURL + journalId).then(function(inResponse) {
			response(null, inResponse.data);
		}).catch(function(inResponse) {
			var code = getErrorCode(inResponse);
			if (code == 3) {
				if (sessionExpired()) {
					return;
				}
			}
			if (error) error(inResponse, code);
		});
	}

	// Create a new user
	server.postStats = function(stats, response, error) {
		var ajax = axios.create({
			responseType: "json",
			headers: computeHeader(preferences.getToken())
		});
		ajax.post(server.getServerUrl() + constant.statsURL, {stats: JSON.stringify(stats)}).then(function(inResponse) {
			if (response) response(null, inResponse.data);
		}).catch(function(inResponse) {
			var code = getErrorCode(inResponse);
			if (error) error(inResponse, code);
		});
	}

	return server;
});
