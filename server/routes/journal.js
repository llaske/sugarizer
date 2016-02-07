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

/**
 * @api {get} /journal/shared Get shared journal 
 * @apiName GetSharedJournal
 * @apiDescription Retrieve id of the shared journal on the server. On the server, there is only one journal shared by all users.
 * @apiGroup Journal
 * @apiVersion 0.6.0
 *
 * @apiSuccess {String} _id Id of the shared journal on the server
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "_id": "536d30874326e55f2a22816f"
 *     }
 **/
exports.findSharedJournal = function(req, res) {
	res.send({_id: shared._id});
}

/**
 * @api {get} /journal/:jid Get journal entries
 * @apiName GetJournalContent
 * @apiDescription Retrieve full content of a journal. Result include both metadata and text.
 *
 * **Deprecated**: it's better to use the "api/journal/:jid/field/:field" to avoid big entries in the result.
 * @apiGroup Journal
 * @apiVersion 0.6.0
 *
 * @apiParam {String} jid Unique id of the journal to retrieve
 *
 * @apiSuccess {Object[]} entries List of all entries in the journal.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     [
 *       {
 *         "metadata": {
 *           "title": "Read me !",
 *           "title_set_by_user": "0",
 *           "activity": "org.sugarlabs.Markdown",
 *           "activity_id": "caa97e48-d33c-470a-99e9-495ff02afe01",
 *           "creation_time": ​1423341000747,
 *           "timestamp": ​1423341066909,
 *           "file_size": ​0,
 *           "buddy_name": "Sugarizer server",
 *           "buddy_color": {
 *             "stroke": "#005FE4",
 *             "fill": "#FF2B34"
 *           }
 *         },
 *         "text": "\"# Hello Sugarizer user !\\n\\nWelcome to the Sugarizer server cloud storage. You could put everything that you need to share.\\n\\n\"",
 *         "objectId": "4837240f-bf78-4d22-b936-3db96880f0a0"
 *       },
 *       {
 *         "metadata": {
 *           "title": "Physics JS Activity",
 *           "title_set_by_user": "0",
 *           "activity": "org.olpg-france.physicsjs",
 *           "activity_id": "43708a15-f48e-49b1-85ef-da4c1419b364",
 *           "creation_time": ​1436003632237,
 *           "timestamp": ​1436025389565,
 *           "file_size": ​0,
 *           "buddy_name": "Lionel",
 *           "buddy_color": {
 *             "stroke": "#00A0FF",
 *             "fill": "#F8E800"
 *           }
 *         },
 *         "text": "{\"world\":[{\"type\":\"circle\",\"radius\":67,\"restitution\":0.9,\"styles\":{\"fillStyle\":\"0xe25e36\",\"strokeStyle\":\"0x79231b\",\"lineWidth\":1,\"angleIndicator\":\"0x79231b\"},\"x\":476.38179433624566,\"y\":293.01047102092167},{\"type\":\"convex-polygon\",\"vertices\":[{\"x\":56,\"y\":0},{\"x\":-27.999999999999986,\"y\":48.49742261192857},{\"x\":-28.000000000000025,\"y\":-48.49742261192855}],\"restitution\":0.9,\"styles\":{\"fillStyle\":\"0x268bd2\",\"strokeStyle\":\"0x0d394f\",\"lineWidth\":1,\"angleIndicator\":\"0x0d394f\"},\"x\":48.905310222358665,\"y\":331.98056461712133},{\"type\":\"rectangle\",\"width\":64.5,\"height\":64,\"restitution\":0.9,\"styles\":{\"fillStyle\":\"0x58c73c\",\"strokeStyle\":\"0x30641c\",\"lineWidth\":1,\"angleIndicator\":\"0x30641c\"},\"x\":152.0965437765946,\"y\":328.48676667480015}]}",
 *         "objectId": "2acbcd69-aa14-4273-8a9f-47642b41ad9d"
 *       },
 *       ...
 *     ]
 **/
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

/**
 * @api {get} /Journal/:jid/:oid Get entry
 * @apiName GetEntry
 * @apiDescription Get an entry in a journal.
 * @apiGroup Journal
 * @apiVersion 0.6.0
 *
 * @apiParam {String} jid Unique id of the journal to get
 * @apiParam {String} oid Unique id of the entry to get
 *
 * @apiSuccess {String} objectId Unique id of the entry in the journal
 * @apiSuccess {Object} metadata Metadata of the entries, i.e. characteristics of the entry
 * @apiSuccess {String} metadata.title Title of the entry
 * @apiSuccess {String} metadata.title_set_by_user 0 is the title has been changed by user, 1 if it's the original one (usually activity name)
 * @apiSuccess {String} metadata.activity Activity unique ID used
 * @apiSuccess {String} metadata.activity_id ID of the activity instance
 * @apiSuccess {Number} metadata.creation_time Timestamp, creation time of the entry
 * @apiSuccess {Number} metadata.timestamp Timestamp, last time the instance was updated
 * @apiSuccess {Number} metadata.file_size Here for Sugar compatibility, always set to 0
 * @apiSuccess {String} metadata.name User name of the entry creator
 * @apiSuccess {Object} metadata.color Buddy color of the entry creator
 * @apiSuccess {String} metadata.color.strike Buddy strike color of the entry creator
 * @apiSuccess {String} metadata.color.file Buddy fill color of the entry creator
 * @apiSuccess {String} text Text of the entries, i.e. storage value of the entry. It depends of the entry type
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "metadata": {
 *         "title": "Read me now !",
 *         "title_set_by_user": "0",
 *         "activity": "org.sugarlabs.Markdown",
 *         "activity_id": "caa97e48-d33c-470a-99e9-495ff02afe01",
 *         "creation_time": ​1423341000747,
 *         "timestamp": ​1423341066120,
 *         "file_size": ​0,
 *         "buddy_name": "Lionel",
 *         "buddy_color": {
 *           "stroke": "#005FE4",
 *           "fill": "#FF2B34"
 *         }
 *       },
 *       "text": "\"# Hello Sugarizer user !\\n\\nWelcome to the Sugarizer server cloud storage. You could put everything that you need to share.\\n\\n\"",
 *       "objectId": "4837240f-bf78-4d22-b936-3db96880f0a0"
 *    }
 **/
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

/**
 * @api {post} /Journal/:jid Add entry
 * @apiName AddEntry
 * @apiDescription Add an entry in a journal. Return the entry created. If the entry already exist, update it instead.
 * @apiGroup Journal
 * @apiVersion 0.6.0
 *
 * @apiParam {String} jid Unique id of the journal where the entry will be created
 *
 * @apiSuccess {String} objectId Unique id of the entry in the journal
 * @apiSuccess {Object} metadata Metadata of the entries, i.e. characteristics of the entry
 * @apiSuccess {String} metadata.title Title of the entry
 * @apiSuccess {String} metadata.title_set_by_user 0 is the title has been changed by user, 1 if it's the original one (usually activity name)
 * @apiSuccess {String} metadata.activity Activity unique ID used
 * @apiSuccess {String} metadata.activity_id ID of the activity instance
 * @apiSuccess {Number} metadata.creation_time Timestamp, creation time of the entry
 * @apiSuccess {Number} metadata.timestamp Timestamp, last time the instance was updated
 * @apiSuccess {Number} metadata.file_size Here for Sugar compatibility, always set to 0
 * @apiSuccess {String} metadata.name User name of the entry creator
 * @apiSuccess {Object} metadata.color Buddy color of the entry creator
 * @apiSuccess {String} metadata.color.strike Buddy strike color of the entry creator
 * @apiSuccess {String} metadata.color.file Buddy fill color of the entry creator
 * @apiSuccess {String} text Text of the entries, i.e. storage value of the entry. It depends of the entry type
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "metadata": {
 *         "title": "Read me !",
 *         "title_set_by_user": "0",
 *         "activity": "org.sugarlabs.Markdown",
 *         "activity_id": "caa97e48-d33c-470a-99e9-495ff02afe01",
 *         "creation_time": ​1423341000747,
 *         "timestamp": ​1423341000747,
 *         "file_size": ​0,
 *         "buddy_name": "Lionel",
 *         "buddy_color": {
 *           "stroke": "#005FE4",
 *           "fill": "#FF2B34"
 *         }
 *       },
 *       "text": "\"# Hello World !\\n\"",
 *       "objectId": "4837240f-bf78-4d22-b936-3db96880f0a0"
 *    }
 **/
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

/**
 * @api {put} /Journal/:jid/:oid Update entry
 * @apiName UpdateEntry
 * @apiDescription Update an entry in a journal. Return the entry updated. If the entry don't exist, create a new one instead.
 * @apiGroup Journal
 * @apiVersion 0.6.0
 *
 * @apiParam {String} jid Unique id of the journal to update
 * @apiParam {String} oid Unique id of the entry to update
 *
 * @apiSuccess {String} objectId Unique id of the entry in the journal
 * @apiSuccess {Object} metadata Metadata of the entries, i.e. characteristics of the entry
 * @apiSuccess {String} metadata.title Title of the entry
 * @apiSuccess {String} metadata.title_set_by_user 0 is the title has been changed by user, 1 if it's the original one (usually activity name)
 * @apiSuccess {String} metadata.activity Activity unique ID used
 * @apiSuccess {String} metadata.activity_id ID of the activity instance
 * @apiSuccess {Number} metadata.creation_time Timestamp, creation time of the entry
 * @apiSuccess {Number} metadata.timestamp Timestamp, last time the instance was updated
 * @apiSuccess {Number} metadata.file_size Here for Sugar compatibility, always set to 0
 * @apiSuccess {String} metadata.name User name of the entry creator
 * @apiSuccess {Object} metadata.color Buddy color of the entry creator
 * @apiSuccess {String} metadata.color.strike Buddy strike color of the entry creator
 * @apiSuccess {String} metadata.color.file Buddy fill color of the entry creator
 * @apiSuccess {String} text Text of the entries, i.e. storage value of the entry. It depends of the entry type
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "metadata": {
 *         "title": "Read me now !",
 *         "title_set_by_user": "0",
 *         "activity": "org.sugarlabs.Markdown",
 *         "activity_id": "caa97e48-d33c-470a-99e9-495ff02afe01",
 *         "creation_time": ​1423341000747,
 *         "timestamp": ​1423341066120,
 *         "file_size": ​0,
 *         "buddy_name": "Lionel",
 *         "buddy_color": {
 *           "stroke": "#005FE4",
 *           "fill": "#FF2B34"
 *         }
 *       },
 *       "text": "\"# Hello Sugarizer user !\\n\\nWelcome to the Sugarizer server cloud storage. You could put everything that you need to share.\\n\\n\"",
 *       "objectId": "4837240f-bf78-4d22-b936-3db96880f0a0"
 *    }
 **/
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

/**
 * @api {delete} /Journal/:jid/:oid Remove entry
 * @apiName RemoveEntry
 * @apiDescription Remove an entry in a journal. Return the id of the entry.
 * @apiGroup Journal
 * @apiVersion 0.6.0
 *
 * @apiParam {String} jid Unique id of the journal to update
 * @apiParam {String} oid Unique id of the entry to update
 *
 * @apiSuccess {Object} _pull Container object
 * @apiSuccess {Object} _pull.content Container object
 * @apiSuccess {String} _pull.content.objectId Unique id of the entry removed
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "$pull": {
 *         "content": {
 *           "objectId": "d3c7cfc2-8a02-4ce8-9306-073814a2024e"
 *         }
 *       }
 *     }
 **/
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

/**
 * @api {get} /journal/:jid/field/:field Get journal entries field
 * @apiName GetJournalContentField
 * @apiDescription Retrieve content of a journal. Results include only value for the field you asked an the objectId field.
 * @apiGroup Journal
 * @apiVersion 0.7.0
 *
 * @apiParam {String} jid Unique id of the journal to retrieve
 * @apiParam {String} field Field to retrieve ("metadata" or "text")
 *
 * @apiSuccess {Object[]} entries List of all entries in the journal.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     [
 *       {
 *         "metadata": {
 *           "title": "Read me !",
 *           "title_set_by_user": "0",
 *           "activity": "org.sugarlabs.Markdown",
 *           "activity_id": "caa97e48-d33c-470a-99e9-495ff02afe01",
 *           "creation_time": ​1423341000747,
 *           "timestamp": ​1423341066909,
 *           "file_size": ​0,
 *           "buddy_name": "Sugarizer server",
 *           "buddy_color": {
 *             "stroke": "#005FE4",
 *             "fill": "#FF2B34"
 *           }
 *         },
 *         "objectId": "4837240f-bf78-4d22-b936-3db96880f0a0"
 *       },
 *       {
 *         "metadata": {
 *           "title": "Physics JS Activity",
 *           "title_set_by_user": "0",
 *           "activity": "org.olpg-france.physicsjs",
 *           "activity_id": "43708a15-f48e-49b1-85ef-da4c1419b364",
 *           "creation_time": ​1436003632237,
 *           "timestamp": ​1436025389565,
 *           "file_size": ​0,
 *           "buddy_name": "Lionel",
 *           "buddy_color": {
 *             "stroke": "#00A0FF",
 *             "fill": "#F8E800"
 *           }
 *         },
 *         "objectId": "2acbcd69-aa14-4273-8a9f-47642b41ad9d"
 *       },
 *       ...
 *     ]
 **/
 /**
 * @api {get} /journal/:jid/filter/:aid Get journal entries filtered
 * @apiName GetJournalContentFilter
 * @apiDescription Retrieve content of a journal filtered by activity. Result include both metadata and text.
 * for all activities matching the activity id.
 *
 * **Deprecated**: it's better to use the "api/journal/:jid/filter/:aid/field/:field" to avoid big entries in the result.
 * @apiGroup Journal
 * @apiVersion 0.6.0
 *
 * @apiParam {String} jid Unique id of the journal to retrieve
 * @apiParam {String} aid Activity unique ID used to filter
 *
 * @apiSuccess {Object[]} entries List of all entries in the journal matching the activity ID.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     [
 *       {
 *         "metadata": {
 *           "title": "al-quaknaa's gears",
 *           "title_set_by_user": "1",
 *           "activity": "org.sugarlabs.GearsActivity",
 *           "activity_id": "b0df189a-a2f6-42ee-8f8a-1d24c04b4d92",
 *           "creation_time": ​1431431464843,
 *           "timestamp": ​1431431631314,
 *           "file_size": ​0,
 *           "buddy_name": "alquaknaa-desktop",
 *           "buddy_color": {
 *             "stroke": "#8BFF7A",
 *             "fill": "#00A0FF"
 *           }
 *         },
 *         "text": "{\"gears\":{\"cf1d2b3d-f2d9-4500-ae1f-ff27f3056124\":{\"location\":{\"x\":323.3090909090909,\"y\":314.2},\"rotation\":5.64729061670311,\"numberOfTeeth\":40,\"id\":\"cf1d2b3d-f2d9-4500-ae1f-ff27f3056124\",\"momentum\":0.8956844752899423,\"group\":0,\"level\":0,\"connections\":{\"5c869a7d-8f7b-4a8a-abfc-e81f901ca295\":\"axis\"},\"pitchRadius\":120,\"innerRadius\":112.5,\"outerRadius\":126,\"hue\":359},\"5c869a7d-8f7b-4a8a-abfc-e81f901ca295\":{\"location\":{\"x\":323.3090909090909,\"y\":314.2},\"rotation\":5.64729061670311,\"numberOfTeeth\":9,\"id\":\"5c869a7d-8f7b-4a8a-abfc-e81f901ca295\",\"momentum\":0,\"group\":0,\"level\":1,\"connections\":{\"cf1d2b3d-f2d9-4500-ae1f-ff27f3056124\":\"axis\",\"79c9666f-45a7-4e35-b1df-549d755f1efb\":\"chain_inside\"},\"pitchRadius\":27,\"innerRadius\":19.5,\"outerRadius\":33},\"b6e6da3a-5a99-4aa7-859a-5d1a21b588fc\":{\"location\":{\"x\":710.4202898550725,\"y\":272.72463768115944},\"rotation\":4.23546796252743,\"numberOfTeeth\":12,\"id\":\"b6e6da3a-5a99-4aa7-859a-5d1a21b588fc\",\"momentum\":0,\"group\":0,\"level\":1,\"connections\":{\"be1b5178-4b39-4e19-9ddd-0da6978c903f\":\"axis\",\"79c9666f-45a7-4e35-b1df-549d755f1efb\":\"chain_inside\"},\"pitchRadius\":36,\"innerRadius\":28.5,\"outerRadius\":42},\"be1b5178-4b39-4e19-9ddd-0da6978c903f\":{\"location\":{\"x\":710.4202898550725,\"y\":272.72463768115944},\"rotation\":4.23546796252743,\"numberOfTeeth\":47,\"id\":\"be1b5178-4b39-4e19-9ddd-0da6978c903f\",\"momentum\":0,\"group\":0,\"level\":0,\"connections\":{\"b6e6da3a-5a99-4aa7-859a-5d1a21b588fc\":\"axis\",\"0ff13b7a-c62f-4c47-8234-fc07902acd5d\":\"meshing\"},\"pitchRadius\":141,\"innerRadius\":133.5,\"outerRadius\":147,\"hue\":70},\"0ff13b7a-c62f-4c47-8234-fc07902acd5d\":{\"location\":{\"x\":884.4202738525415,\"y\":272.6500127489192},\"rotation\":0.8930947497056128,\"numberOfTeeth\":11,\"id\":\"0ff13b7a-c62f-4c47-8234-fc07902acd5d\",\"momentum\":0,\"group\":0,\"level\":0,\"connections\":{\"be1b5178-4b39-4e19-9ddd-0da6978c903f\":\"meshing\"},\"pitchRadius\":33,\"innerRadius\":25.5,\"outerRadius\":39}},\"chains\":{\"79c9666f-45a7-4e35-b1df-549d755f1efb\":{\"id\":\"79c9666f-45a7-4e35-b1df-549d755f1efb\",\"group\":0,\"level\":1,\"connections\":{\"b6e6da3a-5a99-4aa7-859a-5d1a21b588fc\":\"chain_inside\",\"5c869a7d-8f7b-4a8a-abfc-e81f901ca295\":\"chain_inside\"},\"points\":[{\"x\":705.7587286546609,\"y\":237.0277211872264},{\"x\":319.8129200087822,\"y\":287.4273126295502},{\"x\":325.5640565468745,\"y\":341.1056709630593},{\"x\":713.4269107054506,\"y\":308.5988656319052}],\"rotation\":0.9808129796500076,\"ignoredGearIds\":{\"cf1d2b3d-f2d9-4500-ae1f-ff27f3056124\":true,\"be1b5178-4b39-4e19-9ddd-0da6978c903f\":true,\"0ff13b7a-c62f-4c47-8234-fc07902acd5d\":true},\"innerGearIds\":{\"5c869a7d-8f7b-4a8a-abfc-e81f901ca295\":true,\"b6e6da3a-5a99-4aa7-859a-5d1a21b588fc\":true},\"direction\":\"counterclockwise\",\"supportingGearIds\":[\"b6e6da3a-5a99-4aa7-859a-5d1a21b588fc\",\"5c869a7d-8f7b-4a8a-abfc-e81f901ca295\"],\"segments\":[{\"start\":{\"x\":705.7587286546609,\"y\":237.0277211872264},\"end\":{\"x\":319.8129200087822,\"y\":287.4273126295502}},{\"center\":{\"x\":323.3090909090909,\"y\":314.2},\"radius\":27,\"startAngle\":-1.700648751452407,\"endAngle\":1.4871816843181391,\"direction\":\"counterclockwise\",\"start\":{\"x\":319.8129200087822,\"y\":287.42731262955033},\"end\":{\"x\":325.5640565468745,\"y\":341.10567096305937}},{\"start\":{\"x\":325.5640565468745,\"y\":341.1056709630593},\"end\":{\"x\":713.4269107054506,\"y\":308.5988656319052}},{\"center\":{\"x\":710.4202898550725,\"y\":272.72463768115944},\"radius\":36,\"startAngle\":1.4871816843181391,\"endAngle\":-1.700648751452407,\"direction\":\"counterclockwise\",\"start\":{\"x\":713.4269107054506,\"y\":308.59886563190526},\"end\":{\"x\":705.7587286546609,\"y\":237.02772118722655}}]}}}",
 *         "objectId": "859c131a-e7b9-440f-8b87-9cd0f7bbc2b4"
 *       },
 *       {
 *         "metadata": {
 *           "title": "Gears Activity",
 *           "title_set_by_user": "1",
 *           "activity": "org.sugarlabs.GearsActivity",
 *           "activity_id": "a4de29cb-34a9-4ebc-96ed-86e062c71713",
 *           "creation_time": ​1423341077660,
 *           "timestamp": ​1423341150632,
 *           "file_size": ​0,
 *           "buddy_name": "Sugarizer server",
 *           "buddy_color": {
 *             "stroke": "#005FE4",
 *             "fill": "#FF2B34"
 *           }
 *         },
 *         "text": "{\"gears\":{\"3215b8de-a944-4b78-a20e-ed3f4c52e458\":{\"location\":{\"x\":280.825,\"y\":179.7},\"rotation\":1.3043965283746033,\"numberOfTeeth\":32,\"id\":\"3215b8de-a944-4b78-a20e-ed3f4c52e458\",\"momentum\":0,\"group\":0,\"level\":0,\"connections\":{\"93e76628-4b3d-4d74-b693-cea1c42a7442\":\"axis\",\"5a222cd5-5d63-4261-97ba-3072b4a25ed3\":\"meshing\"},\"pitchRadius\":96,\"innerRadius\":88.5,\"outerRadius\":102,\"hue\":251},\"93e76628-4b3d-4d74-b693-cea1c42a7442\":{\"location\":{\"x\":280.825,\"y\":179.7},\"rotation\":1.3043965283746033,\"numberOfTeeth\":20,\"id\":\"93e76628-4b3d-4d74-b693-cea1c42a7442\",\"momentum\":0,\"group\":0,\"level\":1,\"connections\":{\"3215b8de-a944-4b78-a20e-ed3f4c52e458\":\"axis\",\"93cb4289-1ca0-4f06-9d1c-194f51e0a9ab\":\"chain_inside\"},\"pitchRadius\":60,\"innerRadius\":52.5,\"outerRadius\":66,\"hue\":112},\"13422b73-59c4-40ce-b972-481f133b686d\":{\"location\":{\"x\":674.6969696969697,\"y\":252.65151515151513},\"rotation\":0.9858953770180756,\"numberOfTeeth\":21,\"id\":\"13422b73-59c4-40ce-b972-481f133b686d\",\"momentum\":1.200376813091941,\"group\":0,\"level\":1,\"connections\":{\"e38a47b7-60fc-41d8-b966-8a31d834f624\":\"axis\",\"93cb4289-1ca0-4f06-9d1c-194f51e0a9ab\":\"chain_inside\"},\"pitchRadius\":63,\"innerRadius\":55.5,\"outerRadius\":69,\"hue\":78},\"e38a47b7-60fc-41d8-b966-8a31d834f624\":{\"location\":{\"x\":674.6969696969697,\"y\":252.65151515151513},\"rotation\":0.9858953770180756,\"numberOfTeeth\":58,\"id\":\"e38a47b7-60fc-41d8-b966-8a31d834f624\",\"momentum\":0,\"group\":0,\"level\":0,\"connections\":{\"13422b73-59c4-40ce-b972-481f133b686d\":\"axis\"},\"pitchRadius\":174,\"innerRadius\":166.5,\"outerRadius\":180,\"hue\":299},\"5a222cd5-5d63-4261-97ba-3072b4a25ed3\":{\"location\":{\"x\":222.72064718177452,\"y\":346.89116060239303},\"rotation\":3.839149413050695,\"numberOfTeeth\":27,\"id\":\"5a222cd5-5d63-4261-97ba-3072b4a25ed3\",\"momentum\":0,\"group\":0,\"level\":0,\"connections\":{\"3215b8de-a944-4b78-a20e-ed3f4c52e458\":\"meshing\",\"5697e6af-e2f9-44ab-88bb-d83586ee8d64\":\"meshing\"},\"pitchRadius\":81,\"innerRadius\":73.5,\"outerRadius\":87,\"hue\":204},\"5697e6af-e2f9-44ab-88bb-d83586ee8d64\":{\"location\":{\"x\":334.5179219374951,\"y\":455.6908359566602},\"rotation\":3.302446641600337,\"numberOfTeeth\":25,\"id\":\"5697e6af-e2f9-44ab-88bb-d83586ee8d64\",\"momentum\":0,\"group\":0,\"level\":0,\"connections\":{\"5a222cd5-5d63-4261-97ba-3072b4a25ed3\":\"meshing\"},\"pitchRadius\":75,\"innerRadius\":67.5,\"outerRadius\":81,\"hue\":128}},\"chains\":{\"93cb4289-1ca0-4f06-9d1c-194f51e0a9ab\":{\"id\":\"93cb4289-1ca0-4f06-9d1c-194f51e0a9ab\",\"group\":0,\"level\":1,\"connections\":{\"13422b73-59c4-40ce-b972-481f133b686d\":\"chain_inside\",\"93e76628-4b3d-4d74-b693-cea1c42a7442\":\"chain_inside\"},\"points\":[{\"x\":685.7061998043916,\"y\":190.62090293108156},{\"x\":291.3099810546875,\"y\":120.62322645672992},{\"x\":269.45633133385417,\"y\":238.61310017949648},{\"x\":662.7598675975166,\"y\":314.51027033998645}],\"rotation\":2.4086381796146483,\"ignoredGearIds\":{\"3215b8de-a944-4b78-a20e-ed3f4c52e458\":true,\"e38a47b7-60fc-41d8-b966-8a31d834f624\":true,\"5a222cd5-5d63-4261-97ba-3072b4a25ed3\":true,\"5697e6af-e2f9-44ab-88bb-d83586ee8d64\":true},\"innerGearIds\":{\"93e76628-4b3d-4d74-b693-cea1c42a7442\":true,\"13422b73-59c4-40ce-b972-481f133b686d\":true},\"direction\":\"counterclockwise\",\"supportingGearIds\":[\"13422b73-59c4-40ce-b972-481f133b686d\",\"93e76628-4b3d-4d74-b693-cea1c42a7442\"],\"segments\":[{\"start\":{\"x\":685.7061998043916,\"y\":190.62090293108156},\"end\":{\"x\":291.3099810546875,\"y\":120.62322645672992}},{\"center\":{\"x\":280.825,\"y\":179.7},\"radius\":60,\"startAngle\":-1.3951447919519864,\"endAngle\":1.7614266231409736,\"direction\":\"counterclockwise\",\"start\":{\"x\":291.30998105468757,\"y\":120.62322645672967},\"end\":{\"x\":269.45633133385417,\"y\":238.6131001794965}},{\"start\":{\"x\":269.45633133385417,\"y\":238.61310017949648},\"end\":{\"x\":662.7598675975166,\"y\":314.51027033998645}},{\"center\":{\"x\":674.6969696969697,\"y\":252.65151515151513},\"radius\":63,\"startAngle\":1.7614266231409736,\"endAngle\":-1.3951447919519864,\"direction\":\"counterclockwise\",\"start\":{\"x\":662.7598675975166,\"y\":314.5102703399865},\"end\":{\"x\":685.7061998043916,\"y\":190.6209029310813}}]}}}",
 *         "objectId": "453ae0ab-5f85-4e3b-8543-b63a7546107c"
 *       }
 *     ]
 **/
  /**
 * @api {get} /journal/:jid/filter/:aid/field/:field Get journal entries filtered field
 * @apiName GetJournalContentFilterField
 * @apiDescription Retrieve content of a journal filtered by activity. Results include only value for the field you asked an the objectId field
 * for all activities matching the activity id.
 * @apiGroup Journal
 * @apiVersion 0.7.0
 *
 * @apiParam {String} jid Unique id of the journal to retrieve
 * @apiParam {String} aid Activity unique ID used to filter
 * @apiParam {String} field Field to retrieve ("metadata" or "text")
 *
 * @apiSuccess {Object[]} entries List of all entries in the journal matching the activity ID.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     [
 *       {
 *         "metadata": {
 *           "title": "al-quaknaa's gears",
 *           "title_set_by_user": "1",
 *           "activity": "org.sugarlabs.GearsActivity",
 *           "activity_id": "b0df189a-a2f6-42ee-8f8a-1d24c04b4d92",
 *           "creation_time": ​1431431464843,
 *           "timestamp": ​1431431631314,
 *           "file_size": ​0,
 *           "buddy_name": "alquaknaa-desktop",
 *           "buddy_color": {
 *             "stroke": "#8BFF7A",
 *             "fill": "#00A0FF"
 *           }
 *         },
 *         "objectId": "859c131a-e7b9-440f-8b87-9cd0f7bbc2b4"
 *       },
 *       {
 *         "metadata": {
 *           "title": "Gears Activity",
 *           "title_set_by_user": "1",
 *           "activity": "org.sugarlabs.GearsActivity",
 *           "activity_id": "a4de29cb-34a9-4ebc-96ed-86e062c71713",
 *           "creation_time": ​1423341077660,
 *           "timestamp": ​1423341150632,
 *           "file_size": ​0,
 *           "buddy_name": "Sugarizer server",
 *           "buddy_color": {
 *             "stroke": "#005FE4",
 *             "fill": "#FF2B34"
 *           }
 *         },
 *         "objectId": "453ae0ab-5f85-4e3b-8543-b63a7546107c"
 *       }
 *     ]
 **/