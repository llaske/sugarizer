// Interface to activities
define(["sugar-web/datastore","util"], function(datastore, util) {
	var activities = {};

	var list = [];

	var genericActivity = {directory: "icons", icon: "application-x-generic.svg"};

	// Update activity list
	var updateList = function(newlist) {
		// Empty list, just set it
		if (list.length == 0) {
			list = newlist;
			return true;
		}

		// Some activities updated, update it
		var updated = false;
		var seen = 0;
		for (var i = 0 ; i < newlist.length ; i++) {
			var found = false;
			for (var j = 0 ; !found && j < list.length ; j++) {
				if (newlist[i].id == list[j].id) {
					found = true;
					seen++;
					if (list[j].version != newlist[i].version) {
						list[j].name = newlist[i].name;
						list[j].version = newlist[i].version;
						list[j].directory = newlist[i].directory;
						list[j].icon = newlist[i].icon;
						updated = true;
					}
				}
			}
			if (!found) {
				list.push(newlist[i]);
				updated = true;
			}
		}

		// Some activities disappeared, remove it
		if (seen != list.length) {
			updated = true;
			var newactivities = [];
			for (var i = 0 ; i < list.length ; i++) {
				var found = false;
				for (var j = 0 ; !found && j < newlist.length ; j++) {
					if (list[i].id == newlist[j].id || list[i].type == "native") {
						found = true;
						newactivities.push(list[i]);
					}
				}
			}
			list = newactivities;
		}
		return updated;
	};

	// If we are in the SugarizerOS environment, load also the android apps into activities
	var updateSugarizerOS = function(callback) {
		if (window.sugarizerOS){
			sugarizerOS.isAppCacheReady(function(response) {
				if (!response.ready) {
					var loading = humane.create({timeout: 5000, baseCls: "humane-libnotify"});
					loading.log(l10n.get("Loading"));
				}
			});
			sugarizerOS.initActivitiesPreferences(function(){
				callback();
			});
		} else {
			callback();
		}
	};

	// Load activities, return a Promise object
	activities.load = function() {
		// Get activities list from server
		if (util.getClientType() == constant.webAppType) {
			return new Promise(function(resolve, reject) {
				myserver.getActivities(function(sender, response) {
					updateList(response.data);
					activities.loadEntries();
					updateSugarizerOS(function() {
						resolve(list);
					});
				}, function(error) {
					// Error on server, try to load it locally
					axios.get(constant.staticInitActivitiesURL).then(function(response) {
						updateList(response.data);
						activities.loadEntries();
						updateSugarizerOS(function() {
							resolve(list);
						});
					}).catch(function(error) {
						reject(error);
					});
				});
			});
		}

		// Get activities list from local file
		return new Promise(function(resolve, reject) {
			axios.get(constant.staticInitActivitiesURL).then(function(response) {
				updateList(response.data);
				activities.loadEntries();
				updateSugarizerOS(function() {
					resolve(list);
				});
			}).catch(function(error) {
				reject(error);
			});
		});
	};

	// Get activities
	activities.get = function() {
		return list;
	};
	activities.getByName = function(name) {
		if (name === undefined || name == null || name.length == 0) {
			return list;
		}
		var activities = list;
		var matching = [];
		for (var i = 0 ; i < activities.length ; i++) {
			if (activities[i].name.toLowerCase().indexOf(name) != -1) {
				matching.push(activities[i]);
			}
		}
		return matching;
	};
	activities.getById = function(id) {
		for(var i = 0 ; i < list.length ; i++) {
			if (list[i].id == id) {
				return list[i];
			}
		}
		return genericActivity;
	};
	activities.getFavorites = function() {
		var favorites = [];
		for(var i = 0 ; i < list.length ; i++) {
			if (list[i].favorite) {
				favorites.push(list[i]);
			}
		}
		return favorites;
	};
	activities.getFavoritesName = function() {
		var favorites = this.getFavorites();
		var names = [];
		for(var i = 0 ; i < favorites.length ; i++) {
			names.push(favorites[i].id);
		}
		return names;
	};

	// Set activities
	activities.set = function(newlist) {
		list = [];
		for(var i = 0 ; i < newlist.length ; i++) {
			if ((newlist[i].isNative || (newlist[i].type && newlist[i].type == "native")) && !window.sugarizerOS) {
				continue;
			}
			list.push(newlist[i]);
		}
	};

	// Test if activity is generic
	activities.isGeneric = function(activity) {
		return (activity == genericActivity);
	};
	activities.genericActivity = function() {
		return genericActivity;
	};

	activities.switchFavoriteActivity = function(activity) {
		for(var i = 0 ; i < list.length ; i++) {
			if (activity.id == list[i].id) {
				list[i].favorite = !list[i].favorite;
				return list[i].favorite;
			}
		}
		return false;
	};

	// Update journal entries for each activity
	activities.loadEntries = function() {
		var length = list ? list.length : 0;
		for (var i = 0 ; i < length ; i++) {
			var activity = list[i];
			activity.instances = datastore.find(activity.id);
			activity.instances.sort(function(e0, e1) {
				return parseInt(e1.metadata.timestamp) - parseInt(e0.metadata.timestamp);
			});
		}
	};

	return activities;
});
