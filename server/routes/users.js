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
exports.init = function(settings, callback) {
	usersCollection = settings.collections.users; 
	server = new Server(settings.database.server, settings.database.port, {auto_reconnect: true});
	db = new Db(settings.database.name, server, {w:1});
	 
	db.open(function(err, db) {
		if(err) {
		}
		if (callback) callback();
	});
}

/**
 * @api {get} /users/:id Get user detail
 * @apiName GetUser
 * @apiDescription Retrieve detail for a specific user.
 * @apiGroup Users
 * @apiVersion 0.6.0
 *
 * @apiSuccess {String} _id Unique user id
 * @apiSuccess {String} name User name
 * @apiSuccess {Object} color Buddy color
 * @apiSuccess {String} color.strike Buddy strike color
 * @apiSuccess {String} color.file Buddy fill color
 * @apiSuccess {String[]} favorites Ids list of activities in the favorite view
 * @apiSuccess {String} language Language setting of the user
 * @apiSuccess {String} private_journal Id of the private journal on the server
 * @apiSuccess {String} shared_journal Id of the shared journal on the server
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "name": "Lionel", 
 *       "color": {
 *         "stroke": "#A700FF",
 *         "fill": "#FF8F00"
 *       },
 *       "favorites": [
 *         "org.olpcfrance.PaintActivity",
 *         "org.olpcfrance.TamTamMicro",
 *         "org.olpcfrance.MemorizeActivity",
 *         "org.olpg-france.physicsjs",
 *         "org.olpcfrance.RecordActivity",
 *         "org.olpcfrance.Abecedarium",
 *         "org.olpcfrance.KAView",
 *         "org.olpcfrance.FoodChain",
 *         "org.olpc-france.labyrinthjs",
 *         "org.olpcfrance.TankOp",
 *         "org.olpcfrance.Gridpaint",
 *         "org.olpc-france.LOLActivity"
 *       ],
 *       "language": "fr",
 *       "private_journal": "56b271d026068d62059565e4",
 *       "shared_journal": "536d30874326e55f2a22816f",
 *       "_id": "56b271d026068d62059565e5"
 *    }
 **/
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

/**
 * @api {get} /users/ Get all users
 * @apiName GetAllUsers
 * @apiDescription Retrieve all users registered on the server.
 * @apiGroup Users
 * @apiVersion 0.6.0
 *
 * @apiSuccess {Object[]} users
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     [
 *       {
 *         "name": "Walter", 
 *         "color": {
 *           "stroke": "#005FE4",
 *           "fill": "#FF2B34"
 *         },
 *         "favorites": [
 *           "org.sugarlabs.GearsActivity",
 *           "org.sugarlabs.MazeWebActivity",
 *           "org.olpcfrance.PaintActivity",
 *           "org.olpcfrance.TamTamMicro",
 *           "org.olpcfrance.MemorizeActivity",
 *           "org.olpg-france.physicsjs",
 *           "org.sugarlabs.CalculateActivity",
 *           "org.sugarlabs.TurtleBlocksJS",
 *           "org.sugarlabs.Clock",
 *           "org.olpcfrance.RecordActivity",
 *           "org.olpcfrance.Abecedarium",
 *           "org.olpcfrance.KAView",
 *           "org.olpcfrance.FoodChain",
 *           "org.olpc-france.labyrinthjs"
 *         ],
 *         "language": "en",
 *         "private_journal": "536dd30aadcd557f2a9d648a",
 *         "shared_journal": "536d30874326e55f2a22816f",
 *         "_id": "536dd30aadcd557f2a9d648b"
 *      },
 *      {
 *         "name": "Martin", 
 *         "color": {
 *           "stroke": "#8BFF7A",
 *           "fill": "#FF8F00"
 *         },
 *         "favorites": [
 *           "org.olpcfrance.PaintActivity",
 *           "org.olpcfrance.TamTamMicro",
 *           "org.olpcfrance.MemorizeActivity",
 *           "org.olpg-france.physicsjs",
 *           "org.sugarlabs.CalculateActivity",
 *           "org.sugarlabs.TurtleBlocksJS",
 *           "org.sugarlabs.Clock",
 *           "org.olpcfrance.RecordActivity",
 *           "org.olpcfrance.Abecedarium",
 *           "org.sugarlabs.ChatPrototype",
 *           "org.olpcfrance.Gridpaint",
 *           "org.laptop.WelcomeWebActivity"
 *         ],
 *         "language": "es",
 *         "private_journal": "537cb724679ebead166f35f3",
 *         "shared_journal": "536d30874326e55f2a22816f",
 *         "_id": "537cb724679ebead166f35f4"
 *      },
 *      ...
 *     ]
 **/
exports.findAll = function(req, res) {
	db.collection(usersCollection, function(err, collection) {
		collection.find().toArray(function(err, items) {
			res.send(items);
		});
	});
};

/**
 * @api {post} /users/ Add user
 * @apiName AddUser
 * @apiDescription Add a new user. Return the user created.
 * @apiGroup Users
 * @apiVersion 0.6.0

 * @apiSuccess {String} _id Unique user id
 * @apiSuccess {String} name User name
 * @apiSuccess {Object} color Buddy color
 * @apiSuccess {String} color.strike Buddy strike color
 * @apiSuccess {String} color.file Buddy fill color
 * @apiSuccess {String[]} favorites Ids list of activities in the favorite view
 * @apiSuccess {String} language Language setting of the user 
 * @apiSuccess {String} private_journal Id of the private journal on the server
 * @apiSuccess {String} shared_journal Id of the shared journal on the server (the same for all users)
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "name": "Sameer", 
 *       "color": {
 *         "stroke": "#00A0FF",
 *         "fill": "#00B20D"
 *       },
 *       "favorites": [
 *          "org.olpcfrance.Abecedarium",
 *          "org.sugarlabs.ChatPrototype",
 *          "org.sugarlabs.Clock",
 *          "org.olpcfrance.FoodChain",
 *          "org.sugarlabs.GearsActivity",
 *          "org.sugarlabs.GTDActivity",
 *          "org.olpcfrance.Gridpaint",
 *          "org.olpc-france.LOLActivity",
 *          "org.sugarlabs.Markdown",
 *          "org.sugarlabs.MazeWebActivity",
 *          "org.sugarlabs.PaintActivity"
 *       ],
 *       "language": "en",
 *       "private_journal": "5569f4b019e0b4c9525b3c96",
 *       "shared_journal": "536d30874326e55f2a22816f",
 *       "_id": "5569f4b019e0b4c9525b3c97"
 *    }
 **/
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
 
/**
 * @api {put} /users/ Update user
 * @apiName UpdateUser
 * @apiDescription Update an user. Return the user updated.
 * @apiGroup Users
 * @apiVersion 0.6.0
 
 * @apiSuccess {String} _id Unique user id
 * @apiSuccess {String} name User name
 * @apiSuccess {Object} color Buddy color
 * @apiSuccess {String} color.strike Buddy strike color
 * @apiSuccess {String} color.file Buddy fill color
 * @apiSuccess {String[]} favorites Ids list of activities in the favorite view
 * @apiSuccess {String} language Language setting of the user 
 * @apiSuccess {String} private_journal Id of the private journal on the server
 * @apiSuccess {String} shared_journal Id of the shared journal on the server
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "name": "Sameer", 
 *       "color": {
 *         "stroke": "#00A0FF",
 *         "fill": "#00B20D"
 *       },
 *       "favorites": [
 *          "org.olpcfrance.Abecedarium",
 *          "org.sugarlabs.ChatPrototype",
 *          "org.sugarlabs.Clock",
 *          "org.olpcfrance.FoodChain",
 *          "org.sugarlabs.GearsActivity",
 *          "org.sugarlabs.GTDActivity",
 *          "org.olpcfrance.Gridpaint",
 *          "org.olpc-france.LOLActivity",
 *          "org.sugarlabs.Markdown",
 *          "org.sugarlabs.MazeWebActivity",
 *          "org.sugarlabs.PaintActivity"
 *       ],
 *       "language": "en",
 *       "private_journal": "5569f4b019e0b4c9525b3c96",
 *       "shared_journal": "536d30874326e55f2a22816f",
 *       "_id": "5569f4b019e0b4c9525b3c97"
 *    }
 **/
exports.updateUser = function(req, res) {
	if (!BSON.ObjectID.isValid(req.params.uid)) {
		res.send();
		return;
	}
	var uid = req.params.uid;
	var user = JSON.parse(req.body.user);
	db.collection(usersCollection, function(err, collection) {
		collection.update({'_id':new BSON.ObjectID(uid)}, {$set: user}, {safe:true}, function(err, result) {
			if (err) {
				res.send({'error':'An error has occurred'});
			} else {
				res.send(user);
			}
		});
	});
}
 
// Remove user
exports.removeUser = function(req, res) {
	if (!BSON.ObjectID.isValid(req.params.uid)) {
		res.send();
		return;
	}
	var uid = req.params.uid;
	db.collection(usersCollection, function(err, collection) {
		collection.remove({'_id':new BSON.ObjectID(uid)}, function(err, result) {
			if (err) {
				res.send({'error':'An error has occurred'});
			} else {
				res.send(req.params.uid);
			}
		});
	});
}