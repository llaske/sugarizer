// Require
var	fs = require('fs'),
	ini = require('js-ini');

// Get INI filename
var filename = null;
if (process.argv.length != 3) {
	console.log("Usage: ini2json <inifile>");
}
filename = process.argv[2];

// Generate all JSON files
if (filename) {
	// Load file
	fs.readFile(filename, 'utf-8', function(err, read) {
		// Parse content
		if (err) throw err;
		var sections = ini.parse(read, {comment: ";;;", autoTyping: false});
		var keys = Object.keys(sections);

		// Iterate on each section
		for (var i = 0 ; i < keys.length ; i++) {
			// Prepare output file
			var language = keys[i];
			if (language == "*") {
				continue;
			}
			var outputname = "locales/" + language + '.json';

			// Iterate on each string
			var section = sections[language];
			var items = Object.keys(section);
			var content = "{\n";
			for (var j = 0 ; j < items.length ; j++) {
				// Generate lines
				if (j) {
					content += ",\n";
				}
				var msgid = items[j];
				var currentTranslation = section[items[j]];
				content += '\t"'+msgid.replace(/"/g,'\\"')+'"';
				content += ": ";
				content += '"'+currentTranslation.replace(/"/g,'\\"').replace(/\\'/g,"'")+'"';
			}

			// Write file
	 		console.log(outputname + ' generated');
			content += "\n}\n";
			fs.writeFile(outputname, content, 'utf8', function(err) {
				if (err) throw err;
			});
		}
	});
}