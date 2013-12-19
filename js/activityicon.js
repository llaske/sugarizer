
// Colorized icons cache
var iconColorCache = {
	names: [],
	values: []
};


// Class for a Sugar Web activity icon
enyo.kind({
	name: "Sugar.ActivityIcon",
	kind: enyo.Control,
	published: { activity: null, size: constant.iconSizeStandard, x: -1, y: -1, colorized: false },
	classes: "web-activity",
	components: [
		{ name: "icon", classes: "web-activity-icon"}
	],
	
	// Constructor
	create: function() {
		this.inherited(arguments);
		this.iconChanged();
		this.sizeChanged();
		this.xChanged();
		this.yChanged();
	},

	// Render
	rendered: function() {
		this.inherited(arguments);
		
		// If colorized		
		if (this.colorized) {
			// Try to find colorized version in cache
			var node = this.$.icon.hasNode();
if (node == null || node === undefined)
	console.log(this.activity.icon + " is null");
			var name = this.activity.directory+"/"+this.activity.icon;
			for (var i = 0 ; i < iconColorCache.names.length ; i++)
				if (iconColorCache.names[i] == name) {
					node.style.backgroundImage = iconColorCache.values[i];
					return;
				}
			
			// Build it
			iconLib.colorize(node, preferences.getColor(), function() {
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
		if (this.y != -1) this.applyStyle("margin-top", this.y+"px");
	},
	
	iconChanged: function() {
		if (this.activity != null)
			this.$.icon.applyStyle("background-image", "url(" + this.activity.directory+"/"+this.activity.icon + ")");
	},
	
	sizeChanged: function() {
		this.$.icon.applyStyle("width", this.size+"px");
		this.$.icon.applyStyle("height", this.size+"px");
		this.$.icon.applyStyle("background-size", this.size+"px "+this.size+"px");
	},
	
	activityChanged: function() {
		this.iconChanged();
	}
});