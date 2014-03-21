// Activities list handling

var fs = require('fs'),
    path = require('path'),
	ini = require('ini');


// Load activities directory
var activitiesDirName = "activities";
var activitiesPath = ".."+path.sep+activitiesDirName;
var templateDirName = "ActivityTemplate";
var activityInfoPath = "activity"+path.sep+"activity.info";
var activities = [];
fs.readdir(activitiesPath, function(err, files) {
	if (err) throw err;
	files.forEach(function(file) {
		if (file != templateDirName) {
			var filePath = activitiesPath+path.sep+file;
			fs.stat(filePath, function(err, stats) {
				if (err) throw err;
				if (stats.isDirectory()) {
					loadInfoContent(activitiesPath+path.sep+file+path.sep+activityInfoPath, function(info) {
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

// Load activity.info content for one activity
var loadInfoContent = function(file, callback) {
	fs.readFile(file, 'utf-8', function(err, content) {
		if (err) throw err;
		callback(ini.parse(content));
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