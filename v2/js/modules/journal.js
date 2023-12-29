
// Interface to Journal
define(["sugar-web/datastore"], function(datastore) {

	var journal = {};

	var entries = [];

	let constant = {
		fieldMetadata: "metadata",
		syncJournalLimit: 100
	};

	// Load journal
	journal.load = function() {
		entries = datastore.find();
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

	// Launch journal synchronization
	journal.synchronize = function() {
		return new Promise(function(resolve, reject) {
			// Load local journal
			journal.load();
			var localJournal = journal.get();

			// User not connected or don't want to synchronize
			if (!sugarizer.modules.user.isConnected() || !sugarizer.modules.user.getOption("sync")) {
				resolve(0, 0);
				return;
			}

			// Load remote journal
			emitSynchronization("compute");
			var request = {
				field: constant.fieldMetadata,
				limit: constant.syncJournalLimit
			}
			sugarizer.modules.server.getJournal(sugarizer.modules.user.getPrivateJournal(), request, sugarizer.modules.user.getServerURL()).then((remoteJournal) => {
					syncEntries(localJournal, remoteJournal.entries, function(local, remote, error) {
						if (error) {
							reject(error);
						} else {
							journal.load();
							resolve(local, remote);
						}
						emitSynchronization("end", local, remote);
					});
				},
				(error) => {
					console.log('WARNING: Unable to sync the journal, error ' + error);
					reject(error);
				}
			);
		});
	};

	// --- Synchronization functions ---

	// Emit synchronization event
	function emitSynchronization(step, local, remote) {
		const customEvent = new CustomEvent("synchronization", {
			detail: {
				step: step,
				local: local,
				remote: remote,
			},
		});
		window.dispatchEvent(customEvent);
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
		sugarizer.modules.server.getJournalEntry(sugarizer.modules.user.getPrivateJournal(), objectId, sugarizer.modules.user.getServerURL()).then(
			function(response) {
				var ds = new datastore.DatastoreObject(objectId);
				ds.setMetadata(response.entries[0].metadata);
				ds.setDataAsText(response.entries[0].text);
				ds.save(null, true);
				nextAction(session);
			},
			function(error) {
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
			sugarizer.modules.server.putJournalEntry(sugarizer.modules.user.getPrivateJournal(), newentry.objectId, dataentry, sugarizer.modules.user.getServerURL()).then(
				function() {
					nextAction(session);
				},
				function(error) {
					console.log("WARNING: Error "+error+" writing "+newentry.objectId+" to sync remote journal ");
					session.error++;
					nextAction(session);
				}
			);
		});
	}

	// Function process sync processSyncActions
	function processSyncActions(updateToLocal, updateToRemote, endCallback) {
		var session = {
			actionCount: updateToLocal.length + updateToRemote.length,
			localCount: updateToLocal.length,
			remoteCount: updateToRemote.length,
			error: 0,
			callback: endCallback
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

		// No action to do, call callback
		if (updateToRemote.length == 0 && updateToLocal.length == 0) {
			session.callback(0, 0, 0);
		}
	}

	// Synchronize local and remote journal entries
	function syncEntries(localJournal, remoteJournal, endCallback) {
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
						if (localEntry.metadata.isSubmitted === true) {
							updateToLocal.push(remoteEntry); // When an assignment is submitted, it can't be updated
						} else {
							updateToRemote.push(localEntry);
						}
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
		emitSynchronization("start", updateToLocal.length, updateToRemote.length);

		// Process actions
		processSyncActions(updateToLocal, updateToRemote, endCallback);
	}
	
	return journal;
});