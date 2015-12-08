
// Interface to server
define(["settings"], function (preferences) {
	var server = {};
	
	// Retrieve current server name
	server.getServer = function() {
		var url = preferences.getServer();
		if (url != null)
			return url;
		return (util.getClientType() == constant.thinClientType) ? util.getCurrentServerUrl() : "localhost";
	}
	
	// Retrieve current server URL
	server.getServerUrl = function()  {
		var name = server.getServer();
		return constant.http + name;
	}

	// Get URL to retrieve activities from server
	server.getActivitiesUrl = function() {
		return server.getServerUrl() + constant.dynamicInitActivitiesURL;
	}
	
	// Get user information
	server.getUser = function(userId, response, error, optserver) {
		var ajax = new enyo.Ajax({
			url: (optserver ? optserver : server.getServerUrl()) + constant.initNetworkURL + userId,
			method: "GET",
			handleAs: "json"
		});
		ajax.response(response);
		ajax.error(error);
		ajax.go();	
	}
	
	// Create a new user
	server.postUser = function(user, response, error) {
		var ajax = new enyo.Ajax({
			url: server.getServerUrl() + constant.initNetworkURL,
			method: "POST",
			handleAs: "json",
			postBody: {user: JSON.stringify(user)}
		});
		ajax.response(response);
		ajax.error(error);
		ajax.go();	
	}
	
	// Update user
	server.putUser = function(userId, settings, response, error) {
		var ajax = new enyo.Ajax({
			url: server.getServerUrl() + constant.initNetworkURL+userId,
			method: "PUT",
			handleAs: "json",
			postBody: {user: JSON.stringify(settings)}
		});
		ajax.response(response);
		ajax.error(error);
		ajax.go();	
	}
	
	// Get journal content optionally filter by typeactivity
	server.getJournal = function(journalId, typeactivity, field, response, error) {
		var url = server.getServerUrl() + constant.sendCloudURL+journalId;
		if (typeactivity !== undefined) {
			url += constant.filterJournalURL+typeactivity;
		}
		if (field !== undefined) {
			url += constant.filterFieldURL+field;
		}
		var ajax = new enyo.Ajax({
			url: url,
			method: "GET",
			handleAs: "json"
		});
		ajax.response(response);
		ajax.error(error);
		ajax.go();	
	}
	
	// Get an entry in a journal
	server.getJournalEntry = function(journalId, objectId, response, error) {
		var ajax = new enyo.Ajax({
			url: server.getServerUrl() + constant.sendCloudURL+journalId+"/"+objectId,
			method: "GET",
			handleAs: "json"
		});
		ajax.response(response);
		ajax.error(error);
		ajax.go();
	}
	
	// Add an entry in a journal
	server.postJournalEntry = function(journalId, entry, response, error) {
		var ajax = new enyo.Ajax({
			url: server.getServerUrl() + constant.sendCloudURL+journalId,
			method: "POST",
			handleAs: "json",
			postBody: {journal: JSON.stringify(entry)}
		});
		ajax.response(response);
		ajax.error(error);
		ajax.go();
	}

	// Update an entry in a journal
	server.putJournalEntry = function(journalId, objectId, entry, response, error) {
		var ajax = new enyo.Ajax({
			url: server.getServerUrl() + constant.sendCloudURL+journalId+"/"+objectId,
			method: "PUT",
			handleAs: "json",
			postBody: {journal: JSON.stringify(entry)}
		});
		ajax.response(response);
		ajax.error(error);
		ajax.go();
	}
	
	// Delete an entry in a journal
	server.deleteJournalEntry = function(journalId, objectId, response, error) {
		var ajax = new enyo.Ajax({
			url: server.getServerUrl() + constant.sendCloudURL+journalId+"/"+objectId,
			method: "DELETE",
			handleAs: "json"
		});	
		ajax.response(response);
		ajax.error(error);
		ajax.go();
	}
	
	return server;
});