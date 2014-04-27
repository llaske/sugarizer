// User handling

var mongo = require('mongodb'),
	journal = require('./journal');
 
var Server = mongo.Server,
	Db = mongo.Db,
	BSON = mongo.BSONPure;
 
var server;
var db;

var usersCollection;

// Init database
exports.init = function(settings) {
	usersCollection = settings.collections.users; 
	server = new Server(settings.database.server, settings.database.port, {auto_reconnect: true});
	db = new Db(settings.database.name, server);
	 
	db.open(function(err, db) {
		if(!err) {
		}
	});
}

// Find an user
exports.findById = function(req, res) {
	if (!BSON.ObjectID.isValid(req.params.uid)) {
		res.send();
		return;
	}
	db.collection(usersCollection, function(err, collection) {
		collection.findOne({'_id':new BSON.ObjectID(req.params.uid)}, function(err, item) {
			res.send(item);
		});
	});
};

// Find all users
exports.findAll = function(req, res) {
	db.collection(usersCollection, function(err, collection) {
		collection.find().toArray(function(err, items) {
			res.send(items);
		});
	});
};

// Add a new user
exports.addUser = function(req, res) {
	var user = JSON.parse(req.body.user);
	db.collection(usersCollection, function (err, collection) {
		// Create a new journal
		journal.createJournal(function(err, result) {
			// Create the new user
			user.private_journal = result[0]._id;
			user.shared_journal = journal.getShared()._id;
			collection.insert(user, {safe:true}, function(err, result) {
				if (err) {
					res.send({'error':'An error has occurred'});
				} else {
					res.send(result[0]);
				}
			});
		});
	});
}
 
// Update user
exports.updateUser = function(req, res) {
	if (!BSON.ObjectID.isValid(req.params.uid)) {
		res.send();
		return;
	}
	var uid = req.params.uid;
	var user = JSON.parse(req.body.user);
	db.collection(usersCollection, function(err, collection) {
		collection.update({'_id':new BSON.ObjectID(uid)}, user, {safe:true}, function(err, result) {
			if (err) {
				res.send({'error':'An error has occurred'});
			} else {
				res.send(user);
			}
		});
	});
}