
// Neighborhood view
enyo.kind({
	name: "Sugar.NeighborhoodView",
	kind: enyo.Control,
	components: [
		{name: "owner", kind: "Sugar.Icon", size: constant.sizeNeighbor, colorized: true, classes: "owner-icon"},
		{name: "network", showing: true, onresize: "resize", components: []},
		{name: "otherview", showing: true, components: []},		
		{name: "networkPopup", kind: "Sugar.Popup", showing: false}
	],
  
	// Constructor: init list
	create: function() {
		this.inherited(arguments);
		this.$.owner.setIcon({directory: "icons", icon: "owner-icon.svg"});
		this.$.owner.setPopupShow(enyo.bind(this, "showBuddyPopup"));
		this.$.owner.setPopupHide(enyo.bind(this, "hideBuddyPopup"));		
		this.draw();
	},
	
	// Get linked toolbar
	getToolbar: function() {
		if (this.toolbar == null)
			this.toolbar = new Sugar.NeighborhoodToolbar();
		return this.toolbar;
	},
	
	// Get linked popup
	getPopup: function() {
		return this.$.networkPopup;
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
	
	// Draw screen
	draw: function() {	
		// Draw XO owner
		var canvas_center = util.getCanvasCenter();		
		this.$.owner.applyStyle("margin-left", (canvas_center.x-constant.sizeNeighbor/2)+"px");
		this.$.owner.applyStyle("margin-top", (canvas_center.y-constant.sizeNeighbor/2)+"px");	
	}	
});





// Class for neighborhood toolbar
enyo.kind({
	name: "Sugar.NeighborhoodToolbar",
	kind: enyo.Control,
	components: [
		{name: "neighborsearch", kind: "Sugar.SearchField", onTextChanged: "filterNetwork", classes: "neighbor-filter-text"},
		{name: "radialbutton", kind: "Button", classes: "toolbutton view-desktop-button", title:"Home", title:"Home", ontap: "gotoDesktop"}
	],
	
	// Constructor
	create: function() {
		// Localize items
		this.inherited(arguments);		
		this.$.neighborsearch.setPlaceholder(l10n.get("SearchNeighbor"));
	},
	
	rendered: function() {
		this.$.radialbutton.setNodeProperty("title", l10n.get("Home"));	
	},

	// Event handling
	gotoDesktop: function() {
		app.showView(constant.radialView);
	},
	
	filterNetwork: function() {
	}	
});