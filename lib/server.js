
// Interface to server
define(["settings"], function (preferences) {
	var server = {};
	
	// Retrieve current server name
	server.getServer = function() {
		var url = preferences.getServer();
		if (url != null)
			return url;
		return (util.getClientType() == constant.thinClientType) ? "" : "localhost";
	}
	
	// Retrieve current server URL
	server.getServerUrl = function()  {
		var name = server.getServer();
		return (name == "") ? name : constant.http + name;
	}

	// Get URL to retrieve activities from server
	server.getActivitiesUrl = function() {
		return server.getServerUrl() + constant.dynamicInitActivitiesURL;
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
	
	// Get journal content optionally filter by typeactivity
	server.getJournal = function(journalId, typeactivity, response, error) {
		var ajax = new enyo.Ajax({
			url: server.getServerUrl() + constant.sendCloudURL+journalId+(typeactivity !== undefined ? constant.filterJournalURL+typeactivity : ""),
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