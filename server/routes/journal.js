// Journal handling

var mongo = require('mongodb');

var Server = mongo.Server,
	Db = mongo.Db,
	BSON = mongo.BSONPure;

var server;
var db;

var journalCollection;

var shared = null;

//- Utility functions

// Init database
exports.init = function(settings, callback) {
	journalCollection = settings.collections.journal;
	server = new Server(settings.database.server, settings.database.port, {auto_reconnect: true});
	db = new Db(settings.database.name, server, {w:1});

	// Open the journal collection
	db.open(function(err, db) {
		if(!err) {
			db.collection(journalCollection, function(err, collection) {
				// Get the shared journal collection
				collection.findOne({'shared':true}, function(err, item) {
					// Not found, create one
					if (!err && item == null) {
						collection.insert({content:[], shared: true}, {safe:true}, function(err, result) {
							shared = result[0];
						});
					}

					// Already exist, save it
					else if (item != null) {
						shared = item;
					}

					if (callback) callback();
				});
			});
		}
	});
}

// Get shared journal
exports.getShared = function() {
	return shared;
}

// Create a new journal
exports.createJournal = function(callback) {
	db.collection(journalCollection, function (err, collection) {
		collection.insert({content:[], shared: false}, {safe:true}, callback)
	});
}

// Remove a journal
exports.removeJournal = function(req, res) {
	if (!BSON.ObjectID.isValid(req.params.jid)) {
		res.send();
		return;
	}
	var jid = req.params.jid;
	db.collection(journalCollection, function(err, collection) {
		collection.remove({'_id':new BSON.ObjectID(jid)}, function(err, result) {
			if (err) {
				res.send({'error':'An error has occurred'});
			} else {
				res.send(req.params.jid);
			}
		});
	});
}

// Find all journal
exports.findAll = function(req, res) {
	db.collection(journalCollection, function(err, collection) {
		collection.find().toArray(function(err, items) {
			res.send(items);
		});
	});
}

//- REST interface

// Add a new journal
exports.addJournal = function(req, res) {
	exports.createJournal(function(err, result) {
		if (err) {
			res.send({'error':'An error has occurred'});
		} else {
			res.send(result[0]);
		}
	});
}

// Get shared journal id
exports.findSharedJournal = function(req, res) {
	res.send({_id: shared._id});
}

// Get journal entries
exports.findJournalContent = function(req, res) {
	if (!BSON.ObjectID.isValid(req.params.jid)) {
		res.send();
		return;
	}
	var jid = req.params.jid;
	var aid = req.params.aid;
	var field = req.params.field;
	var filter = {_id:new BSON.ObjectID(jid)};
	db.collection(journalCollection, function(err, collection) {
		collection.findOne(filter, function(err, item) {
			if (item == null) {
				res.send(item);
			} else {
				var entries = item.content;
				var results = [];
				for (var i = 0 ; i < entries.length ; i++) {
					var entry = entries[i];

					// Filter by activity type
					if (aid !== undefined && entry.metadata.activity != aid) {
						continue;
					}

					// Limit fields
					if (field !== undefined) {
						var newentry = {};
						for(var key in entry) {
							if (key == field || key == "objectId") {
								newentry[key] = entry[key];
							}
						}
						entry = newentry;
					}

					results.push(entry);
				}
				entries = results;

				// Sort by descending date
				res.send(entries.sort(function(e0, e1) {
					if (e0.metadata && e1.metadata) {
						return parseInt(e1.metadata.timestamp) - parseInt(e0.metadata.timestamp);
					} else if (e0.timestamp && e0.timestamp) {
						return parseInt(e1.timestamp) - parseInt(e0.timestamp);
					}
					return 0;
				}));
			}
		});
	});
};

// Add an entry in a journal
exports.getEntryInJournal = function(req, res) {
	// Get parameter
	if (!BSON.ObjectID.isValid(req.params.jid)) {
		res.send();
		return;
	}
	var jid = req.params.jid;
	var oid = req.params.oid;

	// Look for existing entry with the same objectId
	var filter = {'_id':new BSON.ObjectID(jid), 'content.objectId': oid};
	db.collection(journalCollection, function(err, collection) {
		collection.findOne(filter, function(err, item) {
			if (item == null) {
				res.send();
			} else {
				for (var i = 0 ; i < item.content.length ; i++) {
					if (item.content[i].objectId == oid) {
						res.send(item.content[i]);
						return;
					}
				}
				res.send();
			}
		});
	});
}

// Add an entry in a journal
exports.addEntryInJournal = function(req, res) {
	// Get parameter
	if (!BSON.ObjectID.isValid(req.params.jid)) {
		res.send();
		return;
	}
	var jid = req.params.jid;
	var journal = JSON.parse(req.body.journal);

	// Look for existing entry with the same objectId
	var filter = {'_id':new BSON.ObjectID(jid), 'content.objectId': journal.objectId};
	db.collection(journalCollection, function(err, collection) {
		collection.findOne(filter, function(err, item) {
			if (item == null) {
				// Add a new entry
				var newcontent = {$push: {content: journal}};
				db.collection(journalCollection, function(err, collection) {
					collection.update({'_id':new BSON.ObjectID(jid)}, newcontent, {safe:true}, function(err, result) {
						if (err) {
							res.send({'error':'An error has occurred'});
						} else {
							res.send(newcontent);
						}
					});
				});
			} else {
				// Update the entry
				req.params.oid = journal.objectId;
				exports.updateEntryInJournal(req, res);
			}
		});
	});
}

// Update an entry in a journal
exports.updateEntryInJournal = function(req, res) {
	if (!BSON.ObjectID.isValid(req.params.jid)) {
		res.send();
		return;
	}
	var jid = req.params.jid;
	var oid = req.params.oid;

	// Delete the entry
	var deletecontent = {$pull: {content: {objectId: oid}}};
	db.collection(journalCollection, function(err, collection) {
		collection.update({'_id':new BSON.ObjectID(jid)}, deletecontent, {safe:true}, function(err, result) {
			if (err) {
				res.send({'error':'An error has occurred'});
			} else {
				// Add the updated entry
				exports.addEntryInJournal(req, res);
			}
		});
	});
}

// Remove an entry in a journal
exports.removeEntryInJournal = function(req, res) {
	if (!BSON.ObjectID.isValid(req.params.jid)) {
		res.send();
		return;
	}
	var jid = req.params.jid;
	var oid = req.params.oid;
	var deletecontent = {$pull: {content: {objectId: oid}}};
	db.collection(journalCollection, function(err, collection) {
		collection.update({'_id':new BSON.ObjectID(jid)}, deletecontent, {safe:true}, function(err, result) {
			if (err) {
				res.send({'error':'An error has occurred'});
			} else {
				res.send(deletecontent);
			}
		});
	});
}