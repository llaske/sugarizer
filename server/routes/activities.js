// Activities list handling

var fs = require('fs'),
    path = require('path'),
	ini = require('ini');

// Load into memory the content of activities directory
var activities = [];
exports.load = function(settings) {
	// Get settings
	var activitiesDirName = settings.activities.activities_directory_name;
	var activitiesPath = settings.activities.activities_path;
	var templateDirName = settings.activities.template_directory_name;
	var activityInfoPath = settings.activities.activity_info_path;
	
	// Read activities directory
	fs.readdir(activitiesPath, function(err, files) {
		if (err) throw err;
		files.forEach(function(file) {
			// If it's not the template directory
			if (file != templateDirName) {
				// Get the file name
				var filePath = activitiesPath+path.sep+file;
				fs.stat(filePath, function(err, stats) {
					if (err) throw err;
					// If it's a directory, it's an activity
					if (stats.isDirectory()) {
						// Read the activity.info file
						fs.readFile(activitiesPath+path.sep+file+path.sep+activityInfoPath, 'utf-8', function(err, content) {					
							if (err) throw err;							
							// Parse the file as an .INI file
							var info = ini.parse(content);
							activities.push({
								"id":info.Activity.bundle_id,
								"name":info.Activity.name,
								"version":info.Activity.activity_version,
								"directory":activitiesDirName+"/"+file,
								"icon":"activity/"+info.Activity.icon+".svg",
								"favorite":true,
								"activityId":null
							});
						});
					}
				});
			}
		});
	});
};

// Get all activities
exports.findAll = function(req, res) {
	res.send(activities);
};

// Get one activity
exports.findById = function(req, res) {
	var id = req.params.id;
	for (var i = 0 ; i < activities.length ; i++) {
		var activity = activities[i];
		if (activity.id == id) {
			res.send(activity);
		}
	}
	res.send();
};