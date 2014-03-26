// User handling

var mongo = require('mongodb');
 
var Server = mongo.Server,
	Db = mongo.Db,
	BSON = mongo.BSONPure;
 
var server;
var db;

var usersCollection = 'users';

// Init database
exports.init = function(settings) {
	server = new Server(settings.database.server, settings.database.port, {auto_reconnect: true});
	db = new Db(settings.database.name, server);
	 
	db.open(function(err, db) {
		if(!err) {
		}
	});
}

// Find an user
exports.findById = function(req, res) {
	var uid = req.params.uid;
	db.collection(usersCollection, function(err, collection) {
		collection.findOne({'_id':new BSON.ObjectID(uid)}, function(err, item) {
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
	db.collection(usersCollection, function (err, collection) {
		collection.insert(req.body, {safe:true}, function(err, result) {
			if (err) {
				res.send({'error':'An error has occurred'});
			} else {
				res.send(result[0]);
			}
		})	
	});
}
 
// Update user
exports.updateUser = function(req, res) {
	var uid = req.params.uid;
	var user = req.body;
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