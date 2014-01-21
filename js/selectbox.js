// Class for a Sugar select box
enyo.kind({
	name: "Sugar.SelectBox",
	kind: enyo.Control,
	classes: "selectbox-border",
	published: { selected: -1, items: [], parentMargin: null },
	events: { onIndexChanged: "" },	
	components: [
		{components: [
			{name: "icon", kind: "Sugar.Icon", size: 20, x: 6, y: 6, classes: "selectbox-icon"},	
			{name: "text", content: "xxx", classes: "selectbox-text"},
			{name: "selectpopup", kind: "Sugar.Popup", classes: "selectbox-popup", showing: false}
		], onclick:"showPopup", ontap:"showPopup"}
	],
	
	// Constructor
	create: function() {
		this.inherited(arguments);
		this.timer = null;
		this.itemsChanged();
		this.selectedChanged();
		this.parentMarginChanged();
	},
	
	// Property changed
	itemsChanged: function() {
		if (this.items.length == 0)
			return;
		this.selected = 0;
		this.selectedChanged();
	},
	selectedChanged: function() {
		if (this.selected > this.items.length || this.selected < 0)
			return;
		this.$.icon.setIcon(this.items[this.selected].icon);
		this.$.text.setContent(this.items[this.selected].name);		
	},
	parentMarginChanged: function() {
	},	
	
	// Popup menu for item selection
	showPopup: function() {
		// Create popup
		if (this.items.length == 0)
			return;
		var clientrects = this.hasNode().getClientRects();
		var ctrlpos = clientrects[clientrects.length-1];
		if (this.parentMargin != null) {
			var nodepos = enyo.dom.calcNodePosition(this.parentMargin.hasNode(), document);	
			ctrlpos = { left: ctrlpos.left-nodepos.left, top: ctrlpos.top-nodepos.top };			
		}
		this.$.selectpopup.setMargin({left: ctrlpos.left-mouse.position.x+5, top: ctrlpos.top-mouse.position.y-3});
		this.$.selectpopup.setHeader({
			icon: this.items[0].icon,
			name: this.items[0].name,
			action: enyo.bind(this, "setSelection"),	
			data: [0]
		});		
		var items = [];
		for (var i = 1 ; i < this.items.length ; i++)
			items.push({
				icon: this.items[i].icon,
				name: this.items[i].name,
				action: enyo.bind(this, "setSelection"),
				data: [i]
			});
		this.$.selectpopup.setItems(items);		
		this.$.selectpopup.showPopup();
		this.$.selectpopup.showContent();
		this.timer = window.setInterval(enyo.bind(this, "hidePopup"), constant.timerPopupDuration);
	},
	hidePopup: function() {	
		// Hide popup
		if (this.$.selectpopup.cursorIsInside())
			return false;
		window.clearInterval(this.timer);
		this.timer = null;			
		this.$.selectpopup.hidePopup();
		return true;
	},
	
	// Set selection
	setSelection: function(index) {
		this.selected = index;
		this.selectedChanged();
		window.clearInterval(this.timer);
		this.timer = null;
		this.$.selectpopup.hidePopup();
		this.doIndexChanged();
	}
});