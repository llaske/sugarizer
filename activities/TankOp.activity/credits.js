
// Credits popup
enyo.kind({
	name: "TankOp.CreditsPopup",
	kind: "Popup",
	classes: "credits-popup",
	centered: true,
	modal: true,
	floating: true, 	
	components: [	
		{ kind: "Scroller", classes: "credit-content no-select-content", components: [	
			{ kind: "Image", src: "images/hq_blue.png", classes: "credit-image-hq" },
			{ kind: "Image", src: "images/target.png", classes: "credit-image-target" },
			{ kind: "Image", src: "images/tank_red_0.png", classes: "credit-image-tankred" },
			{ content: "concept and code", classes: "credit-title" },
			{ content: "Lionel Laské", classes: "credit-name" },
			{ kind: "Image", src: "images/tank_blue_2.png", classes: "credit-image-tank" },		
			{ content: "arts", classes: "credit-title" },
			{ content: "Vicki Wenderlich (game unit)", classes: "credit-name" },
			{ content: "Tux4kids (LCD Display)", classes: "credit-name" },
			{ content: "Mister Pixel from The Noun Project (keyboard icon)", classes: "credit-name" },		
			{ content: "None Shall Pass font from KC Fonts (military font)", classes: "credit-name" },
			{ kind: "Image", src: "images/helo_blue_2.png", classes: "credit-image-helo" },
			{ content: "music", classes: "credit-title" },
			{ content: "Ride of the Valkyries, Richard Wagner, Americain Symphony Orchestra 1921", classes: "credit-name" },	
			{ kind: "Image", src: "images/soldier_blue_2.png", classes: "credit-image-soldier" },		
			{ content: "sounds effects", classes: "credit-title" },
			{ content: "fridobeck from freesound (explosion)", classes: "credit-name" },	
			{ content: "joshfeed from freesound (missed)", classes: "credit-name" },	
			{ content: "DANIpeNet from freesound (mission complete)", classes: "credit-name" },	
			{ content: "juskiddink from freesound (mission failed)", classes: "credit-name" }
		]}
	],
	
	// Constructor
	create: function() {
		this.inherited(arguments);
	},
	
	rendered: function() {
	}
});