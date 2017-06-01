
// Unit testing on activities

var assert = require('assert'),
	activities = require('../routes/activities'),
	settings = require('../settings');


// Load settings
settings.load(function(ini) {
	// Init activities
	activities.load(ini);

	describe('Activities', function() {
		// Dummy request
		var res = {send: function(value) {
			this.value = value;
		}};

		// Start test
		describe('#findAll()', function() {
			activities.findAll({params: []}, res);

			it('should return all activities', function() {
				assert.equal(33, res.value.length);
			});

			it('should return all fields', function() {
				for (var i = 0 ; i < res.value.length ; i++) {
					var item = res.value[i];
					assert.notEqual(item.id, undefined);
					assert.notEqual(item.name, undefined);
					assert.notEqual(item.version, undefined);
					assert.notEqual(item.directory, undefined);
					assert.notEqual(item.favorite, undefined);
					assert.equal(item.activityId, null);
					assert.notEqual(item.index, undefined);
				}
			});

			it('should return right number of favorites', function() {
				var count = 0;
				for (var i = 0 ; i < res.value.length ; i++) {
					if ( res.value[i].favorite ) count++;
				}
				assert.equal(3, count);
			});

			it('should return favorites in right order', function() {
				assert.equal('org.sugarlabs.GearsActivity', res.value[0].id);
				assert.equal('org.sugarlabs.MazeWebActivity', res.value[1].id);
				assert.equal('org.olpcfrance.PaintActivity', res.value[2].id);
			});
		});


		describe('#findById()', function() {
			it('should return nothing on inexisting activity', function() {
				activities.findById({params: {id: 'xxx'}}, res);
				assert.equal(undefined, res.value);
			});

			it('should return right activity on existing id', function() {
				activities.findById({params: {id: 'org.olpcfrance.PaintActivity'}}, res);
				var item = res.value;
				assert.equal(item.id, 'org.olpcfrance.PaintActivity');
				assert.notEqual(item.name, undefined);
				assert.notEqual(item.version, undefined);
				assert.notEqual(item.directory, undefined);
				assert.notEqual(item.favorite, undefined);
				assert.equal(item.activityId, null);
				assert.notEqual(item.index, undefined);
			});
		});
	});
}, "test.ini");
