

// Class to load all game images in cache
enyo.kind({
	name: "ImageCache",
	kind: enyo.Control,
	events: { onCacheLoaded: "" },
	components: [
		// Preload images
		{kind: "Image", id: "endgame_victory", src:"images/endgame_victory.png", classes: "image-preload", onload: "imageLoaded" },
		{kind: "Image", id: "endgame_defeat", src:"images/endgame_defeat.png", classes: "image-preload", onload: "imageLoaded" },
		{kind: "Image", id: "target", src:"images/target.png", classes: "image-preload", onload: "imageLoaded" },
		{kind: "Image", id: "move", src:"images/move.png", classes: "image-preload", onload: "imageLoaded" },
		{kind: "Image", id: "grass", src:"images/grass.png", classes: "image-preload", onload: "imageLoaded" },
		{kind: "Image", id: "trees", src:"images/trees.png", classes: "image-preload", onload: "imageLoaded" },
		{kind: "Image", id: "mountain", src:"images/mountain.png", classes: "image-preload", onload: "imageLoaded" },
		{kind: "Image", id: "water", src:"images/water.png", classes: "image-preload", onload: "imageLoaded" },
		{kind: "Image", id: "explosion_1", src:"images/explosion_1.png", classes: "image-preload", onload: "imageLoaded" },
		{kind: "Image", id: "explosion_2", src:"images/explosion_2.png", classes: "image-preload", onload: "imageLoaded" },
		{kind: "Image", id: "explosion_3", src:"images/explosion_3.png", classes: "image-preload", onload: "imageLoaded" },
		{kind: "Image", id: "explosion_4", src:"images/explosion_4.png", classes: "image-preload", onload: "imageLoaded" },
		{kind: "Image", id: "explosion_5", src:"images/explosion_5.png", classes: "image-preload", onload: "imageLoaded" },
		{kind: "Image", id: "explosion_6", src:"images/explosion_6.png", classes: "image-preload", onload: "imageLoaded" },
		{kind: "Image", id: "explosion_7", src:"images/explosion_7.png", classes: "image-preload", onload: "imageLoaded" },
		{kind: "Image", id:"helo_blue_0", src:"images/helo_blue_0.png", classes: "image-preload", onload: "imageLoaded" },
		{kind: "Image", id:"helo_blue_1", src:"images/helo_blue_1.png", classes: "image-preload", onload: "imageLoaded" },
		{kind: "Image", id:"helo_blue_2", src:"images/helo_blue_2.png", classes: "image-preload", onload: "imageLoaded" },
		{kind: "Image", id:"helo_blue_3", src:"images/helo_blue_3.png", classes: "image-preload", onload: "imageLoaded" },
		{kind: "Image", id:"helo_red_0", src:"images/helo_red_0.png", classes: "image-preload", onload: "imageLoaded" },
		{kind: "Image", id:"helo_red_1", src:"images/helo_red_1.png", classes: "image-preload", onload: "imageLoaded" },
		{kind: "Image", id:"helo_red_2", src:"images/helo_red_2.png", classes: "image-preload", onload: "imageLoaded" },
		{kind: "Image", id:"helo_red_3", src:"images/helo_red_3.png", classes: "image-preload", onload: "imageLoaded" },
		{kind: "Image", id:"hq_blue", src:"images/hq_blue.png", classes: "image-preload", onload: "imageLoaded" },
		{kind: "Image", id:"hq_red", src:"images/hq_red.png", classes: "image-preload", onload: "imageLoaded" },
		{kind: "Image", id:"soldier_blue_0", src:"images/soldier_blue_0.png", classes: "image-preload", onload: "imageLoaded" },
		{kind: "Image", id:"soldier_blue_1", src:"images/soldier_blue_1.png", classes: "image-preload", onload: "imageLoaded" },
		{kind: "Image", id:"soldier_blue_2", src:"images/soldier_blue_2.png", classes: "image-preload", onload: "imageLoaded" },
		{kind: "Image", id:"soldier_blue_3", src:"images/soldier_blue_3.png", classes: "image-preload", onload: "imageLoaded" },
		{kind: "Image", id:"soldier_red_0", src:"images/soldier_red_0.png", classes: "image-preload", onload: "imageLoaded" },
		{kind: "Image", id:"soldier_red_1", src:"images/soldier_red_1.png", classes: "image-preload", onload: "imageLoaded" },
		{kind: "Image", id:"soldier_red_2", src:"images/soldier_red_2.png", classes: "image-preload", onload: "imageLoaded" },
		{kind: "Image", id:"soldier_red_3", src:"images/soldier_red_3.png", classes: "image-preload", onload: "imageLoaded" },
		{kind: "Image", id:"canon_blue_0", src:"images/canon_blue_0.png", classes: "image-preload", onload: "imageLoaded" },
		{kind: "Image", id:"canon_blue_1", src:"images/canon_blue_1.png", classes: "image-preload", onload: "imageLoaded" },
		{kind: "Image", id:"canon_blue_2", src:"images/canon_blue_2.png", classes: "image-preload", onload: "imageLoaded" },
		{kind: "Image", id:"canon_blue_3", src:"images/canon_blue_3.png", classes: "image-preload", onload: "imageLoaded" },
		{kind: "Image", id:"canon_red_0", src:"images/canon_red_0.png", classes: "image-preload", onload: "imageLoaded" },
		{kind: "Image", id:"canon_red_1", src:"images/canon_red_1.png", classes: "image-preload", onload: "imageLoaded" },
		{kind: "Image", id:"canon_red_2", src:"images/canon_red_2.png", classes: "image-preload", onload: "imageLoaded" },
		{kind: "Image", id:"canon_red_3", src:"images/canon_red_3.png", classes: "image-preload", onload: "imageLoaded" },
		{kind: "Image", id:"tank_blue_0", src:"images/tank_blue_0.png", classes: "image-preload", onload: "imageLoaded" },
		{kind: "Image", id:"tank_blue_1", src:"images/tank_blue_1.png", classes: "image-preload", onload: "imageLoaded" },
		{kind: "Image", id:"tank_blue_2", src:"images/tank_blue_2.png", classes: "image-preload", onload: "imageLoaded" },
		{kind: "Image", id:"tank_blue_3", src:"images/tank_blue_3.png", classes: "image-preload", onload: "imageLoaded" },
		{kind: "Image", id:"tank_red_0", src:"images/tank_red_0.png", classes: "image-preload", onload: "imageLoaded" },
		{kind: "Image", id:"tank_red_1", src:"images/tank_red_1.png", classes: "image-preload", onload: "imageLoaded" },
		{kind: "Image", id:"tank_red_2", src:"images/tank_red_2.png", classes: "image-preload", onload: "imageLoaded" },
		{kind: "Image", id:"tank_red_3", src:"images/tank_red_3.png", classes: "image-preload", onload: "imageLoaded" }
	],
	
	// Constructor
	create: function() {
		this.imagesToLoad = 49;	
		this.inherited(arguments);
	},
	
	// One image load
	imageLoaded: function() {
		if (--this.imagesToLoad == 0)
			this.doCacheLoaded();
	}
});