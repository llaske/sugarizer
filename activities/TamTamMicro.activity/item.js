// Entry component with image and sound
enyo.kind({
	name: "TamTam.Item",
	kind: enyo.Control,
	published: { name: "" },
	classes: "item",
	components: [
		{ name: "itemImage", classes: "itemImage", kind: "Image", ontap: "play" }
	],
	
	// Constructor
	create: function() {
		this.inherited(arguments);
		this.nameChanged();
		this.sound = null;
	},
	
	// Item setup
	nameChanged: function() {
		if(currentPianoMode === this.name) {
			this.$.itemImage.setAttribute("src", "images/database/"+this.name+"sel.png");
		} else {
			this.$.itemImage.setAttribute("src", "images/database/"+this.name+".png");
		}
	},
	
	// Play sound using the media
	play: function() {
		currentPianoMode = this.name;
		this.$.itemImage.setAttribute("src", "images/database/"+this.name+"sel.png");
		if (this.name != null) {
			this.sound = "audio/database/"+this.name;
			sound.play(this);
		}
	},
});