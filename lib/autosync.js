// Handle autosynchronization between local and server journal
define(["settings","sugar-web/datastore"], function(preferences, datastore) {
	var autosync = {};

	// Load local journal
	function loadJournal() {
		var journal = datastore.find();
		return journal
	}

	// Update action count
	function nextAction(session) {
		session.actionCount = session.actionCount - 1;
		if (session.actionCount == 0) {
			if (session.callback) {
				console.log("Synchronized "+session.localCount+"D, "+session.remoteCount+"U");
				session.callback(session.localCount, session.remoteCount, session.error);
			}
		}
	}

	// Update/Create local entry with an existing remote entry
	function updateLocalWith(entry, session) {
		var objectId = entry.objectId;
		myserver.getJournalEntry(preferences.getPrivateJournal(), objectId,
			function(inSender, inResponse) {
				var ds = new datastore.DatastoreObject(objectId);
				ds.setMetadata(inResponse.entries[0].metadata);
				ds.setDataAsText(inResponse.entries[0].text);
				ds.save(null, true);
				nextAction(session);
			},
			function(inResponse, error) {
				datastore.remove(objectId);
				console.log("WARNING: Error "+error+" loading entry "+objectId+" in remote journal to sync local");
				session.error++;
				nextAction(session);
			}
		);
	}

	// Update/Create remote entry with an existing local entry
	function updateRemoteWith(entry, session) {
		var newentry = new datastore.DatastoreObject(entry.objectId);
		newentry.loadAsText(function(err, metadata, text) {
			var dataentry = {metadata: metadata, text: text, objectId: newentry.objectId};
			myserver.putJournalEntry(preferences.getPrivateJournal(), newentry.objectId, dataentry,
				function() {
					nextAction(session);
				},
				function(inResponse, error) {
					console.log("WARNING: Error "+error+" writing "+newentry.objectId+" to sync remote journal ");
					session.error++;
					nextAction(session);
				}
			);
		});
	}

	// Function process sync processSyncActions
	function processSyncActions(updateToLocal, updateToRemote, callback) {
		var session = {
			callback: callback,
			actionCount: updateToLocal.length + updateToRemote.length,
			localCount: updateToLocal.length,
			remoteCount: updateToRemote.length,
			error: 0
		};

		// Update local entries from remote
		for (var i = 0 ; i < updateToLocal.length ; i++) {
			var entry = updateToLocal[i];
			updateLocalWith(entry, session);
		}

		// Update remote entries from local
		for (var i = 0 ; i < updateToRemote.length ; i++) {
			var entry = updateToRemote[i];
			updateRemoteWith(entry, session);
		}
	}

	// Synchronize local and remote journal entries
	function syncEntries(localJournal, remoteJournal, startCallback, endCallback) {
		// Look for local not in remote
		var updateToLocal = [];
		var updateToRemote = [];
		for (var i = 0 ; i < localJournal.length ; i++) {
			var localEntry = localJournal[i];
			var found = false;
			for (var j = 0 ; j < remoteJournal.length ; j++) {
				var remoteEntry = remoteJournal[j];
				if (localEntry.objectId == remoteEntry.objectId) {
					found = true;
					remoteEntry.seen = true;
					if (localEntry.metadata.timestamp == remoteEntry.metadata.timestamp) {
						;
					} else if (localEntry.metadata.timestamp > remoteEntry.metadata.timestamp) {
						updateToRemote.push(localEntry);
					} else {
						updateToLocal.push(remoteEntry);
					}
				}
			}
			if (!found) {
				updateToRemote.push(localEntry);
			}
		}
		// Look for remote not in local
		for (var i = 0 ; i < remoteJournal.length ; i++) {
			var remoteEntry = remoteJournal[i];
			if (!remoteEntry.seen) {
				updateToLocal.push(remoteEntry);
			}
		}

		// Signalize start callback
		if (startCallback) {
			startCallback(updateToLocal.length+updateToRemote.length);
		}

		// Process actions
		processSyncActions(updateToLocal, updateToRemote, endCallback);
	}

	// Launch journal synchronization
	autosync.synchronizeJournal = function(startCallback, endCallback) {
		// User don't want to synchronize
		if (!preferences.getOptions("sync")) {
			return;
		}

		// Load local journal
		var localJournal = loadJournal();

		// Load remote journal
		var that = this;
		var request = {
			field: constant.fieldMetadata,
			limit: constant.syncJournalLimit
		}
		myserver.getJournal(preferences.getPrivateJournal(), request,
			function(inSender, inResponse) {
				var remoteJournal = inResponse.entries;
				syncEntries(localJournal, remoteJournal, startCallback, endCallback);
			},
			function() {
				console.log("WARNING: Error syncing remote journal ");
			}
		);
	};

	return autosync;
});
