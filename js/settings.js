


// Activity list
var defaultActivities = [
	{id: "org.sugarlabs.Clock", name: "Clock Web", directory: "activities/Clock.activity", icon: "activity/activity-clock.svg", instances: []},
	{id: "org.sugarlabs.ConnectTheDots", name: "Connect the Dots", directory: "activities/ConnecttheDots.activity", icon: "activity/activity-icon.svg", instances: []},
	{id: "org.sugarlabs.GearsActivity", name: "Gears", directory: "activities/Gears.activity", icon: "activity/activity-icon.svg", instances: []},
	{id: "org.sugarlabs.GTDActivity", name: "Get Things Done", directory: "activities/GetThingsDone.activity", icon: "activity/activity-icon.svg", instances: []},
	{id: "org.olpc-france.LOLActivity", name: "LOL", directory: "activities/LastOneLoses.activity", icon: "activity/activity-icon.svg", instances: []},
	{id: "org.sugarlabs.Markdown", name: "Markdown Activity", directory: "activities/Markdown.activity", icon: "activity/activity-icon.svg", instances: []},
	{id: "org.sugarlabs.MemorizeActivity", name: "Memorize Web", directory: "activities/Memorize.activity", icon: "activity/activity-icon.svg", instances: []},
	{id: "org.sugarlabs.PaintActivity", name: "Paint Web", directory: "activities/Paint.activity", icon: "activity/activity-icon.svg", instances: []},
	{id: "org.sugarlabs.StopwatchActivity", name: "Stopwatch Web", directory: "activities/Stopwatch.activity", icon: "activity/activity-icon.svg", instances: []},
	{id: "org.laptop.WelcomeWebActivity", name: "WelcomeWeb", directory: "activities/WelcomeWeb.activity", icon: "activity/welcome-activity.svg", instances: []}
];


// Settings handling
var preferences = new Settings();
function Settings() {
	
	// Load settings from local storage
	this.load = function() {
		var settings = LocalStorage.getValue('settings');
		if (settings == null)
			return;
		name = settings.name;
		color = settings.color;
		colorvalue = settings.colorvalue;
		activities = settings.activities;
	};
	
	// Save settings to local storage
	this.save = function() {
		LocalStorage.setValue('settings', {name: name, color: color, colorvalue: xoPalette.colors[color], activities: activities});
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
	
	// Run activity
	this.runActivity = function(activity) {
		activity.instances.push(1);
		this.save();
		window.location = activity.directory+"/index.html";
	};
	
	// Default value
	var name = "<No name>";
	var color = 22;
	var colorvalue = null;
	var activities = defaultActivities;
	
	// Load settings
	this.load();
}




