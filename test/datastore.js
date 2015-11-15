
// Unit testing on datastore

describe('Datastore', function() {

	before(function() {
		initSugarizer();
	});
	
	var objectIds = [];
	describe('#create()', function() {
		it('should create one entry', function() {
			var results = datastore.create({name: "entry", activity: "test"}, function(err, oid) {
				objectIds.push(oid);
				chai.assert.equal(null, err);
				chai.assert.notEqual(null, oid);
				chai.assert.equal(36, oid.length);
			}, {value: "100"});
			
			var results = datastore.find();
			chai.assert.equal(1, results.length);
			chai.assert.equal("entry", results[0].metadata.name);
			chai.assert.equal("test", results[0].metadata.activity);
			chai.assert.equal("100", results[0].text.value);

			var results = datastore.find("test");
			chai.assert.equal(1, results.length);
			chai.assert.equal("entry", results[0].metadata.name);
			chai.assert.equal("test", results[0].metadata.activity);
			chai.assert.equal("100", results[0].text.value);			
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
			entry.getMetadata(function() {
				chai.assert.equal(objectIds[0], entry.objectId);
				chai.assert.equal("entry", entry.newMetadata.name);
				chai.assert.equal("test", entry.newMetadata.activity);
				chai.assert.equal("100", entry.newDataAsText.value);
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
			chai.assert.isNull(entry.newDataAsText);
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
			entry.getMetadata(function() {
				chai.assert.equal(objectIds[0], entry.objectId);
				chai.assert.equal("entry", entry.newMetadata.name);
				chai.assert.equal("test", entry.newMetadata.activity);
				chai.assert.equal("100", entry.newDataAsText.value);
				var timeBefore = new Date().getTime();
				entry.save(function() {
					var timeAfter = new Date().getTime();
					chai.assert.equal("entry", entry.newMetadata.name);
					chai.assert.equal("test", entry.newMetadata.activity);
					chai.assert.ok(entry.newMetadata.timestamp >= timeBefore);
					chai.assert.ok(entry.newMetadata.timestamp <= timeAfter);
					chai.assert.deepEqual({ stroke: '#AC32FF', fill: '#FF8F00' }, entry.newMetadata.buddy_color);
					chai.assert.equal("Mocha", entry.newMetadata.buddy_name);
					done();
				});
			});
		});
		
		it('should create metadata for new object', function(done) {
			var entry = new datastore.DatastoreObject();
			var timeBefore = new Date().getTime();
			entry.save(function() {
				var timeAfter = new Date().getTime();
				chai.assert.isNotNull(entry.objectId);
				chai.assert.equal(36, entry.objectId.length);
				chai.assert.ok(entry.newMetadata.timestamp >= timeBefore);
				chai.assert.ok(entry.newMetadata.timestamp <= timeAfter);
				chai.assert.ok(entry.newMetadata.creation_time >= timeBefore);
				chai.assert.ok(entry.newMetadata.creation_time <= timeAfter);
				chai.assert.deepEqual({ stroke: '#AC32FF', fill: '#FF8F00' }, entry.newMetadata.buddy_color);
				chai.assert.equal("Mocha", entry.newMetadata.buddy_name);
				chai.assert.equal("0", entry.newMetadata.file_size);
				chai.assert.isNull(entry.newDataAsText);
				objectIds.push(entry.objectId);
				done();
			});
		});
	});
	
	describe('#loadAsText()', function() {
		it('should get text entry', function(done) {
			var entry = new datastore.DatastoreObject(objectIds[0]);
			entry.loadAsText(function() {
				chai.assert.equal("100", entry.newDataAsText.value);
				done();
			});
		});
		
		it('should get null on free text entry', function(done) {
			var entry = new datastore.DatastoreObject(objectIds[1]);
			entry.loadAsText(function() {
				chai.assert.equal(objectIds[1], entry.objectId);
				chai.assert.isNull(entry.newDataAsText);
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

	// TODO: setMetadata
	// TODO: setDataAsText
	
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
