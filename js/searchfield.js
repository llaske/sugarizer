// Class for a Sugar button with an icon and a text
enyo.kind({
	name: "Sugar.SearchField",
	kind: enyo.Control,
	classes: "search-field-border search-field-border-nofocus",
	published: { text: "", placeholder: "" },
	events: { onTextChanged: "" },
	components: [
		{classes: "search-field-iconsearch"},
		{name: "text", kind: "enyo.Input", classes: "search-field-input", onfocus: "onfocus", onblur:"onblur", oninput:"oninput"},
		{name: "icon", classes: "search-field-iconcancel", showing: false, ontap: "onclick", onclick: "clickToTap"}
	],
	
	// Constructor
	create: function() {
		this.inherited(arguments);
		this.textChanged();
		this.placeholderChanged();
	},
	
	// Property changed
	textChanged: function() {
		this.$.text.setValue(this.text);
		if (this.text.length > 0)
			this.$.icon.show();
		else
			this.$.icon.hide();
	},
	
	placeholderChanged: function() {
		this.$.text.setPlaceholder(this.placeholder);
	},
	
	// Event handling to mimic Sugar focus handling
	onfocus: function() {
		// Focus on input field, change background of border box
		this.addRemoveClass('search-field-border-nofocus', false);
		this.addRemoveClass('search-field-border-focus', true);
	},

	onblur: function() {
		// Lose focus on input field, change background of border box
		this.addRemoveClass('search-field-border-nofocus', true);
		this.addRemoveClass('search-field-border-focus', false);
	},
	
	oninput: function() {
		// Input text changed, notify parent
		this.text = this.$.text.getValue();
		this.doTextChanged();
		if (this.text.length > 0)
			this.$.icon.show();
		else
			this.$.icon.hide();
	},
	
	onclick: function() {
		this.text = "";	
		this.$.text.setValue(this.text);
		this.textChanged();
		this.doTextChanged();
	},
	
	clickToTap: function(inSender, inEvent) {
		util.clickToTap(inSender, inEvent);
	}	
});