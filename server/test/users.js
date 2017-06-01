
// Unit testing on users

var assert = require('assert'),
    users = require('../routes/users'),
	journal = require('../routes/journal'),
	settings = require('../settings');

// Load settings
settings.load(function(ini) {
	// Connect to MongoDB
	users.init(ini, function() {

		// HACK: Dummy request to match Express interface
		var res = {send: function(value) {
			this.value = value;
			if (this.done) this.done();
		}};

		describe('Users', function() {
			// First count number of users in database
			var initCount = 0;
			res.done = function() {
				initCount = res.value.length;
			}
			users.findAll(null, res);

			// Start test
			this.timeout(2000);

			describe('#findAll()', function() {
				it('should return all users', function(done) {
					res.done = function() {
						assert.equal(initCount, this.value.length);
						done();
					}
					users.findAll(null, res);
				});
			});

			var newUser = null;
			describe('#addUser()', function() {
				it('should create a user', function(done) {
					res.done = function() {
						var user = res.value;
						assert.equal("Sugarizer", user.name);
						assert.equal("fr", user.language);
						assert.equal("#FF0000", user.color.stroke);
						assert.equal("#0000FF", user.color.fill);
						assert.notEqual(undefined, user.private_journal);
						assert.notEqual(undefined, user.shared_journal);
						assert.notEqual(undefined, user._id);
						newUser = user;
						done();
					}
					users.addUser({body: {user: '{"name":"Sugarizer","color":{"stroke":"#FF0000","fill":"#0000FF"},"language":"fr"}'}}, res);
				});

				it('should add a new user', function(done) {
					res.done = function() {
						assert.equal(initCount+1, this.value.length);
						done();
					}
					users.findAll(null, res);
				});
			});

			describe('#findById()', function() {
				it('should return nothing on inexisting user', function(done) {
					res.done = function() {
						assert.equal(undefined, this.value);
						done();
					}
					users.findById({params: {uid: 'ffffffffffffffffffffffff'}}, res);
				});

				it('should return right user on existing uid', function(done) {
					res.done = function() {
						var user = this.value;
						assert.equal(newUser.name, user.name);
						assert.equal(newUser.language, user.language);
						assert.equal(newUser.color.stroke, user.color.stroke);
						assert.equal(newUser.color.fill, user.color.fill);
						assert.equal(newUser.private_journal.toString(), user.private_journal.toString());
						assert.equal(newUser.shared_journal.toString(), user.shared_journal.toString());
						assert.equal(newUser._id.toString(), user._id.toString());
						done();
					}
					users.findById({params: {uid: newUser._id.toString()}}, res);
				});
			});

			describe('#updateUser()', function() {
				it('should do nothing on invalid user', function(done) {
					res.done = function() {
						assert.equal(undefined, this.value);
						done();
					}
					users.updateUser({params: {uid: 'xxx'}, body: {user: '{"color":{"fill":"#00FF00"},"language":"en","version":7}'}}, res);
				});

				it('should not update an inexisting user', function(done) {
					res.done = function() {
						var user = res.value;
						assert.equal("en", user.language);
						assert.equal(7, user.version);
						assert.equal("#00FF00", user.color.fill);
						done();
					}
					users.updateUser({params: {uid: 'ffffffffffffffffffffffff'}, body: {user: '{"color":{"fill":"#00FF00"},"language":"en","version":7}'}}, res);
				});

				it('should update the user', function(done) {
					res.done = function() {
						var user = res.value;
						assert.equal("en", user.language);
						assert.equal(7, user.version);
						assert.equal("#00FF00", user.color.fill);
						done();
					}
					users.updateUser({params: {uid: newUser._id.toString()}, body: {user: '{"color":{"fill":"#00FF00"},"language":"en","version":7}'}}, res);
				});

				it('should preserve user fields', function(done) {
					res.done = function() {
						var user = res.value;
						assert.equal("Sugarizer", user.name);
						assert.equal("en", user.language);
						assert.equal(7, user.version);
						assert.equal(undefined, user.color.stroke);
						assert.equal("#00FF00", user.color.fill);
						assert.equal(newUser.private_journal.toString(), user.private_journal.toString());
						assert.equal(newUser.shared_journal.toString(), user.shared_journal.toString());
						assert.equal(newUser._id.toString(), user._id.toString());
						done();
					}
					users.findById({params: {uid: newUser._id.toString()}}, res);
				});
			});

			describe('#removeUser()', function() {
				it('should do nothing on invalid user', function(done) {
					res.done = function() {
						assert.equal(undefined, this.value);
						done();
					}
					users.removeUser({params: {uid: 'xxx'}}, res);
				});

				it('should not remove an inexisting user', function(done) {
					res.done = function() {
						assert.equal('ffffffffffffffffffffffff',res.value.toString());
						done();
					}
					users.removeUser({params: {uid: 'ffffffffffffffffffffffff'}}, res);
				});

				it('should remove the user', function(done) {
					res.done = function() {
						assert.equal(newUser._id.toString(), res.value.toString());
						done();
					}
					users.removeUser({params: {uid: newUser._id.toString()}}, res);
				});

        it('should return nothing on removed user', function(done) {
          res.done = function() {
						var user = this.value;
						assert.equal(null, user);
						done();
					}
					users.findById({params: {uid: newUser._id.toString()}}, res);
				});

				it('should remove only one user', function(done) {
					res.done = function() {
						assert.equal(initCount, this.value.length);
						done();
					}
					users.findAll(null, res);
				});
			});

			after(function() {
				res.done = null;
				journal.removeJournal({params: {jid: newUser.private_journal.toString()}}, res);
			});
		});

		run();
	});
}, "test.ini");
