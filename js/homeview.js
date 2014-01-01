
// Sugar Libraries (initialized by require)
var app;
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
		{name: "owner", onclick: "changeColor", classes: "owner-icon", showing: true},
		{name: "journal", onclick: "showJournal", classes: "journal-icon", showing: true},
		{name: "desktop", showing: true, onresize: "redraw", components: []},
		{name: "otherview", showing: true, components: []},
		{name: "activityPopup", kind: "Sugar.Desktop.ActivityPopup", showing: false},		
		{name: "activities", kind: "enyo.WebService", url: constant.initActivitiesURL, onResponse: "queryResponse", onError: "queryFail"}
	],
	
	// Constructor
	create: function() {
		// Init screen
		this.inherited(arguments);
		this.timer = null;
		this.localize();
		
		// Always save mouse position - need for popup menu
		var that = this;		
		document.onmousemove = function(e) {
			that.position = {x: e.pageX, y: e.pageY};
		}
		
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
	
	// Localize toolbar
	localize: function() {
		document.getElementById("view-radial-button").title = l10n.get("FavoritesView");
		document.getElementById("view-list-button").title = l10n.get("ListView");
		document.getElementById("view-desktop-button").title = l10n.get("Home");
		document.getElementById("favorite-button").title = l10n.get("FilterFavorites");
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
		this.$.journal.applyStyle("margin-left", (canvas_center.x+5)+"px");
		this.$.journal.applyStyle("margin-top", (canvas_center.y+constant.sizeOwner-constant.sizeJournal/2)+"px");
		
		// Draw activity icons;	
		var activitiesList = preferences.getFavoritesActivities();
		var base_angle = ((Math.PI*2.0)/parseFloat(activitiesList.length));
		for (var i = 0 ; i < activitiesList.length ; i++) {
			var activity = activitiesList[i];
			var angle = base_angle*parseFloat(i);
			this.$.desktop.createComponent({
					kind: "Sugar.ActivityIcon", 
					activity: activity, 
					x: canvas_center.x+Math.cos(angle)*radius, 
					y: canvas_center.y+Math.sin(angle)*radius,
					colorized: activity.activityId != null,
					onclick: "runActivity",
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
			util.setToolbarVisibility({desktopToolbar: true, journalToolbar: false});
			document.getElementById("view-radial-button").classList.add('active');
			this.$.otherview.hide();
			this.$.desktop.show();
			this.$.owner.show();
			this.$.journal.show();
			this.render();
			return;
		}
		
		// Hide desktop
		this.$.owner.hide();
		this.$.journal.hide();
		this.$.desktop.hide();
		this.clearView();
		
		// Show list
		if (newView == constant.listView) {
			util.setToolbarVisibility({desktopToolbar: true, journalToolbar: false});	
			document.getElementById("view-list-button").classList.add('active');			
			this.$.otherview.createComponent({kind: "Sugar.Desktop.ListView", count: preferences.getActivities().length});
		}
		
		// Show journal
		else if (newView == constant.journalView) {
			if (this.timer != null) {
				this.$.activityPopup.hidePopup();
				window.clearInterval(this.timer);
			}	
			util.setToolbarVisibility({desktopToolbar: false, journalToolbar: true});
			this.$.otherview.createComponent({kind: "Sugar.Journal", journal: this.journal});
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
	runActivity: function(icon) {
		// Run the last activity instance in the context
		preferences.runActivity(icon.activity);
	},
	runOldActivity: function(icon, instance) {
		// Run an old activity instance
		preferences.runActivity(icon.activity, instance.objectId, instance.metadata.title);
	},
	runNewActivity: function(icon) {
		// Start a new activity instance
		preferences.runActivity(icon.activity, null);
	},	
	
	// Display journal
	showJournal: function() {
		this.showView(constant.journalView);
	},
	
	// Popup menu handling
	showActivityPopup: function(icon) {
		// Create popup
		this.$.activityPopup.setIcon(icon);
		var title;
		if (icon.activity.activityId != null && icon.activity.instances[0].metadata.title !== undefined) {
			title = icon.activity.instances[0].metadata.title;			
		} else {
			title = l10n.get('NameActivity', {name: icon.activity.name});
		}
		this.$.activityPopup.setHeader({
			icon: icon,
			colorized: icon.activity.activityId != null,
			name: icon.activity.name,
			title: title,
			action: enyo.bind(this, "runActivity"),
			data: [icon, null]
		});
		var items = [];
		for(var i = 0 ; i < icon.activity.instances.length && i < constant.maxPopupHistory; i++) {
			items.push({
				icon: icon,
				colorized: true,
				name: icon.activity.instances[i].metadata.title,
				action: enyo.bind(this, "runOldActivity"),
				data: [icon, icon.activity.instances[i]]
			});
		}
		this.$.activityPopup.setItems(items);
		this.$.activityPopup.setFooter([{
			icon: icon,
			colorized: false,
			name: l10n.get("StartNew"),
			action: enyo.bind(this, "runNewActivity"),	
			data: [icon, null]
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
	}
});

