// Interface to server
define([], function() {

	var server = {};

	const constant = {
		dynamicInitActivitiesURL: "/api/v1/activities/",
		serverInformationURL: "/api/",
		loginURL: "/auth/login/",
		signupURL: "/auth/signup/",
		initNetworkURL: "/api/v1/users/",
		sendCloudURL: "/api/v1/journal/",
		submitAssignment:"/api/v1/assignments/deliveries/submit/",
		statsURL: "/api/v1/stats/",
	};

	// Get current server URL util
	var getCurrentServerUrl = function() {
		var url = window.location.href;
		url = url.replace("/v2", ""); // HACK: Remove /v2 from URL
		return url.substring(0, url.lastIndexOf('/'));
	}

	// Get token util
	server.getToken = function() {
		let settings = sugarizer.modules.settings.getUser();
		if (settings && settings.token) {
			return settings.token;
		}
		return null;
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
		sugarizer.restart();
	}

	// Retrieve current server name
	server.getServer = function() {
		return (sugarizer.getClientType() == sugarizer.constant.webAppType) ? getCurrentServerUrl() : "http://localhost";
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
	server.getServerInformation = function(serverurl) {
		return new Promise(function(resolve, reject) {
			var serverUrl = serverurl;
			if (!serverUrl || !serverUrl.length) {
				serverUrl = server.getServerUrl();
			}
			if (serverUrl.length && serverUrl[serverUrl.length-1] == '/') {
				serverUrl = serverUrl.substr(0, serverUrl.length-1);
			}
			var ajax = axios.create({
				responseType: "json"
			});
			ajax.get(serverUrl + constant.serverInformationURL).then(function(inResponse) {
				inResponse.data.url = serverUrl;
				resolve(inResponse.data);
			}).catch(function(inResponse) {
				reject(getErrorCode(inResponse));
			});
		});
	}

	// Get activities
	server.getActivities = function(optserver) {
		return new Promise(function(resolve, reject) {
			var ajax = axios.create({
				responseType: "json",
				headers: computeHeader(server.getToken())
			});
			ajax.get((optserver ? optserver : server.getServerUrl()) + constant.dynamicInitActivitiesURL).then(function(inResponse) {
				resolve(inResponse.data);
			}).catch(function(inResponse) {
				var code = getErrorCode(inResponse);
				if (code == 3) {
					if (sessionExpired()) {
						reject(code);
						return;
					}
				}
				reject(code);
			});
		});
	}

	// Get user information
	server.getUser = function(userId, optserver) {
		return new Promise(function(resolve, reject) {
			var ajax = axios.create({
				responseType: "json",
				headers: computeHeader(server.getToken())
			});
			if (!userId) {
				userId = server.getToken().x_key;
			}
			ajax.get((optserver ? optserver : server.getServerUrl()) + constant.initNetworkURL + userId).then(function(inResponse) {
				resolve(inResponse.data);
			}).catch(function(inResponse) {
				var code = getErrorCode(inResponse);
				if (code == 3) {
					if (sessionExpired()) {
						reject(code);
						return;
					}
				}
				reject(code);
			});
		});
	}

	// Create a new user
	server.postUser = function(user, optserver) {
		return new Promise(function(resolve, reject) {
			var ajax = axios.create({
				responseType: "json"
			});
			ajax.post((optserver ? optserver : server.getServerUrl()) + constant.signupURL, {user: JSON.stringify(user)}).then(function(inResponse) {
				resolve(inResponse.data);
			}).catch(function(inResponse) {
				var code = getErrorCode(inResponse);
				if (code == 3) {
					if (sessionExpired()) {
						reject(code);
						return;
					}
				}
				reject(code);
			});
		});
	}

	// Log an user
	server.loginUser = function(user, optserver) {
		return new Promise(function(resolve, reject) {
			var userValue = user;
			userValue.role = ["student","teacher"];
			var ajax = axios.create({
				responseType: "json"
			});
			ajax.post((optserver ? optserver : server.getServerUrl()) + constant.loginURL, {user: JSON.stringify(userValue)}).then(function(inResponse) {
				resolve(inResponse.data);
			}).catch(function(inResponse) {
				var code = getErrorCode(inResponse);
				if (code == 3) {
					if (sessionExpired()) {
						reject(code);
						return;
					}
				}
				reject(code);
			});
		});
	}

	// Update user
	server.putUser = function(userId, settings, optserver) {
		return new Promise(function(resolve, reject) {
			var ajax = axios.create({
				responseType: "json",
				headers: computeHeader(server.getToken())
			});
			if (!userId) {
				userId = server.getToken().x_key;
			}
			ajax.put((optserver ? optserver : server.getServerUrl()) + constant.initNetworkURL + userId, {user: JSON.stringify(settings)}).then(function(inResponse) {
				resolve(inResponse.data);
			}).catch(function(inResponse) {
				var code = getErrorCode(inResponse);
				if (code == 3) {
					if (sessionExpired()) {
						reject(code);
						return;
					}
				}
				reject(code);
			});
		});
	}

	// Delete user
	server.deleteUser = function(userId, optserver) {
		return new Promise(function(resolve, reject) {
			var ajax = axios.create({
				responseType: "json",
				headers: computeHeader(server.getToken())
			});
			if (!userId) {
				userId = server.getToken().x_key;
			}
			ajax.delete((optserver ? optserver : server.getServerUrl()) + constant.initNetworkURL + userId).then(function(inResponse) {
				resolve(inResponse.data);
			}).catch(function(inResponse) {
				var code = getErrorCode(inResponse);
				if (code == 3) {
					if (sessionExpired()) {
						reject(code);
						return;
					}
				}
				reject(code);
			});
		});
	}

	// Get journal content optionally filter by typeactivity, time, favorite, ...
	server.getJournal = function(journalId, request, optserver) {
		return new Promise(function(resolve, reject) {
			var typeactivity = request.typeactivity;
			var stime = request.stime;
			var favorite = request.favorite;
			var assignment = request.assignment;
			var field = request.field;
			var limit = request.limit;
			var offset = request.offset;
			var title = request.title;
			var sort = request.sort;
			var url = (optserver ? optserver : server.getServerUrl()) + constant.sendCloudURL + journalId + "?limit="+limit;
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
				resolve(inResponse.data);
			}).catch(function(inResponse) {
				var code = getErrorCode(inResponse);
				if (code == 3) {
					if (sessionExpired()) {
						reject(code);
						return;
					}
				}
				reject(code);
			});
		});
	}

	// Get an entry in a journal
	server.getJournalEntry = function(journalId, objectId, optserver) {
		return new Promise(function(resolve, reject) {
			var params = {};
			var ajax = axios.create({
				responseType: "json",
				headers: computeHeader(server.getToken()),
				params: {
					oid: objectId,
					fields: "text,metadata"
				}
			});
			ajax.get((optserver ? optserver : server.getServerUrl()) + constant.sendCloudURL + journalId).then(function(inResponse) {
				resolve(inResponse.data);
			}).catch(function(inResponse) {
				var code = getErrorCode(inResponse);
				if (code == 3) {
					if (sessionExpired()) {
						reject(code);
						return;
					}
				}
				reject(code);
			});
		});
	}

	// Add an entry in a journal
	server.postJournalEntry = function(journalId, entry, optserver) {
		return new Promise(function(resolve, reject) {
			var token = server.getToken();
			entry.metadata.user_id = token.x_key;
			var ajax = axios.create({
				responseType: "json",
				headers: computeHeader(token)
			});
			ajax.post((optserver ? optserver : server.getServerUrl()) + constant.sendCloudURL + journalId, {journal: JSON.stringify(entry)}).then(function(inResponse) {
				resolve(inResponse.data);
			}).catch(function(inResponse) {
				var code = getErrorCode(inResponse);
				if (code == 3) {
					if (sessionExpired()) {
						reject(code);
						return;
					}
				}
				reject(code);
			});
		});
	}

	// Update an entry in a journal
	server.putJournalEntry = function(journalId, objectId, entry, optserver) {
		return new Promise(function(resolve, reject) {
			var token = server.getToken();
			entry.metadata.user_id = token.x_key;
			var ajax = axios.create({
				responseType: "json",
				params: {
					oid: objectId
				},
				headers: computeHeader(token)
			});
			ajax.put((optserver ? optserver : server.getServerUrl()) + constant.sendCloudURL + journalId, {journal: JSON.stringify(entry)}).then(function(inResponse) {
				resolve(inResponse.data);
			}).catch(function(inResponse) {
				var code = getErrorCode(inResponse);
				if (code == 3) {
					if (sessionExpired()) {
						reject(code);
						return;
					}
				}
				reject(code);
			});
		});
	}

	// Delete an entry in a journal
	server.deleteJournalEntry = function(journalId, objectId, optserver) {
		return new Promise(function(resolve, reject) {
			var ajax = axios.create({
				responseType: "json",
				params: {
					oid: objectId,
					type: 'partial'
				},
				headers: computeHeader(server.getToken())
			});
			ajax.delete((optserver ? optserver : server.getServerUrl()) + constant.sendCloudURL + journalId).then(function(inResponse) {
				resolve(inResponse.data);
			}).catch(function(inResponse) {
				var code = getErrorCode(inResponse);
				if (code == 3) {
					if (sessionExpired()) {
						reject(code);
						return;
					}
				}
				reject(code);
			});
		});
	}

	// Create a new user
	server.postStats = function(stats, optserver) {
		return new Promise(function(resolve, reject) {
			var ajax = axios.create({
				responseType: "json",
				headers: computeHeader(server.getToken())
			});
			ajax.post((optserver ? optserver : server.getServerUrl()) + constant.statsURL, {stats: JSON.stringify(stats)}).then(function(inResponse) {
				resolve(inResponse.data);
			}).catch(function(inResponse) {
				var code = getErrorCode(inResponse);
				reject(code);
			});
		});
	}

	//submit assignment
	server.postAssignment = function(assignmentId, objectId, optserver) {
		return new Promise(function(resolve, reject) {
			var params = {};
			var ajax = axios.create({
				responseType: "json",
				params: {
					oid: objectId,
				},
				headers: computeHeader(server.getToken())
			});
			ajax.put((optserver ? optserver : server.getServerUrl()) + constant.submitAssignment + assignmentId).then(function(inResponse) {
				resolve(inResponse.data);
			}).catch(function(inResponse) {
				var code = getErrorCode(inResponse);
				reject(code);
			});
		});	
	}

	return server;
});
