// Class for a Sugar button with an icon and a text
enyo.kind({
	name: "Sugar.IconButton",
	kind: enyo.Control,
	published: {
		icon: null,
		text: null,
	},
	classes: "icon-button",
	components: [
		{ name: "icon", kind: "Sugar.Icon", size: 20, x: 6, y: 6},
		{ name: "text", classes: "icon-button-text" }
	],
	
	// Constructor
	create: function() {
		this.inherited(arguments);
		this.iconChanged();
		this.textChanged();
		if (l10n.language.direction == "rtl") {
			this.setAttribute("dir", "rtl");
			this.$.text.addClass("rtl-10");
		}
	},
	
	// Property changed
	iconChanged: function() {
		this.$.icon.setIcon(this.icon);
	},
	
	textChanged: function() {
		this.$.text.setContent(this.text);
	}
});