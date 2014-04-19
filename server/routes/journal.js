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
exports.init = function(settings) {
	journalCollection = settings.collections.journal; 
	server = new Server(settings.database.server, settings.database.port, {auto_reconnect: true});
	db = new Db(settings.database.name, server);
	
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

//- REST interface 

// Add a new journal
exports.addJournal = function(req, res) {
	createJournal(function(err, result) {
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
	var jid = req.params.jid;
	var aid = req.params.aid;
	var filter = {_id:new BSON.ObjectID(jid)};
	db.collection(journalCollection, function(err, collection) {
		collection.findOne(filter, function(err, item) {
			if (item == null) {
				res.send(item);
			} else {
				// Filter by activity type
				var entries = item.content;
				if (aid !== undefined) {
					var results = [];
					for (var i = 0 ; i < entries.length ; i++) {
						var entry = entries[i];
						if (entry.metadata.activity == aid) {
							results.push(entry);
						}					
					}
					entries = results;
				}
				
				// Sort by descending date
				res.send(entries.sort(function(e0, e1) {
					return parseInt(e1.metadata.timestamp) - parseInt(e0.metadata.timestamp); 
				}));
			}
		});
	});
};

// Add an entry in a journal
exports.addEntryInJournal = function(req, res) {
	var jid = req.params.jid;
	var journal = JSON.parse(req.body.journal);
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
}

// Remove an entry in a journal
exports.removeEntryInJournal = function(req, res) {
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