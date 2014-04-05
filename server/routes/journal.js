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

// Get shared journal
exports.findSharedJournal = function(req, res) {
	res.send({_id: shared._id});
}

// Get journal
exports.findJournal = function(req, res) {
	var jid = req.params.jid;
	db.collection(journalCollection, function(err, collection) {
		collection.findOne({'_id':new BSON.ObjectID(jid)}, function(err, item) {
			if (item == null) {
				res.send(item);
			} else {
				res.send(item.content);
			}
		});
	});
};

// Add an entry in a journal
exports.addEntryInJournal = function(req, res) {
	var jid = req.params.jid;
	var journal = JSON.parse(req.body.journal);
	var newcontent = {$push: {content: req.body}};
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