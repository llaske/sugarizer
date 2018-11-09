
// Sugar Libraries (initialized by require)
var app = null;
var toolbar = null;
var mouse = {position: {x: -1, y: -1}};
var isFirstLaunch = false;
var iconLib;
var xoPalette;
var radioButtonsGroup;
var datastore;
var presence;
var l10n;
var preferences;
var util;
var myserver;
var humane;
var tutorial;
var stats;
var autosync;



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
		this.restrictedModeInfo = { start: 0 };
		util.hideNativeToolbar();

		// Load and sort journal
		this.loadJournal();
		this.isJournalFull = false;
		this.testJournalSize();

		// Call activities list service
		if (util.getClientType() == constant.webAppType) {
			this.$.activities.setUrl(myserver.getActivitiesUrl());
			myserver.getActivities(enyo.bind(this, "queryActivitiesResponse"), enyo.bind(this, "queryActivitiesFail"));
		} else {
			this.$.activities.setUrl(constant.staticInitActivitiesURL);
			this.$.activities.send();
		}

		// Check change on preferences from server
		if (preferences.isConnected()) {
			var networkId = preferences.getNetworkId();
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
					autosync.synchronizeJournal(
						function(count) {
							if (count) {
								setTimeout(function() {
									var message = l10n.get("RetrievingJournal");
									if (message) humane.log(message);
								}, 100);
								var toolbar = that.getToolbar();
								if (toolbar.showSync) {
									toolbar.showSync(true);
								}
							}
						},
						function(locale, remote, error) {
							var toolbar = that.getToolbar();
							if (toolbar.showSync) {
								toolbar.showSync(false);
							}

							// Locale journal has changed, update display
							if (locale && !error) {
								that.loadJournal();
								that.testJournalSize();
								preferences.updateEntries();
								that.draw();
								that.render();
							}
						}
					);
				},
				function() {
					console.log("WARNING: Can't read network user settings");
				}
			);
		}

		// Launch tutorial at first launch 
		var that = this;
		window.setTimeout(function() {
			if (isFirstLaunch) {
				that.getToolbar().startTutorial();
			}
		}, constant.timerBeforeTutorial);
	},

	// Load and sort journal
	loadJournal: function() {
		this.journal = datastore.find();
		this.journal = this.journal.sort(function(e0, e1) {
			return parseInt(e1.metadata.timestamp) - parseInt(e0.metadata.timestamp);
		});
	},

	// Test Journal size to ensure it's not full
	testJournalSize: function() {
		this.isJournalFull = false;
		var that = this;
		util.computeDatastoreSize(function(size) {
			var percentremain = ((size.remain/size.total)*100);
			if (percentremain < constant.minStorageSizePercent) {
				console.log("WARNING: Journal almost full");
				that.isJournalFull = true;
			}
		});
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
			if (preferences.updateActivities(inResponse.data)) {
				preferences.save();
			}
		}
		preferences.updateEntries();

		// If we are in the SugarizerOS environment, load the android apps into activities
		if (window.sugarizerOS){
			var t = this;
			sugarizerOS.isAppCacheReady(function(response) {
				if (!response.ready) {
					var loading = humane.create({timeout: 5000, baseCls: "humane-libnotify"});
					loading.log(l10n.get("Loading"));
				}
			});
			sugarizerOS.initActivitiesPreferences(function(){t.init();});
			sugarizerOS.isWifiEnabled(function(value){
				if (value != 0) {
					sugarizerOS.scanWifi();
				}
			});
			sugarizerOS.popupTimer = 0;
			if (sugarizerOS.launches == 2 && sugarizerOS.launcherPackageName != sugarizerOS.packageName &&
			!sugarizerOS.isSetup){
				this.doResetLauncher();
				sugarizerOS.putInt("IS_SETUP", 1);
			}
		}
		else {
			this.init();
		}
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
		if (this.toolbar == null) {
			this.toolbar = new Sugar.DesktopToolbar();
		}
		if (this.currentView != constant.listView && this.otherview != null) {
			return this.otherview.getToolbar();
		}
		return this.toolbar;
	},

	// Get linked popup
	getPopup: function() {
		return this.$.activityPopup;
	},

	// Init desktop
	init: function() {
		this.currentView = constant.radialView;
		if (preferences.getView()) {
			this.showView(preferences.getView());
		}
		this.draw();
		tutorial.setElement("owner", this.$.owner.getAttribute("id"));
	},

	// Draw desktop
	draw: function() {
		// Clean desktop
		var items = [];
		enyo.forEach(this.$.desktop.getControls(), function(item) {	items.push(item); });
		for (var i = 0 ; i < items.length ; i++) { items[i].destroy(); };
		var tutorialActivity = false;

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
				this.restrictedModeInfo.count = activitiesCount;
				this.restrictedModeInfo.length = activitiesList.length;
				base_angle = (PI2/parseFloat(activitiesCount+1));
			}
		}

		// Draw activity icons
		var angle = -Math.PI/2.0-base_angle;
		for (var i = 0 ; i < activitiesList.length ; i++) {
			// Compute icon position
			var activity = activitiesList[i];
			var ix, iy;
			var previousAngle = angle;
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

			// Restricted mode for small device: integrate a way to scroll on the circle
			if (restrictedMode) {
				if (i < this.restrictedModeInfo.start) {
					angle = previousAngle;
					continue;
				} else if (i > 0 && i == this.restrictedModeInfo.start) {
					this.$.desktop.createComponent({
							kind: "Sugar.Icon",
							icon: {directory: "icons", icon: "activity-etc.svg", name: l10n.get("ListView")},
							size: icon_size,
							x: ix,
							y: iy,
							ontap: "showPreviousRestrictedList"
						},
						{owner: this}).render();
					continue;
				} else if (i >= this.restrictedModeInfo.start+activitiesCount-1 && this.restrictedModeInfo.start + activitiesCount < activitiesList.length) {
					this.$.desktop.createComponent({
							kind: "Sugar.Icon",
							icon: {directory: "icons", icon: "activity-etc.svg", name: l10n.get("ListView")},
							size: icon_size,
							x: ix,
							y: iy,
							ontap: "showNextRestrictedList"
						},
						{owner: this}).render();
					break;
				}
			}

			// Draw icon
			if (activity.type != null && activity.type == "native") {
				activity.isNative = true;
			}
			var newIcon = this.$.desktop.createComponent({
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
				{owner: this}
			);
			newIcon.render();
			activitiesIndex++;

			// Set tutorial
			if (!tutorialActivity) {
				tutorial.setElement("activity", newIcon.getAttribute("id"));
				tutorial.setElement("journal", this.$.journal.getAttribute("id"));
				tutorialActivity = true;
			}
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
		if (this.noresize) {
			return;
		}
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

	showPreviousRestrictedList: function() {
		this.getPopup().hidePopup();
		var newStart = this.restrictedModeInfo.start - this.restrictedModeInfo.count;
		if (newStart < 0) {
			newStart = 0;
		}
		this.restrictedModeInfo.start = newStart;
		this.draw();
	},

	showNextRestrictedList: function() {
		this.getPopup().hidePopup();
		var newStart = this.restrictedModeInfo.start + this.restrictedModeInfo.count - 2;
		if (newStart > this.restrictedModeInfo.length-1) {
			return;
		} else if (newStart+this.restrictedModeInfo.count > this.restrictedModeInfo.length) {
			newStart = this.restrictedModeInfo.length - this.restrictedModeInfo.count;
		}
		this.restrictedModeInfo.start = newStart;
		this.draw();
	},

	// Switch between radial and other views (list or journal)
	showView: function(newView) {
		if (this.currentView == newView) {
			return;
		}
		var oldView = this.currentView;
		this.currentView = newView;
		stats.trace(constant.viewNames[oldView], 'change_view', constant.viewNames[newView]);

		// Show desktop
		if (newView == constant.radialView) {
			this.otherview = null;
			util.setToolbar(this.getToolbar());
			toolbar.setActiveView(constant.radialView);
			this.$.otherview.hide();
			this.$.desktop.show();
			this.$.owner.show();
			this.$.journal.show();
			this.clearView();
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
		if (this.journal.length > 0) {
			this.$.journal.colorize(preferences.getColor());
		}
		if (this.isJournalFull && l10n.get("JournalAlmostFull")) {
			humane.log(l10n.get("JournalAlmostFull"));
			this.isJournalFull = false;
		}
	},

	// Run activity
	runMatchingActivity: function(icon) {
		if (!icon.getDisabled() && !this.getPopup().showing){
			this.hideActivityPopup(icon);
			util.vibrate();
			this.runActivity(icon.icon);
			this.postRunActivity();
		}
	},
	runActivity: function(activity) {
		// Run the last activity instance in the context
		util.vibrate();
		var help = tutorial.isLaunched() && activity.id == tutorial.activityId;
		preferences.runActivity(activity, undefined, null, null, help);
		this.postRunActivity();
	},
	runOldActivity: function(activity, instance) {
		// Run an old activity instance
		this.getPopup().hidePopup()
		util.vibrate();
		var help = tutorial.isLaunched() && activity.id == tutorial.activityId;
		preferences.runActivity(activity, instance.objectId, instance.metadata.title, null, help);
	},
	runNewActivity: function(activity) {
		// Start a new activity instance
		this.getPopup().hidePopup()
		util.vibrate();
		var help = tutorial.isLaunched() && activity.id == tutorial.activityId;
		preferences.runActivity(activity, null, null, null, help);
		this.postRunActivity();
	},
	postRunActivity: function() {
		// When run a native activity, should update journal and view to reflect journal change
		if (window.sugarizerOS) {
			sugarizerOS.popupTimer = new Date();
			this.loadJournal();
			preferences.updateEntries();
			this.draw();
		}
	},

	// Display journal
	showJournal: function() {
		this.showView(constant.journalView);
	},

	// Popup menu for activities handling
	showActivityPopup: function(icon) {
		// Create popup
		if (window.sugarizerOS) {
			var now = new Date();
			if (sugarizerOS.popupTimer && now.getTime() - sugarizerOS.popupTimer.getTime() < 3000) {
				return;
			}
			sugarizerOS.popupTimer = now;
		}
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
		if (activity.instances) {
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
		}
		this.getPopup().setItems(items);
		this.getPopup().setFooter([{
			icon: activity,
			colorized: false,
			name: l10n.get("StartNew"),
			action: enyo.bind(this, "runNewActivity"),
			data: [activity, null]
		}]);

		// Show popup
		this.getPopup().showPopup();
	},
	hideActivityPopup: function(icon) {
		// Hide popup
		if (this.getPopup().cursorIsInside() || icon.cursorIsInside()) {
			return false;
		}
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
			name: l10n.get("Logoff"),
			action: enyo.bind(this, "doLogoff"),
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
	hideBuddyPopup: function(icon) {
		if (this.getPopup().cursorIsInside() || icon.cursorIsInside()) {
			return false;
		}
		this.getPopup().hidePopup();
		return true;
	},
	doLogoff: function() {
		stats.trace(constant.viewNames[this.getView()], 'click', 'logoff');
		this.getPopup().hidePopup();
		if (!preferences.isConnected() || (preferences.isConnected() && !preferences.getOptions("sync"))) {
			this.otherview = this.$.otherview.createComponent({kind: "Sugar.DialogWarningMessage"}, {owner:this});
			this.otherview.show();
		} else {
			preferences.addUserInHistory();
			util.cleanDatastore();
			util.restartApp();
		}
	},
	doRestart: function() {
		stats.trace(constant.viewNames[this.getView()], 'click', 'restart');
		util.restartApp();
	},
	doSettings: function() {
		stats.trace(constant.viewNames[this.getView()], 'click', 'my_settings');
		this.getPopup().hidePopup();
		this.otherview = this.$.otherview.createComponent({kind: "Sugar.DialogSettings"}, {owner:this});
		this.otherview.show();
	},
	doResetLauncher: function() {
		this.otherview = this.$.otherview.createComponent({kind: "Sugar.DialogSetLauncher"}, {owner:this});
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
		{name: "helpbutton", kind: "Button", classes: "toolbutton help-button", title:"Help", ontap: "startTutorial"},
		{name: "syncbutton", classes: "sync-button sync-home sync-gear sync-gear-home", showing: false},
		{name: "radialbutton", kind: "Button", classes: "toolbutton view-radial-button active", title:"Home", ontap: "showRadialView"},
		{name: "neighborbutton", kind: "Button", classes: "toolbutton view-neighbor-button", title:"Home", ontap: "showNeighborView"},
		{name: "listbutton", kind: "Button", classes: "toolbutton view-list-button", title:"List", ontap: "showListView"}
	],

	// Constructor
	create: function() {
		this.inherited(arguments);
		this.needRedraw = false;
	},

	rendered: function() {
		this.inherited(arguments);
		this.localize();
	},

	localize: function() {
		// Localize items
		this.$.searchtext.setPlaceholder(l10n.get("SearchHome"));
		this.$.radialbutton.setNodeProperty("title", l10n.get("FavoritesView"));
		this.$.listbutton.setNodeProperty("title", l10n.get("ListView"));
		this.$.neighborbutton.setNodeProperty("title", l10n.get("NeighborhoodView"));
		this.$.helpbutton.setNodeProperty("title", l10n.get("Tutorial"));
	},

	askRedraw: function() {
		this.needRedraw = true;
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
		stats.trace(constant.viewNames[app.getView()], 'search', 'q='+this.getSearchText(), null);
		app.filterActivities();
	},

	showRadialView: function() {
		util.vibrate();
		app.showView(constant.radialView);
		if (this.needRedraw) {
			this.needRedraw = false;
			app.redraw();
		}
	},

	showListView: function() {
		util.vibrate();
		app.showView(constant.listView);
		if (this.needRedraw) {
			this.needRedraw = false;
			app.redraw();
		}
	},

	showNeighborView: function() {
		util.vibrate();
		app.showView(constant.neighborhoodView);
		if (this.needRedraw) {
			this.needRedraw = false;
			app.redraw();
		}
	},

	showSync: function(showing) {
		this.$.syncbutton.setShowing(showing);
	},

	startTutorial: function() {
		tutorial.setElement("radialbutton", this.$.radialbutton.getAttribute("id"));
		tutorial.setElement("listbutton", this.$.listbutton.getAttribute("id"));
		tutorial.setElement("neighborbutton", this.$.neighborbutton.getAttribute("id"));
		tutorial.setElement("searchtext", this.$.searchtext.getAttribute("id"));
		stats.trace(constant.viewNames[app.getView()], 'tutorial', 'start', null);
		tutorial.start();
	}
});
