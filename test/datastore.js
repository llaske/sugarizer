
// Unit testing on datastore

describe('Datastore', function() {

	before(function() {
		initSugarizer();
	});

	var objectIds = [];
	describe('#create()', function() {
		it('should create one entry', function(done) {
			var results = datastore.create({name: "entry", activity: "test"}, function(err, oid) {
				objectIds.push(oid);
				chai.assert.equal(null, err);
				chai.assert.notEqual(null, oid);
				chai.assert.equal(36, oid.length);

				var results = datastore.find();
				chai.assert.equal(1, results.length);
				chai.assert.equal("entry", results[0].metadata.name);
				chai.assert.equal("test", results[0].metadata.activity);
				chai.assert.isNotNull(results[0].text);

				var results = datastore.find("test");
				chai.assert.equal(1, results.length);
				chai.assert.equal("entry", results[0].metadata.name);
				chai.assert.equal("test", results[0].metadata.activity);
				chai.assert.isNotNull(results[0].text);

				var entry = new datastore.DatastoreObject(objectIds[0]);
				entry.loadAsText(function(err, metadata, text) {
					chai.assert.equal("100", text.value);
					done();
				});
			}, {value: "100"});
		});

		it('should set text to null if undefined', function() {
			var results = datastore.create({name: "entry2", activity: "test2"}, function(err, oid) {
				objectIds.push(oid);
				chai.assert.equal(null, err);
				chai.assert.notEqual(null, oid);
				chai.assert.equal(36, oid.length);
			});

			var results = datastore.find("test2");
			chai.assert.equal(1, results.length);
			chai.assert.equal("entry2", results[0].metadata.name);
			chai.assert.equal("test2", results[0].metadata.activity);
			chai.assert.isNull(results[0].text);
		});
	});

	describe('#find()', function() {
		it('should return all object created', function() {
			var results = datastore.find();
			chai.assert.equal(objectIds.length, results.length);
		});

		it('should allow find specific activity', function() {
			var results = datastore.find("test");
			chai.assert.equal(1, results.length);
		});

		it('should return empty on inexisting activity', function() {
			var results = datastore.find("xxxx");
			chai.assert.equal(0, results.length);
		});
	});

	describe('#getMetadata()', function() {
		it('should get entry', function(done) {
			var entry = new datastore.DatastoreObject(objectIds[0]);
			entry.getMetadata(function(err, metadata) {
				chai.assert.equal("entry", metadata.name);
				chai.assert.equal("test", metadata.activity);
				done();
			});
		});

		it('should get empty element on inexisting entry', function(done) {
			var entry = new datastore.DatastoreObject("ffffffff-ffff-ffff-ffff-ffffffffffff");
			entry.getMetadata(function() {
				chai.assert.fail();
			});
			chai.assert.equal("ffffffff-ffff-ffff-ffff-ffffffffffff", entry.objectId);
			chai.assert.deepEqual({}, entry.newMetadata);
			done();
		});

		it('should get empty element on undefined id', function(done) {
			var entry = new datastore.DatastoreObject();
			entry.getMetadata(function() {
				chai.assert.fail();
			});
			chai.assert.equal(undefined, entry.objectId);
			chai.assert.deepEqual({}, entry.newMetadata);
			chai.assert.isNull(entry.newDataAsText);
			done();
		});
	});

	describe('#save()', function() {
		it('should update metadata on existing object', function(done) {
			var entry = new datastore.DatastoreObject(objectIds[0]);
			entry.getMetadata(function(err, metadata) {
				chai.assert.equal(objectIds[0], entry.objectId);
				chai.assert.equal("entry", metadata.name);
				chai.assert.equal("test", metadata.activity);
				var timeBefore = new Date().getTime();
				entry.save(function(err, metasaved) {
					var timeAfter = new Date().getTime();
					chai.assert.equal("entry", metasaved.name);
					chai.assert.equal("test", metasaved.activity);
					chai.assert.ok(metasaved.timestamp >= timeBefore);
					chai.assert.ok(metasaved.timestamp <= timeAfter);
					chai.assert.deepEqual({ stroke: '#AC32FF', fill: '#FF8F00' }, metasaved.buddy_color);
					chai.assert.equal("Mocha", metasaved.buddy_name);
					done();
				});
			});
		});

		it('should update text on existing object', function(done) {
			var entry = new datastore.DatastoreObject(objectIds[0]);
			entry.loadAsText(function(err, metadata, text) {
				chai.assert.equal(objectIds[0], entry.objectId);
				chai.assert.equal("entry", metadata.name);
				chai.assert.equal("test", metadata.activity);
				chai.assert.equal("100", text.value);
				entry.setDataAsText({value: "200"});
				var timeBefore = new Date().getTime();
				entry.save(function(err, metasaved, textsaved) {
					var timeAfter = new Date().getTime();
					chai.assert.equal("entry", metasaved.name);
					chai.assert.equal("test", metasaved.activity);
					chai.assert.ok(metasaved.timestamp >= timeBefore);
					chai.assert.ok(metasaved.timestamp <= timeAfter);
					chai.assert.deepEqual({ stroke: '#AC32FF', fill: '#FF8F00' }, metasaved.buddy_color);
					chai.assert.equal("Mocha", metasaved.buddy_name);
					chai.assert.equal("200", textsaved.value);
					done();
				});
			});
		});

		it('should create metadata for new object', function(done) {
			var entry = new datastore.DatastoreObject();
			var timeBefore = new Date().getTime();
			entry.save(function(err, metadata, text) {
				var timeAfter = new Date().getTime();
				chai.assert.isNotNull(entry.objectId);
				chai.assert.equal(36, entry.objectId.length);
				chai.assert.ok(metadata.timestamp >= timeBefore);
				chai.assert.ok(metadata.timestamp <= timeAfter);
				chai.assert.ok(metadata.creation_time >= timeBefore);
				chai.assert.ok(metadata.creation_time <= timeAfter);
				chai.assert.deepEqual({ stroke: '#AC32FF', fill: '#FF8F00' }, metadata.buddy_color);
				chai.assert.equal("Mocha", metadata.buddy_name);
				chai.assert.equal("0", metadata.file_size);
				chai.assert.isNull(text);
				objectIds.push(entry.objectId);
				done();
			});
		});
	});

	describe('#loadAsText()', function() {
		it('should get text entry', function(done) {
			var entry = new datastore.DatastoreObject(objectIds[0]);
			entry.loadAsText(function(err, metadata, text) {
				chai.assert.equal("200", text.value);
				done();
			});
		});

		it('should get null on free text entry', function(done) {
			var entry = new datastore.DatastoreObject(objectIds[1]);
			entry.loadAsText(function(err, metadata, text) {
				chai.assert.equal(objectIds[1], entry.objectId);
				chai.assert.isNull(text);
				done();
			});
		});

		it('should do nothing on undefined id', function(done) {
			var entry = new datastore.DatastoreObject();
			entry.loadAsText(function() {
				chai.assert.fail();
			});
			chai.assert.equal(undefined, entry.objectId);
			chai.assert.deepEqual({}, entry.newMetadata);
			chai.assert.isNull(entry.newDataAsText);
			done();
		});
	});

	describe('#setMetadata()', function() {
		it('should not change data when nothing change', function(done) {
			var entry = new datastore.DatastoreObject(objectIds[0]);
			entry.getMetadata(function() {
				entry.setMetadata();
				entry.save(function(err, metadata, text) {
					chai.assert.equal(objectIds[0], entry.objectId);
					chai.assert.equal("entry", metadata.name);
					chai.assert.equal("test", metadata.activity);
					done();
				});
			});
		});

		it('should change/update metadata', function(done) {
			var entry = new datastore.DatastoreObject(objectIds[0]);
			entry.getMetadata(function() {
				entry.setMetadata({
					name: "updatedentry",
					width: "100px"
				});
				entry.save(function(err, metadata) {
					chai.assert.equal(objectIds[0], entry.objectId);
					chai.assert.equal("updatedentry", metadata.name);
					chai.assert.equal("test", metadata.activity);
					chai.assert.equal("100px", metadata.width);
					done();
				});
			});
		});

		it('should update entry - double check', function(done) {
			var entry = new datastore.DatastoreObject(objectIds[0]);
			entry.getMetadata(function(err, metadata) {
				chai.assert.equal("updatedentry", metadata.name);
				chai.assert.equal("test", metadata.activity);
				chai.assert.equal("100px", metadata.width);
				done();
			});
		});
	});

	describe('#setDataAsText()', function() {
		it('should remove text when undefined', function(done) {
			var entry = new datastore.DatastoreObject(objectIds[0]);
			entry.loadAsText(function() {
				entry.setDataAsText();
				entry.save(function(err, metadata, text) {
					chai.assert.equal(objectIds[0], entry.objectId);
					chai.assert.equal(undefined, text);
					done();
				});
			});
		});

		it('should update text', function(done) {
			var entry = new datastore.DatastoreObject(objectIds[0]);
			entry.loadAsText(function() {
				entry.setDataAsText({newvalue: "200"});
				entry.save(function(err, metadata, text) {
					chai.assert.equal(objectIds[0], entry.objectId);
					chai.assert.equal("200",text.newvalue);
					done();
				});
			});
		});

		it('should update entry - double check', function(done) {
			var entry = new datastore.DatastoreObject(objectIds[0]);
			entry.loadAsText(function(err, metadata, text) {
				chai.assert.equal("200", text.newvalue);
				done();
			});
		});
	});

	describe('#remove()', function() {
		it('should do nothing on inexisting entry', function() {
			datastore.remove("ffffffff-ffff-ffff-ffff-ffffffffffff");
			var results = datastore.find();
			chai.assert.equal(objectIds.length, results.length);
		});

		it('should remove entry', function() {
			for (var i = 0 ; i < objectIds.length ; i++)
				datastore.remove(objectIds[i]);
			var results = datastore.find();
			chai.assert.equal(0, results.length);
		});
	});
});
