
// Unit testing on mongodb
var mongo = require('mongodb'),
	assert = require('assert'),
	settings = require('../settings');

var Server = mongo.Server,
	Db = mongo.Db;

// Load settings
settings.load(function(settings) {

		describe('Database', function() {

				// connect to db
				var server = new Server(settings.database.server, settings.database.port, {auto_reconnect: true});
				var db = new Db(settings.database.name, server, {w:1});

				describe('#connect()', function() {
						it('should connect to MongoDB', function(done) {
								db.open(function(err, db) {
										assert.notEqual(null, db);
										done();
								});
						});
				});
		});

		run();
}, "test.ini");
