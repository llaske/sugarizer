// Class for a Sugar select box
enyo.kind({
	name: "Sugar.SelectBox",
	kind: enyo.Control,
	classes: "selectbox-border",
	components: [
		{components: [
			{name: "icon", kind: "Sugar.Icon", size: 20, x: 6, y: 6, classes: "selectbox-icon"},	
			{name: "text", content:"Click here", classes: "selectbox-text"},
			{name: "selectpopup", kind: "Sugar.Popup", classes: "selectbox-popup", showing: false}
		], ontap:"showPopup"}
	],
	
	// Constructor
	create: function() {
		this.inherited(arguments);		
	},
	
	// Popup menu for item selection
	showPopup: function() {
		return;
		// Create popup
		this.$.selectpopup.setMargin({top: 0, left: 0});
		this.$.selectpopup.setHeader({
			icon: this.$.favoritebutton,
			colorized: true,
			name: "Hello",
			title: null,
			action: null
		});		
		var items = [];
		items.push({
			icon: {directory: "icons", icon: "preferences-system.svg"},
			colorized: false,
			name: l10n.get("MySettings"),
			action: null,	
			data: null
		});
		this.$.selectpopup.setFooter(items);		
		this.$.selectpopup.showPopup();
	},
	hidePopup: function() {
		// Hide popup
		if (this.$.selectpopup.cursorIsInside())
			return false;	
		this.$.selectpopup.hidePopup();
		return true;
	}
});