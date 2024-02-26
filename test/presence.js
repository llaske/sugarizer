
// Unit testing on presence

describe('Presence', function() {

	var testPresenceServerUrl = "http://localhost";
	var testPresenceServerPort = 8039;
	var networkId = "9446effc-a186-4199-8730-9f2be39a11d2";
	var activityName = "sugarizer.mocha.activity";
	var sharedId = null;
	var sharedId2 = null;

	describe('#joinNetwork()', function() {
		this.timeout(5000);
		it("not indicate connected before connection", function() {
			chai.assert.isFalse(presence.isConnected());
		});

		it("should fail when server don't exist", function(done) {
			initSugarizer({name: "mocha1", server: {url: "http://xxxxx", presence: 8888}, networkId: networkId});
			presence.joinNetwork(function(error, presence) {
				chai.assert.isNotNull(error);
				done();
			});
		});

		it("should connect user", function(done) {
			initSugarizer({name: "mocha1", server: {url: testPresenceServerUrl, presence: testPresenceServerPort}, networkId: networkId});
			presence.joinNetwork(function(error, presence) {
				chai.assert.isNull(error);
				chai.assert.isNotNull(presence);
				done();
			});
		});
	});

	describe('#isConnected()', function() {
		it("should indicate connected", function() {
			chai.assert.isTrue(presence.isConnected());
		});
	});

	describe('#listUsers()', function() {
		it("should list user as connected", function(done) {
			presence.listUsers(function(users) {
				chai.assert.equal(1, users.length);
				chai.assert.equal("mocha1", users[0].name);
				chai.assert.equal(networkId, users[0].networkId);
				chai.assert.deepEqual({ stroke: '#AC32FF', fill: '#FF8F00' }, users[0].colorvalue);
				done();
			});
		});
	});

	describe('#getUserInfo()', function() {
		it("should retrieve user information", function() {
			var userInfo = presence.getUserInfo();
			chai.assert.equal("mocha1", userInfo.name);
			chai.assert.equal(networkId, userInfo.networkId);
			chai.assert.deepEqual({ stroke: '#AC32FF', fill: '#FF8F00' }, userInfo.colorvalue);
		});
	});

	describe('#createSharedActivity()', function() {
		it("should not contain shared activity at first", function(done) {
			presence.listSharedActivities(function(activities) {
				chai.assert.equal(0, activities.length);
				done();
			});
		});

		it("should create a shared activity at first", function(done) {
			presence.createSharedActivity(activityName, function(id) {
				sharedId = id;
				chai.assert.isNotNull(sharedId);
				chai.assert.equal(36, sharedId.length);
				done();
			});
		});

		it("should list one shared activity", function(done) {
			presence.listSharedActivities(function(activities) {
				chai.assert.equal(1, activities.length);
				done();
			});
		});

		it("should create a another shared activity", function(done) {
			presence.createSharedActivity(activityName, function(id) {
				sharedId2 = id;
				chai.assert.isNotNull(sharedId2);
				chai.assert.equal(36, sharedId2.length);
				chai.assert.notEqual(sharedId, sharedId2);
				done();
			});
		});

		it("should list two shared activity", function(done) {
			presence.listSharedActivities(function(activities) {
				chai.assert.equal(2, activities.length);
				done();
			});
		});
	});

	describe('#listSharedActivities()', function() {
		it("should list shared activity and details", function(done) {
			presence.listSharedActivities(function(activities) {
				chai.assert.equal(2, activities.length);
				chai.assert.equal(activityName, activities[0].activityId);
				chai.assert.equal(sharedId, activities[0].id);
				chai.assert.deepEqual({ stroke: '#AC32FF', fill: '#FF8F00' }, activities[0].colorvalue);
				chai.assert.equal(1, activities[0].users.length);
				chai.assert.equal(networkId, activities[0].users[0]);
				chai.assert.equal(activityName, activities[1].activityId);
				chai.assert.equal(sharedId2, activities[1].id);
				chai.assert.deepEqual({ stroke: '#AC32FF', fill: '#FF8F00' }, activities[1].colorvalue);
				chai.assert.equal(1, activities[1].users.length);
				chai.assert.equal(networkId, activities[1].users[0]);
				done();
			});
		});
	});

	describe('#listSharedActivityUsers()', function() {
		it("should list user connected on first activity", function(done) {
			presence.listSharedActivityUsers(sharedId, function(users) {
				chai.assert.equal(1, users.length);
				chai.assert.equal("mocha1", users[0].name);
				chai.assert.equal(networkId, users[0].networkId);
				chai.assert.deepEqual({ stroke: '#AC32FF', fill: '#FF8F00' }, users[0].colorvalue);
				done();
			});
		});

		it("should list user connected on second activity", function(done) {
			presence.listSharedActivityUsers(sharedId2, function(users) {
				chai.assert.equal(1, users.length);
				chai.assert.equal("mocha1", users[0].name);
				chai.assert.equal(networkId, users[0].networkId);
				chai.assert.deepEqual({ stroke: '#AC32FF', fill: '#FF8F00' }, users[0].colorvalue);
				done();
			});
		});
	});

	describe('#sendMessage()', function() {
		it("should not receive message to other shared group", function(done) {
			presence.onDataReceived(function(data) {
				chai.assert.fail();
				done();
			});
			presence.sendMessage("ffffffff-ffff-ffff-ffff-ffffffffffff", "Hello!");
			done();
		});

		it("should receive message sent", function(done) {
			presence.onDataReceived(function(data) {
				chai.assert.equal("Hello!", data);
				done();
			});
			presence.sendMessage(sharedId, "Hello!");
		});

		it("should receive message sent to other group", function(done) {
			presence.onDataReceived(function(data) {
				chai.assert.equal("World!", data);
				done();
			});
			presence.sendMessage(sharedId2, "World!");
		});
	});

	describe('#leaveSharedActivity()', function() {
		it("should leave activity", function(done) {
			presence.onSharedActivityUserChanged(function() {

				done();
			});
			presence.leaveSharedActivity(sharedId2, function() {
			});
		});

		it("should list one leaving shared activity", function(done) {
			presence.listSharedActivities(function(activities) {
				chai.assert.equal(1, activities.length);
				chai.assert.equal(activityName, activities[0].activityId);
				chai.assert.equal(sharedId, activities[0].id);
				chai.assert.deepEqual({ stroke: '#AC32FF', fill: '#FF8F00' }, activities[0].colorvalue);
				chai.assert.equal(1, activities[0].users.length);
				chai.assert.equal(networkId, activities[0].users[0]);
				done();
			});
		});

		it("should not receive message when left shared group", function(done) {
			presence.onDataReceived(function(data) {
				chai.assert.fail();
				done();
			});
			presence.sendMessage(sharedId2, "Hello!");
			done();
		});

		it("should leave second activity", function(done) {
			presence.onSharedActivityUserChanged(function(moves) {
				chai.assert.equal(-1, moves.move);
				chai.assert.equal("mocha1", moves.user.name);
				chai.assert.equal(networkId, moves.user.networkId);
				chai.assert.deepEqual({ stroke: '#AC32FF', fill: '#FF8F00' }, moves.user.colorvalue);
				done();
			});
			presence.leaveSharedActivity(sharedId, function() {
			});
		});

		it("should list no shared activity", function(done) {
			presence.listSharedActivities(function(activities) {
				chai.assert.equal(0, activities.length);
				done();
			});
		});
	});

	describe('#leaveNetwork()', function() {
		it("should disconnect", function() {
			presence.onConnectionClosed(function() {
				chai.assert.isTrue(true);
			});
			presence.leaveNetwork();
		});

		it("should do nothing when disconnected", function() {
			presence.onConnectionClosed(function() {
				chai.assert.isFalse(false);
			});
			presence.leaveNetwork();
			chai.assert.isFalse(presence.isConnected());
		});
	});
});
