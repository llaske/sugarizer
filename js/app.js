
// Sugar Libraries (initialized by require)
var iconLib;
var xoPalette;


// Constants
var sizeOwner = 100;
var sizeRadius = 200;


// Main app class
enyo.kind({
	name: "SugarDesktop",
	kind: enyo.Control,
	components: [
		{name: "owner", onclick: "changeColor", classes: "owner-icon"},
		{name: "activitybox", components: []}
	],
	
	// Constructor
	create: function() {
		this.inherited(arguments);
		this.init();
	},
	
	// Init desktop
	init: function() {
		// Clean desktop
		var items = [];
		enyo.forEach(this.$.activitybox.getControls(), function(item) {	items.push(item); });		
		for (var i = 0 ; i < items.length ; i++) { items[i].destroy(); };
		
		// Get desktop size
		var canvas = document.getElementById("canvas");
		var canvas_centery = parseFloat(canvas.offsetHeight)/2.0;
		var canvas_centerx = parseFloat(canvas.offsetWidth)/2.0
		
		// Draw XO owner
		this.$.owner.applyStyle("margin-left", (canvas_centerx-sizeOwner/4)+"px");
		this.$.owner.applyStyle("margin-top", (canvas_centery-sizeOwner/4)+"px");
		
		// Draw activity icons;	
		var activitiesList = preferences.getActivities();
		var base_angle = ((Math.PI*2.0)/parseFloat(activitiesList.length));
		for (var i = 0 ; i < activitiesList.length ; i++) {
			var activity = activitiesList[i];
			var angle = base_angle*parseFloat(i);
			this.$.activitybox.createComponent(
				{kind: "SugarWebActivity", activity: activity, x: canvas_centerx+Math.cos(angle)*sizeRadius, y: canvas_centery+Math.sin(angle)*sizeRadius},
				{owner: this}).render();
		}
	},

	// Render
	rendered: function() {
		this.inherited(arguments);
		iconLib.colorize(this.$.owner.hasNode(), preferences.getColor());
	},
	
	// Change color
	changeColor: function() {
		preferences.nextColor();
		this.init();
		this.render();
	}
});
