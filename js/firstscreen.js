

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
		{name: "consentbox", classes: "first-consentbox", onresize: "resize", showing: false, components: [
			{name: "privacy", kind: "Sugar.Icon", icon: {directory: "icons", icon: "cookie.svg"}, classes: "first-privacy-icon"},
			{name: "cookietext", content: "xxx", classes: "first-cookietext", allowHtml: true},
			{name: "policytext", content: "xxx", classes: "first-policytext", allowHtml: true}
		]},
		{name: "previous", kind: "Sugar.IconButton", icon: {directory: "icons", icon: "go-left.svg"}, classes: "first-leftbutton", ontap: "previous", showing: false},
		{name: "next", kind: "Sugar.IconButton", icon: {directory: "icons", icon: "go-right.svg"}, classes: "first-rightbutton", ontap: "next", showing: false},
		{name: "decline", kind: "Sugar.IconButton", icon: {directory: "icons", icon: "dialog-cancel.svg"}, classes: "first-leftbutton", ontap: "decline", showing: false},
		{name: "accept", kind: "Sugar.IconButton", icon: {directory: "icons", icon: "dialog-ok.svg"}, classes: "first-rightbutton", ontap: "accept", showing: false},
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
		this.history = historic.get();
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

		// At first launch, display tutorial
		var that = this;
		window.addEventListener("localized", function () {
			if (that.history.length === 0) {
				that.startTutorial();
			}
		}, {once : true})
	},

	localize: function() {
		this.$.nametext.setContent(l10n.get("Name"));
		this.$.servertext.setContent(l10n.get("ServerUrl"));
		this.$.password.setLabel(l10n.get("Password"));
		this.$.previous.setText(l10n.get("Back"));
		this.$.next.setText(l10n.get("Next"));
		this.$.decline.setText(l10n.get("Decline"));
		this.$.accept.setText(l10n.get("Accept"));
		this.$.cookietext.setContent(l10n.get("CookieConsent"));
		this.$.policytext.setContent(l10n.get("PolicyLink", {url: "#"}));
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
			vdecline = false,
			vaccept = false,
			vconsentbox = false,
			vwarning = false,
			vhistory = false;
		var currentserver;
		var serverurl;
		var defaultServer;
		var server = preferences.getServer();
		var consentNeed = ((util.getClientType() == constant.appType && !this.createnew) || (server && server.options && server.options["consent-need"]));

		switch(this.step) {
		case 0: // Choose between New User/Login
			this.scrollToTop();
			vlogin = vlogintext = vnewuser = vnewusertext = true;
			vstop = util.platform.electron;
			vhistory = true;
			defaultServer = util.getOptions()["defaultServer"] || constant.defaultServer;
			this.$.server.setValue((util.getClientType() == constant.appType) ? defaultServer : util.getCurrentServerUrl());
			this.$.server.setDisabled(true);
			break;

		case 1: // Server name
			vserverbox = vnext = vprevious = true;
			this.$.qrbutton.setShowing(util.platform.ios || util.platform.android);
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
			this.$.next.setText(l10n.get(consentNeed ? "Next" : "Done"));
			break;

		case 5: // Consent to cookies
			this.scrollToTop();
			vconsentbox = vdecline = vaccept = true;
			break;

		case 6: // Go to home view
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
		this.$.decline.setShowing(vdecline);
		this.$.accept.setShowing(vaccept);
		this.$.consentbox.setShowing(vconsentbox);
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
			if (!this.createnew) {
				this.step++; // No color when login
				this.step++; // No cookie consent when login (asked at create)
			}
			this.displayStep();
		} else if (this.step == 4) {
			var server = preferences.getServer();
			if ((util.getClientType() == constant.appType && this.createnew) // No cookie consent for the app when create new
				|| (server && !server.options["consent-need"])) { // No cookie consent if server doesn't require it
				this.step++;
			} else if (server && server.options) {
				this.$.policytext.setContent(l10n.get("PolicyLink", {url: server.options["policy-url"]+"?lang="+preferences.getLanguage() || "#"}));
			}
			this.step++;
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

	decline: function() {
		this.step = 0;
		this.displayStep();
	},

	accept: function() {
		this.step++;
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
		if (nodeName && util.platform.android) {
			setTimeout(function() {
				nodeName.scrollIntoView();
			}, 100);
		}
	},
	scrollToTop: function() {
		var nodeName = this.$.helpbutton.hasNode();
		if (nodeName && util.platform.android) {
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
		this.$.privacy.applyStyle("margin-left", (canvas_center.x-25)+"px");
		this.$.consentbox.applyStyle("margin-top", (newUserPosition+55)+"px");
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
		var that = this;
		if (user.server && user.server.url) {
			// Retrieve the server in history and go to login
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
			activities.load().then(function(data) {
				that.launchDesktop();
			}).catch(function(error) {
				console.log("Error loading init activities");
			});
		}
	},

	// Account handling
	createOrLogin: function() {
		// Save settings
		preferences.setColor(this.ownerColor);
		preferences.setName(this.$.name.getValue().trim());

		// Not connected
		var that = this;
		if (util.getClientType() != constant.webAppType && (this.createnew || !this.$.server.getValue())) {
			historic.addUser({name: preferences.getName(), color: util.getColorIndex(preferences.getColor()), server: preferences.getServer()});
			activities.load().then(function(data) {
				that.launchDesktop();
			}).catch(function(error) {
				console.log("Error loading init activities");
			});
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
			preferences.setNetworkId(loginResponse.user._id);
			myserver.getUser(
				loginResponse.user._id,
				function(inSender, inResponse) {
					preferences.setPrivateJournal(inResponse.private_journal);
					preferences.setSharedJournal(inResponse.shared_journal);
					preferences.setConnected(true);
					l10n.language.code = inResponse.language;
					var changed = preferences.merge(inResponse);
					if (changed) {
						preferences.save();
					}
					that.$.spinner.setShowing(false);
					historic.addUser({name: preferences.getName(), color: util.getColorIndex(preferences.getColor()), server: preferences.getServer()});
					activities.load().then(function(data) {
						that.launchDesktop();
					}).catch(function(error) {
						console.log("Error loading init activities");
					});
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
		tutorial.setElement("accept", this.$.accept.getAttribute("id"));
		tutorial.setElement("decline", this.$.decline.getAttribute("id"));
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
		this.pong = false;
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
596a6568164a576157615f18221838685f576416495f626c5b686357641822184957686a5e576116\
5d6b666a571822183a5e686b6c16435f69685718221846576b6265163c685764595f695965164962\
65636618221837645a685b57163d65647057625b691822184668576157695e164b60606d57621822\
18495764576a5764182218435768596b6916395e65645d18221849576b6857585e16485760182218\
4957695e685b5b611643575d576418221857695e5f695e16575d5d57686d576218221849576b6857\
585e163d6b666a5718221863576a5f57696357686a5f645b5b5b7018221849576b636f5716416b69\
5e6d575e571822183b696a6f6e4a6857646962576a5f65646918221849706f636564163a705f6b5a\
57182218376f5b695e57695e575f612d2b2f182218435764615f68576a16495f645d5e1822183764\
57645a16395e656b6857695f5718221848655e576416616b6357681822184c5b5a57646a16495e57\
686357182218445f69595e576f163d656f57621822183c685b5a5a5f5b44182218635f6161621822\
1840575f615f695e57641638685f606d57645f18221857585e5f695e5b616a57646d57681822184d\
57626a5b6816385b645a5b681822183a5f695e57164a5762685b6057182218395e685f696a65665e\
163a5b68645a65685c5b6823435b5a6569595e18221837585e5f695e5b6116495f645d5e18221869\
6b665b685e576157681822183763576416416b635768164f575a576c182218695e5f615e57685d57\
685d272e27281822184b6a615768695e495f5a5a5e666b68571822184b5769615b5a2a5a576a1822\
183c685b5b163b5a6b59576a5f656457621649655c6a6d57685b165c6568164365585f625b163a5b\
6c5f595b691623164a6857646962576a5f656469166a6516386857705f625f5764164665686a6b5d\
6b5b695b18221837383e3f44374c16403e371822183a5f63635b681822183e5768695e5f6a164357\
6b686f571822183b695e57576416375d5d57686d57621822184065685d5b163762585b686a65163d\
e9635b701642e9665b70182218415b5f696b615f18221849392a4818221837585e5f695e5b611822\
1849575761695e5f16405e57182218376f6b695e1642655e57645f1822184c57645b696957163c68\
5b6b5a5b64585b685d1822184b6a615768695e16495f645d5e1822185b696a282d27182218392416\
39656969df1822186a68575a705f61182218376c5f6457695e16375d57686d57621822183857696a\
5f5b64182218495b5857696a5f576416495f626c57182218493e483b4f374916494b413e373a3b4c\
3b1822186266276a5b611822183a5f645b695e16395e656b5a5e57686f1822184b6060576d576216\
43655a5f1822185959682a581822183b685f59164f6565641822183764695e6b63576416385e5768\
5a6d57601822183a5e6d5760163d6b666a571822184116375a5f6a5e6f571641685f695e64571822\
183868575a6f163e182218495764595e5f6a1641576665656818221837483f3e37444a1640373f44\
1822183c685764596516396568685b5718221837686f576416435b5a5f68576a6a571822183a5f6c\
6f5764695e16375d57686d57621822186457655c6b63182218496b6857601822186023695e6b585e\
182218495e57611648575d65625b6818221857685f5b696957182218416b6457621643655e6a5718\
2218375a5f6a6f5716416b63576816495f645e5718221837635f6a16395e576168575865686a5f18\
22183a576c5f5a5b163965696a571822183a5b6c57616b6357681644431822184257685f69695716\
43656b68571822183f5d6457595f651648655a68e35d6b5b701822183e5b635764695e1822184357\
5e63656b5a163a576d65655a18221846576868656a3d5b5b611649655c6a6d57685b182218485760\
5b5b6c1648576c5f645a685764182218486569571637645f62163d5b65685d5b1822184957635b5b\
6816416b6357681649576a6f575a5768695e5f18221848576b6216476b5f646a6516495761575f18\
2218495763696564163d655a5a6f182218486b595e57164157696a6b685b18221849576b68576c16\
4668576a5f5e57681822184f57695e57695e6c5f163a576c5b1822183b6b57641645645d18221843\
5f5e5f6816495e575e182218605f5d6f57696b645f5d57631822186157645f695e61166157695e6f\
57661822186c6068601822184668576a5e5763182218625b656457685a59601853",

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
	},

	// Pong activity icons
	startPong: function(home) {
		this.pong = true;
		var items = [];
		var imax = 30;
		var imin = -30;
		var randvalue = function(min,max) { return Math.floor(Math.random() * (max - min + 1) ) + min };
		var controls = home.$.desktop.getControls();
		//controls.push(home.$.owner);
		//controls.push(home.$.journal);
		enyo.forEach(controls, function(item) {
			item.setDisabled(false);
			items.push({
				ctrl: item,
				ix: randvalue(imin, imax),
				iy: randvalue(imin, imax),
				size: parseInt(item.getComputedStyleValue("width"),10)
			});
		});
		var dim = util.getCanvasCenter();
		var that = this;
		var step = function() {
			if (!that.pong) {
				return;
			}
			for (var i = 0 ; i < items.length ; i++) {
				var item = items[i];
				var x = parseInt(item.ctrl.getComputedStyleValue("margin-left"),10);
				var y = parseInt(item.ctrl.getComputedStyleValue("margin-top"),10);
				x += item.ix;
				if (x <= 0 || x+item.size >= dim.dx-item.size/2) { item.ix = -item.ix; }
				y += item.iy;
				if (y <= item.size/2 || y+item.size >= dim.dy-item.size/2) { item.iy = -item.iy; }
				item.ctrl.applyStyle("margin-left", x+"px");
				item.ctrl.applyStyle("margin-top", y+"px");
			}
			setTimeout(step, 200);
		};
		setTimeout(step, 200);
	},
	stopPong: function() {
		this.pong = false;
	}
});
