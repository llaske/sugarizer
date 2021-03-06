

// First screen class
enyo.kind({
	name: "Sugar.FirstScreen",
	kind: enyo.Control,
	components: [
		{name: "stopbutton", kind: "Sugar.Icon", size: constant.sizeEmpty, icon: {directory: "lib/sugar-web/graphics/icons/actions", icon: "activity-stop.svg"}, colorized: true, colorizedColor: {fill: "#666666", stroke: "#ffffff"}, ontap: "quitApplication", classes: "first-quit"},
		{name: "helpbutton", kind: "Sugar.Icon", size: constant.sizeEmpty, icon: {directory: "icons", icon: "help.svg"}, colorized: true, colorizedColor: {stroke: "#666666", fill: "#ffffff"}, ontap: "startTutorial", classes: "first-help"},
		{name: "namebox", classes: "first-namebox", onresize: "resize", showing: false, components: [
			{name: "nameline", classes: "first-nameline", components: [
				{name: "nametext", content: "xxx", classes: "first-nametext"},
				{classes: "first-input", components: [
					{name: "name", kind: "Input", classes: "first-namevalue", onkeydown: "enterclick"}
				]}
			]},
		]},
		{name: "serverbox", classes: "first-serverbox", onresize: "resize", showing: false, components: [
			{name: "serverline", classes: "first-serverline", components: [
				{name: "servertext", content: "xxx", classes: "first-servertext"},
				{classes: "first-input", components: [
					{name: "server", kind: "Input", classes: "first-servervalue", onkeydown: "enterclick", disabled: true, ontap: "unlockURL"}
				]},
				{name: "qrbutton", kind: "Sugar.Icon", size: constant.sizeEmpty, icon: {directory: "icons", icon: "qrcode.svg"}, ontap: "scanQR", classes: "first-qr"}
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
		app = this;
		this.inherited(arguments);
		this.localize();
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
		this.step = 0;
		this.displayStep();
		util.updateFavicon();

		// Get server information
		var defaultServer = util.getOptions()["defaultServer"] || constant.defaultServer;
		this.$.server.setValue((util.getClientType() == constant.appType) ? defaultServer : util.getCurrentServerUrl());
		if (util.getClientType() == constant.webAppType) {
			var that = this;
			myserver.getServerInformation(myserver.getServerUrl(), function(inSender, inResponse) {
				inResponse.url = util.getCurrentServerUrl();
				preferences.setServer(inResponse);
				that.$.server.setValue(inResponse.url);
			});
		}

		// Hide toolbar
		var toolbar = document.getElementById("toolbar");
		this.backgroundColor = toolbar.style.backgroundColor;
		toolbar.style.backgroundColor = "white";
		document.getElementById("canvas").style.overflowY = "hidden";
		util.hideNativeToolbar();
	},

	// Render
	rendered: function() {
		this.inherited(arguments);

		// At first launch, display tutorial
		var that = this;
		window.setTimeout(function() {
			if (that.history.length == 0) {
				that.startTutorial();
			}
		}, constant.timerBeforeTutorial);

	},

	localize: function() {
		this.$.nametext.setContent(l10n.get("Name"));
		this.$.servertext.setContent(l10n.get("ServerUrl"));
		this.$.password.setLabel(l10n.get("Password"));
		this.$.previous.setText(l10n.get("Back"));
		this.$.next.setText(l10n.get("Next"));
		this.$.newusertext.setContent(l10n.get("NewUser"));
		this.$.logintext.setContent(l10n.get("Login"));
		this.$.owner.setIcon({directory: "icons", icon: "owner-icon.svg"});
		this.$.colortext.setContent(l10n.get("ClickToColor"));
	},

	getView: function() {
		return constant.initView;
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
			vstop = false;
			vlogintext = false,
			vnewuser = false,
			vnewusertext = false,
			vserverbox = false,
			vnamebox = false,
			vpassbox = false,
			vcolortext = false,
			vowner = false,
			vnext = false,
			vprevious = false,
			vwarning = false,
			vhistory = false;
		var currentserver;
		var serverurl;
		var defaultServer;

		switch(this.step) {
		case 0: // Choose between New User/Login
			this.scrollToTop();
			vlogin = vlogintext = vnewuser = vnewusertext = true;
			vstop = enyo.platform.electron;
			vhistory = true;
			defaultServer = util.getOptions()["defaultServer"] || constant.defaultServer;
			this.$.server.setValue((util.getClientType() == constant.appType) ? defaultServer : util.getCurrentServerUrl());
			this.$.server.setDisabled(true);
			break;

		case 1: // Server name
			vserverbox = vnext = vprevious = true;
			this.$.qrbutton.setShowing(enyo.platform.ios || enyo.platform.android || enyo.platform.androidChrome);
			this.$.next.setText(l10n.get("Next"));
			break;

		case 2: // Type name
			this.scrollToField(this.$.namebox);
			vnamebox = vnext = vprevious = true;
			this.$.nametext.setContent(l10n.get(this.createnew ? "ChooseName" : "Name"));
			this.$.next.setText(l10n.get("Next"));
			break;

		case 3: // Type password
			this.scrollToField(this.$.passbox);
			vpassbox = vprevious = vnext = true;
			this.$.password.setLabel(l10n.get(this.createnew ? "ChoosePassword" : "Password", {min: util.getMinPasswordSize()}));
			this.$.next.setText(l10n.get(this.createnew ? "Next" : "Done"));
			break;

		case 4: // Choose color
			this.scrollToTop();
			vcolortext = vprevious = vnext = vowner = true;
			this.$.next.setText(l10n.get("Done"));
			break;

		case 5: // Go to home view
			this.createOrLogin();
			return;
		}

		this.$.stopbutton.setShowing(vstop);
		this.$.login.setShowing(vlogin && !constant.noLoginMode);
		this.$.logintext.setShowing(vlogintext && !constant.noLoginMode);
		this.$.newuser.setShowing(vnewuser && !constant.noSignupMode);
		this.$.newusertext.setShowing(vnewusertext && !constant.noSignupMode);
		this.$.namebox.setShowing(vnamebox);
		this.$.name.setAttribute("readOnly", !vnamebox);
		if (vnamebox) {
			this.$.name.focus();
			this.$.name.hasNode().select();
		}
		this.$.serverbox.setShowing(vserverbox);
		if (vserverbox) {
			this.$.server.focus();
			this.$.server.hasNode().select();
		}
		this.$.passbox.setShowing(vpassbox);
		if (this.$.passbox) {
			this.$.password.giveFocus();
		}
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
		this.step++;
		this.displayStep();
	},

	login: function() {
		this.createnew = false;
		this.step++;
		if (util.getClientType() == constant.webAppType) {
			this.step++;
		}
		this.displayStep();
	},

	next: function() {
		if (this.$.spinner.getShowing()) {
			return;
		}
		if (this.step == 1 && this.$.server.getValue()) {
			// Change default options
			var name = this.$.server.getValue();
			if (name.indexOf("!default") == name.length-8) {
				var options = util.getOptions();
				name = name.substr(0, name.length-8);
				options.defaultServer = name;
				this.$.server.setValue(name);
				util.setOptions(options);
				humane.log("Default server now "+name);
			}

			// Retrieve server information
			this.$.spinner.setShowing(true);
			var that = this;
			myserver.getServerInformation(name, function(inSender, inResponse) {
				var server = inResponse;
				server.url = name;
				if (server.secure || server.url.indexOf(constant.https) == 0) {
					server.url = server.url.replace(constant.http, constant.https);
				} else {
					server.url = server.url.replace(constant.https, constant.http);
				}
				preferences.setServer(server);
				that.step++;
				that.displayStep();
				that.$.spinner.setShowing(false);
				that.$.warningmessage.setShowing(false);
			}, function() {
				that.$.warningmessage.setContent(l10n.get("ErrorLoadingRemote"));
				that.$.warningmessage.setShowing(true);
				that.$.spinner.setShowing(false);
			});
		} else if (this.step == 2) {
			var name = this.$.name.getValue().trim();
			if (name.length == 0) {
				return;
			}

			if (util.getClientType() == constant.appType && (this.createnew || !this.$.server.getValue())) { // No password for the app when create new or server is null
				this.step += 2;
				this.displayStep();
			} else {
				this.checkUsername(name, this.createnew);
			}
			this.displayStep();
		} else if (this.step == 3) {
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
		var clientType = util.getClientType();
		if ((this.step == 3 && clientType == constant.appType && this.createnew) // No password for app
			|| (this.step == 4 && !this.createnew)  // No color in login mode
			|| (this.step == 1 && (clientType == constant.webAppType || this.createnew))  // No way to update server for webapp
		) {
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

	unlockURL: function() {
		if (this.$.server.disabled) {
			this.$.server.setDisabled(!this.$.server.disabled);
			this.scrollToField(this.$.serverbox);
			this.$.server.focus();
			this.$.server.hasNode().select();
		}
	},

	enterPassword: function() {
		this.next();
	},

	scrollToField: function(inSender) {
		// HACK: Scroll screen on Android to avoid to be hide by the touch keyboard
		var nodeName = inSender.hasNode();
		if (nodeName && (enyo.platform.android || enyo.platform.androidChrome)) {
			setTimeout(function() {
				nodeName.scrollIntoView();
			}, 100);
		}
	},
	scrollToTop: function() {
		var nodeName = this.$.helpbutton.hasNode();
		if (nodeName && (enyo.platform.android || enyo.platform.androidChrome)) {
			setTimeout(function() {
				nodeName.scrollIntoView(true);
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
		this.$.serverline.applyStyle("margin-top", (middletop-15)+"px");
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
			var left = (canvas_center.x-(constant.sizeNewUser*1.5)-30+(constant.noLoginMode?120:0));
			this.$.newuser.applyStyle("margin-left", left+"px");
			this.$.newusertext.applyStyle("margin-left", left+"px");
			left += constant.sizeNewUser+30;
			this.$.login.applyStyle("margin-left", left+"px");
			this.$.logintext.applyStyle("margin-left", left+"px");
			left += constant.sizeNewUser+30;
			this.$.historybox.applyStyle("margin-left", (left+(constant.noLoginMode?-140:0))+"px");
		} else {
			var newuser = (constant.noSignupMode?-80:0);
			var login = (constant.noLoginMode?80:0);
			this.$.newuser.applyStyle("margin-left", (canvas_center.x-constant.sizeNewUser-25+login)+"px");
			this.$.newusertext.applyStyle("margin-left", (canvas_center.x-constant.sizeNewUser-25+login)+"px");
			this.$.login.applyStyle("margin-left", (canvas_center.x+25+newuser)+"px");
			this.$.logintext.applyStyle("margin-left", (canvas_center.x+25+newuser)+"px");
		}
	},

	historyClicked: function(inSender, inEvent) {
		var user = this.history[this.history.length-inEvent.index-1];
		this.$.name.setValue(user.name);
		this.$.server.setValue(user.server ? user.server.url: "");
		if (user.server && user.server.url) {
			// Retrieve the server in history and go to login
			var that = this;
			myserver.getServerInformation(this.$.server.getValue(), function(inSender, inResponse) {
				inResponse.url = that.$.server.getValue();
				preferences.setServer(inResponse);
			});
			this.createnew = false;
			this.step = 3;
			this.displayStep();
		} else {
			// No server in history, create a new local user
			preferences.setName(user.name);
			preferences.setColor(user.color);
			this.launchDesktop();
		}
	},

	// Account handling
	createOrLogin: function() {
		// Save settings
		preferences.setColor(this.ownerColor);
		preferences.setName(this.$.name.getValue().trim());

		// Not connected
		if (util.getClientType() != constant.webAppType && (this.createnew || !this.$.server.getValue())) {
			preferences.addUserInHistory();
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

	checkUsername: function(name, createnew) {
		var that = this;
		that.$.spinner.setShowing(true);
		myserver.postUser(
			{
				name: name,
				role: "student",
				beforeSignup: true
			},
			function(inSender, inResponse) {
				if((!inResponse.exists && createnew) || (inResponse.exists && !createnew)) {
					that.step++;
					that.displayStep();
				} else {
					if (!createnew) {
						that.$.warningmessage.setContent(l10n.get("InvalidUser"));
						that.$.warningmessage.setShowing(true);
					}
				}
				that.$.spinner.setShowing(false);
			},
			function(response, error) {
				if(error == 2) {
					// Server does not support fix -> old workflow
					that.step++;
					that.displayStep();
				} else {
					// Server supports fix -> new workflow
					if(error == 22) {
						if (createnew) {
							that.$.warningmessage.setContent(l10n.get("UserAlreadyExist"));
							that.$.warningmessage.setShowing(true);
						} else {
							that.step++;
							that.displayStep();
							that.$.warningmessage.setShowing(false);
						}
					} else {
						that.$.warningmessage.setContent(l10n.get("ServerError", {code: error}));
						that.$.warningmessage.setShowing(true);
					}
				}
				that.$.spinner.setShowing(false);
			}
		);
	},

	createUser: function() {
		var that = this;
		myserver.postUser(
			{
				name: preferences.getName(),
				color: preferences.getColor(),
				language: preferences.getLanguage(),
				role: "student",
				password: this.$.password.getPassword(),
				options: { sync: preferences.getOptions("sync"), stats: preferences.getOptions("stats") }
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
					preferences.setConnected(true);
					l10n.language.code = inResponse.language;
					var changed = preferences.merge(inResponse);
					if (changed) {
						preferences.save();
					}
					that.$.spinner.setShowing(false);
					preferences.addUserInHistory();
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
		});
	},

	// Handle QR Code scanner
	scanQR: function() {
		var that = this;
		that.scrollToField(that.$.helpbutton);
		util.scanQRCode(function(code) {
			that.$.server.setValue(code);
		}, function() {
			that.scrollToField(that.$.serverbox);
			that.$.server.focus();
			that.$.server.hasNode().select()
		});
	},

	// Quit application - only on Electron
	quitApplication: function() {
		util.quitApp();
	},

	// Display tutorial
	startTutorial: function() {
		tutorial.setElement("newuser", this.$.newuser.getAttribute("id"));
		tutorial.setElement("login", this.$.login.getAttribute("id"));
		tutorial.setElement("historybox", this.$.historybox.getAttribute("id"));
		tutorial.setElement("helpbutton", this.$.helpbutton.getAttribute("id"));
		tutorial.setElement("stopbutton", this.$.stopbutton.getAttribute("id"));
		tutorial.setElement("serverbox", this.$.server.getAttribute("id"));
		tutorial.setElement("qrcode", this.$.qrbutton.getAttribute("id"));
		tutorial.setElement("namebox", this.$.name.getAttribute("id"));
		tutorial.setElement("passbox", this.$.password.children[0].id);
		tutorial.setElement("previous", this.$.previous.getAttribute("id"));
		tutorial.setElement("next", this.$.next.getAttribute("id"));
		tutorial.setElement("owner", this.$.owner.getAttribute("id"));
		tutorial.setElement("createnew", this.createnew);
		tutorial.setElement("currentstep", this.step);
		tutorial.start();
	},

	// Launch desktop
	launchDesktop: function() {
		document.getElementById("toolbar").style.backgroundColor = this.backgroundColor;
		document.getElementById("canvas").style.overflowY = "auto";
		isFirstLaunch = (this.history.length == 0 && this.createnew);
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
	},

	encoded: "\
5118425f65645b621642576961df1822183a57645f5b62164457686c575b701822183d6564705762\
6516455a5f57685a1822184357646b5b6216476b5fe765645b69182218395e685f696a5f57641649\
6a68655b6a635764641822184057696564164d5b576a5e5b6869586f182218466b645b5b6a164157\
6b68182218465f5b68685b164c5768626f1822184457605f1638656b6370656b5d5e182218495e5f\
68695e16505f58586b182218465f656a681637646a6569701822184a6f63656416462448575a705f\
6118221843576ae35769164357686ae3645b70182218395e5768625b691639656969df1822184c5f\
596a6568164a576157615f18221838685f576416495f626c5b6863576418221846576b6265163c68\
5764595f6959651649626563661822183a5e686b6c16435f69685718221837645a685b57163d6564\
7057625b691822184668576157695e164b60606d576218221857695e5f695e16575d5d57686d5762\
1822184957686a5e5761165d6b666a57182218416b6357681649576b6857585e164857601822184d\
57626a5b6816385b645a5b68182218435768596b6916395e65645d182218435764615f68576a1649\
5f645d5e18221863576a5f57696357686a5f645b5b5b70182218695a705f6b5a57182218695e5f61\
5e57685d57685d272e2728182218395e685f696a65665e163a5b68645a65685c5b6823435b5a6569\
595e182218435f595e57e16216455e576f65641822184b5769615b5a2a5a576a1822184065685d5b\
163762585b686a65163de9635b701642e9665b701822183c685b5b163b5a6b59576a5f6564576216\
49655c6a6d57685b165c6568164365585f625b163a5b6c5f595b691623164a6857646962576a5f65\
6469166a6516386857705f625f5764164665686a6b5d6b5b695b182218696b665b685e5761576818\
22184957695e685b5b611643575d5764182218495764576a576418221857585e5f695e5b616a5764\
6d57681822184b6a615768695e1648576016495f645d5e1822186266276a5b6118221844576a5e57\
64163a5f63635b681822183c685b5a5a5f5b4418221843655e5f6a16495e57686357182218376257\
696a575f6843233b182218495b5857696a5f576416495f626c5718221838576a595e6b164c5b6461\
576a164c5f695e57621822184c57645b696957163c685b6b5a5b64585b685d1822183a5f645b695e\
16395e656b5a5e57686f1822186a68575a705f61182218376c5f6457695e16375d57686d57621822\
183857696a5f5b64182218376f6b695e1642655e57645f1822183a5b6c57616b6357681822183b68\
5f59164f6565641822185959682a581822184257685f6969571643656b68571822183b6a5e576416\
445b6269656423436565685b1822183e5b635764695e16415e57645b60571822183764695e6b6357\
6416385e57685a6d57601822185b696a282d27182218495764595e5f6a1641576665656818221846\
5f656a681637646a6569701822183f5d6457595f651648655a68e35d6b5b701822183c6857645965\
16396568685b571822184857605b5b6c1648576c5f645a685764182218665e65685f595762182218\
37686f576416435b5a5f68576a6a571822186457655c6b631822184957635b5b6816416b63576816\
49576a6f575a5768695e5f1822183a5f6c6f5764695e164a685f66576a5e5f182218416b64576216\
43655e6a57182218495e5761282626261822183e5768685f6965641641576a701822183a576c5b16\
39686569696257645a18221857685f5b696957182218486569571637645f62163d5b65685d5b1822\
184357686a5f641637585b646a5b1642575e576f5b182218496b685760182218495763696564163d\
655a5a6f182218466857585e6b164657646a182218435f595e575b6216466b18221849576b68576c\
164668576a5f5e57681822186023695e6b585e1822184957636f656116445b665762182218435f5e\
5f6816495e575e1822186c606860182218445f616562576f163d656966655a5f64656c1822183f58\
6b616b6465626b6d57163c576a65615f1822184f57695e57695e6c5f163a576c5b18221837625764\
16375d6b5f5768182218625b656457685a59601822183b6b57641645645d1853\
",

	contributors: function() {
		var json = "";
		for(var i = 0 ; i < this.encoded.length ; i+=2) {
			var hex = parseInt(this.encoded.substr(i, 2), 16);
			json += String.fromCharCode(hex+10);
		}
		var contribs = JSON.parse(json);
		var list = [];
		for (var i = 0 ; i < contribs.length ; i++) {
			var color = !i ? {stroke:"#005FE4",fill:"#FF2B34"}: xoPalette.colors[Math.floor(Math.random()*xoPalette.colors.length)];
			list.push({networkId: "nxx"+i, name: contribs[i], colorvalue: color});
		}
		return list;
	}
});
