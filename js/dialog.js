// Settings dialog
enyo.kind({
	name: "Sugar.Dialog.Settings",
	kind: "enyo.Popup",
	classes: "settings-dialog",
	centered: true,
	modal: true,
	floating: true,
	components: [
		{name: "toolbar", classes: "toolbar", components: [
			{name: "settingssearch", kind: "Sugar.SearchField", onTextChanged: "filterSettings", classes: "settings-filter-text"},
			{name: "donebutton", kind: "Button", classes: "toolbutton settings-close-button", title:"List", ontap: "closeSettings", onclick: "clickToTap"}			
		]},
		{name: "content", components: [
			{name: "me", kind: "Sugar.Dialog.Settings.Item", onclick: "clickToTap", ontap: "meClicked", text: "Me", icon: {directory: "icons", icon: "module-about_me.svg"}, colorized: true},
			{name: "computer", kind: "Sugar.Dialog.Settings.Item", onclick: "clickToTap", ontap: "computerClicked", text: "Computer", icon: {directory: "icons", icon: "module-about_my_computer.svg"}},
			{name: "aboutserver", kind: "Sugar.Dialog.Settings.Item", onclick: "clickToTap", ontap: "serverClicked", text: "Server", icon: {directory: "icons", icon: "cloud-settings.svg"}},
			{name: "language", kind: "Sugar.Dialog.Settings.Item", onclick: "clickToTap", ontap: "languageClicked", text: "Language", icon: {directory: "icons", icon: "module-language.svg"}}
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
		this.subdialog = null;
	},
	
	rendered: function() {
		app.noresize = true; // HACK: Forbid resize to avoid issue on the modal
		this.$.me.render();
		this.$.donebutton.setNodeProperty("title", l10n.get("Done"));		
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
			this.subdialog = this.$.subdialog.createComponent({kind: "Sugar.Dialog.Aboutme"}, {owner:this});
			this.subdialog.show();
		}
	},
	
	computerClicked: function() {
		if (!this.$.computer.getDisabled()) {
			this.hide();
			this.subdialog = this.$.subdialog.createComponent({kind: "Sugar.Dialog.Computer"}, {owner:this});
			this.subdialog.show();
		}
	},
	
	languageClicked: function() {
		if (!this.$.language.getDisabled()) {
			this.hide();
			this.subdialog = this.$.subdialog.createComponent({kind: "Sugar.Dialog.Language"}, {owner:this});
			this.subdialog.show();
		}
	},
	
	serverClicked: function() {
		if (!this.$.aboutserver.getDisabled()) {
			this.hide();
			this.subdialog = this.$.subdialog.createComponent({kind: "Sugar.Dialog.Server"}, {owner:this});
			this.subdialog.show();
		}	
	},
	
	clickToTap: function(inSender, inEvent) {
		util.clickToTap(this, inSender, inEvent);
	}	
});	



// About me dialog
enyo.kind({
	name: "Sugar.Dialog.Aboutme",
	kind: "enyo.Popup",
	classes: "module-dialog",
	centered: true,
	modal: true,
	floating: true,
	autoDismiss: false,
	components: [
		{name: "toolbar", classes: "toolbar", components: [
			{name: "icon", kind: "Sugar.Icon", x: 6, y: 6, classes: "module-icon", colorized: true, size: constant.sizeToolbar, icon: {directory: "icons", icon: "owner-icon.svg"}},
			{name: "text", content: "xxx", classes: "module-text"},
			{name: "cancelbutton", kind: "Button", classes: "toolbutton module-cancel-button", onclick: "clickToTap", ontap: "cancel"},		
			{name: "okbutton", kind: "Button", classes: "toolbutton module-ok-button", onclick: "clickToTap", ontap: "ok"}
		]},
		{name: "warningbox", kind: "Sugar.Dialog.Settings.WarningBox", showing: false, onCancel: "cancel", onRestart: "restart"},
		{name: "content", components: [
			{name: "message", content: "xxx", classes: "aboutme-message"},
			{name: "psicon", kind: "Sugar.Icon", x: 6, y: 6, classes: "aboutme-psicon", size: constant.sizeOwner, icon: {directory: "icons", icon: "owner-icon.svg"}, onclick:"clickToTap", ontap:"setcolor"},
			{name: "nsicon", kind: "Sugar.Icon", x: 6, y: 6, classes: "aboutme-nsicon", size: constant.sizeOwner, icon: {directory: "icons", icon: "owner-icon.svg"}, onclick:"clickToTap", ontap:"setcolor"},
			{name: "cicon", kind: "Sugar.Icon", x: 6, y: 6, classes: "aboutme-cicon", size: constant.sizeOwner, icon: {directory: "icons", icon: "owner-icon.svg"}, onclick:"clickToTap", ontap:"setcolor"},
			{name: "pficon", kind: "Sugar.Icon", x: 6, y: 6, classes: "aboutme-pficon", size: constant.sizeOwner, icon: {directory: "icons", icon: "owner-icon.svg"}, onclick:"clickToTap", ontap:"setcolor"},
			{name: "nficon", kind: "Sugar.Icon", x: 6, y: 6, classes: "aboutme-nficon", size: constant.sizeOwner, icon: {directory: "icons", icon: "owner-icon.svg"}, onclick:"clickToTap", ontap:"setcolor"},
			{name: "restartmessage", content: "xxx", classes: "aboutme-restart", showing: false},
			{name: "name", kind: "Input", classes: "aboutme-name", oninput:"namechanged"}
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
	},
	
	rendered: function() {
		this.$.icon.render();
		this.$.cancelbutton.setNodeProperty("title", l10n.get("Cancel"));		
		this.$.okbutton.setNodeProperty("title", l10n.get("Ok"));
		this.$.pficon.setColorizedColor(util.getPreviousFillColor(this.currentcolor));
		this.$.pficon.setColorized(true);
		this.$.psicon.setColorizedColor(util.getPreviousStrokeColor(this.currentcolor));
		this.$.psicon.setColorized(true);
		this.$.cicon.setColorizedColor(this.currentcolor);
		this.$.cicon.setColorized(true);
		this.$.nficon.setColorizedColor(util.getNextFillColor(this.currentcolor));
		this.$.nficon.setColorized(true);
		this.$.nsicon.setColorizedColor(util.getNextStrokeColor(this.currentcolor));
		this.$.nsicon.setColorized(true);
		this.$.name.setValue(this.currentname);
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
	
	clickToTap: function(inSender, inEvent) {
		util.clickToTap(this, inSender, inEvent);
	},
	
	setcolor: function(icon) {
		var newcolor = icon.getColorizedColor();
		if (newcolor == this.currentcolor)
			return;
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
	name: "Sugar.Dialog.Language",
	kind: "enyo.Popup",
	classes: "module-dialog",
	centered: true,
	modal: true,
	floating: true,
	autoDismiss: false,
	components: [
		{name: "toolbar", classes: "toolbar", components: [
			{name: "icon", kind: "Sugar.Icon", x: 6, y: 6, classes: "module-icon", size: constant.sizeToolbar, icon: {directory: "icons", icon: "module-language.svg"}},
			{name: "text", content: "xxx", classes: "module-text"},
			{name: "cancelbutton", kind: "Button", classes: "toolbutton module-cancel-button", onclick: "clickToTap", ontap: "cancel"},		
			{name: "okbutton", kind: "Button", classes: "toolbutton module-ok-button", onclick: "clickToTap", ontap: "ok"}
		]},
		{name: "warningbox", kind: "Sugar.Dialog.Settings.WarningBox", showing: false, onCancel: "cancel", onRestart: "restart"},
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
			{code: "fr", icon: null, name: l10n.get("French")}
		];
		this.$.languageselect.setItems(this.languageset);		
		for (var i = 0 ; i < this.languageset.length ; i++) {
			if (this.languageset[i].code == this.initlanguage) {
				this.$.languageselect.setSelected(i);
				break;
			}
		}
		this.$.restartmessage.setContent(l10n.get("ChangesRequireRestart"));
	},
	
	rendered: function() {
		this.$.cancelbutton.setNodeProperty("title", l10n.get("Cancel"));		
		this.$.okbutton.setNodeProperty("title", l10n.get("Ok"));
		this.$.languageselect.setParentMargin(this);
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
	
	clickToTap: function(inSender, inEvent) {
		util.clickToTap(this, inSender, inEvent);
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
	name: "Sugar.Dialog.Computer",
	kind: "enyo.Popup",
	classes: "module-dialog",
	centered: true,
	modal: true,
	floating: true,
	autoDismiss: false,
	components: [
		{name: "toolbar", classes: "toolbar", components: [
			{name: "icon", kind: "Sugar.Icon", x: 6, y: 6, classes: "module-icon", size: constant.sizeToolbar, icon: {directory: "icons", icon: "module-about_my_computer.svg"}},
			{name: "text", content: "xxx", classes: "module-text"},
			{name: "cancelbutton", kind: "Button", classes: "toolbutton module-cancel-button", onclick: "clickToTap", ontap: "cancel"},		
			{name: "okbutton", kind: "Button", classes: "toolbutton module-ok-button", onclick: "clickToTap", ontap: "ok"}
		]},
		{name: "content", components: [
			{name: "software", content: "xxx", classes: "computer-software"},
			{content: "Sugarizer:", classes: "computer-sugarizer"},
			{name: "sugarizer_value", classes: "computer-value"},
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
			{classes: "computer-line"},			
			{name: "copyright", content: "xxx", classes: "computer-copyright"},
			{content: "© 2013-2014 Lionel Laské, Sugar Labs Inc and Contributors", classes: "computer-contributor"},
			{name: "license", content: "xxx", classes: "computer-licence"}
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
		
		this.$.sugarizer_value.setContent(constant.sugarizerVersion);	
		this.$.clienttype_value.setContent(util.getClientName());
		this.$.browser_value.setContent(util.getBrowserName());	
		this.$.browserversion_value.setContent(util.getBrowserVersion());	
		this.$.useragent_value.setContent(navigator.userAgent);			
	},
	
	rendered: function() {
		this.$.cancelbutton.setNodeProperty("title", l10n.get("Cancel"));		
		this.$.okbutton.setNodeProperty("title", l10n.get("Ok"));
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
	
	clickToTap: function(inSender, inEvent) {
		util.clickToTap(this, inSender, inEvent);
	}	
});



// Server dialog
enyo.kind({
	name: "Sugar.Dialog.Server",
	kind: "enyo.Popup",
	classes: "module-dialog",
	centered: true,
	modal: true,
	floating: true,
	autoDismiss: false,
	components: [
		{name: "toolbar", classes: "toolbar", components: [
			{name: "icon", kind: "Sugar.Icon", x: 6, y: 6, classes: "module-icon", size: constant.sizeToolbar, icon: {directory: "icons", icon: "cloud-settings.svg"}},
			{name: "text", content: "xxx", classes: "module-text"},
			{name: "cancelbutton", kind: "Button", classes: "toolbutton module-cancel-button", onclick: "clickToTap", ontap: "cancel"},		
			{name: "okbutton", kind: "Button", classes: "toolbutton module-ok-button", onclick: "clickToTap", ontap: "ok"}
		]},
		{name: "warningbox", kind: "Sugar.Dialog.Settings.WarningBox", showing: false, onCancel: "cancel", onRestart: "restart"},
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
			{name: "checkbutton", kind: "Sugar.IconButton", icon: {directory: "icons", icon: "dialog-ok.svg"}, classes: "aboutserver-checkbutton", onclick: "clickToTap", ontap: "check"},
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
		if (util.getClientType() == constant.thinClientType) {
			this.initservername = util.getCurrentServerUrl();
			this.$.servername.setDisabled(true);
		} else {
			this.initservername = preferences.getServer();
		}
		this.$.servername.setValue(this.initservername);		
		this.initusername = preferences.getNetworkId();
		this.$.username.setValue(this.initusername);
	},
	
	rendered: function() {
		this.$.cancelbutton.setNodeProperty("title", l10n.get("Cancel"));
		this.$.okbutton.setNodeProperty("title", l10n.get("Ok"));
		this.$.connected.setNodeProperty("checked", this.initconnected);
		var disabled = !this.$.connected.getNodeProperty("checked");
		if (util.getClientType() != constant.thinClientType)
			this.$.servername.setDisabled(disabled);
		this.$.username.setDisabled(disabled);		
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
	
	clickToTap: function(inSender, inEvent) {
		util.clickToTap(this, inSender, inEvent);
	},
	
	switchConnection: function() {
		if (util.getClientType() == constant.thinClientType) {
			this.$.connected.setNodeProperty("checked", true);
		}
		var disabled = !this.$.connected.getNodeProperty("checked");
		if (util.getClientType() != constant.thinClientType)
			this.$.servername.setDisabled(disabled);
		this.$.username.setDisabled(disabled);
		this.$.warningmessage.setShowing(this.hasChanged());
	},
	
	changed: function() {
		this.$.warningmessage.setShowing(this.hasChanged());	
	},
	
	check: function() {
		if (!this.$.connected.getNodeProperty("checked"))
			return;
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
		if ((this.initconnected && !currentconnected) || currentusername == "")
			preferences.init();	
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
	name: "Sugar.Dialog.Settings.Item",
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
	name: "Sugar.Dialog.Settings.WarningBox",
	kind: enyo.Control,
	classes: "settings-warningbox",
	events: { onRestart: "", onCancel: "" },
	components: [
		{name: "warningtitle", content: "xxx", classes: "warningbox-title"},
		{name: "warningmessage", content: "xxx", classes: "warningbox-message"},
		{name: "warningcancel", kind: "Sugar.IconButton", icon: {directory: "icons", icon: "dialog-cancel.svg"}, classes: "warningbox-cancel-button", onclick: "clickToTap", ontap: "cancel"},		
		{name: "warningrestart", kind: "Sugar.IconButton", icon: {directory: "icons", icon: "system-restart.svg"}, classes: "warningbox-refresh-button", onclick: "clickToTap", ontap: "restart"}
	],
	
	// Constructor
	create: function() {
		this.inherited(arguments);
		this.$.warningtitle.setContent(l10n.get("Warning"));
		this.$.warningmessage.setContent(l10n.get("ChangesRequireRestart"));
		this.$.warningcancel.setText(l10n.get("CancelChanges"));
		this.$.warningrestart.setText(l10n.get("RestartNow"));		
	},
	
	// Events
	cancel: function() {
		this.doCancel();
	},
	
	restart: function() {
		this.doRestart();
	},
	
	clickToTap: function(inSender, inEvent) {
		util.clickToTap(this, inSender, inEvent);
	}	
});
