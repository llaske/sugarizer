
// Credit screen class
enyo.kind({
	name: "FoodChain.Credits",
	kind: enyo.Control,
	classes: "board credits-popup",
	components: [
		{ kind: "Scroller", classes: "credit-content", components: [
			{ classes: "two-column-credits", components: [
				{ name: "concept", classes: "credit-title" },
				{ content: "Lionel Laské", classes: "credit-name" },
				{ name: "arts", classes: "credit-title" },
				{ content: "Art4Apps (learn & build game)", classes: "credit-name" },
				{ content: "Vicki Wenderlich (play game)", classes: "credit-name" },
				{ content: "Mathafix (icon)", classes: "credit-name" },
				{ content: "Ray Larabie (home font)", classes: "credit-name" },
				{ name: "music", classes: "credit-title" },
				{ content: "part of Popcorn by Gershon Kingsley", classes: "credit-name" },	
				{ name: "sound", classes: "credit-title" },
				{ content: "Charel Sytze (applause)", classes: "credit-name" },	
				{ content: "Unchaz (disappointment)", classes: "credit-name" },	
				{ content: "Esformouse (frog)", classes: "credit-name" },	
				{ content: "Galeky (flyes)", classes: "credit-name" },	
				{ content: "Novino (snake)", classes: "credit-name" }
			]},
			{kind: "Canvas", name: "canvas", classes: "emul-canvas", attributes: {width: 300, height: 600}}
		]},	
		{ name: "home", kind: "ShadowButton", img: "home", classes: "home", ontap: "home" },		
		
		// Preload iamges
		{kind: "Image", id: "frog4", src:"images/frog4.png", classes: "image-preload", onload: "initCanvas" },
		{kind: "Image", id: "fly1", src:"images/fly1.png", classes: "image-preload" },
		{kind: "Image", id: "snake4", src:"images/snake4.png", classes: "image-preload" },		
		
		// End of sound event
		{kind: "Signals", onEndOfSound: "endOfSound"}
	],
	
	// Constructor, save home
	create: function() {
		this.inherited(arguments);
		
		this.setLocale();
		
		// Init soundtrack
		this.soundtrack = "audio/popcorn";
	},
	
	// Localization changed, update string resource
	setLocale: function() {
		this.$.concept.setContent(__$FC("concept")); 
		this.$.arts.setContent(__$FC("arts"));
		this.$.music.setContent(__$FC("music"));
		this.$.sound.setContent(__$FC("sound"));
	},
	
	// Image loaded, display elements of play game
	initCanvas: function() {
		this.ctx = this.$.canvas.node.getContext('2d');	
		var zoom = FoodChain.getZoomLevel();
		this.$.canvas.hasNode().style.MozTransform = "scale("+zoom+")";
		this.$.canvas.hasNode().style.MozTransformOrigin = "0 0";
		this.$.canvas.hasNode().style.zoom = zoom;		
		this.ctx.clearRect(0, 0, this.$.canvas.attributes.width, this.$.canvas.attributes.height);	
		
		var fly = new Sprite({x: 150, y: 50, heading: 0, images: ["fly1"], width: 58, height: 86, index: 0});
		fly.draw(this.ctx);
		
		var frog = new Sprite({x: 150, y: 200, heading: 90, images: ["frog4"], width: 116, height: 172, index: 0});
		frog.draw(this.ctx);
		
		var snake = new Sprite({x: 150, y: 450, heading: 90, images: ["snake4"], width: 100, height: 250, index: 0});
		snake.draw(this.ctx);
	},
	
	// Loop on the theme
	endOfSound: function(e, s) {
		if (s.sound == this.soundtrack)
			FoodChain.sound.play(this.soundtrack);
	},
	
	// Go to the home page of the app
	home: function() {
		FoodChain.goHome();
	}	
});