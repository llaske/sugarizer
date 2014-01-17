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
			{name: "listbutton", kind: "Button", classes: "toolbutton settings-close-button", title:"List", onclick: "closeSettings"}			
		]},
		{name: "content", components: [
			{name: "me", kind: "Sugar.Dialog.Settings.Item", ontap: "meClicked", text: "Me", icon: {directory: "icons", icon: "module-about_me.svg"}, colorized: true},
			{name: "computer", kind: "Sugar.Dialog.Settings.Item", ontap: "computerClicked", text: "Computer", icon: {directory: "icons", icon: "module-about_my_computer.svg"}},
			{name: "language", kind: "Sugar.Dialog.Settings.Item", ontap: "languageClicked", text: "Language", icon: {directory: "icons", icon: "module-language.svg"}},
		]}
	],

	// Constructor
	create: function() {
		this.inherited(arguments);
		this.$.settingssearch.setPlaceholder(l10n.get("SearchSettings"));
		this.$.me.setText(l10n.get("AboutMe"));
		this.$.computer.setText(l10n.get("AboutMyComputer"));
		this.$.language.setText(l10n.get("Language"));
	},
	
	rendered: function() {
		this.$.me.render();
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
	
	meClicked: function() {
		if (!this.$.me.getDisabled())
			this.hide();
	},
	
	computerClicked: function() {
		if (!this.$.computer.getDisabled())
			this.hide();
	},
	
	languageClicked: function() {
		if (!this.$.language.getDisabled())
			this.hide();
	}
});	


// Class for a Sugar select box
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
			{name: "icon", kind: "Sugar.Icon", size: 20, x: 6, y: 6, classes: "settings-item-icon", size: constant.sizeSettings, disabledBackground: "#000000"},
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