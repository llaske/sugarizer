// Activities list handling

var fs = require('fs'),
    path = require('path'),
	ini = require('ini');

// Load into memory the content of activities directory
var activities = [];
exports.load = function(settings, callback) {
	// Get settings
	var activitiesDirName = settings.activities.activities_directory_name;
	var activitiesPath = settings.activities.activities_path;
	var templateDirName = settings.activities.template_directory_name;
	var activityInfoPath = settings.activities.activity_info_path;
	var favorites = settings.activities.favorites ? settings.activities.favorites.split(',') : [];
	
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
						var stream = fs.createReadStream(activitiesPath+path.sep+file+path.sep+activityInfoPath, {encoding:'utf8'});
						stream.on('data', function(content) {						
							// Parse the file as an .INI file
							var info = ini.parse(content);
							
							// Check if activity is favorite
							var favorite = false;
							var index = favorites.length+1;
							for (var i = 0 ; !favorite && i < favorites.length ; i++) {
								if (favorites[i].trim() == info.Activity.bundle_id) {
									favorite = true;
									index = i;
								}
							}
							
							// Return the activity
							activities.push({
								"id":info.Activity.bundle_id,
								"name":info.Activity.name,
								"version":info.Activity.activity_version,
								"directory":activitiesDirName+"/"+file,
								"icon":"activity/"+info.Activity.icon+".svg",
								"favorite":favorite,
								"activityId":null,
								"index": index
							});
						});
						stream.on('end', function() {
							// Sort activities array by index in .INI favorite property
							activities.sort(function(a0, a1) {
								if (a0.index > a1.index) return 1;
								else if (a0.index < a1.index) return -1;
								else return 0;
							});
							if (callback) {
								callback();
								callback = null;
							}
						});
						stream.on('error', function(err) {					
							throw err;							
						});
					}
				});
			}
		});
	});
};

/**
 * @api {get} /activities/ Get all activities
 * @apiName GetAllActivities
 * @apiDescription Retrieve all activities installed on the server. 
 * @apiGroup Activities
 * @apiVersion 0.6.0
 *
 * @apiSuccess {Object[]} activities
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     [
 *       {
 *         "id": "org.sugarlabs.GearsActivity",
 *         "name": "Gears",
 *         "version": "6",
 *         "directory": "activities/Gears.activity",
 *         "icon": "activity/activity-icon.svg",
 *         "favorite": true,
 *         "activityId": null,
 *         "index": 0
 *       },
 *       {
 *         "id": "org.sugarlabs.MazeWebActivity",
 *         "name": "Maze Web",
 *         "version": "2",
 *         "directory": "activities/MazeWeb.activity",
 *         "icon": "activity/activity-icon.svg",
 *         "favorite": true,
 *         "activityId": null,
 *         "index": 1
 *       },
 *       ...
 *     ]
 **/
exports.findAll = function(req, res) {
	res.send(activities);
};

/**
 * @api {get} /activities/:id Get activity detail
 * @apiName GetActivity
 * @apiDescription Retrieve detail of an activity.
 * @apiParam {id} id Activity unique ID
 *
 * @apiSuccess {String} id Activity unique ID
 * @apiSuccess {String} name Display name of the activity
 * @apiSuccess {String} version Activity version number
 * @apiSuccess {String} directory Location directory of the activity in Sugarizer
 * @apiSuccess {String} icon Location of the icon in the activity directory
 * @apiSuccess {Boolean} favorite true means that the activity is in the favorite view
 * @apiSuccess {String} activityId Reserved for internal use
 * @apiSuccess {Number} index Index of the activity in the activity list
 *
 * @apiGroup Activities
 * @apiVersion 0.6.0
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "id": "org.olpcfrance.Abecedarium",
 *       "name": "Abecedarium",
 *       "version": "5",
 *       "directory": "activities/Abecedarium.activity",
 *       "icon": "activity/activity-icon.svg",
 *       "favorite": true,
 *       "activityId": null,
 *       "index": 11
 *     }
 **/
exports.findById = function(req, res) {
	var id = req.params.id;
	for (var i = 0 ; i < activities.length ; i++) {
		var activity = activities[i];
		if (activity.id == id) {
			res.send(activity);
			return;
		}
	}
	res.send();
};