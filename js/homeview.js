
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



// Main app class
enyo.kind({
	name: "Sugar.Desktop",
	kind: enyo.Control,
	components: [
		{name: "owner", kind: "Sugar.Icon", size: constant.sizeOwner, colorized: true, onclick: "changeColor", classes: "owner-icon", showing: true},
		{name: "journal", kind: "Sugar.Icon", size: constant.sizeJournal, onclick: "showJournal", classes: "journal-icon", showing: true},
		{name: "desktop", showing: true, onresize: "redraw", components: []},
		{name: "otherview", showing: true, components: []},
		{name: "activityPopup", kind: "Sugar.Popup", showing: false},		
		{name: "activities", kind: "enyo.WebService", url: constant.initActivitiesURL, onResponse: "queryResponse", onError: "queryFail"}
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
		
		// Get activities from local storage or from init web service
		if (preferences.getActivities() == null) {
			this.$.activities.send();
		} else {
			this.init();
		}
	},
	
	// Init web service response, redraw screen
	queryResponse: function(inSender, inResponse) {
		preferences.setActivities(inResponse.data);
		preferences.save();
		this.init();
	},
	
	// Error on init
	queryFail: function(inSender, inError) {
		console.log("Error loading init activities");
	},
	
	// Get linked toolbar
	getToolbar: function() {
		if (this.toolbar == null)
			this.toolbar = new Sugar.Desktop.Toolbar();
		return this.toolbar;
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
		var radius = Math.min(Math.min(canvas_center.y,canvas_center.x),constant.sizeRadius);
		
		// Draw XO owner
		this.$.owner.applyStyle("margin-left", (canvas_center.x-constant.sizeOwner/4)+"px");
		this.$.owner.applyStyle("margin-top", (canvas_center.y-constant.sizeOwner/4)+"px");
		this.$.journal.setColorized(this.journal.length > 0);
		this.$.journal.applyStyle("margin-left", (canvas_center.x+5)+"px");
		this.$.journal.applyStyle("margin-top", (canvas_center.y+constant.sizeOwner-constant.sizeJournal/2)+"px");
		
		// Draw activity icons;	
		var activitiesList = preferences.getFavoritesActivities();
		var base_angle = ((Math.PI*2.0)/parseFloat(activitiesList.length));
		for (var i = 0 ; i < activitiesList.length ; i++) {
			var activity = activitiesList[i];
			var angle = base_angle*parseFloat(i);
			this.$.desktop.createComponent({
					kind: "Sugar.Icon", 
					icon: activity,  // HACK: Icon characteristics are embedded in activity object
					x: canvas_center.x+Math.cos(angle)*radius, 
					y: canvas_center.y+Math.sin(angle)*radius,
					colorized: activity.activityId != null,
					onclick: "runMatchingActivity",
					popupShow: enyo.bind(this, "showActivityPopup"),
					popupHide: enyo.bind(this, "hideActivityPopup")
				},
				{owner: this}).render();
		}
	},
	
	// Redraw after a resized event
	redraw: function() {
		this.draw();
		this.render();
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
			this.otherview = this.$.otherview.createComponent({kind: "Sugar.Desktop.ListView", activities: preferences.getActivitiesByName(filter)});
		}
		
		// Show journal
		else if (newView == constant.journalView) {
			if (this.timer != null) {
				this.$.activityPopup.hidePopup();
				window.clearInterval(this.timer);
			}	
			this.otherview = this.$.otherview.createComponent({kind: "Sugar.Journal", journal: this.journal});
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
		iconLib.colorize(this.$.owner.hasNode(), preferences.getColor());
		if (this.journal.length > 0)
			iconLib.colorize(this.$.journal.hasNode(), preferences.getColor());
	},
	
	// Change color
	changeColor: function() {
		preferences.nextColor();
		preferences.save();
		iconColorCache = {names: [], values: []}; // Delete icon cache
		this.draw();
		this.render();
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
		if (activity.activityId != null && activity.instances[0].metadata.title !== undefined) {
			title = activity.instances[0].metadata.title;			
		} else {
			title = l10n.get('NameActivity', {name: activity.name});
		}
		this.$.activityPopup.setHeader({
			icon: activity,
			colorized: activity.activityId != null,
			name: activity.name,
			title: title,
			action: enyo.bind(this, "runActivity"),
			data: [activity, null]
		});
		var items = [];
		for(var i = 0 ; i < activity.instances.length && i < constant.maxPopupHistory; i++) {
			items.push({
				icon: activity,
				colorized: true,
				name: activity.instances[i].metadata.title,
				action: enyo.bind(this, "runOldActivity"),
				data: [activity, activity.instances[i]]
			});
		}
		this.$.activityPopup.setItems(items);
		this.$.activityPopup.setFooter([{
			icon: activity,
			colorized: false,
			name: l10n.get("StartNew"),
			action: enyo.bind(this, "runNewActivity"),	
			data: [activity, null]
		}]);
		
		// Show popup
		this.$.activityPopup.showPopup();
	},
	hideActivityPopup: function() {
		// Hide popup
		if (this.$.activityPopup.cursorIsInside())
			return false;	
		this.$.activityPopup.hidePopup();
		return true;
	},
		
	// Popup menu for buddy handling
	showBuddyPopup: function(icon) {
		// Create popup
		this.$.activityPopup.setHeader({
			icon: icon.icon,
			colorized: true,
			name: preferences.getName(),
			title: null,
			action: null
		});
		this.$.activityPopup.setItems(null);		
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
		this.$.activityPopup.setFooter(items);
		
		// Show popup
		this.$.activityPopup.showPopup();		
	},
	hideBuddyPopup: function() {
		if (this.$.activityPopup.cursorIsInside())
			return false;	
		this.$.activityPopup.hidePopup();
		return true;	
	},
	doShutdown: function() {
		this.$.activityPopup.hidePopup();
		util.quitApp();
	},
	doRestart: function() {
		location.reload();
	},
	doSettings: function() {
		this.$.activityPopup.hidePopup();
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
	name: "Sugar.Desktop.Toolbar",
	kind: enyo.Control,
	components: [
		{name: "searchtext", kind: "Sugar.SearchField", classes: "homeview-filter-text", onTextChanged: "filterActivities"},
		{name: "radialbutton", kind: "Button", classes: "toolbutton view-radial-button active", title:"Home", onclick: "showRadialView"},
		{name: "listbutton", kind: "Button", classes: "toolbutton view-list-button", title:"List", onclick: "showListView"}
	],
	
	// Constructor
	create: function() {
		// Localize items
		this.inherited(arguments);		
		this.$.searchtext.setNodeProperty("title", l10n.get("FavoritesView"));
		this.$.listbutton.setNodeProperty("title", l10n.get("ListView"));
		this.$.searchtext.setPlaceholder(l10n.get("SearchHome"));	
	},
	
	// Get search text content
	getSearchText: function() {
		return this.$.searchtext.getText();
	},
	
	// Handle active button
	setActiveView: function(view) {
		if (view == constant.radialView) {
			this.$.radialbutton.addRemoveClass('active', true);
			this.$.listbutton.addRemoveClass('active', false);
		} else if (view == constant.listView) {
			this.$.radialbutton.addRemoveClass('active', false);
			this.$.listbutton.addRemoveClass('active', true);		
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
	}
});