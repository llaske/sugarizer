

// Network check component
enyo.kind({
	name: "Abcd.NetworkCheck",
	kind: enyo.Control,
	classes: "networkCheck",
	components: [
		{name: "box", components: []},	
		{name: "networkChecking", kind: "Image", src: "images/spinner-light.gif", showing: false, classes: "networkIcon"},
		{name: "networkOK", kind: "Image", src: "images/network-ok.png", showing: false, classes: "networkIcon"},
		{name: "networkKO", kind: "Image", src: "images/network-ko.png", showing: false, classes: "networkIcon"}	
	],
	
	// Constructor
	rendered: function() {
		this.inherited(arguments);
	},
	
	// Check the connection
	check: function() {
		// Not needed when local database used
		if (Abcd.context.database == "") {
			Abcd.changeVisibility(this, {networkChecking: false, networkOK: false, networkKO: false});
			return;
		}
		Abcd.changeVisibility(this, {networkChecking: true, networkOK: false, networkKO: false});

		// Remove previous attempt
		var items = [];
		enyo.forEach(this.$.box.getControls(), function(item) {
			items.push(item);
		});		
		for (var i = 0 ; i < items.length ; i++) {
			items[i].destroy();
		}
		
		// Ping network
		this.$.networkChecking.show();
		this.$.box.createComponent(
			{kind: "Image", showing: false, src: Abcd.context.database+"images/database/_ping.png?"+(new Date()).getTime(), onload: "networkOK", onerror: "networkKO"},
			{owner: this}
		).render();	
	},
	
	// Update icons depending of network response
	networkOK: function() {
		Abcd.changeVisibility(this, {networkChecking: false, networkOK: true, networkKO: false});
	},
	
	networkKO: function() {	
		Abcd.changeVisibility(this, {networkChecking: false, networkOK: false, networkKO: true});
	}
});


// Network setting popup
enyo.kind({
	name: "Abcd.NetworkPopup",
	kind: "onyx.Popup",
	classes: "network-popup",
	centered: true,
	modal: true,
	floating: true,	
	events: {
		onNetworkChanged: ""
	},	
	components: [
		{kind: "Image", src: "images/network-black.png", classes: "networkbImage"},	
		{name: "settings", kind: "enyo.Input", classes: "networkValue"},
		{kind: "Image", src: "images/checkw.png", classes: "checkwButton", ontap: "checkTaped"}
	],
	
	// Constructor
	create: function() {
		this.inherited(arguments);
	},

	rendered: function() {
		this.inherited(arguments);	
	},

	// Display popup with current database value	
	display: function() {
		this.$.settings.setValue(Abcd.context.database);
		this.show();		
		this.$.settings.hasNode().focus();
	},
	
	// Check taped, set the new value, recheck
	checkTaped: function() {
		var newvalue = this.$.settings.getValue();
		if (newvalue != "")
			Abcd.context.database = this.$.settings.getValue();			
		this.hide();
		this.doNetworkChanged();
	}
});