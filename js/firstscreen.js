

// First screen class
enyo.kind({
	name: "Sugar.FirstScreen",
	kind: enyo.Control,
	components: [
		{name: "namebox", classes: "first-namebox", onresize: "resize", showing: false, components: [
			{name: "nameline", classes: "first-nameline", components: [
				{name: "nametext", content: "xxx", classes: "first-nametext"},
				{classes: "first-input", components: [
					{name: "name", kind: "Input", classes: "first-namevalue", onfocus: "scrollToField", onkeydown: "enterclick"}
				]}
			]},
		]},
		{name: "passbox", classes: "first-passbox", onresize: "resize", showing: false, components: [
			{name: "password", kind: "Sugar.Password", onEnter: "enterPassword"}
		]},
		{name: "historybox", classes: "first-historybox", kind: "Repeater", onSetupItem: "setupHistory", onresize: "resize", showing: false, components:[
			{name: "history", kind: "Sugar.IconButton", icon: {directory: "icons", icon: "owner-icon.svg"}, classes: "first-historybutton", ontap: "historyClicked"}
		]},
		{name: "previous", kind: "Sugar.IconButton", icon: {directory: "icons", icon: "go-left.svg"}, classes: "first-leftbutton", ontap: "previous", showing: false},
		{name: "next", kind: "Sugar.IconButton", icon: {directory: "icons", icon: "go-right.svg"}, classes: "first-rightbutton", ontap: "next", showing: false},
		{name: "colortext", content: "xxx", classes: "first-colortext", showing: false},
		{name: "owner", kind: "Sugar.Icon", size: constant.sizeOwner, colorized: true, classes: "first-owner-icon", showing: false, onresize: "resize", ontap: "nextcolor"},
		{name: "newuser", kind: "Sugar.Icon", size: constant.sizeNewUser, colorized: false, classes: "first-owner-icon", showing: true, onresize: "resize", ontap: "newUser"},
		{name: "newusertext", content: "xxx", classes: "newuser-text"},
		{name: "login", kind: "Sugar.Icon", size: constant.sizeNewUser, colorized: false, classes: "first-owner-icon", showing: true, onresize: "resize", ontap: "login"},
		{name: "logintext", content: "xxx", classes: "newuser-text"},
		{name: "spinner", kind: "Image", src: "images/spinner-light.gif", classes: "spinner", showing: false},
		{name: "warningmessage", content: "xxx", classes: "first-warningmessage", showing: true}
	],

	// Constructor
	create: function() {
		// Init screen
		this.inherited(arguments);
		this.$.nametext.setContent(l10n.get("Name"));
		this.$.password.setLabel(l10n.get("Password"));
		this.$.previous.setText(l10n.get("Back"));
		this.$.next.setText(l10n.get("Next"));
		this.$.newusertext.setContent(l10n.get("NewUser"));
		this.$.logintext.setContent(l10n.get("Login"));
		this.$.owner.setIcon({directory: "icons", icon: "owner-icon.svg"});
		this.$.colortext.setContent(l10n.get("ClickToColor"));
		this.history = preferences.getHistory();
		if (!this.history || !this.history.length) {
			this.history = [];
		}
		this.$.historybox.set("count", this.history.length, true);
		this.resize();
		this.ownerColor = Math.floor(Math.random()*xoPalette.colors.length);
		this.$.owner.setColorizedColor(xoPalette.colors[this.ownerColor]);
		this.$.newuser.setIcon({directory: "icons", icon: "newuser-icon.svg"});
		this.$.login.setIcon({directory: "icons", icon: "login.svg"});
		if (l10n.language.direction == "rtl") {
			this.$.name.addClass("rtl-10");
		}
		this.createnew = true;
		if (util.getClientType() == constant.webAppType) {
			this.step = 0;
		} else {
			this.step = 1;
		}
		this.displayStep();

		// Get server information
		if (util.getClientType() == constant.webAppType) {
			myserver.getServerInformation(myserver.getServerUrl(), function(inSender, inResponse) {
				inResponse.url = util.getCurrentServerUrl();
				preferences.setServer(inResponse);
			});
		}

		// Hide toolbar
		var toolbar = document.getElementById("toolbar");
		this.backgroundColor = toolbar.style.backgroundColor;
		toolbar.style.backgroundColor = "white";
		document.getElementById("canvas").style.overflowY = "hidden";
		util.hideNativeToolbar();
	},

	getView: function() {
		return constant.radialView;
	},

	setupHistory: function(inSender, inEvent) {
		var user = this.history[this.history.length-inEvent.index-1];
		inEvent.item.$.history.setColorizedColor(xoPalette.colors[user.color]);
		inEvent.item.$.history.setColorized(true);
		inEvent.item.$.history.setText(user.name);
	},

	// Display current step items
	displayStep: function() {
		var vlogin = false,
			vlogintext = false,
			vnewuser = false,
			vnewusertext = false,
			vnamebox = false,
			vpassbox = false,
			vcolortext = false,
			vowner = false,
			vnext = false,
			vprevious = false,
			vwarning = false,
			vhistory = false;
		this.$.password.stopInputListening();

		switch(this.step) {
		case 0: // Choose between New User/Login
			vlogin = vlogintext = vnewuser = vnewusertext = true;
			vhistory = true;
			break;

		case 1: // Type name
			vnamebox = vnext = true;
			vprevious = (util.getClientType() == constant.webAppType);
			this.$.nametext.setContent(l10n.get(this.createnew ? "ChooseName" : "Name"));
			this.$.next.setText(l10n.get("Next"));
			break;

		case 2: // Type password
			vpassbox = vprevious = vnext = true;
			this.$.password.setLabel(l10n.get(this.createnew ? "ChoosePassword" : "Password", {min: util.getMinPasswordSize()}));
			this.$.next.setText(l10n.get(this.createnew ? "Next" : "Done"));
			this.$.password.startInputListening();
			break;

		case 3: // Choose color
			vcolortext = vprevious = vnext = vowner = true;
			this.$.next.setText(l10n.get("Done"));
			break;

		case 4: // Go to home view
			this.createOrLogin();
			return;
		}

		this.$.login.setShowing(vlogin);
		this.$.logintext.setShowing(vlogintext);
		this.$.newuser.setShowing(vnewuser);
		this.$.newusertext.setShowing(vnewusertext);
		this.$.namebox.setShowing(vnamebox);
		this.$.passbox.setShowing(vpassbox);
		this.$.colortext.setShowing(vcolortext);
		this.$.owner.setShowing(vowner);
		this.$.previous.setShowing(vprevious);
		this.$.next.setShowing(vnext);
		this.$.historybox.setShowing(vhistory && this.history.length);
		this.$.warningmessage.setShowing(vwarning);
	},

	// Event handling
	newUser: function() {
		this.createnew = true;
		this.step++;
		this.displayStep();
	},

	login: function() {
		this.createnew = false;
		this.step++;
		this.displayStep();
	},

	next: function() {
		if (this.$.spinner.getShowing()) {
			return;
		}
		if (this.step == 1) {
			var name = this.$.name.getValue().trim();
			if (name.length == 0) {
				return;
			}
			this.step++;
			if (util.getClientType() == constant.appType) { // No password for the app
				this.step++;
			}
			this.displayStep();
		} else if (this.step == 2) {
			var pass = this.$.password.getPassword();
			if (pass.length == 0 || pass.length < util.getMinPasswordSize()) {
				return;
			}
			this.step++;
			if (!this.createnew) { // No color when login
				this.step++;
			}
			this.displayStep();
		} else {
			this.step++;
			this.displayStep();
		}
	},

	previous: function() {
		if (this.$.spinner.getShowing()) {
			return;
		}
		this.step--;
		if ((this.step == 2 && util.getClientType() == constant.appType) // No password for app
			|| (this.step == 3 && !this.createnew)) { // No color in login mode
			this.step--;
		}
		this.displayStep();
	},

	enterclick: function(inSender, inEvent) {
		if (inEvent.keyCode === 13) {
			this.next();
			return true;
		}
	},

	enterPassword: function() {
		this.next();
	},

	scrollToField: function() {
		// HACK: Scroll screen on Android to avoid to be hide by the touch keyboard
		var nodeName = this.$.name.hasNode();
		if (nodeName && (enyo.platform.android || enyo.platform.androidChrome)) {
			setTimeout(function() {
				nodeName.scrollIntoView();
			}, 100);
		}
	},

	nextcolor: function() {
		if (this.$.spinner.getShowing()) {
			return;
		}
		this.ownerColor = this.ownerColor + 1;
		if (this.ownerColor >= xoPalette.colors.length)
			this.ownerColor = 0;
		this.$.owner.setColorizedColor(xoPalette.colors[this.ownerColor]);
		this.$.owner.render();
	},

	resize: function() {
		var canvas_center = util.getCanvasCenter();
		this.$.owner.applyStyle("margin-left", (canvas_center.x-constant.sizeOwner/2)+"px");
		var middletop = (canvas_center.y-constant.sizeOwner/2);
		this.$.nameline.applyStyle("margin-top", (middletop-15)+"px");
		this.$.passbox.applyStyle("margin-top", (middletop/2)+"px");
		this.$.owner.applyStyle("margin-top", middletop+"px");
		this.$.warningmessage.applyStyle("left", (canvas_center.x-100)+"px");
		this.$.colortext.applyStyle("margin-top", (middletop-15)+"px");
		var newUserPosition = (middletop-constant.sizeNewUser/2);
		this.$.newuser.applyStyle("margin-top", newUserPosition+"px");
		this.$.login.applyStyle("margin-top", newUserPosition+"px");
		this.$.historybox.applyStyle("margin-top", (newUserPosition+20)+"px");
		this.$.newusertext.applyStyle("margin-top", (newUserPosition+constant.sizeNewUser+20)+"px");
		this.$.newusertext.applyStyle("width", constant.sizeNewUser+"px");
		this.$.logintext.applyStyle("margin-top", (newUserPosition+constant.sizeNewUser+20)+"px");
		this.$.logintext.applyStyle("width", constant.sizeNewUser+"px");
		if (this.history.length) {
			var left = (canvas_center.x-(constant.sizeNewUser*1.5)-30);
			this.$.newuser.applyStyle("margin-left", left+"px");
			this.$.newusertext.applyStyle("margin-left", left+"px");
			left += constant.sizeNewUser+30;
			this.$.login.applyStyle("margin-left", left+"px");
			this.$.logintext.applyStyle("margin-left", left+"px");
			left += constant.sizeNewUser+30;
			this.$.historybox.applyStyle("margin-left", left+"px");
		} else {
			this.$.newuser.applyStyle("margin-left", (canvas_center.x-constant.sizeNewUser-25)+"px");
			this.$.newusertext.applyStyle("margin-left", (canvas_center.x-constant.sizeNewUser-25)+"px");
			this.$.login.applyStyle("margin-left", (canvas_center.x+25)+"px");
			this.$.logintext.applyStyle("margin-left", (canvas_center.x+25)+"px");
		}
	},

	historyClicked: function(inSender, inEvent) {
		this.$.name.setValue(this.history[this.history.length-inEvent.index-1].name);
		this.createnew = false;
		this.step = 2;
		this.displayStep();
	},

	// Account handling
	createOrLogin: function() {
		// Save settings
		preferences.setColor(this.ownerColor);
		preferences.setName(this.$.name.getValue().trim());

		// Not connected
		if (util.getClientType() != constant.webAppType) {
			this.launchDesktop();
			return;
		}

		// Pause UI
		this.$.spinner.setShowing(true);

		// Create a new user on the network
		if (this.createnew) {
			this.createUser();
		}

		// Log user
		else {
			this.loginUser();
		}
	},

	createUser: function() {
		var that = this;
		myserver.postUser(
			{
				name: preferences.getName(),
				color: preferences.getColor(),
				language: preferences.getLanguage(),
				role: "student",
				password: this.$.password.getPassword()
			},
			function(inSender, inResponse) {
				// Auto log user after creation to get token
				that.loginUser();
			},
			function(response, error) {
				that.$.spinner.setShowing(false);
				if (error == 22) {
					that.$.warningmessage.setContent(l10n.get("UserAlreadyExist"));
				} else {
					that.$.warningmessage.setContent(l10n.get("ServerError", {code: error}));
				}
				that.$.warningmessage.setShowing(true);
				that.step--;
			}
		);
	},

	loginUser: function() {
		var that = this;
		var user = {
			"name": preferences.getName(),
			"password": this.$.password.getPassword()
		};
		myserver.loginUser(user, function(loginSender, loginResponse) {
			preferences.setToken({'x_key': loginResponse.user._id, 'access_token': loginResponse.token});
			myserver.getUser(
				loginResponse.user._id,
				function(inSender, inResponse) {
					preferences.setNetworkId(inResponse._id);
					preferences.setPrivateJournal(inResponse.private_journal);
					preferences.setSharedJournal(inResponse.shared_journal);
					l10n.language.code = inResponse.language;
					var changed = preferences.merge(inResponse);
					if (changed) {
						preferences.save();
					}
					presence.joinNetwork(function (error, user) {
						if (error) {
							console.log("WARNING: Can't connect to presence server");
						}
					});
					that.$.spinner.setShowing(false);
					that.launchDesktop();
				},
				function(response, code) {
					that.$.warningmessage.setContent(l10n.get("ServerError", {code: code}));
					that.$.warningmessage.setShowing(true);
					that.$.spinner.setShowing(false);
					that.step--;
				}
			);
		},
		function(response, error) {
			if (error == 1) {
				that.$.warningmessage.setContent(l10n.get("UserLoginInvalid"));
			} else {
				that.$.warningmessage.setContent(l10n.get("ServerError", {code: error}));
			}
			that.$.warningmessage.setShowing(true);
			that.$.spinner.setShowing(false);
			that.step--;
			if (that.step == 3 && util.getClientType() == constant.webAppType) {
				that.$.password.startInputListening();
			}
		});
	},

	// Launch desktop
	launchDesktop: function() {
		document.getElementById("toolbar").style.backgroundColor = this.backgroundColor;
		document.getElementById("canvas").style.overflowY = "auto";
		app = new Sugar.Desktop();
		app.renderInto(document.getElementById("canvas"));
		preferences.save();
	}
});


// EE screen handle
enyo.kind({
	name: "Sugar.EE",
	kind: enyo.Control,
	published: { mode: 1 },
	components: [
		{name: "endscreen", kind: "Image", src: "images/uiwarning.png", classes: "shutdownimage", showing: false, ontap: "reload"},
		{name: "audio", kind: "Sugar.Audio"},
		{name: "owner", kind: "Sugar.Icon", size: constant.sizeOwner, icon: {directory: "icons", icon: "owner-icon.svg"}, colorized: true, colorizedColor: {stroke: "#666666", fill: "#FFFFFF"}, classes: "owner-icon", showing: false},
		{name: "dots"},
		{name: "lab", kind: "Image", src: "images/eelab.svg", classes: "eelab", showing: false},
		{name: "fed", kind: "Image", src: "images/eefed.jpg", classes: "eefed", showing: false},
	],

	// Constructor
	create: function() {
		this.inherited(arguments);
		this.timer = null;
		this.step = 0;
		app.noresize = true;
	},

	// Render
	rendered: function() {
		this.inherited(arguments);
		this.draw();
	},

	modeChanged: function() {
		this.draw();
	},

	reload: function() {
		location.reload();
	},

	// Draw screen
	draw: function() {
		this.addRemoveClass("eedownscreen", false);
		this.addRemoveClass("shutdownscreen", false);
		if (this.mode == 1) {
			if (this.step) {
				return;
			}
			this.addRemoveClass("eescreen", true);
			this.$.audio.play("audio/eeboot");
			this.step = 1;
			this.timer = window.setInterval(enyo.bind(this, "processStep"), 1000);
		} else if (this.mode == 2) {
			this.addRemoveClass("shutdownscreen", true);
			this.$.endscreen.setShowing(true);
		}
	},

	processStep: function() {
		var lightgray = {stroke: "#000000", fill: "#999999"};
		var darkgray = {stroke: "#000000", fill: "#666666"};
		switch(this.step++) {
			case 1: {
				var canvas_center = util.getCanvasCenter();
				this.$.owner.setX(canvas_center.x-constant.sizeOwner/2);
				this.$.owner.setY(canvas_center.y-constant.sizeOwner/2);
				this.$.owner.setShowing(true);
				break;
			}
			case 11: {
				this.dots = [];
				var dotsize = 24;
				var ownersize = this.$.owner.getSize();
				var centerx = this.$.owner.getX() + ownersize/2 - dotsize/2;
				var centery = this.$.owner.getY() + ownersize/2 - dotsize/2;
				var PI2 = Math.PI*2.0;
				var radius = ownersize*1.5;
				var angle = Math.PI/2.0;
				var base_angle = PI2/parseFloat(24);
				for (var i = 0 ; i < 24 ; i++) {
					x = (centerx+Math.cos(angle)*radius);
					y = (centery+Math.sin(angle)*radius);
					var dot = this.$.dots.createComponent({
						kind: "Sugar.Icon",
						icon: {directory: "icons", icon: "dot.svg"},
						size: dotsize,
						x: x,
						y: y,
						colorizedColor: lightgray,
						colorized: true,
						showing: (i==0)},
						{owner: this});
					dot.render();
					this.dots.push(dot);
					angle += base_angle;
				}
				break;
			}
			case 20: {
				for (var i = 0 ; i < 24 ; i++) {
					this.dots[i].setShowing(true);
				}
				this.$.fed.setShowing(true);
				this.$.lab.setShowing(true);
				break;
			}
			case 21: {
				for (var i = 0 ; i < 24 ; i += 4) {
					this.dots[i].setColorizedColor(darkgray);
				}
				break;
			}
			case 22:
			case 23:
			case 24:
			case 25:
			case 26: {
				var colors = [];
				for (var i = 0 ; i < 24 ; i++) {
					colors.push(this.dots[i].getColorizedColor());
				}
				for (var i = 0 ; i < 24 ; i++) {
					this.dots[i].setColorizedColor(colors[(i == 0 ? 23 : i-1)]);
				}
				break;
			}
			case 27: {
				for (var i = 0 ; i < 24 ; i++) {
					this.dots[i].setColorizedColor(darkgray);
				}
				break;
			}
			case 39: {
				window.clearInterval(this.timer);
				this.reload();
			}
			default: {
			}
		}
	}
});
