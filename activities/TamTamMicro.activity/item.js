var firstTimePlayed = true; // HACK for Safari

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
		currentSimonMode = this.name;
		this.nameChanged();
		if (this.name != null) {
			var sound = 'audio/database/'+this.name+".mp3";
			if (firstTimePlayed) { // HACK: First time should be different on Safari
				tonePlayer.load(sound, function() {
					tonePlayer.play(0)
				});
				firstTimePlayed = false;
				return;
			} else {  // HACK: Only this sequence works on Safari
				tonePlayer.playSound(sound);
				tonePlayer.play(0);
			}
		}
	},
});
