


// Activity list
var defaultActivities = [
	{id: "org.sugarlabs.Clock", name: "Clock Web", version: 1, directory: "activities/Clock.activity", icon: "activity/activity-clock.svg", favorite: true, instances: []},
	{id: "org.sugarlabs.ConnectTheDots", name: "Connect the Dots", version: 1, directory: "activities/ConnecttheDots.activity", icon: "activity/activity-icon.svg", favorite: true, instances: []},
	{id: "org.sugarlabs.GearsActivity", name: "Gears", version: 5, directory: "activities/Gears.activity", icon: "activity/activity-icon.svg", favorite: true, instances: []},
	{id: "org.sugarlabs.GTDActivity", name: "Get Things Done", version: 1, directory: "activities/GetThingsDone.activity", icon: "activity/activity-icon.svg", favorite: true, instances: []},
	{id: "org.olpc-france.LOLActivity", name: "Last One Loses Activity", version: 1, directory: "activities/LastOneLoses.activity", icon: "activity/activity-icon.svg", favorite: true, instances: []},
	{id: "org.sugarlabs.Markdown", name: "Markdown", version: 3, directory: "activities/Markdown.activity", icon: "activity/activity-icon.svg", favorite: true, instances: []},
	{id: "org.sugarlabs.MemorizeActivity", name: "Memorize", version: 1, directory: "activities/Memorize.activity", icon: "activity/activity-icon.svg", favorite: true, instances: []},
	{id: "org.sugarlabs.PaintActivity", name: "Paint", version: 1, directory: "activities/Paint.activity", icon: "activity/activity-icon.svg", favorite: true, instances: []},
	{id: "org.sugarlabs.StopwatchActivity", name: "Stopwatch", version: 1, directory: "activities/Stopwatch.activity", icon: "activity/activity-icon.svg", favorite: true, instances: []},
	{id: "org.laptop.WelcomeWebActivity", name: "WelcomeWeb", version: 1, directory: "activities/WelcomeWeb.activity", icon: "activity/welcome-activity.svg", favorite: true, instances: []}
];


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
		activity.instances.push(1);
		this.save();
		window.location = activity.directory+"/index.html";
	};
	this.switchFavoriteActivity = function(activity) {
		activity.favorite = !activity.favorite;
		return activity.favorite;
	};
	
	// Default value
	var name = "<No name>";
	var color = 22;
	var colorvalue = null;
	var activities = defaultActivities;
	
	// Load settings
	this.load();
}




