/**
	A control designed to display a group of stacked items, typically used in
	lists. Items are displayed with small guide lines between them; by default,
	they are highlighted when tapped. Set *tapHighlight* to false to prevent the
	highlighting.

		{kind: "onyx.Item", tapHighlight: false}
*/
enyo.kind({
	name: "onyx.Item",
	classes: "onyx-item",
	tapHighlight: true,
	handlers: {
		onhold: "hold",
		onrelease: "release"
	},
	//* @public
	hold: function(inSender, inEvent) {
		if (this.tapHighlight) {
			onyx.Item.addFlyweightClass(this.controlParent || this, "onyx-highlight", inEvent);
		}
	},
	//* @public
	release: function(inSender, inEvent) {
		if (this.tapHighlight) {
			onyx.Item.removeFlyweightClass(this.controlParent || this, "onyx-highlight", inEvent);
		}
	},
	//* @protected
	statics: {
		addFlyweightClass: function(inControl, inClass, inEvent, inIndex) {
			var flyweight = inEvent.flyweight;
			if (flyweight) {
				var index = inIndex != undefined ? inIndex : inEvent.index;
				flyweight.performOnRow(index, function() {
					if (!inControl.hasClass(inClass)) {
						inControl.addClass(inClass);
					} else {
						inControl.setClassAttribute(inControl.getClassAttribute());
					}
				});
				inControl.removeClass(inClass);
			}
		},
		// FIXME: dry
		removeFlyweightClass: function(inControl, inClass, inEvent, inIndex) {
			var flyweight = inEvent.flyweight;
			if (flyweight) {
				var index = inIndex != undefined ? inIndex : inEvent.index;
				flyweight.performOnRow(index, function() {
					if (!inControl.hasClass(inClass)) {
						inControl.setClassAttribute(inControl.getClassAttribute());
					} else {
						inControl.removeClass(inClass);
					}
				});
			}
		}
	}
});