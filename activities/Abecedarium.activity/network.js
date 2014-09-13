

// Network check component
enyo.kind({
	name: "Abcd.NetworkCheck",
	kind: enyo.Control,
	classes: "networkCheck",
	published: { connected: false },
	components: [
		{name: "box", components: []}	
	],
	
	// Constructor
	rendered: function() {
		this.inherited(arguments);
	},
	
	// Check the connection
	check: function() {
		// Remove previous attempt
		var items = [];
		enyo.forEach(this.$.box.getControls(), function(item) {
			items.push(item);
		});		
		for (var i = 0 ; i < items.length ; i++) {
			items[i].destroy();
		}
		
		// Ping network
		this.$.box.createComponent(
			{kind: "Image", showing: false, src: "images/database/_ping.png?"+(new Date()).getTime(), onload: "networkOK", onerror: "networkKO"},
			{owner: this}
		).render();	
	},
	
	// Update icons depending of network response
	networkOK: function() {
		this.connected = true;
	},
	
	networkKO: function() {	
		this.connected = false;
	}
});
