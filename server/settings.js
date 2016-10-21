// Load Sugarizer Settings

var	fs = require('fs'),
ini = require('ini');

// Load and parse sugarizer.ini file
exports.load = function(callback) {
	var confFile = "sugarizer.ini"
	if (process.argv.length >= 3) {
		confFile = process.argv[2];
	}
	fs.readFile(confFile, 'utf-8', function(err, content) {
		if (err) throw err;
		callback(ini.parse(content));
	});
};
