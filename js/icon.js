
// Colorized icons cache
var iconColorCache = {
	names: [],
	values: []
};


// Class for a Sugar icon
enyo.kind({
	name: "Sugar.Icon",
	kind: enyo.Control,
	published: {
		icon: null,
		size: constant.iconSizeStandard,
		x: -1, y: -1,
		colorized: false,
		colorizedColor: null,
		disabled: false,
		disabledBackground: 'white',
		popupShow: null,
		popupHide: null,
		isNative: false,
		data: null
	},
	classes: "web-activity",
	components: [
		{ name: "icon", classes: "web-activity-icon", onmouseover: "popupShowTimer", onmouseout: "popupHideTimer"},
		{ name: "disable", classes: "web-activity-disable", showing: false}
	],

	// Constructor
	create: function() {
		this.inherited(arguments);
		this.iconChanged();
		this.sizeChanged();
		this.colorizedColorChanged();
		this.colorizedChanged();
		this.isNativeChanged();
		this.disabledBackgroundChanged();
		this.disabledChanged();
		this.xChanged();
		this.yChanged();
		this.timer = null;
		this.emulateMouseOver = false;
	},

	// Timer handler for popup menu
	popupShowTimer: function() {
		if (this.popupShow == null) {
			return;
		}
		if (this.timer != null) {
			window.clearInterval(this.timer);
		}
		this.timer = window.setInterval(enyo.bind(this, "showPopup"), constant.timerPopupDuration);
	},

	showPopup: function(icon, e) {
		this.popupShow(this);
		window.clearInterval(this.timer);
		this.timer = null;
	},

	popupHideTimer: function(icon, e) {
		if (this.popupHide == null) {
			return;
		}
		if (this.timer != null) {
			window.clearInterval(this.timer);
		}
		this.timer = window.setInterval(enyo.bind(this, "hidePopup"), constant.timerPopupDuration);
	},

	hidePopup: function() {
		if (!this.popupHide(this)) {
			return;
		}
		window.clearInterval(this.timer);
		this.timer = null;
	},

	// Render
	rendered: function() {
		this.inherited(arguments);

		var node = this.$.icon.hasNode();
		if (node && enyo.platform.touch) {
			// HACK: On iOS and Chrome Android use touch events to simulate mouseover/mouseout
			var that = this;
			if (enyo.platform.ios || enyo.platform.androidChrome) {
				enyo.dispatcher.listen(node, "touchstart", function(e) {
					mouse.position = {x: e.touches[0].clientX, y: e.touches[0].clientY};
					that.popupShowTimer();
				});
				enyo.dispatcher.listen(node, "touchend", function(e) {
					that.popupHideTimer();
				});
			}
		}

		// If colorized
		if (this.colorized && !this.icon.isNative) {
			// Get colorized color
			var colorToUse = this.colorizedColor;
			var name = this.icon.directory+"/"+this.icon.icon;
			var cachename;
			node.style.backgroundImage = "url('" + name + "')";
			if (colorToUse == null) {
				// Try to find colorized version in cache
				colorToUse = preferences.getColor();
				cachename = name+"_"+colorToUse.stroke+"_"+colorToUse.fill;
				for (var i = 0 ; i < iconColorCache.names.length ; i++)
					if (iconColorCache.names[i] == cachename) {
						node.style.backgroundImage = iconColorCache.values[i];
						return;
					}
			} else {
				cachename = name+"_"+colorToUse.stroke+"_"+colorToUse.fill;
			}

			// Build it
			iconLib.colorize(node, colorToUse, function() {
				// Cache it
				iconColorCache.names.push(cachename);
				iconColorCache.values.push(node.style.backgroundImage);
			});
		}

	},

	// Test is cursor is inside the icon
	cursorIsInside: function() {
		return util.cursorIsInside(this);
	},

	// Property changed
	xChanged: function() {
		if (this.x != -1) {
			this.applyStyle("margin-left", this.x+"px");
		}
	},

	yChanged: function() {
		if (this.y != -1) {
			this.applyStyle("margin-top", this.y+"px");
		}
	},

	sizeChanged: function() {
		this.$.icon.applyStyle("width", this.size+"px");
		this.$.icon.applyStyle("height", this.size+"px");
		this.$.icon.applyStyle("background-size", this.size+"px "+this.size+"px");
		this.$.disable.applyStyle("width", this.size+"px");
		this.$.disable.applyStyle("height", this.size+"px");
		this.$.disable.applyStyle("background-size", this.size+"px "+this.size+"px");
	},

	iconChanged: function() {
		if (this.icon != null) {
			if (this.icon.isNative != null) {
				this.$.icon.applyStyle("background-image", "url('"+this.icon.icon+"');");
			} else {
				this.$.icon.applyStyle("background-image", "url('"  + this.icon.directory+"/"+this.icon.icon + "')");
			}
		}
		else {
			this.$.icon.applyStyle("background-image", null);
		}
	},

	colorizedColorChanged: function() {
		this.render();
	},

	colorizedChanged: function() {
		this.render();
	},

	isNativeChanged: function(){
		this.render();
	},

	disabledBackgroundChanged: function() {
		this.$.disable.applyStyle("background-color", this.disabledBackground);
	},

	disabledChanged: function() {
		this.$.disable.setShowing(this.disabled);
	},

	// Colorize
	colorize: function(color) {
		var node = this.hasNode();
		if (!node || !node.style.backgroundImage) {
			return;
		}
		iconLib.colorize(node, color, function() {});
	}
});
