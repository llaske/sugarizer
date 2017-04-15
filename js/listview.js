
// Listview view
enyo.kind({
	name: "Sugar.DesktopListView",
	kind: "Scroller",
	published: { activities: [] },
	components: [
		{name: "nomatch", classes: "listview-nomatch", showing: false},
		{name: "message", classes: "listview-message", showing: false},
		{name: "nofilter", kind: "Sugar.IconButton", icon: {directory: "icons", icon: "dialog-cancel.svg"}, classes: "listview-button", ontap: "nofilter", showing: false},
		{name: "activityPopup", kind: "Sugar.Popup", showing: false},
		{name: "activityList", classes: "activity-list", kind: "Repeater", onSetupItem: "setupItem", onresize: "computeSize", components: [
			{name: "item", classes: "activity-list-item", components: [
				{name: "favorite", kind: "Sugar.Icon", x: 10, y: 14, size: constant.iconSizeFavorite, ontap: "doSwitchFavorite"},
				{name: "activity", kind: "Sugar.Icon", x: 60, y: 5, size: constant.iconSizeList, ontap:"doRunNewActivity"},
				{name: "name", classes: "activity-name"},
				{name: "version", classes: "activity-version"}
			]}
		]}
	],
	handlers: {
		onScroll: "onscroll"
	},

	// Constructor: init list
	create: function() {
		this.inherited(arguments);
		this.realLength = 0;
		if (!window.sugarizerOS) {
			this.activitiesChanged();
			this.computeSize();
			this.draw();
		} else {
			var t = this;
			var a = arguments;
			sugarizerOS.initActivitiesPreferences(function (){
				t.activitiesChanged();
				t.computeSize();
				t.draw();
			});
		}
	},

	computeSize: function() {
		var toolbar = document.getElementById("toolbar");
		var canvas = document.getElementById("canvas");
		var canvas_height = canvas.offsetHeight;
		this.applyStyle("height", canvas_height+"px");
	},

	// Get linked toolbar, same than the desktop view
	getToolbar: function() {
		return app.getToolbar();
	},

	// Draw screen
	draw: function() {
		// Set no matching activities
		var canvas_center = util.getCanvasCenter();
		this.$.nomatch.applyStyle("margin-left", (canvas_center.x-constant.sizeEmpty/4)+"px");
		var margintop = (canvas_center.y-constant.sizeEmpty/4);
		this.$.nomatch.applyStyle("margin-top", margintop+"px");
		this.$.message.setContent(l10n.get("NoMatchingActivities"));
		this.$.nofilter.setText(l10n.get("ClearSearch"));
	},

	// Property changed
	activitiesChanged: function() {
		var noFilter = app.getToolbar().getSearchText().length == 0;
		var length = (noFilter && this.activities.length > constant.listInitCount) ? constant.listInitCount : this.activities.length;
		this.realLength = this.activities.length;
		this.$.activityList.set("count", length, true);
		if (this.activities.length == 0) {
			this.$.nomatch.show();
			this.$.message.show();
			this.$.nofilter.show();
		} else {
			this.$.nomatch.hide();
			this.$.message.hide();
			this.$.nofilter.hide();
		}
	},

	// Init setup for a line
	setupItem: function(inSender, inEvent) {
		// Set item in the template
		var activitiesList = sorted(this.activities);
		if (activitiesList[inEvent.index].type !== 'undefined' && activitiesList[inEvent.index].type == "native") {
			activitiesList[inEvent.index].isNative = true;
		}
		inEvent.item.$.activity.setIcon(activitiesList[inEvent.index]);
		inEvent.item.$.activity.setPopupShow(enyo.bind(this, "showActivityPopup"));
		inEvent.item.$.activity.setPopupHide(enyo.bind(this, "hideActivityPopup"));
		inEvent.item.$.favorite.setIcon({directory: "icons", icon: "emblem-favorite.svg"});
		inEvent.item.$.favorite.setColorized(activitiesList[inEvent.index].favorite);
		inEvent.item.$.name.setContent(activitiesList[inEvent.index].name);
		inEvent.item.$.version.setContent(l10n.get("VersionNumber", {number:activitiesList[inEvent.index].version}));
		if (l10n.language.direction == "rtl") {
			inEvent.item.$.name.addClass("rtl-14");
			inEvent.item.$.version.addClass("rtl-14");
		}
	},

	// Handle scroll to lazy display content
	onscroll: function(inSender, inEvent) {
		var scrollBounds = inEvent.scrollBounds;
		var currentCount = this.$.activityList.get("count");
		if (app.getToolbar().getSearchText().length == 0 && scrollBounds && (scrollBounds.maxTop - scrollBounds.top) < constant.listScrollLimit && this.realLength > currentCount) {
			var length = Math.min(currentCount + constant.listStepCount, this.activities.length);
			humane.log(l10n.get("Loading"));
			this.$.activityList.set("count", length, true);
		}
	},

	// Switch favorite value for clicked line
	doSwitchFavorite: function(inSender, inEvent) {
		var activitiesList = sorted(this.activities);
		this.switchFavorite(inEvent.dispatchTarget.container, activitiesList[inEvent.index]);
	},
	switchFavorite: function(favorite, activity) {
		util.vibrate();
		favorite.setColorized(preferences.switchFavoriteActivity(activity));
		favorite.container.render();
		preferences.save();
		preferences.saveToServer(myserver);
		this.getToolbar().askRedraw();
		this.$.activityPopup.hidePopup();
	},

	// Run new activity
	doRunNewActivity: function(inSender, inEvent) {
		var activitiesList = sorted(this.activities);
		this.runNewActivity(activitiesList[inEvent.index])
	},
	runNewActivity: function(activity) {
		// Start a new activity instance
		util.vibrate();
		this.$.activityPopup.hidePopup();
		preferences.runActivity(activity, null);
	},

	// Popup menu handling
	showActivityPopup: function(icon) {
		// Create popup
		var activity = icon.icon;
		this.$.activityPopup.setHeader({
			icon: activity,
			colorized: true,
			name: activity.name,
			title: null,
			action: null
		});
		var items = [];
		items.push({
			icon: icon.parent.container.$.favorite.icon,
			colorized: !activity.favorite,
			name: activity.favorite ? l10n.get("RemoveFavorite") : l10n.get("MakeFavorite"),
			action: enyo.bind(this, "switchFavorite"),
			data: [icon.parent.container.$.favorite, icon.icon]
		});
		items.push({
			icon: activity,
			colorized: false,
			name: l10n.get("StartNew"),
			action: enyo.bind(this, "runNewActivity"),
			data: [activity, null]
		});
		this.$.activityPopup.setFooter(items);

		// Show popup
		this.$.activityPopup.setMargin({left: 0, top: (icon.owner.index*60)+20-mouse.position.y});
		this.$.activityPopup.showPopup();
	},
	hideActivityPopup: function(icon) {
		// Hide popup
		if (this.$.activityPopup.cursorIsInside() || icon.cursorIsInside()) {
			return false;
		}
		this.$.activityPopup.hidePopup();
		return true;
	},

	// Remove filter
	nofilter: function() {
		app.getToolbar().setSearchText("");
		app.filterActivities();
	}
});

function sorted(activities) {
	var result = [];
	for (var i in activities) {
			result.push(activities[i]);
	}
	result.sort(function (a, b) {    
		return a.name == b.name ? 0 : (a.name > b.name ? 1 : -1); 
	});
	return result;
}