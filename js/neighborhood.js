
// Neighborhood view
enyo.kind({
	name: "Sugar.NeighborhoodView",
	kind: enyo.Control,
	components: [
		{name: "owner", kind: "Sugar.Icon", size: constant.sizeNeighbor, colorized: true, classes: "owner-icon"},
		{name: "server", kind: "Sugar.Icon", size: constant.sizeNeighbor, colorized: true, classes: "server-icon", showing: false},
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
		this.$.server.setIcon({directory: "icons", icon: "network-wireless-connected-100.svg"});
		this.$.server.setPopupShow(enyo.bind(this, "showServerPopup"));
		this.$.server.setPopupHide(enyo.bind(this, "hideServerPopup"));
		var serverColor = Math.floor(Math.random()*xoPalette.colors.length);
		this.$.server.setColorizedColor(xoPalette.colors[serverColor]);
		this.$.server.setShowing(preferences.getNetworkId() != null && preferences.getPrivateJournal() != null && preferences.getSharedJournal() != null);
		this.users = [];
		this.activities = [];
		presence.listUsers(enyo.bind(this, "userListReceived"));
		presence.listSharedActivities(enyo.bind(this, "sharedListReceived"));
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
			colorizedColor: null,
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
		
	// Popup menu for server handling
	showServerPopup: function(icon) {
		// Create popup
		this.getPopup().setHeader({
			icon: icon.icon,
			colorized: true,
			colorizedColor: icon.colorizedColor,
			name: myserver.getServer(),
			title: l10n.get("Connected"),
			action: null
		});
		this.getPopup().setItems(null);		
		this.getPopup().setFooter(null);
		
		// Show popup
		this.getPopup().showPopup();		
	},
	hideServerPopup: function() {
		if (this.getPopup().cursorIsInside())
			return false;	
		this.getPopup().hidePopup();
		return true;	
	},
		
	// Popup menu for user handling
	showUserPopup: function(icon) {
		// Create popup
		this.getPopup().setHeader({
			icon: icon.icon,
			colorized: true,
			colorizedColor: icon.colorizedColor,
			name: icon.getData().name,
			title: null,
			action: null
		});
		this.getPopup().setItems(null);
		this.getPopup().setFooter(null);
		
		// Show popup
		this.getPopup().showPopup();		
	},
	hideUserPopup: function() {
		if (this.getPopup().cursorIsInside())
			return false;	
		this.getPopup().hidePopup();
		return true;	
	},
		
	// Popup menu for shared activities handling
	showActivityPopup: function(icon) {
		// Create popup
		this.getPopup().setHeader({
			icon: icon.icon,
			colorized: true,
			colorizedColor: icon.colorizedColor,
			name: icon.getData().name,
			title: null,
			action: null
		});
		this.getPopup().setItems(null);
		this.getPopup().setFooter(null);
		
		// Show popup
		this.getPopup().showPopup();		
	},
	hideActivityPopup: function() {
		if (this.getPopup().cursorIsInside())
			return false;	
		this.getPopup().hidePopup();
		return true;	
	},
	
	// User list received
	userListReceived: function(users) {
		// Retrieve users
		this.users = users;
		
		// Redraw
		this.draw();
	},
	
	// Shared activities list received
	sharedListReceived: function(activities) {
		// Retrieve activities
		this.activities = activities;
		
		// Redraw
		this.draw();
	},
	
	// Draw screen
	draw: function() {
		// Clean network icons
		var items = [];
		enyo.forEach(this.$.network.getControls(), function(item) {
			items.push(item);
		});		
		for (var i = 0 ; i < items.length ; i++) { items[i].destroy(); };
		
		// List items to draw
		var canvas_center = util.getCanvasCenter();
		items = [];
		items.push({icon: this.$.owner, x:(canvas_center.x-constant.sizeNeighbor/2), y: (canvas_center.y-constant.sizeNeighbor/2), size: this.$.owner.getSize(), locked: true});
		if (this.$.server.getShowing())
			items.push({icon: this.$.server, size: this.$.server.getSize(), locked: false});
		
		// Create network icons for items
		this.createNetworkIcons(items);
		
		// Compute icons position
		var len = items.length;		
		for(var i = 0 ; i < len ; i++) {
			var current = items[i];
			if (current.locked)
				continue;
			current.x = Math.floor(Math.random()*(canvas_center.dx-current.size));
			current.y = Math.floor(Math.random()*(canvas_center.dy-current.size));
		}
		var collisions = this.detectCollisions(items);
		if (collisions.length > 0)
			this.solveCollisions(collisions, items);
		
		// Draw all icons
		for (var i = 0 ; i < len ; i++) {
			var current = items[i];
			current.icon.applyStyle("margin-left", current.x+"px");
			current.icon.applyStyle("margin-top", current.y+"px");		
		}
	},
	
	// Create network icons fro items
	createNetworkIcons: function(items) {
		// Add user icons
		var len = this.users.length;
		for (var i = 0 ; i < len ; i++) {
			 var currentUser = this.users[i];
			 if (currentUser.networkId != preferences.getNetworkId()) {
				var icon = this.$.network.createComponent({
					kind: "Sugar.Icon", 
					icon: {directory: "icons", icon: "owner-icon.svg"},
					size: constant.sizeNeighbor,
					colorized: true,
					colorizedColor: currentUser.colorvalue,
					popupShow: enyo.bind(this, "showUserPopup"),
					popupHide: enyo.bind(this, "hideUserPopup"),
					data: currentUser
				},
				{owner: this});
				icon.render();
				items.push({icon: icon, size: icon.getSize(), locked: false});			
			 }
		}
		
		// Add activities icons
		len = this.activities.length;
		for (var i = 0 ; i < len ; i++) {
			 var currentActivity = this.activities[i];
			 var activityInfo = preferences.getActivity(currentActivity.activityId);
			 if (activityInfo != preferences.genericActivity) {
				var icon = this.$.network.createComponent({
					kind: "Sugar.Icon", 
					icon: {directory: activityInfo.directory, icon: activityInfo.icon},
					size: constant.sizeNeighbor,
					colorized: true,
					colorizedColor: currentActivity.colorvalue,
					popupShow: enyo.bind(this, "showActivityPopup"),
					popupHide: enyo.bind(this, "hideActivityPopup"),
					data: activityInfo
				},
				{owner: this});
				icon.render();
				items.push({icon: icon, size: icon.getSize(), locked: false});
			 }
		}	
	},
	
	// Detect collisions on drawing
	detectCollisions: function(items) {
		var collisions = [];
		var len = items.length;		
		for (var i = 0 ; i < len ; i++) {
			for (var j = i+1 ; j < len ; j++) {
				var item0 = items[i];
				var item1 = items[j];
				var min0x = item0.x, max0x = item0.x+item0.size;
				var min0y = item0.y, max0y = item0.y+item0.size;
				var min1x = item1.x, max1x = item1.x+item1.size;
				var min1y = item1.y, max1y = item1.y+item1.size;
				if (!(max0x < min1x || min0x > max1x || min0y > max1y || max0y < min1y)) {
					if (item0.locked)
						collisions.push(item1);
					else
						collisions.push(item0);
				}
			}
		}
		return collisions;
	},
	
	// Move items to avoid collisions
	solveCollisions: function(collisions, items) {
		var stillCollide = true;
		var canvas_center = util.getCanvasCenter();		
		for(var i = 0 ; stillCollide && i < constant.maxCollisionTry ; i++) {
			// Move all item with collision
			for(var j = 0 ; j < collisions.length ; j++) {
				var current = collisions[j];
				current.x = Math.floor(Math.random()*(canvas_center.dx-current.size));
				current.y = Math.floor(Math.random()*(canvas_center.dy-current.size));			
			}
			
			// Detect again
			collisions = this.detectCollisions(items);
			stillCollide = (collisions.length > 0);
		}
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