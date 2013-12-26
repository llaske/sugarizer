
// Listview view
enyo.kind({
	name: "Sugar.Desktop.ListView",
	kind: "Scroller",
	published: { count: 0 },	
	components: [
		{name: "activityList", classes: "activity-list", kind: "Repeater", onSetupItem: "setupItem", components: [
			{name: "item", classes: "activity-list-item", components: [
				{name: "favorite", kind: "Sugar.ActivityIcon", x: 10, y: 14, size: constant.iconSizeFavorite, onclick: "switchFavorite"},			
				{name: "activity", kind: "Sugar.ActivityIcon", x: 60, y: 5, size: constant.iconSizeList, onclick:"runNewActivity"},
				{name: "name", classes: "activity-name"},
				{name: "version", classes: "activity-version"}
			]}
		]}
	],
  
	// Constructor: init list
	create: function() {
		this.inherited(arguments);
		this.countChanged();
	},
	
	// Property changed
	countChanged: function() {
		this.$.activityList.setCount(this.count);
	},

	// Init setup for a line
	setupItem: function(inSender, inEvent) {
		// Set item in the template
		var activitiesList = preferences.getActivities();
		inEvent.item.$.activity.setActivity(activitiesList[inEvent.index]);
		inEvent.item.$.favorite.setActivity({directory: "icons", icon: "emblem-favorite.svg"});		
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
		app.redraw();		
	},
	
	// Run new activity
	runNewActivity: function(inSender, inEvent) {
		var activitiesList = preferences.getActivities();	
		preferences.runActivity(activitiesList[inEvent.index], null);
	}
});
