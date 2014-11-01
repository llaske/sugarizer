
// Sugar Libraries (initialized by require)
var app = null;
var toolbar = null;
var mouse = {position: {x: -1, y: -1}};
var iconLib;
var xoPalette;
var radioButtonsGroup;
var datastore;
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
		var semi_size = icon_size/2;
		var radiusx = Math.min(canvas_center.x,constant.sizeRadius)-semi_size;
		var radiusy = Math.min(canvas_center.y,constant.sizeRadius)-semi_size;
		var jdeltay = (canvas_center.dy < 480) ? -12 : 0;
		
		// Draw XO owner
		this.$.owner.applyStyle("margin-left", (canvas_center.x-constant.sizeOwner/2)+"px");
		this.$.owner.applyStyle("margin-top", (canvas_center.y-constant.sizeOwner/2)+"px");
		this.$.journal.setColorized(this.journal.length > 0);
		this.$.journal.applyStyle("margin-left", (canvas_center.x-constant.sizeJournal/2)+"px");
		this.$.journal.applyStyle("margin-top", (canvas_center.y+constant.sizeOwner-constant.sizeJournal+jdeltay)+"px");
		this.$.owner.setShowing(this.currentView == constant.radialView);
		this.$.journal.setShowing(this.currentView == constant.radialView);		
		
		// Draw activity icons;	
		var activitiesList = preferences.getFavoritesActivities();
		var base_angle = ((Math.PI*2.0)/parseFloat(activitiesList.length));
		for (var i = 0 ; i < activitiesList.length ; i++) {
			var activity = activitiesList[i];
			var angle = base_angle*parseFloat(i);
			this.$.desktop.createComponent({
					kind: "Sugar.Icon", 
					icon: activity,  // HACK: Icon characteristics are embedded in activity object
					size: icon_size,
					x: (canvas_center.x+Math.cos(angle)*radiusx-semi_size), 
					y: (canvas_center.y+Math.sin(angle)*radiusy-semi_size),
					colorized: activity.instances !== undefined && activity.instances.length > 0,
					ontap: "runMatchingActivity",
					popupShow: enyo.bind(this, "showActivityPopup"),
					popupHide: enyo.bind(this, "hideActivityPopup")
				},
				{owner: this}).render();
		}
	},
	
	// Redraw, for example after a resized event
	redraw: function() {
		this.draw();
		this.render();
	},
	
	resize: function() {
		if (this.noresize) return;
		this.redraw();
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
	
	// Render
	rendered: function() {
		this.inherited(arguments);
		this.$.owner.colorize(preferences.getColor());
		if (this.journal.length > 0)
			this.$.journal.colorize(preferences.getColor());
	},
	
	// Run activity
	runMatchingActivity: function(icon) {
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
					name: activity.instances[i].metadata.title,
					action: enyo.bind(this, "runOldActivity"),
					data: [activity, activity.instances[i]]
				});
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