

// Popup menu of the activity
enyo.kind({
	name: "Sugar.Popup",
	kind: "enyo.Control",
	classes: "home-activity-popup",
	published: { margin: null, header: null, items: null, footer: null },
	components: [
		{name: "popuptitle", classes: "popup-title", ontap: "runHeaderAction", components: [
			{name: "icon", showing: false, kind: "Sugar.Icon", x: 5, y: 5, size: constant.iconSizeList},
			{name: "name", classes: "popup-name-text"},
			{name: "title", classes: "popup-title-text"},
		]},
		{name: "items", classes: "popup-items", showing: false, components: [
			{name: "itemslist", kind: "Sugar.DesktopPopupListView"}
		]},
		{name: "footer", classes: "popup-items", showing: false, components: [
			{name: "footerlist", kind: "Sugar.DesktopPopupListView"}
		]}
	],

	// Constructor
	create: function() {
		this.inherited(arguments);
		this.marginChanged();
		this.headerChanged();
		this.itemsChanged();
		this.footerChanged();
		this.timer = null;
		if (l10n.language.direction == "rtl") {
			this.$.popuptitle.setAttribute("dir", "rtl");
		}
	},

	// Property changed
	marginChanged: function() {
		if (this.margin == null) {
			this.margin = { left: constant.popupMarginLeft, top: constant.popupMarginTop };
		}
		this.applyStyle("left", (mouse.position.x+this.margin.left)+"px");
		this.applyStyle("top", (mouse.position.y+this.margin.top)+"px");
	},

	headerChanged: function() {
		if (this.header != null) {
			this.$.icon.setShowing(this.header.icon != null);
			if (this.header.icon != null) {
				this.$.icon.setIcon(this.header.icon);
				this.$.icon.setColorized(this.header.colorized);
				if (this.header.colorizedColor) {
					this.$.icon.setColorizedColor(this.header.colorizedColor);
				} else {
					this.$.icon.setColorizedColor(null);
				}
				this.$.icon.render();
			}
			this.$.name.setContent(this.header.name);
			if (l10n.language.direction == "rtl") {
				this.$.name.addClass("rtl-10");
			}
			if (this.header.title != null) {
				this.$.name.removeClass("popup-name-text-bottom");
				this.$.title.setContent(this.header.title);
			} else {
				this.$.title.setContent("");
				this.$.name.addClass("popup-name-text-bottom");
			}
		}
	},

	itemsChanged: function() {
		if (this.items != null) {
			this.$.itemslist.setItems(this.items);
		}
	},

	footerChanged: function() {
		if (this.footer != null) {
			this.$.footerlist.setItems(this.footer);
		}
	},

	// Control popup visibility
	showPopup: function() {
		if (this.margin == null) {
			this.margin = { left: constant.popupMarginLeft, top: constant.popupMarginTop };
		}
		var popupSize = 56;
		popupSize += ((this.footer == null || this.footer.length == 0) ? 0 : 53);
		popupSize += (this.items == null ? 0 : 42 * this.items.length);
		var delta = mouse.position.y + this.margin.top + popupSize - document.getElementById("canvas").offsetHeight;
		this.overflow = false;
		if (delta > 0 && (!this.container.hasNode() || !this.container.hasNode().style.overflowY)) {
			// Popup will overflow window, prepare to shift menu
			this.overflow = true;
		}
		this.setStyle("bottom", "");
		this.applyStyle("top", (mouse.position.y+this.margin.top)+"px");
		this.applyStyle("left", (mouse.position.x+this.margin.left)+"px");
		this.show();
		this.timer = window.setInterval(enyo.bind(this, "showContent"), constant.timerPopupDuration);
	},

	hidePopup: function() {
		this.hide();
		this.$.items.hide();
		this.$.itemslist.setItems(null);
		this.$.footer.hide();
		this.$.footerlist.setItems(null);
	},

	showContent: function() {
		window.clearInterval(this.timer);
		if (this.overflow) {
			this.setStyle("top", "");
			this.applyStyle("bottom", "0px");
			this.applyStyle("left", (mouse.position.x+this.margin.left)+"px");
		}
		this.timer = null;
		if (this.$.items && this.showing) {
			if (this.items != null && this.items.length > 0) {
				this.$.items.show();
			}
			if (this.footer != null && this.footer.length > 0) {
				this.$.footer.show();
			}
		}
	},

	// Click on the header icon, launch action
	runHeaderAction: function(s, e) {
		if (this.header.action != null) {
			this.header.action.apply(this, this.header.data);
			return true;
		}
	},

	// Test is cursor is inside the popup
	cursorIsInside: function() {
		return util.cursorIsInside(this);
	}
});




// Items popup ListView
enyo.kind({
	name: "Sugar.DesktopPopupListView",
	kind: enyo.Scroller,
	published: { items: null },
	classes: "popup-item-listview",
	components: [
		{name: "itemList", classes: "item-list", kind: "Repeater", onSetupItem: "setupItem", components: [
			{name: "item", classes: "item-list-item", ontap: "runItemAction", components: [
				{name: "icon", kind: "Sugar.Icon", x: 5, y: 4, size: constant.iconSizeFavorite},
				{name: "name", classes: "item-name"}
			]}
		]}
	],

	// Constructor: init list
	create: function() {
		this.inherited(arguments);
		this.itemsChanged();
	},

	// Items changed
	itemsChanged: function() {
		if (this.items != null) {
			this.$.itemList.set("count", this.items.length, true);
		} else {
			this.$.itemList.set("count", 0, true);
		}
	},

	// Init setup for a line
	setupItem: function(inSender, inEvent) {
		// Set item in the template
		inEvent.item.$.icon.setIcon(this.items[inEvent.index].icon);
		inEvent.item.$.name.setContent(this.items[inEvent.index].name);
		inEvent.item.$.icon.setColorized(this.items[inEvent.index].colorized);
		if (this.items[inEvent.index].colorizedColor) {
			inEvent.item.$.icon.setColorizedColor(this.items[inEvent.index].colorizedColor);
		} else {
			inEvent.item.$.icon.setColorizedColor(null);
		}
		if (this.items[inEvent.index].disable) {
			inEvent.item.$.name.addRemoveClass('item-name-disable', true);
			inEvent.item.$.name.addRemoveClass('item-name-enable', false);
		} else {
			inEvent.item.$.name.addRemoveClass('item-name-disable', false);
			inEvent.item.$.name.addRemoveClass('item-name-enable', true);
		}
		if (l10n.language.direction == "rtl") {
			inEvent.item.$.name.addClass("rtl-10");
			inEvent.item.$.item.setAttribute("dir", "rtl");
		}
	},

	// Run action on item
	runItemAction: function(inSender, inEvent) {
		// Nothing to do if item is disable
		if (this.items[inEvent.index].disable) {
			return;
		}

		// Get action and run it if it exist
		var action = this.items[inEvent.index].action;
		if (action != null) {
			action.apply(this, this.items[inEvent.index].data);
		}
	}
});
