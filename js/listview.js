
// Listview view
enyo.kind({
	name: "Sugar.Desktop.ListView",
	kind: "Scroller",
	published: { count: 0 },	
	components: [
		{name: "activityPopup", kind: "Sugar.Desktop.ActivityPopup", showing: false},	
		{name: "activityList", classes: "activity-list", kind: "Repeater", onSetupItem: "setupItem", components: [
			{name: "item", classes: "activity-list-item", components: [
				{name: "favorite", kind: "Sugar.ActivityIcon", x: 10, y: 14, size: constant.iconSizeFavorite, onclick: "doSwitchFavorite"},			
				{name: "activity", kind: "Sugar.ActivityIcon", x: 60, y: 5, size: constant.iconSizeList, onclick:"doRunNewActivity"},
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
		inEvent.item.$.activity.setPopupShow(enyo.bind(this, "showActivityPopup"));
		inEvent.item.$.activity.setPopupHide(enyo.bind(this, "hideActivityPopup"));		
		inEvent.item.$.favorite.setActivity({directory: "icons", icon: "emblem-favorite.svg"});		
		inEvent.item.$.favorite.setColorized(activitiesList[inEvent.index].favorite);		
		inEvent.item.$.name.setContent(activitiesList[inEvent.index].name);	
		inEvent.item.$.version.setContent(l10n.get("VersionNumber", {number:activitiesList[inEvent.index].version}));
	},
	
	// Switch favorite value for clicked line
	doSwitchFavorite: function(inSender, inEvent) {
		var activitiesList = preferences.getActivities();
		this.switchFavorite(inSender, activitiesList[inEvent.index]);		
	},
	switchFavorite: function(favorite, activity) {
		favorite.setColorized(preferences.switchFavoriteActivity(activity));
		favorite.render();
		preferences.save();
		app.redraw();		
		this.$.activityPopup.hidePopup();
	},
	
	// Run new activity
	doRunNewActivity: function(inSender, inEvent) {
		var activitiesList = preferences.getActivities();
		this.runNewActivity(activitiesList[inEvent.index])
	},
	runNewActivity: function(activity) {
		// Start a new activity instance
		preferences.runActivity(activity, null);
	},	
	
	// Popup menu handling
	showActivityPopup: function(icon) {
		// Create popup
		this.$.activityPopup.setIcon(icon);
		this.$.activityPopup.setHeader({
			icon: icon,
			colorized: true,
			name: icon.activity.name,
			title: null,
			action: null
		});
		var items = [];
		items.push({
			icon: icon.parent.container.$.favorite,
			colorized: !icon.activity.favorite,
			name: icon.activity.favorite ? l10n.get("RemoveFavorite") : l10n.get("MakeFavorite"),
			action: enyo.bind(this, "switchFavorite"),	
			data: [icon.parent.container.$.favorite, icon.activity]
		});
		items.push({
			icon: icon,
			colorized: false,
			name: l10n.get("StartNew"),
			action: enyo.bind(this, "runNewActivity"),	
			data: [icon.activity, null]
		});
		this.$.activityPopup.setFooter(items);
		
		// Show popup
		this.$.activityPopup.showPopup();
	},
	hideActivityPopup: function() {
		// Hide popup
		if (this.$.activityPopup.cursorIsInside())
			return false;	
		this.$.activityPopup.hidePopup();
		return true;
	}	
});
