// Interface to server
define(["settings"], function(preferences) {

	// var
	var server = {};
	var hparam = {x_key: '59726d8767adb75ba6d993ee', access_token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE1MDEyNzY5MTA0OTd9.cTk7tyk1ixWIAW0aP9QNUgD4eOcr9R784tH8FNbEivs'};
	var huser = 'postman';
	var hpassword = 'pass';
	var hserver = 'localhost:8484';

	// Retrieve current server name
	server.getServer = function() {
		return hserver;
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
		return server.getServerUrl() + constant.dynamicInitActivitiesURL + "?x_key="+hparam.x_key+"&access_token="+hparam.access_token;
	}

	// Get user information
	server.getUser = function(userId, response, error, optserver) {
		userId = hparam.x_key;
		var ajax = new enyo.Ajax({
			url: (optserver ? optserver : server.getServerUrl()) + constant.initNetworkURL + userId,
			method: "GET",
			handleAs: "json"
		});
		ajax.response(response);
		ajax.error(error);
		ajax.go(hparam);
	}

	// Create a new user
	server.postUser = function(user, response, error) {
		user.password = huser;
		user.role = hpassword;
		var ajax = new enyo.Ajax({
			url: server.getServerUrl() + constant.signupURL,
			method: "POST",
			handleAs: "json",
			postBody: {
				user: JSON.stringify(user)
			}
		});
		ajax.response(response);
		ajax.error(error);
		ajax.go(hparam);
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
		userId = hparam.x_key;
		var ajax = new enyo.Ajax({
			url: server.getServerUrl() + constant.initNetworkURL + userId,
			method: "PUT",
			handleAs: "json",
			postBody: {
				user: JSON.stringify(settings)
			}
		});
		ajax.response(response);
		ajax.error(error);
		ajax.go(hparam);
	}

	// Get journal content optionally filter by typeactivity
	server.getJournal = function(journalId, typeactivity, field, response, error) {
		var url = server.getServerUrl() + constant.sendCloudURL + journalId;
		params = hparam;
		if (typeactivity !== undefined) {
			params.aid = typeactivity;
		}
		var ajax = new enyo.Ajax({
			url: url,
			method: "GET",
			handleAs: "json"
		});
		ajax.response(response);
		ajax.error(error);
		ajax.go(params);
	}

	// Get an entry in a journal
	server.getJournalEntry = function(journalId, objectId, response, error) {
		var ajax = new enyo.Ajax({
			url: server.getServerUrl() + constant.sendCloudURL + journalId,
			method: "GET",
			handleAs: "json"
		});
		hparam.oid = objectId;
		ajax.response(response);
		ajax.error(error);
		ajax.go(hparam);
	}

	// Add an entry in a journal
	server.postJournalEntry = function(journalId, entry, response, error) {
		entry.metadata.user_id = hparam.x_key;
		var ajax = new enyo.Ajax({
			url: server.getServerUrl() + constant.sendCloudURL + journalId,
			method: "POST",
			handleAs: "json",
			postBody: {
				journal: JSON.stringify(entry)
			}
		});
		ajax.response(response);
		ajax.error(error);
		ajax.go(hparam);
	}

	// Update an entry in a journal
	server.putJournalEntry = function(journalId, objectId, entry, response, error) {
		entry.metadata.user_id = hparam.x_key;
		var ajax = new enyo.Ajax({
			url: server.getServerUrl() + constant.sendCloudURL + journalId,
			method: "PUT",
			handleAs: "json",
			postBody: {
				journal: JSON.stringify(entry)
			}
		});
		ajax.response(response);
		ajax.error(error);
		hparam.oid = objectId;
		ajax.go(hparam);
	}

	// Delete an entry in a journal
	server.deleteJournalEntry = function(journalId, objectId, response, error) {
		var ajax = new enyo.Ajax({
			url: server.getServerUrl() + constant.sendCloudURL + journalId,
			method: "DELETE",
			handleAs: "json"
		});
		ajax.response(response);
		ajax.error(error);
		hparam.oid = objectId;
		hparam.type = 'partial';
		ajax.go(hparam);
	}

	return server;
});
