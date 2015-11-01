
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
		
		describe('#removeJournal()', function() {
			it('should do nothing on invalid journal', function(done) {
				res.done = function() {
					assert.equal(undefined, this.value);
					done();
				}			
				journal.removeJournal({params: {jid: 'xxx'}}, res);
			});
			
			it('should not remove an inexisting journal', function(done) {
				res.done = function() {
					assert.equal('ffffffffffffffffffffffff',res.value.toString());
					done();
				}
				journal.removeJournal({params: {jid: 'ffffffffffffffffffffffff'}}, res);
			});
			
			it('should do nothing on inexisting journal', function(done) {
				res.done = function() {
					assert.equal(undefined, this.value);
					done();
				}			
				journal.findJournalContent({params: {jid: 'ffffffffffffffffffffffff'}}, res);
			});
			
			it('should remove the journal', function(done) {
				res.done = function() {
					assert.equal(newJournal._id.toString(), res.value.toString());
					done();
				}
				journal.removeJournal({params: {jid: newJournal._id.toString()}}, res);
			});
			
			it('should remove one journal', function(done) {
				res.done = function() {
					assert.equal(initCount, this.value.length);
					done();
				}
				journal.findAll(null, res);
			});
		});
		
		// TODO addEntryInJournal
		// TODO updateEntryInJournal
		// TODO removeEntryInJournal
	});
});