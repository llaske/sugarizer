enyo.kind({
	name: "onyx.Scrim",
	showing: false,
	classes: "onyx-scrim enyo-fit",
	floating: false,
	//* @protected
	create: function() {
		this.inherited(arguments);
		this.zStack = [];
		if (this.floating) {
			this.setParent(enyo.floatingLayer);
		}
	},
	showingChanged: function() {
	// auto render when shown.
		if (this.floating && this.showing && !this.hasNode()) {
			this.render();
		}
		this.inherited(arguments);
		//this.addRemoveClass(this.showingClassName, this.showing);
	},
	//* @protected
	addZIndex: function(inZIndex) {
		if (enyo.indexOf(inZIndex, this.zStack) < 0) {
			this.zStack.push(inZIndex);
		}
	},
	removeZIndex: function(inControl) {
		enyo.remove(inControl, this.zStack);
	},
	//* @public
	//* Show Scrim at the specified ZIndex.  Note: If you use showAtZIndex you
	//*  must call hideAtZIndex to properly unwind the zIndex stack
	showAtZIndex: function(inZIndex) {
		this.addZIndex(inZIndex);
		if (inZIndex !== undefined) {
			this.setZIndex(inZIndex);
		}
		this.show();
	},
	//* Hide Scrim at the specified ZIndex
	hideAtZIndex: function(inZIndex) {
		this.removeZIndex(inZIndex);
		if (!this.zStack.length) {
			this.hide();
		} else {
			var z = this.zStack[this.zStack.length-1];
			this.setZIndex(z);
		}
	},
	//* @protected
	// Set scrim to show at `inZIndex`
	setZIndex: function(inZIndex) {
		this.zIndex = inZIndex;
		this.applyStyle("z-index", inZIndex);
	},
	make: function() {
		return this;
	}
});

//* @protected
//
// Scrim singleton exposing a subset of Scrim API. 
// is replaced with a proper enyo.Scrim instance.
//
enyo.kind({
	name: "onyx.scrimSingleton",
	kind: null,
	constructor: function(inName, inProps) {
		this.instanceName = inName;
		enyo.setObject(this.instanceName, this);
		this.props = inProps || {};
	},
	make: function() {
		var s = new onyx.Scrim(this.props);
		enyo.setObject(this.instanceName, s);
		return s;
	},
	showAtZIndex: function(inZIndex) {
		var s = this.make();
		s.showAtZIndex(inZIndex);
	},
	// in case somebody does this out of order
	hideAtZIndex: enyo.nop,
	show: function() {
		var s = this.make();
		s.show();
	}
});

new onyx.scrimSingleton("onyx.scrim", {floating: true, classes: "onyx-scrim-translucent"});
new onyx.scrimSingleton("onyx.scrimTransparent", {floating: true, classes: "onyx-scrim-transparent"});
