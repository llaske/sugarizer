// Interface to server
define([], function() {

	var server = {};

	const constant = {
		webAppType: 0,
		appType: 1,
		dynamicInitActivitiesURL: "/api/v1/activities/",
		serverInformationURL: "/api/",
		loginURL: "/auth/login/",
		signupURL: "/auth/signup/",
		initNetworkURL: "/api/v1/users/",
		sendCloudURL: "/api/v1/journal/",
		submitAssignment:"/api/v1/assignments/deliveries/submit/",
		statsURL: "/api/v1/stats/",
	};

	// Get client type util
	var getClientType = function() {
		return (document.location.protocol.substr(0,4) == "http") ? constant.webAppType : constant.appType;
	}

	// Get current server URL util
	var getCurrentServerUrl = function() {
		var url = window.location.href;
		url = url.replace("/v2", ""); // HACK: Remove /v2 from URL
		return url.substring(0, url.lastIndexOf('/'));
	}

	// Restart app util
	var restartApp = function() {
		location.assign(location.href.replace(/\?rst=?./g,"?rst=0"));
	}

	// Get token util
	server.getToken = function() {
		var settings = JSON.parse(localStorage.getItem("sugar_settings"));
		if (settings && settings.token) {
			return settings.token;
		}
		return null;
	}

	// Set token util
	var setToken = function(token) {
		var settings = JSON.parse(localStorage.getItem("sugar_settings"));
		if (settings) {
			settings.token = token;
			localStorage.setItem("sugar_settings", JSON.stringify(settings));
		}
	}

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
		if (getClientType() == constant.webAppType) {
			// For web app, force deconnection
			localStorage.removeItem("sugar_settings");
			restartApp();
			return true;
		} else {
			// TODO: For app, display a message and mark token expired
			return false;
		}
	}

	// Retrieve current server name
	server.getServer = function() {
		return (getClientType() == constant.webAppType) ? getCurrentServerUrl() : "http://localhost";
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
		var params = server.getToken();
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
			headers: computeHeader(server.getToken())
		});
		ajax.get(server.getServerUrl() + constant.dynamicInitActivitiesURL).then(function(inResponse) {
			if (response) response(inResponse.data);
		}).catch(function(inResponse) {
			var code = getErrorCode(inResponse);
			if (code == 3) {
				if (sessionExpired()) {
					return;
				}
			}
			if (error) error(code);
		});
	}

	// Get user information
	server.getUser = function(userId, response, error, optserver) {
		var ajax = axios.create({
			responseType: "json",
			headers: computeHeader(server.getToken())
		});
		if (!userId) {
			userId = server.getToken().x_key;
		}
		ajax.get((optserver ? optserver : server.getServerUrl()) + constant.initNetworkURL + userId).then(function(inResponse) {
			response(inResponse.data);
		}).catch(function(inResponse) {
			var code = getErrorCode(inResponse);
			if (code == 3) {
				if (sessionExpired()) {
					return;
				}
			}
			if (error) error(code);
		});
	}

	// Create a new user
	server.postUser = function(user, response, error, optserver) {
		var ajax = axios.create({
			responseType: "json"
		});
		ajax.post((optserver ? optserver : server.getServerUrl()) + constant.signupURL, {user: JSON.stringify(user)}).then(function(inResponse) {
			if (response) response(inResponse.data);
		}).catch(function(inResponse) {
			var code = getErrorCode(inResponse);
			if (code == 3) {
				if (sessionExpired()) {
					return;
				}
			}
			if (error) error(code);
		});
	}

	// Create a new user
	server.loginUser = function(user, response, error, optserver) {
		var userValue = user;
		userValue.role = ["student","teacher"];
		var ajax = axios.create({
			responseType: "json"
		});
		ajax.post((optserver ? optserver : server.getServerUrl()) + constant.loginURL, {user: JSON.stringify(userValue)}).then(function(inResponse) {
			response(inResponse.data);
		}).catch(function(inResponse) {
			var code = getErrorCode(inResponse);
			if (code == 3) {
				if (sessionExpired()) {
					return;
				}
			}
			if (error) error(code);
		});
	}

	// Update user
	server.putUser = function(userId, settings, response, error) {
		var ajax = axios.create({
			responseType: "json",
			headers: computeHeader(server.getToken())
		});
		if (!userId) {
			userId = server.getToken().x_key;
		}
		ajax.put(server.getServerUrl() + constant.initNetworkURL + userId, {user: JSON.stringify(settings)}).then(function(inResponse) {
			response(inResponse.data);
		}).catch(function(inResponse) {
			var code = getErrorCode(inResponse);
			if (code == 3) {
				if (sessionExpired()) {
					return;
				}
			}
			if (error) error(code);
		});
	}

	// Delete user
	server.deleteUser = function(userId, response, error) {
		var ajax = axios.create({
			responseType: "json",
			headers: computeHeader(server.getToken())
		});
		ajax.delete(server.getServerUrl() + constant.initNetworkURL + userId).then(function(inResponse) {
			response(inResponse.data);
		}).catch(function(inResponse) {
			var code = getErrorCode(inResponse);
			if (code == 3) {
				if (sessionExpired()) {
					return;
				}
			}
			if (error) error(code);
		});
	}

	// Get journal content optionally filter by typeactivity, time, favorite, ...
	server.getJournal = function(journalId, request, response, error) {
		var typeactivity = request.typeactivity;
		var stime = request.stime;
		var favorite = request.favorite;
		var assignment = request.assignment;
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
		if (assignment !== undefined) {
			params.assignment = assignment;
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
			headers: computeHeader(server.getToken()),
			params: params
		});
		ajax.get(url).then(function(inResponse) {
			response(inResponse.data);
		}).catch(function(inResponse) {
			var code = getErrorCode(inResponse);
			if (code == 3) {
				if (sessionExpired()) {
					return;
				}
			}
			if (error) error(code);
		});
	}

	// Get an entry in a journal
	server.getJournalEntry = function(journalId, objectId, response, error) {
		var params = {};
		var ajax = axios.create({
			responseType: "json",
			headers: computeHeader(server.getToken()),
			params: {
				oid: objectId,
				fields: "text,metadata"
			}
		});
		ajax.get(server.getServerUrl() + constant.sendCloudURL + journalId).then(function(inResponse) {
			response(inResponse.data);
		}).catch(function(inResponse) {
			var code = getErrorCode(inResponse);
			if (code == 3) {
				if (sessionExpired()) {
					return;
				}
			}
			if (error) error(code);
		});
	}

	// Add an entry in a journal
	server.postJournalEntry = function(journalId, entry, response, error) {
		var token = server.getToken();
		entry.metadata.user_id = token.x_key;
		var ajax = axios.create({
			responseType: "json",
			headers: computeHeader(token)
		});
		ajax.post(server.getServerUrl() + constant.sendCloudURL + journalId, {journal: JSON.stringify(entry)}).then(function(inResponse) {
			response(inResponse.data);
		}).catch(function(inResponse) {
			var code = getErrorCode(inResponse);
			if (code == 3) {
				if (sessionExpired()) {
					return;
				}
			}
			if (error) error(code);
		});
	}

	// Update an entry in a journal
	server.putJournalEntry = function(journalId, objectId, entry, response, error) {
		var token = server.getToken();
		entry.metadata.user_id = token.x_key;
		var ajax = axios.create({
			responseType: "json",
			params: {
				oid: objectId
			},
			headers: computeHeader(token)
		});
		ajax.put(server.getServerUrl() + constant.sendCloudURL + journalId, {journal: JSON.stringify(entry)}).then(function(inResponse) {
			response(inResponse.data);
		}).catch(function(inResponse) {
			var code = getErrorCode(inResponse);
			if (code == 3) {
				if (sessionExpired()) {
					return;
				}
			}
			if (error) error(code);
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
			headers: computeHeader(server.getToken())
		});
		ajax.delete(server.getServerUrl() + constant.sendCloudURL + journalId).then(function(inResponse) {
			response(inResponse.data);
		}).catch(function(inResponse) {
			var code = getErrorCode(inResponse);
			if (code == 3) {
				if (sessionExpired()) {
					return;
				}
			}
			if (error) error(code);
		});
	}

	// Create a new user
	server.postStats = function(stats, response, error) {
		var ajax = axios.create({
			responseType: "json",
			headers: computeHeader(server.getToken())
		});
		ajax.post(server.getServerUrl() + constant.statsURL, {stats: JSON.stringify(stats)}).then(function(inResponse) {
			if (response) response(inResponse.data);
		}).catch(function(inResponse) {
			var code = getErrorCode(inResponse);
			if (error) error(code);
		});
	}

	//submit assignment
	server.postAssignment = function(assignmentId, objectId, response, error) {
		var params = {};
		var ajax = axios.create({
			responseType: "json",
			params: {
				oid: objectId,
			},
			headers: computeHeader(server.getToken())
		});
		ajax.put(server.getServerUrl() + constant.submitAssignment + assignmentId).then(function(inResponse) {
			if (response) response(inResponse.data);
		}).catch(function(inResponse) {
			var code = getErrorCode(inResponse);
			if (error) error(code);
		});
		
	}

	return server;
});
