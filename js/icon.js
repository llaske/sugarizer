
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
		popupHide: null
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
		this.disabledBackgroundChanged();
		this.disabledChanged();
		this.xChanged();
		this.yChanged();
		this.timer = null;
	},
	
	// Timer handler for popup menu
	popupShowTimer: function() {
		if (this.popupShow == null)
			return;
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
		if (this.popupHide == null)
			return;	
		if (this.timer != null) {
			window.clearInterval(this.timer);
		}
		this.timer = window.setInterval(enyo.bind(this, "hidePopup"), constant.timerPopupDuration);
	},
	hidePopup: function() {
		if (!this.popupHide())
			return;
		window.clearInterval(this.timer);
		this.timer = null;		
	},

	// Render
	rendered: function() {
		this.inherited(arguments);

		// If colorized		
		if (this.colorized) {
			// Get colorized color
			var colorToUse = this.colorizedColor;
			var node = this.$.icon.hasNode();
			var name = this.icon.directory+"/"+this.icon.icon;			
			if (colorToUse == null) {
				// Try to find colorized version in cache
				colorToUse = preferences.getColor();
				for (var i = 0 ; i < iconColorCache.names.length ; i++)
					if (iconColorCache.names[i] == name) {
						node.style.backgroundImage = iconColorCache.values[i];
						return;
					}
			}
			
			// Build it
			iconLib.colorize(node, colorToUse, function() {
				// Cache it			
				iconColorCache.names.push(name);
				iconColorCache.values.push(node.style.backgroundImage);
			});
		}
	},
	
	// Property changed
	xChanged: function() {
		if (this.x != -1) this.applyStyle("margin-left", this.x+"px");
	},
	
	yChanged: function() {
		if (this.y != -1) {
			this.applyStyle("margin-top", this.y+"px");
			this.$.disable.applyStyle("margin-top", (-this.size)+"px");
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
		if (this.icon != null)
			this.$.icon.applyStyle("background-image", "url(" + this.icon.directory+"/"+this.icon.icon + ")");
		else
			this.$.icon.applyStyle("background-image", null);
	},
	
	colorizedColorChanged: function() {
		this.render();
	},
	
	colorizedChanged: function() {
		this.render();
	},
	
	disabledBackgroundChanged: function() {
		this.$.disable.applyStyle("background-color", this.disabledBackground);
	},
	
	disabledChanged: function() {
		this.$.disable.setShowing(this.disabled);
	}
});