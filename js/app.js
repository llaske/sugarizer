
// Sugar Libraries (initialized by require)
var iconLib;
var xoPalette;
var radioButtonsGroup;


// Constants
var sizeOwner = 100;
var sizeRadius = 180.0;
var radialView = 0;
var listView = 1;


// Main app class
enyo.kind({
	name: "Sugar.Desktop",
	kind: enyo.Control,
	components: [
		{name: "owner", onclick: "changeColor", classes: "owner-icon", showing: true},
		{name: "activitybox", showing: true, components: []},
		{name: "activitylist", showing: false, kind: "Sugar.Desktop.ListView"}
	],
	
	// Constructor
	create: function() {
		this.inherited(arguments);
		this.currentView = radialView;		
		this.init();
	},
	
	// Init desktop
	init: function() {
		this.draw();
	},
	
	// Draw desktop
	draw: function() {
		// Clean desktop
		var items = [];
		enyo.forEach(this.$.activitybox.getControls(), function(item) {	items.push(item); });		
		for (var i = 0 ; i < items.length ; i++) { items[i].destroy(); };
		
		// Get desktop size
		var canvas = document.getElementById("canvas");
		var canvas_height = canvas.offsetHeight;
		var canvas_width = canvas.offsetWidth;
		var canvas_centery = parseFloat(canvas_height)/2.0;
		var canvas_centerx = parseFloat(canvas_width)/2.0
		var radius = Math.min(canvas_centery,sizeRadius);
		
		// Draw XO owner
		this.$.owner.applyStyle("margin-left", (canvas_centerx-sizeOwner/4)+"px");
		this.$.owner.applyStyle("margin-top", (canvas_centery-sizeOwner/4)+"px");
		
		// Draw activity icons;	
		var activitiesList = preferences.getFavoritesActivities();
		var base_angle = ((Math.PI*2.0)/parseFloat(activitiesList.length));
		for (var i = 0 ; i < activitiesList.length ; i++) {
			var activity = activitiesList[i];
			var angle = base_angle*parseFloat(i);
			this.$.activitybox.createComponent({
					kind: "Sugar.ActivityIcon", 
					activity: activity, 
					x: canvas_centerx+Math.cos(angle)*radius, 
					y: canvas_centery+Math.sin(angle)*radius,
					colorized: activity.instances.length > 0,
					onclick: "runActivity"
				},
				{owner: this}).render();
		}
	},
	
	// Switch between radial and list view
	switchView: function() {
		this.currentView = (this.currentView + 1) % 2;
		this.$.owner.hide();
		this.$.activitybox.hide();
		this.$.activitylist.hide();
		if (this.currentView == radialView) {
			this.draw();
			this.$.activitybox.show();
			this.$.owner.show();
			this.render();
		}
		else if (this.currentView == listView)
			this.$.activitylist.show();		
	},
	
	// Render
	rendered: function() {
		this.inherited(arguments);
		iconLib.colorize(this.$.owner.hasNode(), preferences.getColor());
	},
	
	// Change color
	changeColor: function() {
		preferences.nextColor();
		this.draw();
		this.render();
	},
	
	// Run activity
	runActivity: function(icon) {
		// Save context then run the activity in the context
		preferences.runActivity(icon.activity);
	}
});


// Listview view
enyo.kind({
	name: "Sugar.Desktop.ListView",
	kind: "Scroller",
	components: [
		{name: "activityList", classes: "activity-list", kind: "Repeater", onSetupItem: "setupItem", components: [
			{name: "item", classes: "activity-list-item", components: [
				{name: "favorite", kind: "Sugar.ActivityIcon", x: 10, y: 14, size: 20, onclick: "switchFavorite",
					activity: { directory: "icons", icon: "emblem-favorite.svg" }},			
				{name: "activity", kind: "Sugar.ActivityIcon", x: 60, y: 5, size: 40},
				{name: "name", classes: "activity-name"},
				{name: "version", classes: "activity-version"}
			]}
		]}
	],
  
	// Constructor: init list
	create: function() {
		this.inherited(arguments);
		this.$.activityList.setCount(preferences.getActivities().length);
	},

	// Init setup for a line
	setupItem: function(inSender, inEvent) {
		// Set item in the template
		var activitiesList = preferences.getActivities();
		inEvent.item.$.activity.setActivity(activitiesList[inEvent.index]);
		inEvent.item.$.favorite.setColorized(activitiesList[inEvent.index].favorite);		
		inEvent.item.$.name.setContent(activitiesList[inEvent.index].name);	
		inEvent.item.$.version.setContent("Version "+activitiesList[inEvent.index].version);			
	},
	
	// Switch favorite value for clicked line
	switchFavorite: function(inSender, inEvent) {
		var activitiesList = preferences.getActivities();	
		inSender.setColorized(preferences.switchFavoriteActivity(activitiesList[inEvent.index]));
		inSender.render();
		preferences.save();
	}
});

