// Load Sugarizer Settings

var	fs = require('fs'),
ini = require('ini');

// Load and parse sugarizer.ini file
exports.load = function(callback, confFile) {
	if (!confFile) {
		confFile = "sugarizer.ini";
	}
	fs.readFile(confFile, 'utf-8', function(err, content) {
		if (err) throw err;
		callback(ini.parse(content));
	});
};
