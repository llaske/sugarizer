
// Unit testing on users

var assert = require('assert'),
    mongo = require('mongodb'),
    users = require('../routes/users');
var BSON = mongo.BSONPure;

// Dummy request
var res = {send: function(value) {
	this.value = value;
	if (this.done) this.done();
}};

// Connect to MongoDB
var settings = {
	database: {	server: "localhost", port: "27018",	name: "sugarizer"},
	collections: { users: "users" }
};
users.init(settings, function() {

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
			
			it('should return right user on inexisting uid', function(done) {
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
				//users.findById({params: {uid: newUser._id.getTimestamp()}}, res);
			});
		});		
	});
});