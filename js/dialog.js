// Settings dialog

enyo.kind({
	name: "Sugar.DialogSettings",
	kind: "enyo.Popup",
	classes: "settings-dialog",
	centered: false,
	modal: true,
	floating: true,
	components: [
		{name: "toolbar", classes: "toolbar", components: [
			{name: "settingssearch", kind: "Sugar.SearchField", onTextChanged: "filterSettings", classes: "settings-filter-text"},
			{name: "donebutton", kind: "Button", classes: "toolbutton settings-close-button", title:"List", ontap: "closeSettings"}
		]},
		{name: "scroller", kind: "Scroller", horizontal: "hidden", vertical: "auto", classes: "settings-scroller", components: [
			{name: "content", components: [
				{name: "me", kind: "Sugar.DialogSettingsItem", ontap: "meClicked", text: "Me", icon: {directory: "icons", icon: "module-about_me.svg"}, colorized: true},
				{name: "computer", kind: "Sugar.DialogSettingsItem", ontap: "computerClicked", text: "Computer", icon: {directory: "icons", icon: "module-about_my_computer.svg"}},
				{name: "aboutserver", kind: "Sugar.DialogSettingsItem", ontap: "serverClicked", text: "Server", icon: {directory: "icons", icon: "cloud-settings.svg"}},
				{name: "security", kind: "Sugar.DialogSettingsItem", ontap: "securityClicked", icon: {directory: "icons", icon: "login-icon.svg"}, showing: false},
				{name: "privacy", kind: "Sugar.DialogSettingsItem", ontap: "privacyClicked", icon: {directory: "icons", icon: "privacy.svg"}, showing: false},
				{name: "language", kind: "Sugar.DialogSettingsItem", ontap: "languageClicked", text: "Language", icon: {directory: "icons", icon: "module-language.svg"}},
				{name: "androidSettings", kind: "Sugar.DialogSettingsItem", ontap: "androidSettingsClicked", text: "AndroidSettings", icon: {directory: "icons", icon: "android-preferences.svg"}, showing: false},
				{name: "resetLauncher", kind: "Sugar.DialogSettingsItem", ontap: "resetLauncherPopup", text: "ResetLauncher", icon: {directory: "icons", icon: "launcher-icon.svg"}, showing: false}
			]},
		]},
		{name: "subdialog"}
	],

	// Constructor
	create: function() {
		this.inherited(arguments);
		this.$.settingssearch.setPlaceholder(l10n.get("SearchSettings"));
		this.$.me.setText(l10n.get("AboutMe"));
		this.$.computer.setText(l10n.get("AboutMyComputer"));
		this.$.security.setText(l10n.get("MySecurity"));
		this.$.privacy.setText(l10n.get("MyPrivacy"));
		this.$.language.setText(l10n.get("Language"));
		this.$.aboutserver.setText(l10n.get("Server"));
		if (util.getClientType() == constant.webAppType || preferences.isConnected()) {
			this.$.security.setShowing(true);
			this.$.privacy.setShowing(true);
		}
		if (window.sugarizerOS) {
			sugarizerOS.getLauncherPackageName(function(value) {sugarizerOS.launcherPackageName = value;});
			this.$.androidSettings.setText(l10n.get("AndroidSettings"));
			this.$.androidSettings.show();
			this.$.resetLauncher.show();
			this.$.resetLauncher.setText(l10n.get("ResetLauncher"));
		}
		if (l10n.language.direction == "rtl") {
			this.$.me.addClass("rtl-10");
			this.$.computer.addClass("rtl-10");
			this.$.security.addClass("rtl-10");
			this.$.privacy.addClass("rtl-10");
			this.$.language.addClass("rtl-10");
			this.$.aboutserver.addClass("rtl-10");
		}
		if (util.getClientType() == constant.webAppType) {
			this.$.security.setShowing(true);
		}
		this.subdialog = null;
	},

	rendered: function() {
		this.inherited(arguments);
		app.noresize = true; // HACK: Forbid home resizing when popup is displayed to avoid modal issue
		this.$.me.render();
		this.$.donebutton.setNodeProperty("title", l10n.get("Done"));
		var margin = this.centerDialog(this);
		this.$.content.applyStyle("height", (margin.height)+"px");
		this.$.scroller.render();
	},

	centerDialog: function(dialog) {
		var margin = util.computeMargin({width: 800, height: 500}, {width: 0.95, height: 0.95});
		dialog.applyStyle("margin-left", margin.left+"px");
		dialog.applyStyle("margin-top", (margin.top-55)+"px");
		return margin;
	},

	// Events
	filterSettings: function() {
		var filter = this.$.settingssearch.getText().toLowerCase();
		stats.trace('my_settings', 'search', 'q='+filter, null);
		enyo.forEach(this.$.content.getControls(), function(item) {
			item.setDisabled(item.getText().toLowerCase().indexOf(filter) == -1 && filter.length != 0);
		});
	},

	closeSettings: function() {
		this.hide();
		app.noresize = false;
	},

	// Display me dialog
	meClicked: function() {
		if (!this.$.me.getDisabled()) {
			stats.trace('my_settings', 'click', 'about_me', null);
			this.hide();
			this.subdialog = this.$.subdialog.createComponent({kind: "Sugar.DialogAboutme"}, {owner:this});
			this.subdialog.show();
		}
	},

	computerClicked: function() {
		if (!this.$.computer.getDisabled()) {
			stats.trace('my_settings', 'click', 'about_my_computer', null);
			this.hide();
			this.subdialog = this.$.subdialog.createComponent({kind: "Sugar.DialogComputer"}, {owner:this});
			this.subdialog.show();
		}
	},

	securityClicked: function() {
		if (!this.$.security.getDisabled()) {
			stats.trace('my_settings', 'click', 'security', null);
			this.hide();
			this.subdialog = this.$.subdialog.createComponent({kind: "Sugar.DialogSecurity"}, {owner:this});
			this.subdialog.show();
		}
	},

	privacyClicked: function() {
		if (!this.$.security.getDisabled()) {
			stats.trace('my_settings', 'click', 'privacy', null);
			this.hide();
			this.subdialog = this.$.subdialog.createComponent({kind: "Sugar.DialogPrivacy"}, {owner:this});
			this.subdialog.show();
		}
	},

	languageClicked: function() {
		if (!this.$.language.getDisabled()) {
			stats.trace('my_settings', 'click', 'language', null);
			this.hide();
			this.subdialog = this.$.subdialog.createComponent({kind: "Sugar.DialogLanguage"}, {owner:this});
			this.subdialog.show();
		}
	},

	serverClicked: function() {
		if (!this.$.aboutserver.getDisabled()) {
			stats.trace('my_settings', 'click', 'about_my_server', null);
			this.hide();
			this.subdialog = this.$.subdialog.createComponent({kind: "Sugar.DialogServer"}, {owner:this});
			this.subdialog.show();
		}
	},

	androidSettingsClicked: function() {
		if (window.sugarizerOS){
			sugarizerOS.runSettings();
		}
		this.hide();
	},

	resetLauncherPopup: function(){
		this.hide();
		this.subdialog = this.$.subdialog.createComponent({kind:"Sugar.DialogSetLauncher"}, {owner:this});
		this.subdialog.show();
	}
});

// Set Launcher dialog
enyo.kind({
	name: "Sugar.DialogSetLauncher",
	kind: "enyo.Popup",
	classes: "module-dialog",
	centered: false,
	modal: true,
	floating: true,
	autoDismiss: false,
	components: [
		{name: "toolbar", classes: "toolbar", components: [
			{name: "icon", kind: "Sugar.Icon", x: 6, y: 6, classes: "module-icon", colorized: true, size: constant.sizeToolbar, icon: {directory: "icons", icon: "owner-icon.svg"}},
			{name: "text", content: "xxx", classes: "module-text"},
			{name: "cancelbutton", kind: "Button", classes: "toolbutton module-cancel-button", ontap: "cancel"},
			{name: "okbutton", kind: "Button", classes: "toolbutton module-ok-button", ontap: "ok"}
		]},
		{name: "warningbox", kind: "Sugar.DialogSettingsWarningBox", showing: false, onCancel: "cancel", onRestart: "restart"},
		{name: "content", components: [
			{name: "message", content: "xxx", classes: "launcher-message" },
			{classes: "launcher-icons", components: [
				{name: "nativeIcon", kind: "Sugar.Icon", classes: "setlauncher-icon native", icon: {directory: "icons", icon: "launcher-icon.svg"}, size: 100, ontap:"changeLauncher"},
				{name: "sugarIcon", kind: "Sugar.Icon", classes: "setlauncher-icon sugar", icon: {directory: "icons", icon: "sugarizer.svg"}, size: 100, ontap:"changeLauncher"}
			]},
		]}
	],

	// Constructor
	create: function() {
		this.inherited(arguments);
		this.$.text.setContent(l10n.get("SetLauncherTitle"));
		this.$.message.setContent(l10n.get("SetLauncherText", {launcher:sugarizerOS.launcherPackageName}));
		if (l10n.language.direction == "rtl") {
			this.$.text.addClass("rtl-10");
		}
		if (window.sugarizerOS) {
			if (sugarizerOS.launcherPackageName == sugarizerOS.packageName) {
				this.$.sugarIcon.addClass("selected");
			}
			else {
				this.$.nativeIcon.addClass("selected");
			}
		}
	},
	rendered: function() {
		this.inherited(arguments);
		this.$.icon.render();
		this.$.cancelbutton.setNodeProperty("title", l10n.get("Cancel"));
		this.$.okbutton.setNodeProperty("title", l10n.get("Ok"));
		this.owner.centerDialog(this);
	},

	// Event handling
	cancel: function() {
		this.hide();
	},

	restart: function() {
		sugarizerOS.chooseLauncher();
		this.hide();
	},

	changeLauncher: function() {
		this.$.warningbox.setShowing(true);
	}
});

// Enter Wireless key dialog
enyo.kind({
	name: "Sugar.DialogNetworkKey",
	kind: "enyo.Popup",
	classes: "module-dialog-wifikey",
	centered: false,
	modal: true,
	floating: true,
	autoDismiss: false,
	components: [
		{name: "toolbar", classes: "toolbar", components: [
			{name: "icon", kind: "Sugar.Icon", x: 6, y: 6, classes: "module-icon", colorized: true, size: constant.sizeToolbar, icon: {directory: "icons", icon: "owner-icon.svg"}},
			{name: "text", content: "xxx", classes: "module-text"},
			{name: "cancelbutton", kind: "Button", classes: "toolbutton module-cancel-button", ontap: "cancel"},
			{name: "okbutton", kind: "Button", classes: "toolbutton module-ok-button", ontap: "ok"}
		]},
		{name: "content", components: [
			{classes: "enterkey", components: [
				{name: "keyInput", kind: "Input", classes: "enterkey-input", oninput:"keychanged"}
			]}
		]}
	],

	// Constructor
	create: function() {
		this.inherited(arguments);
		this.$.text.setContent(l10n.get("EnterKey") + " [" + sugarizerOS.NetworkBuffer.SSID + "]");
		if (sugarizerOS.sharedKeyBuffer) {
			this.$.keyInput.setValue(sugarizerOS.sharedKeyBuffer);
		} else {
			this.$.keyInput.setValue("");
		}
		if (l10n.language.direction == "rtl") {
			this.$.text.addClass("rtl-10");
		}
	},

	rendered: function() {
		this.inherited(arguments);
		this.$.icon.render();
		this.$.cancelbutton.setNodeProperty("title", l10n.get("Cancel"));
		this.$.okbutton.setNodeProperty("title", l10n.get("Ok"));
		this.centerDialog(this);
	},

	// Event handling
	cancel: function() {
		this.hide();
	},

	ok: function() {
		sugarizerOS.sharedKeyBuffer = this.$.keyInput.getValue();
		sugarizerOS.setKey(sugarizerOS.NetworkBuffer.SSID, sugarizerOS.sharedKeyBuffer, true);
		this.hide();
		this.$.okbutton.setDisabled(true);
		this.$.cancelbutton.setDisabled(true);
	},

	keychanged: function() {
	},

	connect: function() {
	},

	centerDialog: function(dialog) {
		var margin = util.computeMargin({width: 500, height: 150}, {width: 0.95, height: 0.25});
		dialog.applyStyle("margin-left", margin.left+"px");
		dialog.applyStyle("margin-top", (margin.top-55-40)+"px");
	}
});

// About me dialog
enyo.kind({
	name: "Sugar.DialogAboutme",
	kind: "enyo.Popup",
	classes: "module-dialog",
	centered: false,
	modal: true,
	floating: true,
	autoDismiss: false,
	components: [
		{name: "toolbar", classes: "toolbar", components: [
			{name: "icon", kind: "Sugar.Icon", x: 6, y: 6, classes: "module-icon", colorized: true, size: constant.sizeToolbar, icon: {directory: "icons", icon: "owner-icon.svg"}},
			{name: "text", content: "xxx", classes: "module-text"},
			{name: "cancelbutton", kind: "Button", classes: "toolbutton module-cancel-button", ontap: "cancel"},
			{name: "okbutton", kind: "Button", classes: "toolbutton module-ok-button", ontap: "ok"}
		]},
		{name: "warningbox", kind: "Sugar.DialogSettingsWarningBox", showing: false, onCancel: "cancel", onRestart: "restart"},
		{name: "content", components: [
			{name: "message", content: "xxx", classes: "aboutme-message"},
			{classes: "aboutme-icons", components: [
				{name: "psicon", kind: "Sugar.Icon", x: 0, y: 6, classes: "aboutme-icon aboutme-psicon", size: constant.sizeOwner, icon: {directory: "icons", icon: "owner-icon.svg"}, ontap:"setcolor"},
				{name: "nsicon", kind: "Sugar.Icon", x: -12, y: 6, classes: "aboutme-icon aboutme-nsicon", size: constant.sizeOwner, icon: {directory: "icons", icon: "owner-icon.svg"}, ontap:"setcolor"},
				{name: "cicon", kind: "Sugar.Icon", x: 6, y: 6, classes: "aboutme-icon aboutme-cicon", size: constant.sizeOwner, icon: {directory: "icons", icon: "owner-icon.svg"}, ontap:"setcolor"},
				{name: "pficon", kind: "Sugar.Icon", x: 0, y: 6, classes: "aboutme-icon aboutme-pficon", size: constant.sizeOwner, icon: {directory: "icons", icon: "owner-icon.svg"}, ontap:"setcolor"},
				{name: "nficon", kind: "Sugar.Icon", x: -12, y: 6, classes: "aboutme-icon aboutme-nficon", size: constant.sizeOwner, icon: {directory: "icons", icon: "owner-icon.svg"}, ontap:"setcolor"}
			]},
			{classes: "aboutme-input", components: [
				{name: "name", kind: "Input", classes: "aboutme-name", oninput:"namechanged"}
			]},
			{name: "restartmessage", content: "xxx", classes: "aboutme-restart", showing: false}
		]}
	],

	// Constructor
	create: function() {
		this.inherited(arguments);
		this.$.text.setContent(l10n.get("AboutMe"));
		this.$.message.setContent(l10n.get("ClickToChangeColor"));
		this.$.restartmessage.setContent(l10n.get("ChangesRequireRestart"));
		this.initcolor = this.currentcolor = preferences.getColor();
		this.initname = this.currentname = preferences.getName();
		this.$.name.setValue(this.initname);
		if (l10n.language.direction == "rtl") {
			this.$.text.addClass("rtl-10");
			this.$.name.addClass("rtl-10");
			this.$.message.addClass("rtl-10");
			this.$.restartmessage.addClass("rtl-10");
		}
	},

	rendered: function() {
		this.inherited(arguments);
		this.$.icon.render();
		this.$.cancelbutton.setNodeProperty("title", l10n.get("Cancel"));
		this.$.okbutton.setNodeProperty("title", l10n.get("Ok"));
		var xosize = (util.getCanvasCenter().dx < 515 ? constant.sizeOwner/2 : constant.sizeOwner);
		this.$.pficon.setSize(xosize);
		this.$.pficon.setColorizedColor(util.getPreviousFillColor(this.currentcolor));
		this.$.pficon.setColorized(true);
		this.$.psicon.setSize(xosize);
		this.$.psicon.setColorizedColor(util.getPreviousStrokeColor(this.currentcolor));
		this.$.psicon.setColorized(true);
		this.$.cicon.setSize(xosize);
		this.$.cicon.setColorizedColor(this.currentcolor);
		this.$.cicon.setColorized(true);
		this.$.nficon.setSize(xosize);
		this.$.nficon.setColorizedColor(util.getNextFillColor(this.currentcolor));
		this.$.nficon.setColorized(true);
		this.$.nsicon.setSize(xosize);
		this.$.nsicon.setColorizedColor(util.getNextStrokeColor(this.currentcolor));
		this.$.nsicon.setColorized(true);
		this.$.name.setValue(this.currentname);
		this.owner.centerDialog(this);
	},

	// Event handling
	cancel: function() {
		this.hide();
		this.owner.show();
	},

	ok: function() {
		if (this.currentcolor.stroke ==  "#00B20D" && this.currentcolor.fill == "#00EA11" && (this.currentname == "one laptop per child" || this.currentname == "OLPC France")) {
			new Sugar.EE({mode:(this.currentname.indexOf("Fr")==-1?1:2)}).renderInto(document.getElementById("body"));
			return;
		}
		if (this.currentcolor == this.initcolor && this.currentname == this.initname) {
			this.hide();
			this.owner.show();
			return;
		}
		this.$.warningbox.setShowing(true);
		this.$.okbutton.setDisabled(true);
		this.$.cancelbutton.setDisabled(true);
		this.$.name.addRemoveClass('aboutme-name-validate', true);
	},

	setcolor: function(icon) {
		var newcolor = icon.getColorizedColor();
		if (newcolor == this.currentcolor) {
			return;
		}
		this.currentcolor = newcolor;
		this.render();
		this.$.restartmessage.setShowing(true);
	},

	namechanged: function() {
		this.$.restartmessage.setShowing(true);
		this.currentname = this.$.name.getValue().trim();
	},

	restart: function() {
		stats.trace('my_settings_about_me', 'change', 'name_color', null);
		preferences.setName(this.currentname);
		preferences.setColor(util.getColorIndex(this.currentcolor));
		preferences.save();
		var that = this;
		preferences.saveToServer(myserver, function() {
			util.restartApp();
		}, function(error, code) {
			that.$.warningbox.setShowing(false);
			that.$.okbutton.setDisabled(false);
			that.$.cancelbutton.setDisabled(false);
			that.currentname = preferences.getName();
			if (code == 22) {
				that.$.restartmessage.setContent(l10n.get("UserAlreadyExist"));
			} else {
				that.$.restartmessage.setContent(l10n.get("ServerError", {code: code}));
			}
		});
	}
});



// Language dialog
enyo.kind({
	name: "Sugar.DialogSecurity",
	kind: "enyo.Popup",
	classes: "module-dialog",
	centered: false,
	modal: true,
	floating: true,
	autoDismiss: false,
	components: [
		{name: "toolbar", classes: "toolbar", components: [
			{name: "icon", kind: "Sugar.Icon", x: 6, y: 6, classes: "module-icon", size: constant.sizeToolbar, icon: {directory: "icons", icon: "login-icon.svg"}},
			{name: "text", content: "xxx", classes: "module-text"},
			{name: "cancelbutton", kind: "Button", classes: "toolbutton module-cancel-button", ontap: "cancel"},
			{name: "okbutton", kind: "Button", classes: "toolbutton module-ok-button", ontap: "ok"}
		]},
		{name: "content", components: [
			{name: "message", content: "xxx", classes: "security-message"},
			{name: "password", kind: "Sugar.Password", classes: "security-password", onEnter: "next"},
			{name: "next", kind: "Sugar.IconButton", icon: {directory: "icons", icon: "go-right.svg"}, classes: "security-rightbutton", ontap: "next"},
			{name: "spinner", kind: "Image", src: "images/spinner-light.gif", classes: "security-spinner", showing: false},
			{name: "warningmessage", content: "xxx", classes: "security-warning", showing: false}
		]}
	],

	// Constructor
	create: function() {
		this.inherited(arguments);
		this.$.text.setContent(l10n.get("MySecurity"));
		this.$.message.setContent(l10n.get("SecurityMessage"));
		this.$.next.setText(l10n.get("Next"));
		this.$.password.giveFocus();
		if (l10n.language.direction == "rtl") {
			this.$.text.addClass("rtl-10");
			this.$.message.addClass("rtl-10");
		}
		this.step = 0;
	},

	rendered: function() {
		this.inherited(arguments);
		this.$.cancelbutton.setNodeProperty("title", l10n.get("Cancel"));
		this.$.okbutton.setNodeProperty("title", l10n.get("Ok"));
		this.owner.centerDialog(this);
	},

	// Event handling
	cancel: function() {
		this.hide();
		this.owner.show();
	},

	ok: function() {
		this.hide();
		this.owner.show();
	},

	next: function() {
		var that = this;
		var user = {
			"name": preferences.getName(),
			"password": this.$.password.getPassword()
		};
		if (this.step == 0) {
			that.$.spinner.setShowing(true);
			myserver.loginUser(user, function(loginSender, loginResponse) {
				preferences.setToken({'x_key': loginResponse.user._id, 'access_token': loginResponse.token});
				that.$.warningmessage.setShowing(false);
				that.$.password.setPassword("");
				that.$.next.setText(l10n.get("Done"));
				that.$.message.setContent(l10n.get("SecurityMessageNew", {min: util.getMinPasswordSize()}));
				that.step++;
				that.$.spinner.setShowing(false);
			},
			function(response, error) {
				if (error == 1) {
					that.$.warningmessage.setContent(l10n.get("InvalidPassword"));
				} else {
					that.$.warningmessage.setContent(l10n.get("ServerError", {code: error}));
				}
				that.$.warningmessage.setShowing(true);
				that.$.spinner.setShowing(false);
			});
		} else {
			var pass = this.$.password.getPassword();
			if (pass.length == 0 || pass.length < util.getMinPasswordSize()) {
				return;
			}
			that.$.spinner.setShowing(true);
			myserver.putUser(
				preferences.getNetworkId(),
				{
					password: this.$.password.getPassword()
				},
				function(inSender, inResponse) {
					that.$.message.setContent(l10n.get("SecurityMessageDone"));
					that.$.next.setShowing(false);
					that.$.password.setShowing(false);
					that.$.warningmessage.setShowing(false);
					that.$.spinner.setShowing(false);
				},
				function(response, error) {
					that.$.warningmessage.setContent(l10n.get("ServerError", {code: error}));
					that.$.warningmessage.setShowing(true);
					that.$.password.giveFocus();
					that.$.spinner.setShowing(false);
				}
			);
		}
	}
});


// Language dialog
enyo.kind({
	name: "Sugar.DialogLanguage",
	kind: "enyo.Popup",
	classes: "module-dialog",
	centered: false,
	modal: true,
	floating: true,
	autoDismiss: false,
	components: [
		{name: "toolbar", classes: "toolbar", components: [
			{name: "icon", kind: "Sugar.Icon", x: 6, y: 6, classes: "module-icon", size: constant.sizeToolbar, icon: {directory: "icons", icon: "module-language.svg"}},
			{name: "text", content: "xxx", classes: "module-text"},
			{name: "cancelbutton", kind: "Button", classes: "toolbutton module-cancel-button", ontap: "cancel"},
			{name: "okbutton", kind: "Button", classes: "toolbutton module-ok-button", ontap: "ok"}
		]},
		{name: "warningbox", kind: "Sugar.DialogSettingsWarningBox", showing: false, onCancel: "cancel", onRestart: "restart"},
		{name: "content", components: [
			{name: "message", content: "xxx", classes: "language-message"},
			{name: "languageselect", kind: "Sugar.SelectBox", classes: "language-select", onIndexChanged: "languageChanged"},
			{name: "restartmessage", content: "xxx", classes: "language-restart", showing: false}
		]}
	],

	// Constructor
	create: function() {
		this.inherited(arguments);
		this.$.text.setContent(l10n.get("Language"));
		this.$.message.setContent(l10n.get("ChooseLanguage"));
		this.initlanguage = this.currentlanguage = preferences.getLanguage();
		this.languageset = [
			{code: "en", icon: null, name: "English (" + l10n.get("English") +")"},
			{code: "es", icon: null, name: "Español (" + l10n.get("Spanish") +")"},
			{code: "fr", icon: null, name: "Français (" + l10n.get("French") +")"},
			{code: "de", icon: null, name: "Deutsch (" + l10n.get("German") +")"},
			{code: "pt", icon: null, name: "Português (" + l10n.get("Portuguese") +")"},
			{code: "ar", icon: null, name: "عربي (" + l10n.get("Arabic") +")"},
			{code: "ja", icon: null, name: "日本語 (" + l10n.get("Japanese") +")"},
			{code: "pl", icon: null, name: "Polski (" + l10n.get("Polish") +")"},
			{code: "ibo", icon: null, name: "Igbo (" + l10n.get("Igbo") +")"},
			{code: "yor", icon: null, name: "Yoruba (" + l10n.get("Yoruba") +")"}
		];
		this.$.languageselect.setItems(this.languageset);
		for (var i = 0 ; i < this.languageset.length ; i++) {
			if (this.languageset[i].code == this.initlanguage) {
				this.$.languageselect.setSelected(i);
				break;
			}
		}
		this.$.restartmessage.setContent(l10n.get("ChangesRequireRestart"));
		if (l10n.language.direction == "rtl") {
			this.$.text.addClass("rtl-10");
			this.$.message.addClass("rtl-10");
			this.$.restartmessage.addClass("rtl-10");
		}
	},

	rendered: function() {
		this.inherited(arguments);
		this.$.cancelbutton.setNodeProperty("title", l10n.get("Cancel"));
		this.$.okbutton.setNodeProperty("title", l10n.get("Ok"));
		this.$.languageselect.setParentMargin(this);
		this.owner.centerDialog(this);
	},

	// Event handling
	cancel: function() {
		this.hide();
		this.owner.show();
	},

	ok: function() {
		if (this.currentlanguage == this.initlanguage) {
			this.hide();
			this.owner.show();
			return;
		}
		this.$.warningbox.setShowing(true);
		this.$.okbutton.setDisabled(true);
		this.$.cancelbutton.setDisabled(true);
	},

	languageChanged: function() {
		this.$.restartmessage.setShowing(true);
		this.currentlanguage = this.languageset[this.$.languageselect.getSelected()].code;
	},

	restart: function() {
		stats.trace('my_settings_language', 'change', 'language', null);
		preferences.setLanguage(this.currentlanguage);
		preferences.save();
		preferences.saveToServer(myserver, function() {
			util.restartApp();
		}, function() {
			util.restartApp();
		});
	}
});



// Computer dialog
enyo.kind({
	name: "Sugar.DialogComputer",
	kind: "enyo.Popup",
	classes: "module-dialog",
	centered: false,
	modal: true,
	floating: true,
	autoDismiss: false,
	components: [
		{name: "toolbar", classes: "toolbar", components: [
			{name: "icon", kind: "Sugar.Icon", x: 6, y: 6, classes: "module-icon", size: constant.sizeToolbar, icon: {directory: "icons", icon: "module-about_my_computer.svg"}},
			{name: "text", content: "xxx", classes: "module-text"},
			{name: "cancelbutton", kind: "Button", classes: "toolbutton module-cancel-button", ontap: "cancel"},
			{name: "okbutton", kind: "Button", classes: "toolbutton module-ok-button", ontap: "ok"}
		]},
		{name: "warningbox", kind: "Sugar.DialogSettingsWarningBox", showing: false, onCancel: "cancel", onRestart: "reinit"},
		{name: "content", kind: "Scroller", classes: "computer-content", components: [
			{name: "software", content: "xxx", classes: "computer-software"},
			{content: "Sugarizer:", classes: "computer-sugarizer"},
			{name: "sugarizer_value", classes: "computer-value", ontap: "version"},
			{classes: "computer-line"},
			{name: "clienttype", classes: "computer-clienttype"},
			{name: "clienttype_value", classes: "computer-value"},
			{classes: "computer-line"},
			{name: "browser", content: "xxx", classes: "computer-browser"},
			{name: "browser_value", classes: "computer-value"},
			{classes: "computer-line"},
			{name: "browserversion", content: "xxx", classes: "computer-browserversion"},
			{name: "browserversion_value", classes: "computer-value"},
			{classes: "computer-line"},
			{name: "useragent", content: "xxx", classes: "computer-useragent"},
			{name: "useragent_value", classes: "computer-value"},
			{name: "storage", content: "xxx", classes: "computer-storage"},
			{name: "storage_value", classes: "computer-value"},
			{classes: "computer-line"},
			{name: "reinitcheck", showing: false, kind: "Input", type: "checkbox", classes: "toggle computer-reinitcheck", onchange: "switchInit"},
			{name: "reinittext", showing: false, content: "xxx", classes: "computer-reinit"},
			{classes: "computer-line"},
			{name: "copyright", content: "xxx", classes: "computer-copyright"},
			{content: "© 2013-2019 Lionel Laské, Sugar Labs Inc and Contributors", classes: "computer-contributor"},
			{name: "license", content: "xxx", classes: "computer-licence"},
			{name: "licenseplus", content: "xxx", classes: "computer-licence"},
			{name: "warningmessage", showing: false, content: "xxx", classes: "computer-warningmessage", showing: false}
		]}
	],

	// Constructor
	create: function() {
		this.inherited(arguments);
		this.$.text.setContent(l10n.get("AboutMyComputer"));
		this.$.software.setContent(l10n.get("Software"));
		this.$.browser.setContent(l10n.get("Browser"));
		this.$.clienttype.setContent(l10n.get("ClientType"));
		this.$.browserversion.setContent(l10n.get("BrowserVersion"));
		this.$.useragent.setContent(l10n.get("UserAgent"));
		this.$.storage.setContent(l10n.get("Storage"));
		this.$.copyright.setContent(l10n.get("Copyright"));
		this.$.license.setContent(l10n.get("LicenseTerms"));
		this.$.licenseplus.setContent(l10n.get("LicenseTermsPlus"));
		this.$.warningmessage.setContent(l10n.get("AllDataWillBeLost"));
		this.$.reinittext.setContent(l10n.get("ReinitJournalAndSettings"));
		this.notify = humane.create({ timeout: 1000, baseCls: 'humane-libnotify' })
		this.clickLeft = 3;

		this.$.sugarizer_value.setContent(constant.sugarizerVersion);
		this.$.clienttype_value.setContent(util.getClientName());
		this.$.browser_value.setContent(util.getBrowserName());
		this.$.browserversion_value.setContent(util.getBrowserVersion());
		this.$.useragent_value.setContent(navigator.userAgent);
		var that = this;
		util.computeDatastoreSize(function(size) {
			that.$.storage_value.setContent(l10n.get("StorageSize", {used: size.bytes, formatted: size.formatted}));
		});

		if (l10n.language.direction == "rtl") {
			this.$.text.addClass("rtl-10");
			this.$.software.addClass("rtl-10");
			this.$.browser.addClass("rtl-10");
			this.$.clienttype.addClass("rtl-10");
			this.$.browserversion.addClass("rtl-10");
			this.$.useragent.addClass("rtl-10");
			this.$.storage.addClass("rtl-10");
			this.$.copyright.addClass("rtl-10");
			this.$.license.addClass("rtl-10");
		}
	},

	rendered: function() {
		this.inherited(arguments);
		this.$.cancelbutton.setNodeProperty("title", l10n.get("Cancel"));
		this.$.okbutton.setNodeProperty("title", l10n.get("Ok"));
		this.owner.centerDialog(this);
	},

	// Event handling
	cancel: function() {
		this.hide();
		this.owner.show();
	},

	ok: function() {
		if (this.$.reinitcheck.getNodeProperty("checked")) {
			this.$.warningbox.setShowing(true);
			this.$.okbutton.setDisabled(true);
			this.$.cancelbutton.setDisabled(true);
		} else {
			this.hide();
			this.owner.show();
		}
	},

	reinit: function() {
		util.cleanDatastore(true, function() {
			util.restartApp();
		});
	},

	switchInit: function() {
		this.$.warningmessage.setShowing(this.$.reinitcheck.getNodeProperty("checked"));
	},

	version: function() {
		this.clickLeft--;
		if (this.clickLeft == 0) {
			this.$.reinittext.setShowing(true);
			this.$.reinitcheck.setShowing(true);
		} else if (this.clickLeft > 0) {
			this.notify.log(l10n.get("ClickMore"));
		}
	}
});



// Server dialog
enyo.kind({
	name: "Sugar.DialogServer",
	kind: "enyo.Popup",
	classes: "module-dialog",
	centered: false,
	modal: true,
	floating: true,
	autoDismiss: false,
	components: [
		{name: "toolbar", classes: "toolbar", components: [
			{name: "icon", kind: "Sugar.Icon", x: 6, y: 6, classes: "module-icon", size: constant.sizeToolbar, icon: {directory: "icons", icon: "cloud-settings.svg"}},
			{name: "text", content: "xxx", classes: "module-text"},
			{name: "cancelbutton", kind: "Button", classes: "toolbutton module-cancel-button", ontap: "cancel"},
			{name: "okbutton", kind: "Button", classes: "toolbutton module-ok-button", ontap: "ok"}
		]},
		{name: "warningbox", kind: "Sugar.DialogSettingsWarningBox", showing: false, onCancel: "cancel", onRestart: "restart"},
		{name: "content", components: [
			{name: "connected", kind: "Input", type: "checkbox", classes: "toggle aboutserver-checkbox", onchange: "switchConnection"},
			{name: "textconnected", content: "xxx", classes: "aboutserver-message"},
			{components:[
				{name: "textservername", content: "xxx", classes: "aboutserver-serverlabel"},
				{name: "servername", kind: "Input", classes: "aboutserver-servername", onkeydown: "enterclick"},
				{name: "qrbutton", kind: "Sugar.Icon", size: constant.sizeEmpty, icon: {directory: "icons", icon: "qrcode.svg"}, ontap: "scanQR", classes: "aboutserver-qr", showing: false}
			]},
			{name: "serversettingsname", classes: "aboutserver-settingsname"},
			{name: "serversettingsvalue", classes: "aboutserver-settingsvalue"},
			{name: "serverdescription", classes: "aboutserver-description"},
			{name: "serverdescriptionvalue", classes: "aboutserver-descriptionvalue"},
			{components:[
				{name: "textusername", content: "xxx", classes: "aboutserver-userlabel"},
				{name: "username", kind: "Input", classes: "aboutserver-username", oninput: "changed"}
			]},
			{name: "passwordmessage", classes: "aboutserver-passwordmessage"},
			{name: "password", kind: "Sugar.Password", classes: "aboutserver-password", onEnter: "next"},
			{name: "next", kind: "Sugar.IconButton", icon: {directory: "icons", icon: "go-right.svg"}, classes: "aboutserver-rightbutton", ontap: "next"},
			{name: "spinner", kind: "Image", src: "images/spinner-light.gif", classes: "aboutserver-spinner", showing: false},
			{name: "warningmessage", content: "xxx", classes: "aboutserver-warningmessage", showing: false}
		]}
	],

	// Constructor
	create: function() {
		this.inherited(arguments);
		this.$.text.setContent(l10n.get("Server"));
		this.$.textconnected.setContent(l10n.get("ConnectedToServer"));
		this.$.textservername.setContent(l10n.get("ServerUrl"));
		this.$.serversettingsname.setContent(l10n.get("ServerName"));
		this.$.serverdescription.setContent(l10n.get("ServerDescription"));
		this.$.textusername.setContent(l10n.get("UserId"));
		this.$.next.setText(l10n.get("Next"));
		this.currentserver = preferences.getServer();
		this.initconnected = preferences.isConnected();
		this.initservername = (this.currentserver && this.currentserver.url) ? this.currentserver.url : util.getCurrentServerUrl();
		this.initusername = preferences.getName();
		this.networkId = null;
		this.forbidcheck = false;
		if (l10n.language.direction == "rtl") {
			this.$.text.addClass("rtl-10");
			this.$.textconnected.addClass("rtl-10");
			this.$.warningmessage.addClass("rtl-10");
			this.$.textservername.addClass("rtl-10");
			this.$.textusername.addClass("rtl-10");
			this.$.textusermessage.addClass("rtl-10");
			this.$.next.addClass("rtl-10");
		}

		this.step = 0;
		if (util.getClientType() == constant.webAppType) {
			this.step = 3;
		} else {
			if (!this.initconnected) {
				this.step = 0;
			} else {
				var token = preferences.getToken();
				if (token && token.expired) {
					this.step = 2;
				} else {
					this.step = 3;
				}
			}
		}
		this.displayStep();
	},

	rendered: function() {
		this.inherited(arguments);
		this.$.cancelbutton.setNodeProperty("title", l10n.get("Cancel"));
		this.$.okbutton.setNodeProperty("title", l10n.get("Ok"));
		this.$.connected.setNodeProperty("checked", this.initconnected);
		if (util.getClientType() == constant.webAppType) {
			this.$.servername.setDisabled(true);
			this.$.username.setDisabled(true);
		}
		this.centerDialog(this);
	},

	centerDialog: function(dialog) {
		var margin = util.computeMargin({width: 800, height: 500}, {width: 0.95, height: 0.95});
		dialog.applyStyle("margin-left", margin.left+"px");
		dialog.applyStyle("margin-top", (margin.top-55)+"px");
		return margin;
	},

	displayStep: function() {
		var
			vtextservername = false,
			vserversettingsname = false,
			vserverdescription = false,
			vtextservername = false,
			vservername = false,
			vserversettingsvalue = false,
			vserverdescriptionvalue = false,
			vserverqr = false,
			vtextusername = false,
			vusername = false,
			vnext = false,
			vpasswordmessage = false,
			vpassword = false;
		if (this.step == 0) {
			this.$.passwordmessage.setContent(l10n.get("PleaseConnectMessage"));
			vpasswordmessage = true;
		} else if (this.step == 1) {
			this.$.servername.setValue(constant.defaultServer);
			vtextservername = vservername = vnext = true;
			vserverqr = (enyo.platform.ios || enyo.platform.android || enyo.platform.androidChrome);
		} else if (this.step == 2) {
			vpasswordmessage = vpassword = vnext = true;
			if (preferences.getToken() && preferences.getToken().expired) {
				this.$.passwordmessage.setContent(l10n.get("SecurityMessageExpired", {min: util.getMinPasswordSize()}));
			} else {
				this.$.passwordmessage.setContent(l10n.get("SecurityMessageNew", {min: util.getMinPasswordSize()}));
			}
		} else if (this.step == 3) {
			this.$.servername.setValue(this.initservername);
			this.$.username.setValue(this.initusername);
			this.$.serversettingsvalue.setContent(this.currentserver.name);
			this.$.serverdescriptionvalue.setContent(this.currentserver.description);
			this.$.servername.setDisabled(true);
			vtextservername = vserversettingsname = vserverdescription = vtextservername = vservername = vserversettingsvalue = vserverdescriptionvalue = vtextusername = vusername = true;
		}
		this.$.textservername.setShowing(vtextservername);
		this.$.serversettingsname.setShowing(vserversettingsname);
		this.$.serverdescription.setShowing(vserverdescription);
		this.$.textservername.setShowing(vtextservername);
		this.$.servername.setShowing(vservername);
		this.$.qrbutton.setShowing(vserverqr);
		this.$.serversettingsvalue.setShowing(vserversettingsvalue);
		this.$.serverdescriptionvalue.setShowing(vserverdescriptionvalue);
		this.$.textusername.setShowing(vtextusername);
		this.$.username.setShowing(vusername);
		this.$.next.setShowing(vnext);
		this.$.passwordmessage.setShowing(vpasswordmessage);
		this.$.password.setShowing(vpassword);
		if (vpassword) {
			this.$.password.giveFocus();
		}
	},

	// Event handling
	cancel: function() {
		if (!this.initconnected && this.hasChanged()) {
			preferences.setServer(null);
		}
		this.hide();
		this.owner.show();
	},

	ok: function() {
		if (!this.hasChanged() || (this.$.connected.getNodeProperty("checked") && this.step != 3)) {
			this.hide();
			this.owner.show();
			return;
		}
		this.$.warningbox.setShowing(true);
		this.$.okbutton.setDisabled(true);
		this.$.cancelbutton.setDisabled(true);
	},

	switchConnection: function() {
		if (this.forbidcheck) {
			this.$.connected.setNodeProperty("checked", !this.$.connected.getNodeProperty());
			return;
		}
		this.forbidcheck = true;
		if (util.getClientType() == constant.webAppType) {
			this.$.connected.setNodeProperty("checked", true);
			return;
		}
		if (this.step == 0) {
			this.step++;
			this.displayStep();
		}
	},

	next: function() {
		if (this.step == 1) {
			// Retrieve server information
			var that = this;
			that.$.spinner.setShowing(true);
			myserver.getServerInformation(this.$.servername.getValue(), function(inSender, inResponse) {
				that.currentserver = inResponse;
				that.currentserver.url = that.$.servername.getValue();
				if (that.currentserver.secure) {
					that.currentserver.url = that.currentserver.url.replace(constant.http, constant.https);
				} else {
					that.currentserver.url = that.currentserver.url.replace(constant.https, constant.http);
				}
				preferences.setServer(that.currentserver);
				that.initservername = that.$.servername.getValue();
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
			// Validate password size
			var pass = this.$.password.getPassword();
			if (pass.length == 0 || pass.length < util.getMinPasswordSize()) {
				return;
			}

			// Try first to create a new user
			var that = this;
			that.$.spinner.setShowing(true);
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
					that.login();
				},
				function(response, error) {
					// User already exist, try to login instead
					if (error == 22) {
						that.login();
					} else {
						that.$.warningmessage.setContent(l10n.get("ServerError", {code: error}));
						that.$.warningmessage.setShowing(true);
						that.$.spinner.setShowing(false);
					}
				}
			);
		}
	},

	login: function() {
		var that = this;
		var user = {
			name: preferences.getName(),
			password: that.$.password.getPassword()
		};
		myserver.loginUser(user, function(loginSender, loginResponse) {
				that.step++;
				that.displayStep();
				that.networkId = loginResponse.user._id;
				preferences.setToken({'x_key': that.networkId, 'access_token': loginResponse.token});
				preferences.setPrivateJournal(loginResponse.user.private_journal);
				preferences.setSharedJournal(loginResponse.user.shared_journal);
				that.$.warningmessage.setContent(l10n.get("ChangesRequireRestart"));
				that.$.warningmessage.setShowing(true);
				that.$.spinner.setShowing(false);
				that.$.warningbox.setShowing(true);
				that.$.okbutton.setDisabled(true);
				that.$.cancelbutton.setDisabled(true);
			},
			function(response, error) {
				// Login error, retry
				if (error == 1) {
					that.$.warningmessage.setContent(l10n.get("UserLoginInvalid"));
				} else {
					that.$.warningmessage.setContent(l10n.get("ServerError", {code: error}));
				}
				that.$.warningmessage.setShowing(true);
				that.$.spinner.setShowing(false);
			}
		);
	},

	restart: function() {
		// Now ConnectedToServer
		var nowconnected = this.$.connected.getNodeProperty("checked");
		preferences.setConnected(nowconnected);
		if (nowconnected) {
			preferences.setNetworkId(this.networkId);
		} else {
			preferences.setNetworkId(null);
			preferences.setServer(null);
			preferences.setToken(null);
		}
		preferences.save();
		util.restartApp();
	},

	// Handle QR Code scanner
	scanQR: function() {
		var that = this;
		var toolbar = document.getElementById("toolbar");
		this.hide();
		toolbar.style.visibility = 'hidden';
		util.scanQRCode(function(code) {
			toolbar.style.visibility = 'visible';
			that.show();
			that.$.servername.setValue(code);
		}, function() {
			toolbar.style.visibility = 'visible';
			that.show();
			that.$.servername.focus();
			that.$.servername.hasNode().select()
		});
	},

	// Utility
	hasChanged: function() {
		var currentconnected = this.$.connected.getNodeProperty("checked");
		return (this.initconnected != currentconnected);
	},

	enterclick: function(inSender, inEvent) {
		if (inEvent.keyCode === 13) {
			this.next();
			return true;
		}
	}
});



// Privacy dialog
enyo.kind({
	name: "Sugar.DialogPrivacy",
	kind: "enyo.Popup",
	classes: "module-dialog",
	centered: false,
	modal: true,
	floating: true,
	autoDismiss: false,
	components: [
		{name: "toolbar", classes: "toolbar", components: [
			{name: "icon", kind: "Sugar.Icon", x: 6, y: 6, classes: "module-icon", size: constant.sizeToolbar, icon: {directory: "icons", icon: "privacy.svg"}},
			{name: "text", content: "xxx", classes: "module-text"},
			{name: "cancelbutton", kind: "Button", classes: "toolbutton module-cancel-button", ontap: "cancel"},
			{name: "okbutton", kind: "Button", classes: "toolbutton module-ok-button", ontap: "ok"}
		]},
		{name: "warningbox", kind: "Sugar.DialogSettingsWarningBox", showing: false, onCancel: "cancel", onRestart: "restart"},
		{name: "content", components: [
			{name: "stats", kind: "Input", type: "checkbox", classes: "toggle privacy-statscheckbox"},
			{name: "textstats", content: "xxx", classes: "privacy-statsmessage"},
			{content: ""},
			{name: "sync", kind: "Input", type: "checkbox", classes: "toggle privacy-synccheckbox"},
			{name: "textsync", content: "xxx", classes: "privacy-syncmessage"},
		]}
	],

	// Constructor
	create: function() {
		this.inherited(arguments);
		this.$.text.setContent(l10n.get("MyPrivacy"));
		this.$.textstats.setContent(l10n.get("PrivacyStats"));
		this.$.textsync.setContent(l10n.get("PrivacySync"));
		this.initstats = preferences.getOptions("stats");
		this.initsync = preferences.getOptions("sync");
		if (l10n.language.direction == "rtl") {
			this.$.text.addClass("rtl-10");
			this.$.textstats.addClass("rtl-10");
			this.$.textsync.addClass("rtl-10");
		}
	},

	rendered: function() {
		this.inherited(arguments);
		this.$.cancelbutton.setNodeProperty("title", l10n.get("Cancel"));
		this.$.okbutton.setNodeProperty("title", l10n.get("Ok"));
		this.$.stats.setNodeProperty("checked", !this.initstats);
		this.$.sync.setNodeProperty("checked", !this.initsync);
		this.owner.centerDialog(this);
	},

	// Event handling
	cancel: function() {
		this.hide();
		this.owner.show();
	},

	ok: function() {
		if (!this.hasChanged()) {
			this.hide();
			this.owner.show();
			return;
		}
		this.$.warningbox.setShowing(true);
		this.$.okbutton.setDisabled(true);
		this.$.cancelbutton.setDisabled(true);
	},

	restart: function() {
		if (this.hasChanged()) {
			preferences.setOptions("stats", !this.$.stats.getNodeProperty("checked"));
			preferences.setOptions("sync", !this.$.sync.getNodeProperty("checked"));
			preferences.save();
			preferences.saveToServer(myserver, null, null);
		}
		util.restartApp();
	},

	// Utility
	hasChanged: function() {
		var currentstats = !this.$.stats.getNodeProperty("checked");
		var currentsync = !this.$.sync.getNodeProperty("checked");
		return (this.initstats != currentstats || this.initsync != currentsync);
	}
});


//-------------------------- Settings utility classes

// Class for an item in the settings dialog
enyo.kind({
	name: "Sugar.DialogSettingsItem",
	kind: enyo.Control,
	classes: "settings-item",
	published: {
		icon: null,
		text: null,
		colorized: false,
		disabled: false
	},
	components: [
		{components: [
			{name: "icon", kind: "Sugar.Icon", x: 6, y: 6, classes: "settings-item-icon", size: constant.sizeSettings, disabledBackground: "#000000"},
			{name: "text", content: "xxx", classes: "settings-item-text"}
		]}
	],

	// Constructor
	create: function() {
		this.inherited(arguments);
		this.colorizedChanged();
		this.iconChanged();
		this.textChanged();
		this.disabledChanged();
	},

	// Property changed
	iconChanged: function() {
		this.$.icon.setIcon(this.icon);
	},

	textChanged: function() {
		this.$.text.setContent(this.text);
	},

	colorizedChanged: function() {
		this.$.icon.setColorized(this.colorized);
	},

	disabledChanged: function() {
		this.$.icon.setDisabled(this.disabled);
		this.addRemoveClass('settings-item-text-disable', this.disabled);
		this.addRemoveClass('settings-item-text-enable', !this.disabled);
	}
});



// Class for a Warning box in settings
enyo.kind({
	name: "Sugar.DialogSettingsWarningBox",
	kind: enyo.Control,
	classes: "settings-warningbox",
	events: { onRestart: "", onCancel: "" },
	components: [
		{name: "warningtitle", content: "xxx", classes: "warningbox-title"},
		{name: "warningmessage", content: "xxx", classes: "warningbox-message"},
		{name: "warningcancel", kind: "Sugar.IconButton", icon: {directory: "icons", icon: "dialog-cancel.svg"}, classes: "warningbox-cancel-button", ontap: "cancel"},
		{name: "warningrestart", kind: "Sugar.IconButton", icon: {directory: "icons", icon: "system-restart.svg"}, classes: "warningbox-refresh-button", ontap: "restart"}
	],

	// Constructor
	create: function() {
		this.inherited(arguments);
		this.$.warningtitle.setContent(l10n.get("Warning"));
		this.$.warningmessage.setContent(l10n.get("ChangesRequireRestart"));
		this.$.warningcancel.setText(l10n.get("CancelChanges"));
		this.$.warningrestart.setText(l10n.get("RestartNow"));
		if (l10n.language.direction == "rtl") {
			this.$.warningtitle.addClass("rtl-10");
			this.$.warningmessage.addClass("rtl-10");
		}
	},

	// Events
	cancel: function() {
		this.doCancel();
	},

	restart: function() {
		this.doRestart();
	}
});


//Dialog to change launcher on a native device
enyo.kind({
	name: "Sugar.DialogChangeLauncher",
	kind: "enyo.Popup",
	classes: "module-dialog",
	centered: false,
	modal: true,
	floating: true,
	autoDismiss: false,
	components: [
		{name: "toolbar", classes: "toolbar", components: [
			{name: "icon", kind: "Sugar.Icon", x: 6, y: 6, classes: "module-icon", colorized: true, size: constant.sizeToolbar, icon: {directory: "icons", icon: "owner-icon.svg"}},
			{name: "text", content: "xxx", classes: "module-text"},
			{name: "cancelbutton", kind: "Button", classes: "toolbutton module-cancel-button", ontap: "cancel"},
			{name: "okbutton", kind: "Button", classes: "toolbutton module-ok-button", ontap: "ok"}
		]},
		{name: "warningbox", kind: "Sugar.DialogSettingsWarningBox", showing: false, onCancel: "cancel", onRestart: "restart"},
		{name: "content", components: [
			{classes: "enterkey", components: [
				{name: "keyInput", kind: "Input", classes: "enterkey-input", oninput:"keychanged"}
			]},
			{name: "connectButton", kind: "Button", classes: "toolbutton", ontap: "ok"}
		]}
	],

	// Constructor
	create: function() {
		this.inherited(arguments);
		this.$.text.setContent(l10n.get("EnterKey"));
		if (l10n.language.direction == "rtl") {
			this.$.text.addClass("rtl-10");
		}
	},

	rendered: function() {
		this.inherited(arguments);
		this.$.icon.render();
		this.$.cancelbutton.setNodeProperty("title", l10n.get("Cancel"));
		this.$.okbutton.setNodeProperty("title", l10n.get("Ok"));
		this.$.connectButton.setContent(l10n.get("Ok"));
	},

	// Event handling
	cancel: function() {
		this.hide();
	},

	ok: function() {
		sugarizerOS.sharedKeyBuffer = this.$.keyInput.getValue();
		this.hide();
		this.$.okbutton.setDisabled(true);
		this.$.cancelbutton.setDisabled(true);
	},

	keychanged: function() {
	},

	connect: function() {
	},

	centerDialog: function(dialog) {
		var margin = util.computeMargin({width: 800, height: 500}, {width: 0.95, height: 0.95});
		dialog.applyStyle("margin-left", margin.left+"px");
		dialog.applyStyle("margin-top", (margin.top-55)+"px");
	}
});


// Waring message dialog
enyo.kind({
	name: "Sugar.DialogWarningMessage",
	kind: "enyo.Popup",
	classes: "warning-dialog",
	centered: false,
	modal: true,
	floating: true,
	autoDismiss: true,
	components: [
		{name: "icon", kind: "Sugar.Icon", x: 6, y: 6, classes: "warningdialog-icon", size: constant.sizeToolbar, icon: {directory: "icons", icon: "emblem-warning.svg"}},
		{name: "warningtitle", content: "xxx", classes: "warningdialog-title"},
		{name: "warningmessage", content: "xxx", classes: "warningdialog-message"},
		{name: "warningcancel", kind: "Sugar.IconButton", icon: {directory: "icons", icon: "dialog-cancel.svg"}, classes: "warningdialog-cancel-button", ontap: "cancel"},
		{name: "warningrestart", kind: "Sugar.IconButton", icon: {directory: "icons", icon: "system-shutdown.svg"}, classes: "warningdialog-ok-button", ontap: "ok"},
	],

	// Constructor
	create: function() {
		this.inherited(arguments);
		this.$.warningtitle.setContent(l10n.get("Warning"));
		this.$.warningmessage.setContent(l10n.get("AllDataWillBeLost"));
		this.$.warningcancel.setText(l10n.get("CancelChanges"));
		this.$.warningrestart.setText(l10n.get("Logoff"));
	},
	rendered: function() {
		this.inherited(arguments);
		var margin = util.computeMargin({width: 800, height: 150}, {width: 0.95, height: 0.95});
		this.applyStyle("margin-left", margin.left+"px");
		this.applyStyle("margin-top", (margin.top-55)+"px");
	},

	// Event handling
	cancel: function() {
		this.hide();
	},

	ok: function() {
		this.hide();
		preferences.addUserInHistory();
		util.cleanDatastore(null, function() {
			util.restartApp();
		});
	}
});




// Class for a generic Warning box
enyo.kind({
	name: "Sugar.GenericDialogBox",
	kind: enyo.Control,
	classes: "genericbox",
	events: { onOk: "", onCancel: "", onShow: "", onHide: "" },
	published: {
		title: null,
		message: null,
		okText: '',
		cancelText: ''
	},
	components: [
		{name: "warningtitle", content: "xxx", classes: "genericbox-title"},
		{name: "warningmessage", content: "xxx", classes: "genericbox-message"},
		{name: "warningcancel", kind: "Sugar.IconButton", icon: {directory: "icons", icon: "dialog-cancel.svg"}, classes: "genericbox-cancel-button", ontap: "cancel"},
		{name: "warningok", kind: "Sugar.IconButton", icon: {directory: "icons", icon: "dialog-ok.svg"}, classes: "genericbox-ok-button", ontap: "ok"}
	],

	// Constructor
	create: function() {
		this.inherited(arguments);
		this.titleChanged();
		this.messageChanged();
		this.okTextChanged();
		this.cancelTextChanged();
		if (l10n.language.direction == "rtl") {
			this.$.warningtitle.addClass("rtl-10");
			this.$.warningmessage.addClass("rtl-10");
		}
	},

	titleChanged: function() {
		this.$.warningtitle.setContent(this.title);
	},

	messageChanged: function() {
		this.$.warningmessage.setContent(this.message);
	},

	cancelTextChanged: function() {
		this.$.warningcancel.setText(this.cancelText);
	},

	okTextChanged: function() {
		this.$.warningok.setText(this.okText);
	},

	showingChanged: function() {
		this.inherited(arguments);
		if (this.showing) {
			this.doShow();
		} else {
			this.doHide();
		}
	},

	// Events
	cancel: function() {
		this.doCancel();
	},

	ok: function() {
		this.doOk();
	}
});
