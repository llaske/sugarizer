/**
	An item that slides to the left to reveal Delete and Cancel buttons. Pressing the Cancel button will slide the item back into place and generate
	an onCancel event. Pressing the Delete button will immediately position the content back in place and generate an onDelete event.

	A SwipeableItem contains methods for styling its content and these should be used to effect styling on the row content. Add css classes via
	the contentClasses property and the methods add|remove|has|addRemove<ContentClass>. Alter css styles via the applyContentStyle method.

		{kind: "onyx.SwipeableItem", onCancel: "canceled", onDelete: "deleted"}

*/
enyo.kind({
	name: "onyx.SwipeableItem",
	kind: "onyx.Item",
	classes: "onyx-swipeable-item",
	published: {
		//* Add custom CSS classes via the contentClasses property to style the SwipeableItem's content
		contentClasses: "",
		//* Set to true to prevent a drag from bubbling beyond the SwipeableItem.
		preventDragPropagation: false
	},
	defaultContentClasses: "onyx-swipeable-item-content",
	handlers: {
		ondown: "down"
	},
	events: {
		/**
			Fires when a SwipeableItem's delete button has been triggered
			This event does not fire when programatically deleting a SwipeableItem instance
		*/
		onDelete: "",
		/**
			Fires when a SwipeableItem's cancel button has been triggered
			This event does not fire when selecting a second SwipeableItem, causing the first to cancel itself programatically
		*/
		onCancel: ""
	},
	components: [
		{name: "client", kind: "Slideable", min: -100, unit: "%", ondragstart: "clientDragStart"},
		{name: "confirm", kind: "onyx.Toolbar", canGenerate: false, classes: "onyx-swipeable-item-confirm enyo-fit", style: "text-align: center;", ontap: "confirmTap", components: [
			{kind: "onyx.Button", content: "Delete", ontap: "deleteTap"},
			{kind: "onyx.Button", content: "Cancel", ontap: "cancelTap"}
		]}
	],
	//* @protected
	swiping: -1,
	create: function() {
		this.inherited(arguments);
		this.contentClassesChanged();
	},
	//* @public
	//* Resets the sliding position of the SwipeableItem currently displaying confirmation options
	reset: function() {
		this.applyStyle("position", null);
		this.$.confirm.setShowing(false);
		// stop animating if we reset.
		this.$.client.getAnimator().stop();
		this.$.client.setValue(0);
	},
	//* @protected
	contentClassesChanged: function() {
		this.$.client.setClasses(this.defaultContentClasses + " " + this.contentClasses);
	},
	//* @public
	//* Applies a single style value to the SwipeableItem
	applyContentStyle: function(inStyle, inValue) {
		this.$.client.applyStyle(inStyle, inValue);
	},
	//* Applies a CSS class to the SwipeableItem's contentClasses
	addContentClass: function(inClass) {
		this.$.client.addClass(inClass);
	},
	//* Removes a CSS class to the SwipeableItem's contentClasses
	removeContentClass: function(inClass) {
		this.$.client.removeClass(inClass);
	},
	//* Returns true if the _class_ attribute contains a substring matching _inClass_
	hasContentClass: function(inClass) {
		return this.$.client.hasClass(inClass);
	},
	/**
		Adds or removes substring _inClass_ from the _class_ attribute of this object based
		on the value of _inTrueToAdd_.

		If _inTrueToAdd_ is truthy, then _inClass_ is added; otherwise, _inClass_ is removed.
	*/
	addRemoveContentClass: function(inClass, inAdd) {
		this.$.client.addRemoveClass(inClass, inAdd);
	},
	//* @protected
	generateHtml: function() {
		this.reset();
		return this.inherited(arguments);
	},
	contentChanged: function() {
		this.$.client.setContent(this.content);
	},
	confirmTap: function() {
		return true;
	},
	deleteTap: function(inSender, inEvent) {
		this.reset();
		this.doDelete();
		return true;
	},
	cancelTap: function(inSender, inEvent) {
		this.$.client.animateToMax();
		this.doCancel();
		return true;
	},
	down: function(inSender, inEvent) {
		// on down, remove swiping state
		var last = this.swiping;
		this.swiping = inEvent.index;
		var flyweight = inEvent.flyweight;
		if (this.swiping != last && last >= 0 && flyweight) {
			flyweight.performOnRow(last, enyo.bind(this, function() {
				this.reset();
			}));
		}
	},
	clientDragStart: function(inSender, inEvent) {
		if (inSender.dragging) {
			var flyweight = inEvent.flyweight;
			if (flyweight) {
				flyweight.prepareRow(inEvent.index);
				// if needed, render confirm.
				// NOTE: position relative so can enyo-fit confirm; apply only when confirm needed
				// because it's a known rendering slowdown.
				this.applyStyle("position", "relative");
				this.$.confirm.setShowing(true);
				if (!this.$.confirm.hasNode()) {
					// NOTE: prepend so Slideable will be on top.
					this.$.confirm.prepend = true;
					this.$.confirm.render();
					this.$.confirm.prepend = false;
				}
				// note: can't teardown.
			}
		}
		return this.preventDragPropagation;
	}
});