

// Network check component
enyo.kind({
	name: "FoodChain.NetworkCheck",
	kind: enyo.Control,
	classes: "networkCheck",
	published: { connected: false },
	components: [
		{name: "box", components: []}	
	],
	
	// Constructor
	create: function() {
		this.inherited(arguments);
		this.then = null;
	},
	
	// Constructor
	rendered: function() {
		this.inherited(arguments);
	},
	
	// Check the connection
	check: function(then) {
		// Remove previous attempt
		var items = [];
		enyo.forEach(this.$.box.getControls(), function(item) {
			items.push(item);
		});		
		for (var i = 0 ; i < items.length ; i++) {
			items[i].destroy();
		}
		
		// Ping network
		this.then = then;
		this.$.box.createComponent(
			{kind: "Image", showing: false, src: "images/cards/_ping.png?"+(new Date()).getTime(), onload: "networkOK", onerror: "networkKO"},
			{owner: this}
		).render();	
	},
	
	// Update icons depending of network response
	networkOK: function() {
		this.connected = true;
		if (this.then) this.then(this.connected);
	},
	
	networkKO: function() {
		this.connected = false;
		if (this.then) this.then(this.connected);		
	}
});
