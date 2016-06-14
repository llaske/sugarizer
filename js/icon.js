
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
	    androidImported: false,
	    data: null
	},
	classes: "web-activity",
	components: [
		{ name: "icon", classes: "web-activity-icon", onmouseover: "popupShowTimer", onmouseout: "popupHideTimer", ontap: "stopMouseOverSimulator"},
		{ name: "disable", classes: "web-activity-disable", showing: false}
	],
	
	// Constructor
	create: function() {
	    this.inherited(arguments);
	    this.iconChanged();
	    this.sizeChanged();
	    this.colorizedColorChanged();
	    this.colorizedChanged();
	    this.androidImportedChanged();
	    this.disabledBackgroundChanged();
	    this.disabledChanged();
	    this.xChanged();
	    this.yChanged();
	    this.timer = null;
	    this.emulateMouseOver = false;		
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
	startMouseOverSimulator: function(icon, e) {
		if (enyo.platform.firefoxOS && enyo.platform.touch) {
			this.emulateMouseOver = true;
			this.emulatorTimestamp = new Date().getTime();
		}
	},
	stopMouseOverSimulator: function(icon, e) {
		if (this.emulateMouseOver) {
			var timeelapsed = new Date().getTime() - this.emulatorTimestamp;
			this.emulatorMouseOver = false;
			return timeelapsed > constant.touchToPopupDuration;
		}
		this.popupHideTimer();
		return false;
	},

	// Render
	rendered: function() {
		this.inherited(arguments);
		
		var node = this.$.icon.hasNode();
		if (node && enyo.platform.touch) {
			// HACK: Handle directly touch event on FirefoxOS to simulate long click to popup menu
			var that = this;
			if (enyo.platform.firefoxOS) {
				enyo.dispatcher.listen(node, "touchstart", function() {
					that.startMouseOverSimulator();
				});
			} 
			
			// HACK: On iOS and Chrome Android use touch events to simulate mouseover/mouseout
			else if (enyo.platform.ios || enyo.platform.androidChrome) {
				enyo.dispatcher.listen(node, "touchstart", function(e) {
					mouse.position = {x: e.touches[0].clientX, y: e.touches[0].clientY};
					that.popupShowTimer();
				});
				enyo.dispatcher.listen(node, "touchend", function() {
					mouse.position = {x: e.touches[0].clientX, y: e.touches[0].clientY};			
					that.popupHideTimer();
				});			
			}
		}


		// If colorized		
		if (this.colorized) {
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
	    //If androidImported
	    if (this.icon != null && this.icon.androidImported != null)
		node.style.backgroundImage = "url('" + this.icon.icon + "')";

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

    androidImportedChanged: function(){
	this.render();
    },
	
	disabledBackgroundChanged: function() {
		this.$.disable.applyStyle("background-color", this.disabledBackground);
	},
	
	disabledChanged: function() {
		this.$.disable.setShowing(this.disabled);
		this.$.disable.applyStyle("margin-top", (-this.size)+"px"); // Force disable position if not set at start
	},
	
	// Colorize
	colorize: function(color) {
		var node = this.hasNode();
		if (!node || !node.style.backgroundImage) return;
		iconLib.colorize(node, color, function() {});
	}
});
