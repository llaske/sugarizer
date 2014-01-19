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
			{name: "donebutton", kind: "Button", classes: "toolbutton settings-close-button", title:"List", onclick: "closeSettings"}			
		]},
		{name: "content", components: [
			{name: "me", kind: "Sugar.Dialog.Settings.Item", ontap: "meClicked", text: "Me", icon: {directory: "icons", icon: "module-about_me.svg"}, colorized: true},
			{name: "computer", kind: "Sugar.Dialog.Settings.Item", ontap: "computerClicked", text: "Computer", icon: {directory: "icons", icon: "module-about_my_computer.svg"}},
			{name: "language", kind: "Sugar.Dialog.Settings.Item", ontap: "languageClicked", text: "Language", icon: {directory: "icons", icon: "module-language.svg"}},
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
		this.subdialog = null;
	},
	
	rendered: function() {
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
		if (!this.$.computer.getDisabled())
			this.hide();
	},
	
	languageClicked: function() {
		if (!this.$.language.getDisabled()) {
			this.hide();
			this.subdialog = this.$.subdialog.createComponent({kind: "Sugar.Dialog.Language"}, {owner:this});
			this.subdialog.show();
		}
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
			{name: "cancelbutton", kind: "Button", classes: "toolbutton module-cancel-button", title:"List", ontap: "cancel"},		
			{name: "okbutton", kind: "Button", classes: "toolbutton module-ok-button", title:"List", ontap: "ok"}
		]},
		{name: "warningbox", kind: "Sugar.Dialog.Settings.WarningBox", showing: false, onCancel: "cancel", onRestart: "restart"},
		{name: "content", components: [
			{name: "message", content: "xxx", classes: "aboutme-message"},
			{name: "psicon", kind: "Sugar.Icon", x: 6, y: 6, classes: "aboutme-psicon", size: constant.sizeOwner, icon: {directory: "icons", icon: "owner-icon.svg"}, ontap:"setcolor"},
			{name: "nsicon", kind: "Sugar.Icon", x: 6, y: 6, classes: "aboutme-nsicon", size: constant.sizeOwner, icon: {directory: "icons", icon: "owner-icon.svg"}, ontap:"setcolor"},
			{name: "cicon", kind: "Sugar.Icon", x: 6, y: 6, classes: "aboutme-cicon", size: constant.sizeOwner, icon: {directory: "icons", icon: "owner-icon.svg"}, ontap:"setcolor"},
			{name: "pficon", kind: "Sugar.Icon", x: 6, y: 6, classes: "aboutme-pficon", size: constant.sizeOwner, icon: {directory: "icons", icon: "owner-icon.svg"}, ontap:"setcolor"},
			{name: "nficon", kind: "Sugar.Icon", x: 6, y: 6, classes: "aboutme-nficon", size: constant.sizeOwner, icon: {directory: "icons", icon: "owner-icon.svg"}, ontap:"setcolor"},
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
		if (this.currentcolor == this.initcolor && this.currentname == this.name) {
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
		util.restartApp();
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
			{name: "cancelbutton", kind: "Button", classes: "toolbutton module-cancel-button", title:"List", ontap: "cancel"},		
			{name: "okbutton", kind: "Button", classes: "toolbutton module-ok-button", title:"List", ontap: "ok"}
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
			//{code: "es", icon: null, name: l10n.get("Spanish")}, // RESERVED FOR FUTURE USE
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
		this.$.icon.render();
		this.$.cancelbutton.setNodeProperty("title", l10n.get("Cancel"));		
		this.$.okbutton.setNodeProperty("title", l10n.get("Ok"));
		this.$.languageselect.setParentMargin(this);
//console.log(enyo.dom.calcNodePosition(this.$.languageselect.hasNode(), document.getElementById('body')));
		//console.log(this.container.hasNode().getBoundingClientRect());
		//console.log(util.getScreenPosition(this.container.hasNode()));
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
		util.restartApp();
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
	},
	
	// Events
	cancel: function() {
		this.doCancel();
	},
	
	restart: function() {
		this.doRestart();
	}
});
