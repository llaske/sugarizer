
// Sugar Libraries (initialized by require)
var app = null;
var toolbar = null;
var mouse = {position: {x: -1, y: -1}};
var iconLib;
var xoPalette;
var radioButtonsGroup;
var datastore;
var presence;
var l10n;
var preferences;
var util;
var myserver;



// Main app class
enyo.kind({
	name: "Sugar.Desktop",
	kind: enyo.Control,
	components: [
		{name: "owner", kind: "Sugar.Icon", size: constant.sizeOwner, colorized: true, classes: "owner-icon", showing: false},
		{name: "journal", kind: "Sugar.Icon", size: constant.sizeJournal, ontap: "showJournal", classes: "journal-icon", showing: false},
		{name: "desktop", showing: true, onresize: "resize", components: []},
		{name: "otherview", showing: true, components: []},
		{name: "activityPopup", kind: "Sugar.Popup", showing: false},
		{name: "activities", kind: "enyo.WebService", onResponse: "queryActivitiesResponse", onError: "queryActivitiesFail"}
	],

	// Constructor
	create: function() {
		// Init screen
		this.inherited(arguments);
		this.timer = null;
		this.otherview = null;
		this.toolbar = null;
		util.setToolbar(this.getToolbar());
		this.$.owner.setIcon({directory: "icons", icon: "owner-icon.svg"});
		this.$.owner.setPopupShow(enyo.bind(this, "showBuddyPopup"));
		this.$.owner.setPopupHide(enyo.bind(this, "hideBuddyPopup"));
		this.$.journal.setIcon({directory: "icons", icon: "activity-journal.svg"});

		// Load and sort journal
		this.journal = datastore.find();
		this.journal = this.journal.sort(function(e0, e1) {
			return parseInt(e1.metadata.timestamp) - parseInt(e0.metadata.timestamp);
		});

		// Call activities list service
		if (util.getClientType() == constant.thinClientType) {
			this.$.activities.setUrl(myserver.getActivitiesUrl());
		} else {
			this.$.activities.setUrl(constant.staticInitActivitiesURL);
		}
		this.$.activities.send();

		// Call network id
		if (preferences.isConnected()) {
			// Create a new user on the network
			var networkId = preferences.getNetworkId();
			if (networkId == null) {
				myserver.postUser(
					{
						name: preferences.getName(),
						color: preferences.getColor(),
						language: preferences.getLanguage()
					},
					function(inSender, inResponse) {
						preferences.setNetworkId(inResponse._id);
						preferences.setPrivateJournal(inResponse.private_journal);
						preferences.setSharedJournal(inResponse.shared_journal);
						preferences.save();
						presence.joinNetwork(function (error, user) {
							if (error) {
								console.log("WARNING: Can't connect to presence server");
							}
						});
					},
					function() {
						console.log("WARNING: Error creating network user");
					}
				);
			}

			// Retrieve user settings
			else {
				var that = this;
				myserver.getUser(
					networkId,
					function(inSender, inResponse) {
						var changed = preferences.merge(inResponse);
						if (changed) {
							preferences.save();
							util.restartApp();
						} else if (that.currentView == constant.journalView) {
							that.otherview.updateNetworkBar();
						}
						presence.joinNetwork(function (error, user) {
							if (error) {
								console.log("WARNING: Can't connect to presence server");
							}
						});
					},
					function() {
						console.log("WARNING: Can't read network user settings");
					}
				);
			}
		}
	},

	// Init activities service response, redraw screen
	queryActivitiesResponse: function(inSender, inResponse) {
		// No activities at start
		if (preferences.getActivities() == null) {
			// Just copy the activities from the service
			preferences.setActivities(inResponse.data);
			preferences.save();
		} else {
			// Update with new activities
			if (preferences.updateActivities(inResponse.data))
				preferences.save();
		}
	    preferences.updateEntries();
	    if (window.sugarizerOS){
		sugarizerOS.initActivitiesPreferences();
	    }
	    this.init();
	},

	// Error on init activities
	queryActivitiesFail: function(inSender, inError) {
		// Dynamic don't work try static list
		if (this.$.activities.getUrl().indexOf(constant.dynamicInitActivitiesURL) != -1) {
			console.log("WARNING: Backoffice not responding, use static list");
			this.$.activities.setUrl(constant.staticInitActivitiesURL);
			this.$.activities.send();
		}

		// Unable to load
		else {
			console.log("Error loading init activities");
		}
	},

	// Get linked toolbar
	getToolbar: function() {
		if (this.toolbar == null)
			this.toolbar = new Sugar.DesktopToolbar();
		return this.toolbar;
	},

	// Get linked popup
	getPopup: function() {
		return this.$.activityPopup;
	},

	// Init desktop
	init: function() {
		this.currentView = constant.radialView;
		if (preferences.getView())
			this.showView(preferences.getView());
		this.draw();
	},

	// Draw desktop
	draw: function() {
		// Clean desktop
		var items = [];
		enyo.forEach(this.$.desktop.getControls(), function(item) {	items.push(item); });
		for (var i = 0 ; i < items.length ; i++) { items[i].destroy(); };

		// Compute center and radius
		var canvas_center = util.getCanvasCenter();
		var icon_size = constant.iconSizeStandard;
		var icon_padding = icon_size*constant.iconSpacingFactor;
		var semi_size = icon_size/2;
		var jdeltay = (canvas_center.dy < 480) ? -12 : 0;

		// Draw XO owner
		this.$.owner.applyStyle("margin-left", (canvas_center.x-constant.sizeOwner/2)+"px");
		this.$.owner.applyStyle("margin-top", (canvas_center.y-constant.sizeOwner/2)+"px");
		this.$.journal.setColorized(this.journal.length > 0);
		this.$.journal.applyStyle("margin-left", (canvas_center.x-constant.sizeJournal/2)+"px");
		this.$.journal.applyStyle("margin-top", (canvas_center.y+constant.sizeOwner-constant.sizeJournal+jdeltay)+"px");
		this.$.owner.setShowing(this.currentView == constant.radialView);
		this.$.journal.setShowing(this.currentView == constant.radialView);

		// Compute ring size and shape
		var activitiesList = preferences.getFavoritesActivities();
		var activitiesCount = activitiesList.length;
		var activitiesIndex = 0;
		var radiusx, radiusy, base_angle, spiralMode, restrictedMode;
		var PI2 = Math.PI*2.0;
		radiusx = radiusy = Math.max(constant.ringMinRadiusSize, Math.min(canvas_center.x-icon_size,canvas_center.y-icon_size));
		var circumference = PI2*radiusx;
		if ((circumference/activitiesList.length) >= constant.iconSpacingFactor*icon_padding) {
			spiralMode = restrictedMode = false;
			base_angle = (PI2/parseFloat(activitiesList.length));
		} else {
			if (this.hasRoomForSpiral(canvas_center, icon_padding)) {
				spiralMode = true; restrictedMode = false;
				radiusx = radiusy = icon_padding*constant.ringInitSpaceFactor;
				activitiesCount = parseInt((PI2*radiusx)/icon_padding);
				base_angle = PI2/activitiesCount;
			} else {
				restrictedMode = true; spiralMode = false;
				activitiesCount = parseInt(circumference/icon_padding)-1;
				base_angle = (PI2/parseFloat(activitiesCount+1));
			}
		}

		// Draw activity icons
		var angle = -Math.PI/2.0-base_angle;
		for (var i = 0 ; i < activitiesList.length ; i++) {
			var activity = activitiesList[i];
			var ix, iy;
			if (!spiralMode) {
				angle += base_angle;
				ix = (canvas_center.x+Math.cos(angle)*radiusx-semi_size);
				iy = (canvas_center.y+Math.sin(angle)*radiusy-semi_size);
			} else {
				angle += base_angle;
				if (activitiesIndex >= activitiesCount) {
					radiusx = radiusy = radiusx + icon_padding*constant.ringSpaceFactor;
					activitiesCount = parseInt((PI2*radiusx)/icon_padding);
					activitiesIndex = 0;
					angle -= (base_angle/constant.ringAdjustAngleFactor);
					base_angle = PI2/activitiesCount;
				}
				var delta = (icon_padding*constant.ringAdjustSizeFactor)/(activitiesCount-activitiesIndex);
				ix = (canvas_center.x+Math.cos(angle)*(radiusx+delta)-semi_size);
				iy = (canvas_center.y+Math.sin(angle)*(radiusy+delta)-semi_size);
			}
			if (restrictedMode && i >= activitiesCount-1) {
				this.$.desktop.createComponent({
						kind: "Sugar.Icon",
						icon: {directory: "icons", icon: "activity-etc.svg", name: l10n.get("ListView")},
						size: icon_size,
						x: ix,
						y: iy,
						ontap: "showListView"
					},
					{owner: this}).render();
				break;
			}
		    if (activity.type != null && activity.type == "native")
			activity.isNative = true;
			this.$.desktop.createComponent({
					kind: "Sugar.Icon",
					icon: activity,  // HACK: Icon characteristics are embedded in activity object
					size: icon_size,
					x: ix,
					y: iy,
					colorized: activity.instances !== undefined && activity.instances.length > 0,
					colorizedColor: (activity.instances !== undefined && activity.instances.length > 0 && activity.instances[0].metadata.buddy_color) ? activity.instances[0].metadata.buddy_color : null,
					ontap: "runMatchingActivity",
					popupShow: enyo.bind(this, "showActivityPopup"),
					popupHide: enyo.bind(this, "hideActivityPopup")
				},
				{owner: this}).render();
			activitiesIndex++;
		}
	},

	// Redraw, for example after a resized event
	redraw: function() {
		this.draw();
		if (this.currentView == constant.radialView || this.currentView == constant.listView) {
			this.filterActivities();
		}
		this.render();
	},

	resize: function() {
		if (this.noresize) return;
		this.redraw();
	},

	hasRoomForSpiral: function(canvas_center, icon_padding) {
		var activitiesList = preferences.getFavoritesActivities();
		var activitiesCount = activitiesList.length;
		var radius = icon_padding*constant.ringInitSpaceFactor;
		while (activitiesCount > 0) {
			activitiesCount -= parseInt(((Math.PI*2.0)*radius)/icon_padding);
			radius += icon_padding*constant.ringSpaceFactor;
		}
		radius -= (icon_padding/2.0);
		var diameter = radius*2;
		return (diameter <= canvas_center.dx && diameter <= canvas_center.dy);
	},

	// Switch between radial and other views (list or journal)
	showView: function(newView) {
		if (this.currentView == newView)
			return;
		var oldView = this.currentView;
		this.currentView = newView;

		// Show desktop
		if (newView == constant.radialView) {
			util.setToolbar(this.getToolbar());
			toolbar.setActiveView(constant.radialView);
			this.$.otherview.hide();
			this.$.desktop.show();
			this.$.owner.show();
			this.$.journal.show();
			this.otherview = null;
			return;
		}

		// Hide desktop
		this.$.owner.hide();
		this.$.journal.hide();
		this.$.desktop.hide();
		this.clearView();

		// Show list
		if (newView == constant.listView) {
			util.setToolbar(this.getToolbar());
			var filter = toolbar.getSearchText().toLowerCase();
			toolbar.setActiveView(constant.listView);
			this.otherview = this.$.otherview.createComponent({kind: "Sugar.DesktopListView", activities: preferences.getActivitiesByName(filter)});
		}

		// Show journal
		else if (newView == constant.journalView) {
			if (this.timer != null) {
				this.getPopup().hidePopup();
				window.clearInterval(this.timer);
			}
			this.otherview = this.$.otherview.createComponent({kind: "Sugar.Journal", journal: this.journal});
			util.setToolbar(this.otherview.getToolbar());
		}

		// Show neighborhood
		else if (newView == constant.neighborhoodView) {
			this.otherview = this.$.otherview.createComponent({kind: "Sugar.NeighborhoodView"});
			toolbar.setActiveView(constant.neighborhoodView);
			util.setToolbar(this.otherview.getToolbar());
		}

		this.$.otherview.show();
		this.$.otherview.render();
	},

	getView: function() {
		return this.currentView;
	},

	clearView: function() {
		var controls = this.$.otherview.getControls();
		for (var i = 0, c; c = controls[i]; i++) c.destroy();
	},

	showListView: function() {
		this.showView(constant.listView);
	},

	// Render
	rendered: function() {
		this.inherited(arguments);
		this.$.owner.colorize(preferences.getColor());
		if (this.journal.length > 0)
			this.$.journal.colorize(preferences.getColor());
	},

	// Run activity
	runMatchingActivity: function(icon) {
		if (!icon.getDisabled())
			this.runActivity(icon.icon);
	},
	runActivity: function(activity) {
		// Run the last activity instance in the context
		preferences.runActivity(activity);
	},
	runOldActivity: function(activity, instance) {
		// Run an old activity instance
		preferences.runActivity(activity, instance.objectId, instance.metadata.title);
	},
	runNewActivity: function(activity) {
		// Start a new activity instance
		preferences.runActivity(activity, null);
	},

	// Display journal
	showJournal: function() {
		this.showView(constant.journalView);
	},

	// Popup menu for activities handling
	showActivityPopup: function(icon) {
		// Create popup
		var title;
		var activity = icon.icon; // HACK: activity is stored as an icon
		if (activity.instances !== undefined && activity.instances.length > 0 && activity.instances[0].metadata.title !== undefined) {
			title = activity.instances[0].metadata.title;
		} else {
			title = l10n.get('NameActivity', {name: activity.name});
		}
		this.getPopup().setHeader({
			icon: activity,
			colorized: activity.instances !== undefined && activity.instances.length > 0,
			colorizedColor: (activity.instances !== undefined && activity.instances.length > 0 && activity.instances[0].metadata.buddy_color) ? activity.instances[0].metadata.buddy_color : null,
			name: activity.name,
			title: title,
			action: enyo.bind(this, "runActivity"),
			data: [activity, null]
		});
		var items = [];
		if (activity.instances)
			for(var i = 0 ; i < activity.instances.length && i < constant.maxPopupHistory; i++) {
				items.push({
					icon: activity,
					colorized: true,
					colorizedColor: (activity.instances[i].metadata.buddy_color ? activity.instances[i].metadata.buddy_color : null),
					name: activity.instances[i].metadata.title,
					action: enyo.bind(this, "runOldActivity"),
					data: [activity, activity.instances[i]]
				});
			}
	    
	    if (!activity.isNative){
		this.getPopup().setItems(items);
		this.getPopup().setFooter([{
			icon: activity,
			colorized: false,
			name: l10n.get("StartNew"),
			action: enyo.bind(this, "runNewActivity"),
			data: [activity, null]
		}]);
	    }

		// Show popup
		this.getPopup().showPopup();
	},
	hideActivityPopup: function() {
		// Hide popup
		if (this.getPopup().cursorIsInside())
			return false;
		this.getPopup().hidePopup();
		return true;
	},

	// Popup menu for buddy handling
	showBuddyPopup: function(icon) {
		// Create popup
		this.getPopup().setHeader({
			icon: icon.icon,
			colorized: true,
			name: preferences.getName(),
			title: null,
			action: null
		});
		this.getPopup().setItems(null);
		var items = [];
		items.push({
			icon: {directory: "icons", icon: "system-shutdown.svg"},
			colorized: false,
			name: l10n.get("Shutdown"),
			action: enyo.bind(this, "doShutdown"),
			data: null
		});
		items.push({
			icon: {directory: "icons", icon: "system-restart.svg"},
			colorized: false,
			name: l10n.get("Restart"),
			action: enyo.bind(this, "doRestart"),
			data: null
		});
		items.push({
			icon: {directory: "icons", icon: "preferences-system.svg"},
			colorized: false,
			name: l10n.get("MySettings"),
			action: enyo.bind(this, "doSettings"),
			data: null
		});
		this.getPopup().setFooter(items);

		// Show popup
		this.getPopup().showPopup();
	},
	hideBuddyPopup: function() {
		if (this.getPopup().cursorIsInside())
			return false;
		this.getPopup().hidePopup();
		return true;
	},
	doShutdown: function() {
		this.getPopup().hidePopup();
		util.quitApp();
	},
	doRestart: function() {
		util.restartApp();
	},
	doSettings: function() {
		this.getPopup().hidePopup();
		this.otherview = this.$.otherview.createComponent({kind: "Sugar.DialogSettings"}, {owner:this});
		this.otherview.show();
	},

	// Filter activities handling
	filterActivities: function() {
		var filter = toolbar.getSearchText().toLowerCase();

		// In radial view, just disable activities
		enyo.forEach(this.$.desktop.getControls(), function(item) {
			item.setDisabled(item.icon.name.toLowerCase().indexOf(filter) == -1 && filter.length != 0);
		});

		// In list view display only matching activities
		if (this.currentView == constant.listView) {
			this.otherview.setActivities(preferences.getActivitiesByName(filter));
		}
	}
});





// Class for desktop toolbar
enyo.kind({
	name: "Sugar.DesktopToolbar",
	kind: enyo.Control,
	components: [
		{name: "searchtext", kind: "Sugar.SearchField", classes: "homeview-filter-text", onTextChanged: "filterActivities"},
		{name: "radialbutton", kind: "Button", classes: "toolbutton view-radial-button active", title:"Home", ontap: "showRadialView"},
		{name: "neighborbutton", kind: "Button", classes: "toolbutton view-neighbor-button", title:"Home", ontap: "showNeighborView"},
		{name: "listbutton", kind: "Button", classes: "toolbutton view-list-button", title:"List", ontap: "showListView"}
	],

	// Constructor
	create: function() {
		// Localize items
		this.inherited(arguments);
	},

	rendered: function() {
		this.$.searchtext.setPlaceholder(l10n.get("SearchHome"));
		this.$.radialbutton.setNodeProperty("title", l10n.get("FavoritesView"));
		this.$.listbutton.setNodeProperty("title", l10n.get("ListView"));
		this.$.neighborbutton.setNodeProperty("title", l10n.get("NeighborhoodView"));
	},

	// Handle search text content
	getSearchText: function() {
		return this.$.searchtext.getText();
	},

	setSearchText: function(value) {
		this.$.searchtext.setText(value);
	},

	// Handle active button
	setActiveView: function(view) {
		if (view == constant.radialView) {
			this.$.radialbutton.addRemoveClass('active', true);
			this.$.neighborbutton.addRemoveClass('active', false);
			this.$.listbutton.addRemoveClass('active', false);
		} else if (view == constant.listView) {
			this.$.radialbutton.addRemoveClass('active', false);
			this.$.neighborbutton.addRemoveClass('active', false);
			this.$.listbutton.addRemoveClass('active', true);
		} else if (view == constant.neighborhoodView) {
			this.$.radialbutton.addRemoveClass('active', false);
			this.$.neighborbutton.addRemoveClass('active', true);
			this.$.listbutton.addRemoveClass('active', false);
		}
	},

	// Handle events
	filterActivities: function() {
		app.filterActivities();
	},

	showRadialView: function() {
		app.showView(constant.radialView);
	},

	showListView: function() {
		app.showView(constant.listView);
	},

	showNeighborView: function() {
		app.showView(constant.neighborhoodView);
	}
});
