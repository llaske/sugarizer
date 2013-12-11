

// Popup menu of the activity
enyo.kind({
	name: "Sugar.Desktop.ActivityPopup",
	kind: "enyo.Control",
	classes: "home-activity-popup",
	published: { icon: null },
	components: [
		{classes: "popup-title", onclick: "runLastActivity", components: [
			{name: "icon", kind: "Sugar.ActivityIcon", x: 5, y: 5, size: constant.iconSizeList},
			{name: "name", classes: "popup-name-text"},
			{name: "title", classes: "popup-title-text"},
		]},
		{name: "history", classes: "popup-history", showing: false, components: [
			{name: "historylist", kind: "Sugar.Desktop.PopupListView"}
		]},
		{name: "footer", classes: "popup-footer", showing: false, onclick: "runNewActivity", components: [
			{name: "iconbase", kind: "Sugar.ActivityIcon", x: 5, y: 8, size: constant.iconSizeFavorite, colorized: false},
			{content: "Start new", classes: "popup-new-text"}			
		]}
	],
	
	// Constructor
	create: function() {
		this.inherited(arguments);	
		this.iconChanged();	
		this.timer = null;
	},
	
	// Property changed
	iconChanged: function() {
		if (this.icon != null) {
			this.applyStyle("margin-left", (this.icon.x+constant.popupMarginLeft)+"px");
			this.applyStyle("margin-top", (this.icon.y+constant.popupMarginTop)+"px");
			this.$.icon.setActivity(this.icon.activity);
			this.$.icon.setColorized(this.icon.activity.activityId != null);
			this.$.icon.render();
			this.$.name.setContent(this.icon.activity.name);
			if (this.icon.activity.activityId != null && this.icon.activity.instances[0].metadata.title !== undefined) {
				this.$.title.setContent(this.icon.activity.instances[0].metadata.title);			
			} else {
				this.$.title.setContent(this.icon.activity.name+" activity");
			}
			this.$.iconbase.setActivity(this.icon.activity);			
		}
	},
	
	// Control popup visibility
	showPopup: function() {
		this.show();
		this.timer = window.setInterval(enyo.bind(this, "showContent"), constant.timerPopupDuration);
	},
	
	hidePopup: function() {
		this.hide();
		this.$.history.hide();
		this.$.historylist.setActivity(null);
		this.$.footer.hide();
	},
	
	showContent: function() {
		window.clearInterval(this.timer);
		this.timer = null;
		if (this.showing) {
			this.$.historylist.setActivity(this.icon.activity);	
			if (this.icon.activity.instances.length > 0)
				this.$.history.show();
			this.$.footer.show();
		}
	},
	
	// Click on the header icon, launch last activity
	runLastActivity: function() {
		preferences.runActivity(this.icon.activity);
	},
	
	// Click on the footer icon, launch new activity
	runNewActivity: function() {
		preferences.runActivity(this.icon.activity, null);
	},
	
	// Test is cursor is inside the popup
	cursorIsInside: function(position) {
		var obj = document.getElementById(this.getAttribute("id"));
		var p = {};
		p.x = obj.offsetLeft;
		p.y = obj.offsetTop;
		p.dx = obj.clientWidth;
		p.dy = obj.clientHeight;
		while (obj.offsetParent) {
			p.x = p.x + obj.offsetParent.offsetLeft;
			p.y = p.y + obj.offsetParent.offsetTop;
			if (obj == document.getElementsByTagName("body")[0]) {
				break;
			} else {
				obj = obj.offsetParent;
			}
		}
        var isInside = (position.x >= p.x && position.x <= p.x + p.dx && position.y >= p.y && position.y <= p.y + p.dy);
		return isInside;
	}
});




// Activity popup ListView
enyo.kind({
	name: "Sugar.Desktop.PopupListView",
	kind: "Scroller",
	published: { activity: null },
	classes: "history-listView",
	components: [
		{name: "historyList", classes: "history-list", kind: "Repeater", onSetupItem: "setupItem", components: [
			{name: "item", classes: "history-list-item", onclick: "runOldActivity", components: [
				{name: "icon", kind: "Sugar.ActivityIcon", x: 5, y: 4, size: constant.iconSizeFavorite, colorized: true},	
				{name: "name", classes: "history-name"}
			]}
		]}
	],
  
	// Constructor: init list
	create: function() {
		this.inherited(arguments);
		this.activityChanged();
	},
	
	// Activity changed, compute history list
	activityChanged: function() {
		if (this.activity != null)
			this.$.historyList.setCount(Math.min(this.activity.instances.length, constant.maxPopupHistory));
		else
			this.$.historyList.setCount(0);
	},

	// Init setup for a line
	setupItem: function(inSender, inEvent) {
		// Set item in the template
		inEvent.item.$.icon.setActivity(this.activity);
		inEvent.item.$.name.setContent(this.activity.instances[inEvent.index].metadata.title);		
	},
	
	// Click on the item, launch the activity
	runOldActivity: function(inSender, inEvent) {
		preferences.runActivity(this.activity, this.activity.instances[inEvent.index].objectId, this.activity.instances[inEvent.index].metadata.title);
	},	
});