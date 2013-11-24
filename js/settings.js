

// Settings handling
var preferences = new Settings();
function Settings() {
	// Load settings from local storage
	this.load = function() {
		var settings = LocalStorage.getValue('sugar_settings');
		if (settings == null)
			return;
		name = settings.name;
		color = settings.color;
		colorvalue = settings.colorvalue;
		activities = settings.activities;
	};
	
	// Save settings to local storage
	this.save = function() {
		LocalStorage.setValue('sugar_settings', {name: name, color: color, colorvalue: xoPalette.colors[color], activities: activities});
	};
	
	// Get properties
	this.getName = function() {
		return name;
	};
	this.getColor = function() {
		return xoPalette.colors[color];
	};
	this.getActivities = function() {
		return activities;
	};
	this.getFavoritesActivities = function() {
		var favorites = [];
		for(var i = 0 ; i < activities.length ; i++) {
			if (activities[i].favorite) favorites.push(activities[i]);
		}
		return favorites;
	};
	this.setActivities = function(list) {
		activities = list;
	};
	
	// Set properties
	this.setName = function(newname) {
		name = newname;
	};
	this.setColor = function(newcolor) {
		if (newcolor >= 0 && newcolor < xoPalette.colors.length)
			color = newcolor;
	};
	
	// Color playing
	this.nextColor = function() {
		color = (color+1)%xoPalette.colors.length;
	};
	
	// Activity handling
	this.runActivity = function(activity) {
		if (activity.activityId == null) {
			activity.activityId = util.createUUID();
		}
		this.save();
		window.location = activity.directory+"/index.html?aid="+activity.activityId
			+"&a="+activity.id
			+"&n="+activity.name;
	};
	this.switchFavoriteActivity = function(activity) {
		activity.favorite = !activity.favorite;
		return activity.favorite;
	};
	
	// Default value
	var name = "<No name>";
	var color = 22;
	var colorvalue = null;
	var activities = null;
	
	// Load settings
	this.load();
}




