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
		this.$.language.setText(l10n.get("Language"));
		this.$.aboutserver.setText(l10n.get("Server"));
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
			this.$.language.addClass("rtl-10");
			this.$.aboutserver.addClass("rtl-10");
		}
		this.subdialog = null;
	},

	rendered: function() {
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
			this.hide();
			this.subdialog = this.$.subdialog.createComponent({kind: "Sugar.DialogAboutme"}, {owner:this});
			this.subdialog.show();
		}
	},

	computerClicked: function() {
		if (!this.$.computer.getDisabled()) {
			this.hide();
			this.subdialog = this.$.subdialog.createComponent({kind: "Sugar.DialogComputer"}, {owner:this});
			this.subdialog.show();
		}
	},

	languageClicked: function() {
		if (!this.$.language.getDisabled()) {
			this.hide();
			this.subdialog = this.$.subdialog.createComponent({kind: "Sugar.DialogLanguage"}, {owner:this});
			this.subdialog.show();
		}
	},

	serverClicked: function() {
		if (!this.$.aboutserver.getDisabled()) {
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
		this.currentname = this.$.name.getValue();
	},

	restart: function() {
		preferences.setName(this.currentname);
		preferences.setColor(util.getColorIndex(this.currentcolor));
		preferences.save();
		preferences.saveToServer(myserver, function() {
			util.restartApp();
		});
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
			{code: "en", icon: null, name: l10n.get("English")},
			{code: "es", icon: null, name: l10n.get("Spanish")},
			{code: "fr", icon: null, name: l10n.get("French")},
			{code: "de", icon: null, name: l10n.get("German")},
			{code: "pt", icon: null, name: l10n.get("Portuguese")},
			{code: "ar", icon: null, name: l10n.get("Arabic")},
			{code: "ja", icon: null, name: l10n.get("Japanese")},
			{code: "pl", icon: null, name: l10n.get("Polish")},
			{code: "ibo", icon: null, name: l10n.get("Igbo")},
			{code: "yor", icon: null, name: l10n.get("Yoruba")}
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
		preferences.setLanguage(this.currentlanguage);
		preferences.save();
		preferences.saveToServer(myserver, function() {
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
			{name: "reinitcheck", showing: false, kind: "Input", type: "checkbox", classes: "toggle computer-reinitcheck", onchange: "switchInit"},
			{name: "reinittext", showing: false, content: "xxx", classes: "computer-reinit"},
			{classes: "computer-line"},
			{name: "copyright", content: "xxx", classes: "computer-copyright"},
			{content: "© 2013-2017 Lionel Laské, Sugar Labs Inc and Contributors", classes: "computer-contributor"},
			{name: "license", content: "xxx", classes: "computer-licence"},
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
		this.$.copyright.setContent(l10n.get("Copyright"));
		this.$.license.setContent(l10n.get("LicenseTerms"));
		this.$.warningmessage.setContent(l10n.get("AllDataWillBeLost"));
		this.$.reinittext.setContent(l10n.get("ReinitJournalAndSettings"));
		this.notify = humane.create({ timeout: 1000, baseCls: 'humane-libnotify' })
		this.clickLeft = 3;

		this.$.sugarizer_value.setContent(constant.sugarizerVersion);
		this.$.clienttype_value.setContent(util.getClientName());
		this.$.browser_value.setContent(util.getBrowserName());
		this.$.browserversion_value.setContent(util.getBrowserVersion());
		this.$.useragent_value.setContent(navigator.userAgent);

		if (l10n.language.direction == "rtl") {
			this.$.text.addClass("rtl-10");
			this.$.software.addClass("rtl-10");
			this.$.browser.addClass("rtl-10");
			this.$.clienttype.addClass("rtl-10");
			this.$.browserversion.addClass("rtl-10");
			this.$.useragent.addClass("rtl-10");
			this.$.copyright.addClass("rtl-10");
			this.$.license.addClass("rtl-10");
		}
	},

	rendered: function() {
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
		// Remove all object
		var results = datastore.find();
		for(var i = 0 ; i < results.length ; i++) {
			datastore.remove(results[i].objectId);
		}
		preferences.reset();

		// Restart
		util.restartApp();
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
				{content: "http://", classes: "aboutserver-httplabel"},
				{name: "servername", kind: "Input", classes: "aboutserver-servername", oninput: "changed"},
				{name: "serverok", kind: "Sugar.Icon", size: 20, x: 6, y: 17, icon: {directory: "icons", icon: "entry-ok.svg"}, classes: "aboutserver-iconchecked", showing: false}
			]},
			{components:[
				{name: "textusername", content: "xxx", classes: "aboutserver-userlabel"},
				{name: "username", kind: "Input", classes: "aboutserver-username", oninput: "changed"},
				{name: "userok", kind: "Sugar.Icon", size: 20, x: 6, y: 17, icon: {directory: "icons", icon: "entry-cancel.svg"}, classes: "aboutserver-iconchecked", showing: false},
				{name: "textusermessage", content: "xxx", classes: "aboutserver-usermessage"}
			]},
			{name: "checkbutton", kind: "Sugar.IconButton", icon: {directory: "icons", icon: "dialog-ok.svg"}, classes: "aboutserver-checkbutton", ontap: "check"},
			{name: "warningmessage", content: "xxx", classes: "aboutserver-warningmessage", showing: false}
		]}
	],

	// Constructor
	create: function() {
		this.inherited(arguments);
		this.$.text.setContent(l10n.get("Server"));
		this.$.textconnected.setContent(l10n.get("ConnectedToServer"));
		this.$.warningmessage.setContent(l10n.get("ChangesRequireRestart"));
		this.$.textservername.setContent(l10n.get("ServerName"));
		this.$.textusername.setContent(l10n.get("UserId"));
		this.$.textusermessage.setContent(l10n.get("LeaveUserBlank"));
		this.$.checkbutton.setText(l10n.get("CheckInfo"));
		this.initconnected = preferences.isConnected();
		if (util.getClientType() == constant.webAppType) {
			this.initservername = util.getCurrentServerUrl();
			this.$.servername.setDisabled(true);
		} else {
			this.initservername = preferences.getServer();
		}
		this.$.servername.setValue(this.initservername);
		this.initusername = preferences.getNetworkId();
		this.$.username.setValue(this.initusername);
		if (l10n.language.direction == "rtl") {
			this.$.text.addClass("rtl-10");
			this.$.textconnected.addClass("rtl-10");
			this.$.warningmessage.addClass("rtl-10");
			this.$.textservername.addClass("rtl-10");
			this.$.textusername.addClass("rtl-10");
			this.$.textusermessage.addClass("rtl-10");
			this.$.checkbutton.addClass("rtl-10");
		}
	},

	rendered: function() {
		this.$.cancelbutton.setNodeProperty("title", l10n.get("Cancel"));
		this.$.okbutton.setNodeProperty("title", l10n.get("Ok"));
		this.$.connected.setNodeProperty("checked", this.initconnected);
		var disabled = !this.$.connected.getNodeProperty("checked");
		if (util.getClientType() != constant.webAppType) {
			this.$.servername.setDisabled(disabled);
		}
		this.$.username.setDisabled(disabled);
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

	switchConnection: function() {
		if (util.getClientType() == constant.webAppType) {
			this.$.connected.setNodeProperty("checked", true);
		}
		var disabled = !this.$.connected.getNodeProperty("checked");
		if (util.getClientType() != constant.webAppType) {
			this.$.servername.setDisabled(disabled);
			if (this.$.connected.getNodeProperty("checked") && this.$.servername.getValue() == null)
				this.$.servername.setValue(constant.defaultServer);
		}
		this.$.username.setDisabled(disabled);
		this.$.warningmessage.setShowing(this.hasChanged());
	},

	changed: function() {
		this.$.warningmessage.setShowing(this.hasChanged());
	},

	check: function() {
		if (!this.$.connected.getNodeProperty("checked")) {
			return;
		}
		var that = this;
		var setOk = function(server, user) {
			that.$.serverok.setIcon({directory: "icons", icon: (server ? "entry-ok.svg":"entry-cancel.svg")});
			that.$.userok.setIcon({directory: "icons", icon: (user ? "entry-ok.svg":"entry-cancel.svg")});
			that.$.serverok.setShowing(true);
			that.$.userok.setShowing(true);
		}
		var uid = this.$.username.getValue();
		myserver.getUser(uid,
			function(inSender, inResponse) {
				setOk(true, (inResponse || !uid));
			},
			function() {
				setOk(false, false);
			},
			"http://"+this.$.servername.getValue()
		);
	},

	restart: function() {
		// Get values
		var currentconnected = this.$.connected.getNodeProperty("checked");
		var currentservername = this.$.servername.getValue();
		var currentusername = this.$.username.getValue();

		// Save new settings
		if ((this.initconnected && !currentconnected) || currentusername == "") {
			preferences.init();
		}
		preferences.setConnected(currentconnected);
		preferences.setServer(currentservername);
		preferences.setNetworkId(currentusername == "" ? null : currentusername);
		preferences.save();
		util.restartApp();
	},

	// Utility
	hasChanged: function() {
		var currentconnected = this.$.connected.getNodeProperty("checked");
		var currentservername = this.$.servername.getValue();
		var currentusername = this.$.username.getValue();
		return (this.initconnected != currentconnected || this.initusername != currentusername || this.initservername != currentservername);
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
