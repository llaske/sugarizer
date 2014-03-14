

// Settings handling
define(["sugar-web/datastore"], function (datastore) {
	var settings = {};

	// Default value
	settings.name = "<No name>";
	settings.color = 22;
	settings.colorvalue = null;
	settings.activities = null;
	settings.view = 0;
	settings.language = "en";
	
	// Load settings from local storage
	settings.load = function() {
		// Load settings
		var preferences = datastore.localStorage.getValue('sugar_settings');
		if (preferences == null || preferences.name === undefined)
			return false;
		this.name = preferences.name;
		this.color = preferences.color;
		this.colorvalue = preferences.colorvalue;
		this.view = preferences.view;
		if (preferences.language !== undefined) this.language = preferences.language;
	
		// Set language
		l10n.language.code = this.language;		
		
		// Load activities
		this.activities = preferences.activities;
		
		// Load datastore entries for each activity
		for (var i = 0 ; i < this.activities.length ; i++) {
			var activity = this.activities[i];
			activity.instances = [];
			if (activity.activityId != null) {
				activity.instances = datastore.find(activity.activityId);
				activity.instances.sort(function(e0, e1) {
					return parseInt(e1.metadata.timestamp) - parseInt(e0.metadata.timestamp); 
				});
			}
		}
		return true;
	};
	
	// Save settings to local storage
	settings.save = function() {
		datastore.localStorage.setValue('sugar_settings', {
			name: this.name,
			color: this.color,
			colorvalue: xoPalette.colors[this.color],
			activities: this.activities,
			view: app.getView(),
			language: this.language
		});	
	};
	
	// Get properties
	settings.getName = function() {
		return this.name;
	};
	settings.getColor = function() {
		return xoPalette.colors[this.color];
	};
	settings.getView = function() {
		return this.view;
	};
	settings.getLanguage = function() {
		return this.language;
	};
	settings.getActivities = function() {
		return this.activities;
	};
	settings.getActivitiesByName = function(name) {
		if (name === undefined || name == null || name.length == 0)
			return this.activities;
		var activities = this.activities;
		var matching = [];
		for (var i = 0 ; i < activities.length ; i++) {
			if (activities[i].name.toLowerCase().indexOf(name) != -1)
				matching.push(activities[i]);
		}
		return matching;
	};	
	settings.getActivity = function(activityId) {
		for(var i = 0 ; i < this.activities.length ; i++) {
			if (this.activities[i].activityId == activityId) 
				return this.activities[i];
		}
		return null;	
	};
	settings.getFavoritesActivities = function() {
		var favorites = [];
		for(var i = 0 ; i < this.activities.length ; i++) {
			if (this.activities[i].favorite) favorites.push(this.activities[i]);
		}
		return favorites;
	};
	
	// Set properties
	settings.setName = function(newname) {
		this.name = newname;
	};
	settings.setColor = function(newcolor) {
		if (newcolor >= 0 && newcolor < xoPalette.colors.length)
			this.color = newcolor;
	};
	settings.setLanguage = function(newlanguage) {
		this.language = newlanguage;
	};
	settings.setActivities = function(list) {
		this.activities = list;
	};
	
	// Update activities
	settings.updateActivities = function(list) {
		var updated = false;
		for (var i = 0 ; i < list.length ; i++) {
			var found = false;
			for (var j = 0 ; !found && j < this.activities.length ; j++) {
				if (list[i].id == this.activities[j].id) {
					found = true;
					if (this.activities[j].version != list[i].version) {
						this.activities[j].name = list[i].name;
						this.activities[j].version = list[i].version;
						this.activities[j].directory = list[i].directory;
						this.activities[j].icon = list[i].icon;
						updated = true;
					}
				}
			}
			if (!found) {
				this.activities.push(list[i]);
				updated = true;
			}
		}
		return updated;
	};
	
	// Color playing
	settings.nextColor = function() {
		this.color = (this.color+1)%xoPalette.colors.length;
	};
	
	// Activity handling
	settings.runActivity = function(activity, objectId, name) {
		if (activity.activityId == null) {
			activity.activityId = datastore.createUUID();
		}
		this.save();
		var location = activity.directory+"/index.html?aid="+activity.activityId
			+"&a="+activity.id;
		if (objectId === undefined) {
			if (activity.instances != null && activity.instances.length > 0) {
				location = location + "&o="+activity.instances[0].objectId + "&n="+activity.instances[0].metadata.title;
			} else
				location = location + "&n=" +activity.name;			
		} else if (objectId != null) {
			location = location + "&o=" + objectId + "&n="+name;
		} else {
			location = location + "&n=" +activity.name;
		}
		window.location = location;
	};
	settings.switchFavoriteActivity = function(activity) {
		activity.favorite = !activity.favorite;
		return activity.favorite;
	};

	return settings;
});




