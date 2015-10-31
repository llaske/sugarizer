
// Unit testing on journal

var assert = require('assert'),
    journal = require('../routes/journal');


// Dummy request
var res = {send: function(value) {
	this.value = value;
	if (this.done) this.done();
}};

// Connect to MongoDB
var settings = {
	database: {	server: "localhost", port: "27018",	name: "sugarizer"},
	collections: { journal: "journal" }
};
journal.init(settings, function() {

});