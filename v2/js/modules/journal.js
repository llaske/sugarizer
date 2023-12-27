
// Interface to Journal
define(["sugar-web/datastore"], function(datastore) {

	var journal = {};

	var entries = [];

	// Load journal
	journal.load = function() {
		return new Promise(function(resolve, reject) {
			let user = sugarizer.modules.settings.getUser();
			if (user == null) {
				reject();
			}

			// In the app, get the journal locally except if the user is connected to a server
			if (sugarizer.getClientType() === sugarizer.constant.appType && !sugarizer.modules.user.isConnected()) {
				entries = datastore.find();
				resolve();
				return;
			}

			// Load journal from server
			sugarizer.modules.server.getJournal(user.privateJournal, { limit: 100 }, sugarizer.modules.user.getServerURL()).then((journal) => {
				entries = journal.entries.sort((a, b) => {
					return new Date(b.metadata.timestamp) - new Date(a.metadata.timestamp);
				});
				resolve();
			}, (error) => {
				console.error('Unable to load the journal, error ' + error);
				reject();
			});
		});
	}

	// Get entries
	journal.get = function() {
		return entries;
	}

	// Get entries by activity
	journal.getByActivity = function(activity) {
		return entries.filter((entry) => entry.metadata.activity == activity);
	}

	// Clean local journal
	journal.cleanLocal = function() {
		return new Promise(function(resolve, reject) {
			var results = datastore.find();
			var i = 0;
			var removeOneEntry = function(err) {
				if (++i < results.length) {
					datastore.remove(results[i].objectId, removeOneEntry);
				} else {
					entries = [];
					resolve();
				}
			};
			if (results.length) {
				datastore.remove(results[i].objectId, removeOneEntry);
			} else {
				entries = [];
				resolve();
			}
		});
	}
	
	return journal;
});