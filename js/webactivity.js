// Class for a Sugar Web activity
enyo.kind({
	name: "SugarWebActivity",
	kind: enyo.Control,
	published: { activity: null, size: 55, x: 0, y: 0 },
	classes: "web-activity",
	components: [
		{ name: "icon", onclick: "runActivity", classes: "web-activity-icon"}
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
		if (this.activity.instances.length > 0)
			iconLib.colorize(this.$.icon.hasNode(), preferences.getColor());
	},
	
	// Property changed
	xChanged: function() {
		if (this.x != -1) this.applyStyle("margin-left", this.x+"px");
	},
	
	yChanged: function() {
		if (this.y != -1) this.applyStyle("margin-top", this.y+"px");
	},
	
	iconChanged: function() {
		this.$.icon.applyStyle("background-image", "url(" + this.activity.directory+"/"+this.activity.icon + ")");
	},
	
	sizeChanged: function() {
		this.$.icon.applyStyle("width", this.size+"px");
		this.$.icon.applyStyle("height", this.size+"px");
		this.$.icon.applyStyle("background-size", this.size+"px "+this.size+"px");
	},
	
	// Run activity
	runActivity: function() {
		// Save context then run the activity in the context
		preferences.runActivity(this.activity);
	}
});