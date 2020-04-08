// Entry component with image and sound
enyo.kind({
	name: "TamTam.Item",
	kind: enyo.Control,
	published: { name: "" },
	classes: "item",
	components: [
		{ name: "itemImage", classes: "itemImage", kind: "Image", ontap: "play" }
	],
	events: {
		onSelectionChange:""
	},

	// Constructor
	create: function() {
		this.inherited(arguments);
		this.nameChanged();
	},

	// Item setup
	nameChanged: function() {
		if(currentPianoMode === this.name) {
			this.$.itemImage.setAttribute("src", "images/database/"+this.name+"sel.png");
		} else {
			this.$.itemImage.setAttribute("src", "images/database/"+this.name+".png");
		}
	},

	deselect: function() {
		if(this.$.itemImage !== undefined) {
			this.$.itemImage.setAttribute("src", "images/database/"+this.name+".png");
		}
	},

	// Play sound using the media
	play: function() {
		this.doSelectionChange({toChange: currentPianoMode});
		currentPianoMode = this.name;
		this.nameChanged();
		if (this.name != null) {
			tonePlayer.playSound("audio/database/"+this.name+".mp3");
		}
	},
});
