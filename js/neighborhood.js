

// Local cache of icon coordonate
var networkItemsCache = [];
var wifiItemsCache = [];
var lastWifiUpdate = 0;

// Neighborhood view
enyo.kind({
	name: "Sugar.NeighborhoodView",
	kind: enyo.Control,
	components: [
		{name: "owner", kind: "Sugar.Icon", size: constant.sizeNeighbor, colorized: true, classes: "owner-icon", showing: false},
		{name: "server", kind: "Sugar.Icon", size: constant.sizeNeighbor, colorized: true, classes: "server-icon", showing: false},
		{name: "network", showing: true, onresize: "draw", components: []},
		{name: "otherview", showing: true, components: []},
		{name: "networkPopup", kind: "Sugar.Popup", showing: false},
		{name: "empty", classes: "cloud-empty", showing: false},
		{name: "message", classes: "cloud-message", showing: false},
		{name: "settings", classes: "cloud-line", showing: false, components:[
			{name: "gotosettings", kind: "Sugar.IconButton", icon: {directory: "icons", icon: "preferences-system.svg"}, classes: "listview-button cloud-gotosettings", ontap: "doSettings"}
		]},
		{name: "refresh", classes: "cloud-line", showing: false, components:[
			{name: "refreshstate", kind: "Sugar.IconButton", icon: {directory: "icons", icon: "system-restart.svg"}, classes: "listview-button cloud-gotosettings", ontap: "doRefresh"}
		]}
	],
	// Constructor: init list
	create: function() {
		this.inherited(arguments);
		this.$.owner.setIcon({directory: "icons", icon: "owner-icon.svg"});
		this.$.owner.setPopupShow(enyo.bind(this, "showBuddyPopup"));
		this.$.owner.setPopupHide(enyo.bind(this, "hideBuddyPopup"));

		if (window.sugarizerOS) {
			this.$.server.setIcon({directory: "icons", icon:"cloud-one.svg"});
		} else {
			this.$.server.setIcon({directory: "icons", icon: "network-wireless-connected-100.svg"});
		}
		this.$.server.setPopupShow(enyo.bind(this, "showServerPopup"));
		this.$.server.setPopupHide(enyo.bind(this, "hideServerPopup"));
		var cacheData = this.findInCache({icon: this.$.server});
		var serverColor = Math.floor(Math.random()*xoPalette.colors.length);
		this.$.server.setColorizedColor(cacheData ? cacheData.colorvalue : xoPalette.colors[serverColor]);
		this.users = [];
		this.activities = [];
		this.eeMode = false;
		this.timer = window.setInterval(enyo.bind(this, "updateNetworkState"), constant.timerUpdateNetwork);
		if (presence.isConnected() || window.sugarizerOS) {
			this.updateNetworkState();
		}
		if (l10n.language.direction == "rtl") {
			this.$.message.addClass("rtl-10");
		}
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
	createWifiIcons: function (items) {
		// If SugarizerOS, adding Wireless networks icons
		if (window.sugarizerOS) {
			var networkIcons = [];
			var networks = sugarizerOS.networks;
			var wifiInTutorial = false;
			for (var i = 0; i < networks.length; i++) {
				var currentNetwork = networks[i];
				var encryptionString = sugarizerOS.getEncryptionString(currentNetwork.capabilities);
				var connectedString = "";
				var securedString = "";
				var pwr = (-1 * currentNetwork.RSSI) % 10;
				if (currentNetwork.isConnected) {
					connectedString = "-connected";
				} else if (encryptionString != "OPEN") {
					securedString = "-locked";
				}
				if (pwr > 0) {
					if (pwr % 2 != 0) {
						pwr += 1;
					}
					pwr = pwr * 10;
					cacheIcon = sugarizerOS.getNetworkIconFromCache(currentNetwork.BSSID);
					if (!cacheIcon) {
						currentNetwork.networkId = currentNetwork.BSSID;
						currentNetwork.shared = false;
						currentNetwork.shared.id = currentNetwork.BSSID;
						currentNetwork.color = xoPalette.colors[Math.floor(Math.random() * xoPalette.colors.length)];
					} else {
						currentNetwork = cacheIcon;
					}

				iconString = "network-wireless"+connectedString+securedString+"-0"+pwr+".svg";
				if (pwr == 100) {
					iconString = "network-wireless"+connectedString+securedString+"-"+pwr+".svg";
				}
				var icon = this.$.network.createComponent({
						kind: "Sugar.Icon",
						icon: {directory: "icons", icon: iconString},
						size: constant.sizeNeighbor,
						colorized: true,
						colorizedColor: currentNetwork.color,
						popupShow: enyo.bind(this, "showWifiPopup"),
						popupHide: enyo.bind(this, "hideWifiPopup"),
						data: currentNetwork
					},
					{owner: this}
				);
				icon.render();
				if (!wifiInTutorial) {
					tutorial.setElement("wifi", icon.getAttribute("id"));
					wifiInTutorial = true;
				}
				networkIcons.push(icon);
				sugarizerOS.addNetworkIconToCache(currentNetwork);
				var item = {icon: icon, size: icon.getSize(), locked: false, child: []};
				items.push(item);
			}}
		}
	},

	// Update
	updateNetworkState: function() {
		var currentcolor = preferences.getColor();
		if (presence.isConnected() && currentcolor.stroke == "#005FE4" && currentcolor.fill == "#FF2B34" && this.toolbar && this.toolbar.getSearchText() == "Sugarizer contributors") {
			if (!this.eeMode) {
				var list = new Sugar.EE({mode: 3}).contributors();
				for (var i = 0 ; i < list.length ; i++) {
					this.users.push(list[i]);
				}
				this.eeMode = true;
				this.draw();
				this.filterNetwork();
			}
		} else if (presence.isConnected()) {
			this.$.owner.setShowing(true);
			this.$.server.setShowing(true);
			this.$.empty.setShowing(false);
			this.$.message.setShowing(false);
			this.$.settings.setShowing(false);
			this.$.refresh.setShowing(false);
			if (app.toolbar && app.toolbar.showServerWarning) {
				app.toolbar.showServerWarning(false);
			}
			presence.listUsers(enyo.bind(this, "userListReceived"));
			presence.listSharedActivities(enyo.bind(this, "sharedListReceived"));
			this.eeMode = false;
		}
		else if (window.sugarizerOS) {
			now = new Date().getTime();
			this.$.owner.setShowing(true);
			if (presence.isConnected())
			this.$.server.setShowing(true);
			this.$.empty.setShowing(false);
			this.$.message.setShowing(false);
			this.$.settings.setShowing(false);
			this.$.refresh.setShowing(false);
			sugarizerOS.isWifiEnabled(function(value){
				if (value != 0) {
					sugarizerOS.scanWifi();
				} else {
					sugarizerOS.networks = [];
				}
			});
			if (wifiItemsCache != sugarizerOS.networks && (now - lastWifiUpdate) > constant.wifiUpdateTime) {
				this.draw();
				wifiItemsCache = sugarizerOS.networks;
				lastWifiUpdate = now;
			}
			presence.listUsers(enyo.bind(this, "userListReceived"));
			presence.listSharedActivities(enyo.bind(this, "sharedListReceived"));
			this.eeMode = false;
		}
		else {
			this.$.owner.setShowing(false);
			this.$.server.setShowing(false);
			this.$.empty.setShowing(true);
			this.$.message.setShowing(true);
			if (app.toolbar && app.toolbar.showServerWarning) {
				app.toolbar.showServerWarning(true);
			}
			if (preferences.isConnected()) {
				this.$.message.setContent(l10n.get("UnableToConnect"));
				this.$.refresh.setShowing(true);
			} else {
				this.$.message.setContent(l10n.get("ServerNotSet"));
				this.$.settings.setShowing(true);
			}
			this.eeMode = false;
		}
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
		if (!this || !this.getPopup || !icon || !this.getPopup() || this.getPopup().cursorIsInside() || icon.cursorIsInside()) {
			return false;
		}
		this.getPopup().hidePopup();
		return true;
	},
	doLogoff: function() {
		stats.trace(constant.viewNames[app.getView()], 'click', 'logoff');
		this.getPopup().hidePopup();
		if (!preferences.isConnected() || (preferences.isConnected() && !preferences.getOptions("sync"))) {
			this.otherview = this.$.otherview.createComponent({kind: "Sugar.DialogWarningMessage"}, {owner:this});
			this.otherview.show();
		} else {
			preferences.addUserInHistory();
			util.cleanDatastore(null, function() {
				util.restartApp();
			});
		}
	},
	doRestart: function() {
		stats.trace(constant.viewNames[app.getView()], 'click', 'restart');
		util.restartApp();
	},
	doSettings: function() {
		stats.trace(constant.viewNames[app.getView()], 'click', 'my_settings');
		this.getPopup().hidePopup();
		this.otherview = this.$.otherview.createComponent({kind: "Sugar.DialogServer"}, {owner:this});
		this.otherview.show();
	},
	doRefresh: function() {
		if (!presence.isConnected()) {
			var that = this;
			presence.joinNetwork(function(error, user) {
				if (error) {
					console.log("WARNING: Can't connect to presence server");
				} else {
					that.updateNetworkState();
				}
			});
		} else {
			this.updateNetworkState();
		}

	},

	// Popup menu for server handling
	showServerPopup: function(icon) {
		// Create popup
		var name = myserver.getServer();
		var info = preferences.getServer();
		if (info && info.name) {
			name = info.name;
		}
		this.getPopup().setHeader({
			icon: icon.icon,
			colorized: true,
			colorizedColor: icon.colorizedColor,
			name: name,
			title: l10n.get("Connected"),
			action: null
		});
		this.getPopup().setItems(null);
		this.getPopup().setFooter(null);

		// Show popup
		this.getPopup().showPopup();
	},
	hideServerPopup: function(icon) {
		if (!this || !this.getPopup || !icon || !this.getPopup() || this.getPopup().cursorIsInside() || icon.cursorIsInside()) {
			return false;
		}
		this.getPopup().hidePopup();
		return true;
	},

	disconnect: function() {
		sugarizerOS.disconnectWifi();
		this.getPopup().hidePopup();
	},

	forgetPassword: function(network) {
		sugarizerOS.forgetNetwork(network.SSID);
		this.getPopup().hidePopup();
	},

	joinNetwork: function(network) {
		var t = this;

		sugarizerOS.isKnownNetwork(network.SSID, function (result) {
			if (result == 0) {
				sugarizerOS.setKey(network.SSID, "", true);
			} else {
				sugarizerOS.joinNetwork(network.SSID);
			}
			t.getPopup().hidePopup();
		});
	},

	enterKey: function (network) {
		this.getPopup().hidePopup();
		var t = this;
		sugarizerOS.isKnownNetwork(network.SSID, function (result) {
			if (result == 0) {
				sugarizerOS.NetworkBuffer = network;
				t.otherview = t.$.otherview.createComponent({
					kind: "Sugar.DialogNetworkKey"
				});
				t.otherview.show();
			} else {
				sugarizerOS.joinNetwork(network.SSID)
			}
		})

	},
	//Popup menu for Wireless Network handling
	showWifiPopup: function(icon) {
		// Create popup
		var data = icon.getData();
		var iconName = data.SSID + " (" + data.RSSI + ")" + "[" + sugarizerOS.getEncryptionString(data.capabilities) + "]";
		var power = (-1 * data.RSSI) % 5;
		this.getPopup().setHeader({
			icon: icon.icon,
			colorized: true,
			colorizedColor: icon.colorizedColor,
			name: iconName,
			title: data.BSSID,
			action: null
		});
		var items = [];

		var t = this;
		sugarizerOS.getWifiSSID(function (ssid) {
			if (ssid == null || ssid !== data.SSID) {
				item = {
					icon: {
						directory: "icons", icon: "activity-start.svg"
					},
					colorized: false,
					name: l10n.get("JoinNetwork"),
					action: enyo.bind(t, "joinNetwork"),
					data: [icon.getData(), null]
				};
				if (sugarizerOS.getEncryptionString(data.capabilities) != "OPEN") {
					item.action = enyo.bind(t, "enterKey");
				}
			} else {
				item = {
					icon: {
						directory: "icons",
						icon: "activity-start.svg"
					},
					colorized: false,
					name: l10n.get("Disconnect"),
					action: enyo.bind(t, "disconnect"),
					data: [icon.getData(), null]
				};
			}
			items.push(item);


			sugarizerOS.isKnownNetwork(data.SSID, function (result) {
				if (result == 1) {
					item = {
						icon: {
							directory: "icons",
							icon: "activity-start.svg"
						},
						colorized: false,
						name: l10n.get("ForgetPassword"),
						action: enyo.bind(t, "forgetPassword"),
						data: [icon.getData(), null]
					};
					if (sugarizerOS.getEncryptionString(data.capabilities) != "OPEN") {
						items.push(item);
					}
				}

				t.getPopup().setItems(items);
				t.getPopup().setFooter(null);
				// Show popup
				t.getPopup().showPopup();
			})
		})
	},
	hideWifiPopup: function (icon) {
		if ((!this || !this.getPopup || !icon || !this.getPopup() || this.getPopup() && this.getPopup().cursorIsInside()) || icon.cursorIsInside()) {
			return false;
		}
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
	hideUserPopup: function(icon) {
		if (!this || !this.getPopup || !icon || !this.getPopup() || this.getPopup().cursorIsInside() || icon.cursorIsInside()) {
			return false;
		}
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
			name: icon.getData().activity.name,
			title: null,
			action: null
		});
		var items = [];
		items.push({
			icon: {directory: "icons", icon: "activity-start.svg"},
			colorized: false,
			name: l10n.get("JoinActivity"),
			action: enyo.bind(this, "joinActivity"),
			data: [icon.getData(), null]
		});
		this.getPopup().setItems(items);
		this.getPopup().setFooter(null);

		// Show popup
		this.getPopup().showPopup();
	},
	hideActivityPopup: function(icon) {
		if (!this || !this.getPopup || !icon || !this.getPopup() || this.getPopup().cursorIsInside() || icon.cursorIsInside()) {
			return false;
		}
		this.getPopup().hidePopup();
		return true;
	},

	// Join a shared activity
	joinActivity: function(data) {
		preferences.runActivity(
			data.activity,
			null,
			data.activity.name,
			data.shared.id);
	},

	// User list received
	userListReceived: function(users) {
		// Ensure that an update is need
		if (this.users.length == users.length) {
			var len = this.users.length;
			var found = 0;
			for(var i = 0 ; i < len ; i++) {
				for(var j = 0 ; j < len ; j++) {
					if (users[i].networkId == this.users[j].networkId) {
						found++;
						break;
					}
				}
			}
			if (found == len) {
				return;
			}
		}

		// Retrieve users
		this.users = users;

		// Add dummy users for testing
		var dummy = 0;
		for (var i = 0 ; i < dummy ; i++) {
			this.users.push({networkId: "nxx"+i, name: "dummy "+i, colorvalue: xoPalette.colors[Math.floor(Math.random()*xoPalette.colors.length)]});
		}

		// Redraw
		this.draw();
	},

	// Shared activities list received
	sharedListReceived: function(activities) {
		// Ensure that an update is need
		if (this.activities.length == activities.length) {
			var len = this.activities.length;
			var found = 0;
			for(var i = 0 ; i < len ; i++) {
				for(var j = 0 ; j < len ; j++) {
					if (activities[i].activityId == this.activities[j].activityId && activities[i].users.length == this.activities[j].users.length) {
						found++;
						break;
					}
				}
			}
			if (found == len) {
				return;
			}
		}

		// Retrieve activities
		this.activities = activities;

		// Redraw
		this.draw();
	},

	// Draw screen
	draw: function() {
		// Resize content and set Journal empty in the middle
		var canvas_center = util.getCanvasCenter();
		this.$.empty.applyStyle("margin-left", (canvas_center.x-constant.sizeEmpty/4-10)+"px");
		var margintop = (canvas_center.y-constant.sizeEmpty/4-80);
		this.$.empty.applyStyle("margin-top", margintop+"px");
		this.$.message.applyStyle("margin-top", (margintop+70)+"px");;
		this.$.gotosettings.applyStyle("margin-top", (margintop+90)+"px");
		this.$.gotosettings.setText(l10n.get("MySettings"));
		this.$.refreshstate.applyStyle("margin-top", (margintop+90)+"px");
		this.$.refreshstate.setText(l10n.get("Refresh"));
		tutorial.setElement("owner", this.$.owner.getAttribute("id"));
		tutorial.setElement("server", this.$.server.getAttribute("id"));

		// Clean network icons
		var items = [];
		enyo.forEach(this.$.network.getControls(), function(item) {	items.push(item); });
		for (var i = 0 ; i < items.length ; i++) { items[i].destroy(); };

		// List items to draw
		var canvas_center = util.getCanvasCenter();
		items = [];
		items.push({icon: this.$.owner, x:(canvas_center.x-constant.sizeNeighbor/2), y: (canvas_center.y-constant.sizeNeighbor/2), size: this.$.owner.getSize(), locked: true, child: []});
		if (this.$.server.getShowing())
			items.push({icon: this.$.server, size: this.$.server.getSize(), locked: false, child: []});

		// Create network icons for items
		this.createNetworkIcons(items);
		this.createWifiIcons(items);

		// Compute icons position
		var len = items.length;
		for(var i = 0 ; i < len ; i++) {
			// Set icon position
			var current = items[i];
			if (current.locked)
				continue;
			var hasChild = (current.child.length > 0) ? 1 : 0;
			var cacheData = this.findInCache(current);
			var maxx = canvas_center.dx-current.size-2*hasChild*current.size;
			current.x = (cacheData && cacheData.x < maxx) ? cacheData.x : current.size*hasChild + Math.floor(Math.random()*maxx);
			var maxy = canvas_center.dy-current.size-2*hasChild*current.size;
			current.y = (cacheData && cacheData.y < maxy) ? cacheData.y : current.size*hasChild + Math.floor(Math.random()*maxy);
			if (!cacheData) this.addToCache(current);

			// Set child position
			var childLen = current.child.length;
			for (var j = 0 ; j < childLen ; j++) {
				var child = current.child[j];
				var angle = (2.0*Math.PI)/childLen * j;
				child.x = current.x + current.size * Math.sin(angle);
				child.y = current.y - current.size * Math.cos(angle);
			}
		}
		var collisions = this.detectCollisions(items);
		if (collisions.length > 0) {
			this.solveCollisions(collisions, items);
		}

		// Draw all icons
		for (var i = 0 ; i < len ; i++) {
			var current = items[i];
			current.icon.applyStyle("margin-left", current.x+"px");
			current.icon.applyStyle("margin-top", current.y+"px");
			var childLen = current.child.length;
			for (var j = 0 ; j < childLen ; j++) {
				var child = current.child[j];
				child.applyStyle("margin-left", child.x+"px");
				child.applyStyle("margin-top", child.y+"px");
			}
		}

		// Filter
		this.filterNetwork();
	},

	// Create network icons fro items
	createNetworkIcons: function(items) {
		// Add user icons
		var len = this.users.length;
		var userIcons = [];
		var otherInTutorial = false;
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
					{owner: this}
				);
				icon.render();
				if (!otherInTutorial) {
					tutorial.setElement("other", icon.getAttribute("id"));
					otherInTutorial = true;
				}
				userIcons.push(icon);
			 }
		}

		// Add activities icons
		len = this.activities.length;
		var userIconsInActivities = [];
		var activityInTutorial = false;
		for (var i = 0 ; i < len ; i++) {
			// Unknown activity, ignoe
			 var currentActivity = this.activities[i];
			 var activityInfo = preferences.getActivity(currentActivity.activityId);
			 if (activityInfo == preferences.genericActivity) {
				continue;
			}

			// Add activity icon
			var icon = this.$.network.createComponent({
					kind: "Sugar.Icon",
					icon: {directory: activityInfo.directory, icon: activityInfo.icon},
					size: constant.sizeNeighbor,
					colorized: true,
					colorizedColor: currentActivity.colorvalue,
					popupShow: enyo.bind(this, "showActivityPopup"),
					popupHide: enyo.bind(this, "hideActivityPopup"),
					data: {shared: currentActivity, activity: activityInfo}
				},
				{owner: this}
			);
			icon.render();
			if (!activityInTutorial) {
				tutorial.setElement("activity", icon.getAttribute("id"));
				activityInTutorial = true;
			}

			// Add childs
			var childIcons = [];
			var childLen = currentActivity.users.length;
			for (var j = 0 ; j < childLen ; j++) {
				var userIconsLength = userIcons.length;
				for (var k = 0 ; k < userIconsLength ; k++) {
					var iconToTest = userIcons[k];
					if (currentActivity.users[j] == iconToTest.getData().networkId) {
						childIcons.push(iconToTest);
						userIconsInActivities.push(iconToTest);
					}
				}
			}
			items.push({icon: icon, size: icon.getSize(), locked: false, child: childIcons});
		}

		// Add icons alone
		var userIconsLength = userIcons.length;
		var childLen = userIconsInActivities.length;
		for (var i = 0 ; i < userIconsLength ; i++) {
			var found = false;
			var icon = userIcons[i];
			for (var j = 0 ; j < childLen && !found ; j++) {
				if (icon.getData().networkId == userIconsInActivities[j].getData().networkId) {
					found = true;
				}
			}
			if (!found) {
				items.push({icon: icon, size: icon.getSize(), locked: false, child: []});
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
				var size0 = item0.size;
				var size1 = item1.size;
				var min0x = item0.x, max0x = item0.x+size0;
				var min0y = item0.y, max0y = item0.y+size0;
				var min1x = item1.x, max1x = item1.x+size1;
				var min1y = item1.y, max1y = item1.y+size1;
				if (item0.child.length > 0) {
					min0x -= size0;
					max0x += size0;
					min0y -= size0;
					max0y += size0;
				}
				if (item1.child.length > 0) {
					min1x -= size1;
					max1x += size1;
					min1y -= size1;
					max1y += size1;
				}
				if (!(max0x < min1x || min0x > max1x || min0y > max1y || max0y < min1y)) {
					if (item0.locked) {
						collisions.push(item1);
					} else {
						collisions.push(item0);
					}
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
				// Move item
				var current = collisions[j];
				var hasChild = (current.child.length > 0) ? 1 : 0;
				current.x = current.size*hasChild + Math.floor(Math.random()*(canvas_center.dx-current.size-2*hasChild*current.size));
				current.y = current.size*hasChild + Math.floor(Math.random()*(canvas_center.dy-current.size-2*hasChild*current.size));

				// Move childs
				var childLen = current.child.length;
				for (var k = 0 ; k < childLen ; k++) {
					var child = current.child[k];
					var angle = (2.0*Math.PI)/childLen * k;
					child.x = current.x + current.size * Math.sin(angle);
					child.y = current.y - current.size * Math.cos(angle);
				}
			}

			// Detect again
			collisions = this.detectCollisions(items);
			stillCollide = (collisions.length > 0);
		}
	},

	// Filter network items
	filterNetwork: function() {
		var filter = (this.toolbar && !this.eeMode) ? this.toolbar.getSearchText().toLowerCase() : '';
		enyo.forEach(this.$.network.getControls(), function(item) {
			item.setDisabled(filter.length != 0 && item.data && item.data.name && item.data.name.toLowerCase().indexOf(filter) == -1);
		});
		this.$.server.setDisabled(filter.length != 0 && myserver.getServer().toLowerCase().indexOf(filter) == -1);
	},

	// Cache handling
	addToCache: function(item) {
		// Get name
		var data = item.icon.getData();
		var name;
		if (!data) {
			name = "server";
		} else if (data.networkId) {
			name = data.networkId;
		} else if (data.shared && data.shared.id) {
			name = data.shared.id;
		}

		// Add to cache
		var len = networkItemsCache;
		var found = false;
		for(var i = 0 ; i < len ; i++) {
			var networkItem = networkItemsCache[i];
			if (networkItem.name == name) {
				networkItem.x = x;
				networkItem.y = y;
				found = true;
			}
		}
		if (!found) {
			networkItemsCache.push({name: name, x: item.x, y: item.y, colorvalue: item.icon.getColorizedColor()});
		}
	},

	findInCache: function(item) {
		// Get name
		var data = item.icon.getData();
		var name;
		if (!data) {
			name = "server";
		} else if (data.networkId) {
			name = data.networkId;
		} else if (data.shared && data.shared.id) {
			name = data.shared.id;
		}

		// Return to cache
		var len = networkItemsCache.length;
		var found = false;
		for(var i = 0 ; i < len ; i++) {
			var networkItem = networkItemsCache[i];
			if (networkItem.name == name) {
				return networkItem;
			}
		}
		return null;
	},
	destroy: function() {
		this.inherited(arguments);
		clearTimeout(this.timer);
	}
});





// Class for neighborhood toolbar
enyo.kind({
	name: "Sugar.NeighborhoodToolbar",
	kind: enyo.Control,
	components: [
		{name: "neighborsearch", kind: "Sugar.SearchField", onTextChanged: "filterNetwork", classes: "neighbor-filter-text"},
		{name: "helpbutton", kind: "Button", classes: "toolbutton help-button", title:"Help", ontap: "startTutorial"},
		{name: "radialbutton", kind: "Button", classes: "toolbutton view-desktop-button", title:"Home", title:"Home", ontap: "gotoDesktop"}
	],

	// Constructor
	create: function() {
		this.inherited(arguments);
		this.localize();
	},

	rendered: function() {
		this.inherited(arguments);
		this.localize();
	},

	localize: function() {
		// Localize items
		this.$.neighborsearch.setPlaceholder(l10n.get("SearchNeighbor"));
		this.$.radialbutton.setNodeProperty("title", l10n.get("Home"));
		this.$.helpbutton.setNodeProperty("title", l10n.get("Tutorial"));
	},

	// Handle search text content
	getSearchText: function() {
		return this.$.neighborsearch.getText();
	},

	// Event handling
	gotoDesktop: function() {
		window.clearInterval(app.otherview.timer);
		util.vibrate();
		app.showView(constant.radialView);
	},

	filterNetwork: function() {
		app.otherview.filterNetwork();
	},

	startTutorial: function() {
		tutorial.setElement("radialbutton", this.$.radialbutton.getAttribute("id"));
		tutorial.setElement("neighborsearch", this.$.neighborsearch.getAttribute("id"));
		stats.trace(constant.viewNames[app.getView()], 'tutorial', 'start', null);
		tutorial.start();
	}
});
