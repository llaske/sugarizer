
// Unit testing on journal

var assert = require('assert'),
    journal = require('../routes/journal');


// Connect to MongoDB
var settings = {
	database: {	server: "localhost", port: "27018",	name: "sugarizer"},
	collections: { journal: "journal" }
};

journal.init(settings, function() {

	// HACK: Dummy request to match Express interface
	var res = {send: function(value) {
		this.value = value;
		if (this.done) this.done();
	}};

	describe('Journal', function() {
		// First count number of journals in database
		var initCount = 0;
		res.done = function() {
			initCount = res.value.length;
		}
		journal.findAll(null, res);

		// Start test
		this.timeout(2000);

		describe('#findAll()', function() {
			it('should return all journals', function(done) {
				res.done = function() {
					assert.equal(initCount, this.value.length);
					done();
				}
				journal.findAll(null, res);
			});
		});

		describe('#findSharedJournal()', function() {
			it('should return the shared journal', function(done) {
				res.done = function() {
					assert.notEqual(undefined, res.value._id);
					done();
				}
				journal.findSharedJournal(null, res);
			});
		});

		var newJournal = null;
		describe('#addJournal()', function() {
			it('should create a journal', function(done) {
				res.done = function() {
					assert.notEqual(undefined, res.value._id);
					newJournal = res.value;
					done();
				}
				journal.addJournal(null, res);
			});

			it('should add a new journal', function(done) {
				res.done = function() {
					assert.equal(initCount+1, this.value.length);
					done();
				}
				journal.findAll(null, res);
			});
		});

		describe('#findJournalContent()', function() {
			it('should do nothing on invalid journal', function(done) {
				res.done = function() {
					assert.equal(undefined, this.value);
					done();
				}
				journal.findJournalContent({params: {jid: 'xxx'}}, res);
			});

			it('should do nothing on inexisting journal', function(done) {
				res.done = function() {
					assert.equal(undefined, this.value);
					done();
				}
				journal.findJournalContent({params: {jid: 'ffffffffffffffffffffffff'}}, res);
			});

			it('should return 0 on an empty journal', function(done) {
				res.done = function() {
					assert.equal(0, this.value.length);
					done();
				}
				journal.findJournalContent({params: {jid: newJournal._id.toString()}}, res);
			});
		});

		describe('#addEntryInJournal()', function() {
			it('should do nothing on invalid journal', function(done) {
				res.done = function() {
					assert.equal(undefined, this.value);
					done();
				}
				journal.addEntryInJournal({params: {jid: 'xxx'}, body: {journal: '{"objectId":"ffffffff-ffff-ffff-ffff-ffffffffffff","name":"Entry","value":"#0000FF"}'}}, res);
			});

			it('should not add entry in an inexisting journal (1/2)', function(done) {
				res.done = function() {
					assert.deepEqual({"content":{"objectId":"ffffffff-ffff-ffff-ffff-ffffffffffff","name":"Entry","value":"#0000FF"}},res.value.$push);
					done();
				}
				journal.addEntryInJournal({params: {jid: 'ffffffffffffffffffffffff'}, body: {journal: '{"objectId":"ffffffff-ffff-ffff-ffff-ffffffffffff","name":"Entry","value":"#0000FF"}'}}, res);
			});

			it('should do nothing on inexisting journal (2/2)', function(done) {
				res.done = function() {
					assert.equal(undefined, this.value);
					done();
				}
				journal.findJournalContent({params: {jid: 'ffffffffffffffffffffffff'}}, res);
			});

			it('should add entry in a journal (1/4)', function(done) {
				res.done = function() {
					assert.deepEqual({"content":{"objectId":"ffffffff-ffff-ffff-ffff-ffffffffffff","name":"Entry","value":"#0000FF","metadata":{"timestamp":9999, "activity": "1.mocha.org"}}},res.value.$push);
					done();
				}
				journal.addEntryInJournal({params: {jid: newJournal._id.toString()}, body: {journal: '{"objectId":"ffffffff-ffff-ffff-ffff-ffffffffffff","name":"Entry","value":"#0000FF","metadata":{"timestamp":9999, "activity": "1.mocha.org"}}'}}, res);
			});

			it('should add entry in journal (2/4)', function(done) {
				res.done = function() {
					assert.deepEqual({"objectId":"ffffffff-ffff-ffff-ffff-ffffffffffff","name":"Entry","value":"#0000FF","metadata":{"timestamp":9999, "activity": "1.mocha.org"}}, this.value[0]);
					done();
				}
				journal.findJournalContent({params: {jid: newJournal._id.toString()}}, res);
			});

			it('should add entry in a journal (3/4)', function(done) {
				res.done = function() {
					assert.deepEqual({"content":{"objectId":"fffffffe-ffff-ffff-ffff-ffffffffffff","name":"Entry2","value":"#00FF00","metadata":{"timestamp":9990}}},res.value.$push);
					done();
				}
				journal.addEntryInJournal({params: {jid: newJournal._id.toString()}, body: {journal: '{"objectId":"fffffffe-ffff-ffff-ffff-ffffffffffff","name":"Entry2","value":"#00FF00","metadata":{"timestamp":9990}}'}}, res);
			});

			it('should add entry in journal (4/4)', function(done) {
				res.done = function() {
					assert.equal(2, this.value.length);
					assert.equal(9999,this.value[0].metadata.timestamp);
					assert.equal(9990,this.value[1].metadata.timestamp);
					done();
				}
				journal.findJournalContent({params: {jid: newJournal._id.toString()}}, res);
			});
		});

		describe('#findJournalContent() with filter', function() {
			it('should return all element when no filter is present', function(done) {
				res.done = function() {
					assert.equal(2, this.value.length);
					done();
				}
				journal.findJournalContent({params: {jid: newJournal._id.toString()}}, res);
			});

			it('should get only element where the filter apply', function(done) {
				res.done = function() {
					assert.equal(1, this.value.length);
					assert.equal("1.mocha.org",this.value[0].metadata.activity);
					assert.equal(9999,this.value[0].metadata.timestamp);
					done();
				}
				journal.findJournalContent({params: {jid: newJournal._id.toString(), aid: "1.mocha.org"}}, res);
			});

			it('should return nothing when nothing math the filter', function(done) {
				res.done = function() {
					assert.equal(0, this.value.length);
					done();
				}
				journal.findJournalContent({params: {jid: newJournal._id.toString(), aid: "xxx.mocha.org"}}, res);
			});
		});

		describe('#findJournalContent() with field', function() {
			it('should get only a field when specified', function(done) {
				res.done = function() {
					assert.equal(2, this.value.length);
					assert.equal(9999,this.value[0].metadata.timestamp);
					assert.equal(undefined,this.value[0].name);
					assert.equal(undefined,this.value[0].value);
					assert.equal(9990,this.value[1].metadata.timestamp);
					assert.equal(undefined,this.value[1].name);
					assert.equal(undefined,this.value[1].value);
					done();
				}
				journal.findJournalContent({params: {jid: newJournal._id.toString(), field: "metadata"}}, res);
			});

			it('should get only a field when specified (2/2)', function(done) {
				res.done = function() {
					assert.equal(2, this.value.length);
					assert.equal("Entry",this.value[0].name);
					assert.equal(undefined,this.value[0].metadata);
					assert.notEqual(undefined,this.value[0].objectId);
					assert.equal("Entry2",this.value[1].name);
					assert.equal(undefined,this.value[1].metadata);
					assert.notEqual(undefined,this.value[1].objectId);
					done();
				}
				journal.findJournalContent({params: {jid: newJournal._id.toString(), field: "name"}}, res);
			});

			it('should do nothing when field dont exist', function(done) {
				res.done = function() {
					assert.equal(2, this.value.length);
					assert.equal(undefined,this.value[0].name);
					assert.equal(undefined,this.value[0].metadata);
					assert.notEqual(undefined,this.value[0].objectId);
					assert.equal(undefined,this.value[1].name);
					assert.equal(undefined,this.value[1].metadata);
					assert.notEqual(undefined,this.value[1].objectId);
					done();
				}
				journal.findJournalContent({params: {jid: newJournal._id.toString(), field: "dummy"}}, res);
			});

			it('should work combined with filter', function(done) {
				res.done = function() {
					assert.equal(1, this.value.length);
					assert.equal(9999,this.value[0].metadata.timestamp);
					done();
				}
				journal.findJournalContent({params: {jid: newJournal._id.toString(), field: "metadata", aid: "1.mocha.org"}}, res);
			});
		});

		describe('#getEntryInJournal()', function() {
			it('should do nothing on invalid journal', function(done) {
				res.done = function() {
					assert.equal(undefined, this.value);
					done();
				}
				journal.getEntryInJournal({params: {jid: 'xxx', oid:'ffffffff-ffff-ffff-ffff-ffffffffffff'}}, res);
			});

			it('should do nothing on invalid entry', function(done) {
				res.done = function() {
					assert.equal(undefined, this.value);
					done();
				}
				journal.getEntryInJournal({params: {jid: newJournal._id.toString(), oid:'xxx'}}, res);
			});

			it('should get entry in journal', function(done) {
				res.done = function() {
					assert.deepEqual({"objectId":"fffffffe-ffff-ffff-ffff-ffffffffffff","name":"Entry2","value":"#00FF00","metadata":{"timestamp":9990}},res.value);
					done();
				}
				journal.getEntryInJournal({params: {jid: newJournal._id.toString(), oid:'fffffffe-ffff-ffff-ffff-ffffffffffff'}}, res);
			});
		});

		describe('#updateEntryInJournal()', function() {
			it('should do nothing on invalid journal', function(done) {
				res.done = function() {
					assert.equal(undefined, this.value);
					done();
				}
				journal.updateEntryInJournal({params: {jid: 'xxx', oid:'ffffffff-ffff-ffff-ffff-ffffffffffff'}, body: {journal: '{"objectId":"ffffffff-ffff-ffff-ffff-ffffffffffff","name":"Entry","value":"#0000FF"}'}}, res);
			});

			it('should not add entry in an inexisting journal (1/2)', function(done) {
				res.done = function() {
					assert.deepEqual({"content":{"objectId":"ffffffff-ffff-ffff-ffff-ffffffffffff","name":"Entry","value":"#0000FF"}},res.value.$push);
					done();
				}
				journal.updateEntryInJournal({params: {jid: 'ffffffffffffffffffffffff', oid:'ffffffff-ffff-ffff-ffff-ffffffffffff'}, body: {journal: '{"objectId":"ffffffff-ffff-ffff-ffff-ffffffffffff","name":"Entry","value":"#0000FF"}'}}, res);
			});

			it('should do nothing on inexisting journal (2/2)', function(done) {
				res.done = function() {
					assert.equal(undefined, this.value);
					done();
				}
				journal.findJournalContent({params: {jid: 'ffffffffffffffffffffffff'}}, res);
			});

			it('should update entry in a journal (1/4)', function(done) {
				res.done = function() {
					assert.deepEqual({"content":{"objectId":"ffffffff-ffff-ffff-ffff-ffffffffffff","name":"Updated","value":"#0000CC","metadata":{"timestamp":9100}}},res.value.$push);
					done();
				}
				journal.updateEntryInJournal({params: {jid: newJournal._id.toString(), oid:'ffffffff-ffff-ffff-ffff-ffffffffffff'}, body: {journal: '{"objectId":"ffffffff-ffff-ffff-ffff-ffffffffffff","name":"Updated","value":"#0000CC","metadata":{"timestamp":9100}}'}}, res);
			});

			it('should update entry in journal (2/4)', function(done) {
				res.done = function() {
					assert.equal(2, this.value.length);
					assert.deepEqual({"objectId":"ffffffff-ffff-ffff-ffff-ffffffffffff","name":"Updated","value":"#0000CC","metadata":{"timestamp":9100}}, this.value[1]);
					done();
				}
				journal.findJournalContent({params: {jid: newJournal._id.toString()}}, res);
			});

			it('should update entry in a journal (3/4)', function(done) {
				res.done = function() {
					assert.deepEqual({"content":{"objectId":"fffffffd-ffff-ffff-ffff-ffffffffffff","name":"CreateUpdated","value":"#101010","metadata":{"timestamp":9200}}},res.value.$push);
					done();
				}
				journal.updateEntryInJournal({params: {jid: newJournal._id.toString(), oid:'fffffffd-ffff-ffff-ffff-ffffffffffff'}, body: {journal: '{"objectId":"fffffffd-ffff-ffff-ffff-ffffffffffff","name":"CreateUpdated","value":"#101010","metadata":{"timestamp":9200}}'}}, res);
			});

			it('should update entry in journal (4/4)', function(done) {
				res.done = function() {
					assert.equal(3, this.value.length);
					assert.deepEqual({"objectId":"fffffffd-ffff-ffff-ffff-ffffffffffff","name":"CreateUpdated","value":"#101010","metadata":{"timestamp":9200}}, this.value[1]);
					done();
				}
				journal.findJournalContent({params: {jid: newJournal._id.toString()}}, res);
			});
		});

		describe('#removeEntryInJournal()', function() {
			it('should do nothing on invalid journal', function(done) {
				res.done = function() {
					assert.equal(undefined, this.value);
					done();
				}
				journal.removeEntryInJournal({params: {jid: 'xxx', oid:'ffffffff-ffff-ffff-ffff-ffffffffffff'}, body: {journal: '{"objectId":"ffffffff-ffff-ffff-ffff-ffffffffffff","name":"Entry","value":"#0000FF"}'}}, res);
			});

			it('should not add entry in an inexisting journal (1/2)', function(done) {
				res.done = function() {
					assert.deepEqual(undefined,res.value.$push);
					done();
				}
				journal.removeEntryInJournal({params: {jid: 'ffffffffffffffffffffffff', oid:'ffffffff-ffff-ffff-ffff-ffffffffffff'}, body: {journal: '{"objectId":"ffffffff-ffff-ffff-ffff-ffffffffffff","name":"Entry","value":"#0000FF"}'}}, res);
			});

			it('should do nothing on inexisting journal (2/2)', function(done) {
				res.done = function() {
					assert.equal(undefined, this.value);
					done();
				}
				journal.findJournalContent({params: {jid: 'ffffffffffffffffffffffff'}}, res);
			});

			it('should do nothing in an inexisting entry (1/2)', function(done) {
				res.done = function() {
					assert.deepEqual(undefined,res.value.$push);
					done();
				}
				journal.removeEntryInJournal({params: {jid: newJournal._id.toString(), oid:'fffffff0-ffff-ffff-ffff-ffffffffffff'}, body: {journal: '{"objectId":"ffffffff-ffff-ffff-ffff-ffffffffffff","name":"Entry","value":"#0000FF"}'}}, res);
			});

			it('should do nothing on inexisting entry (2/2)', function(done) {
				res.done = function() {
					assert.equal(3, this.value.length);
					done();
				}
				journal.findJournalContent({params: {jid: newJournal._id.toString()}}, res);
			});

			it('should remove an entry (1/2)', function(done) {
				res.done = function() {
					assert.deepEqual(undefined,res.value.$push);
					done();
				}
				journal.removeEntryInJournal({params: {jid: newJournal._id.toString(), oid:'ffffffff-ffff-ffff-ffff-ffffffffffff'}, body: {journal: '{"objectId":"ffffffff-ffff-ffff-ffff-ffffffffffff","name":"Entry","value":"#0000FF"}'}}, res);
			});

			it('should remove an entry (2/2)', function(done) {
				res.done = function() {
					assert.equal(2, this.value.length);
					done();
				}
				journal.findJournalContent({params: {jid: newJournal._id.toString()}}, res);
			});
		});

		describe('#removeJournal()', function() {
			it('should do nothing on invalid journal', function(done) {
				res.done = function() {
					assert.equal(undefined, this.value);
					done();
				}
				journal.removeJournal({params: {jid: 'xxx'}}, res);
			});

			it('should not remove an inexisting journal (1/2)', function(done) {
				res.done = function() {
					assert.equal('ffffffffffffffffffffffff',res.value.toString());
					done();
				}
				journal.removeJournal({params: {jid: 'ffffffffffffffffffffffff'}}, res);
			});

			it('should do nothing on inexisting journal (2/2)', function(done) {
				res.done = function() {
					assert.equal(undefined, this.value);
					done();
				}
				journal.findJournalContent({params: {jid: 'ffffffffffffffffffffffff'}}, res);
			});

			it('should remove the journal (1/2)', function(done) {
				res.done = function() {
					assert.equal(newJournal._id.toString(), res.value.toString());
					done();
				}
				journal.removeJournal({params: {jid: newJournal._id.toString()}}, res);
			});

			it('should remove one journal (2/2)', function(done) {
				res.done = function() {
					assert.equal(initCount, this.value.length);
					done();
				}
				journal.findAll(null, res);
			});
		});
	});
});