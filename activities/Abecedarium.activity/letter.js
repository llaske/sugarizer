// Letter component
enyo.kind({
	name: "Abcd.Letter",
	kind: "Abcd.Item",
	published: { letter: "" },
	classes: "itemLetter",
	showing: false,
	components: [
		{ name: "itemImage", kind: "Image", classes: "itemImage", onload: "imageLoaded" }
	],
	
	// Constructor
	create: function() {
		this.inherited(arguments);
		this.letterChanged();
		this.selectedChanged();
	},
	
	// Display only when image is load
	imageLoaded: function() {
		if (this.letter !== "")
			this.show();
	},
	
	// Localization changed, nothing to do 
	setLocale: function() {
	},
	
	// Letter setup
	letterChanged: function() {
		if (this.letter !== "") {
			this.letter = this.letter.toLowerCase();	
			this.$.itemImage.setAttribute("src", "images/letters/"+this.letter+Abcd.context.casevalue+".png");
		}
	},
	
	// Play sound for this letter
	play: function(media) {	
		media.play(Abcd.context.getDatabase()+"audio/"+Abcd.context.lang+"/database/upper_"+this.letter.toUpperCase());
	}	
});	