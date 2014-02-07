

// Main app class
enyo.kind({
	name: "FoodChain.App",
	kind: enyo.Control,
	classes: "board",
	components: [		
		// Card box
		{ name: "glass", classes: "glass" },
		{ name: "cardbox", classes: "cardbox", components: [] },
		
		// Logo
		{ kind: "Image", src: "images/FoodChain.png", classes: "logo" },
		
		// Game button
		{ name: "LearnGame", kind: "ShadowButton", img: "one", classes: "game-LearnGame", ontap: "playGame", onenter: "showGameDescription", onleave: "hideGameDescription" },
		{ name: "BuildGame", kind: "ShadowButton", img: "two", classes: "game-BuildGame", ontap: "playGame", onenter: "showGameDescription", onleave: "hideGameDescription" },
		{ name: "PlayGame", kind: "ShadowButton", img: "three", classes: "game-PlayGame", ontap: "playGame", onenter: "showGameDescription", onleave: "hideGameDescription" },
		{ kind: "ShadowButton", img: "information", classes: "information", ontap: "showCredits" },
		
		// Popup for game title and description
		{ name: "popup", classes: "game-popup", components: [
			{ name: "title", classes: "game-title" },
			{ name: "description", classes: "game-description" }
		]},
		
		// End of sound event
		{kind: "Signals", onEndOfSound: "endOfSound"}
	],
	
	// Constructor, save home
	create: function() {
		this.inherited(arguments);
		FoodChain.context.home = this;
	
		// Start display card timer
		this.initCardStack();
		
		// Create game description
		this.$.popup.hide();
		this.games = [];
		this.setLocale();
		
		// Update context, no game playing
		FoodChain.context.game = "";
		FoodChain.context.object = this;
		
		// Init soundtrack
		this.soundtrack = "audio/popcorn";
	},
	
	// Localization, changed update cards and description
	setLocale: function() {
		// Update description
		this.games["LearnGame"] = { title: __$FC("learn"), description:  __$FC("learndesc") };
		this.games["BuildGame"] = { title: __$FC("build"), description:  __$FC("builddesc") };
		this.games["PlayGame"] = { title: __$FC("play"), description:  __$FC("playdesc") };	
		
		// Change card localization if any
		enyo.forEach(this.$.cardbox.getControls(), function(card) {
			card.setLocale();
		});
	},
	
	// Init card stack for the animation
	initCardStack: function() {
		// Pick randomly N cards
		this.cardcount = 0;
		this.cards = [];
		var i = 0;
		while (i < 12) {
			var index = Math.floor(Math.random()*FoodChain.cards.length); 
			var found = false;
			for (var j = 0 ; !found && j < this.cards.length-1 ; j++) {
				if (this.cards[j] == FoodChain.cards[index]) found = true;
			}
			if (!found) {
				this.cards.push(FoodChain.cards[index]);
				i++;
			}
		}
	},
	
	// Play soundtrack when rendered and restart at end
	rendered: function() {	
		// Play soundtrack
		FoodChain.sound.play(this.soundtrack);
		
		// Create timer for card animation
		this.createComponent({ name: "timer", kind: "Timer", baseInterval: 1200, onTriggered: "displayCard" }, {owner: this});		
	},
	
	endOfSound: function(e, s) {
		if (s == this.soundtrack)
			FoodChain.sound.play(this.soundtrack);
	},
	
	// Display card animation
	displayCard: function() {	
		// All cards displayed
		if (this.cardcount == this.cards.length) {
			this.$.cardbox.destroyComponents();
			this.$.cardbox.render();
			this.initCardStack();
			return;
		}
		
		// Display a new card
		var x = Math.floor(Math.random()*(FoodChain.getConfig("screen-width")-FoodChain.getConfig("card-width")));
		var y = Math.floor(Math.random()*400);
		this.$.cardbox.createComponent({ kind: "FoodChain.Card", cardname: this.cards[this.cardcount], x: x, y: y, z: 0}).render();
		this.cardcount = this.cardcount + 1;
	},
	
	// Show/hide game description
	showGameDescription: function(s) {
		this.$.title.setContent(this.games[s.name].title+":");
		this.$.title.addClass("game-color-"+s.name);
		this.$.description.setContent(this.games[s.name].description);
		this.$.description.addClass("game-color-"+s.name);
		this.$.popup.show();
	},
	
	hideGameDescription: function(s) {
		this.$.title.removeClass("game-color-"+s.name);	
		this.$.description.removeClass("game-color-"+s.name);		
		this.$.popup.hide();
	},
	
	// Show credit page
	showCredits: function() {
		this.$.timer.stop();
		this.removeComponent(this.$.timer);	
		FoodChain.context.object = new FoodChain.Credits().renderInto(document.getElementById("body"));	
	},
	
	// Launch a game
	playGame: function(s) {
		// Stop sound
		this.$.popup.hide();
		FoodChain.sound.pause();
		this.$.timer.stop();
		this.removeComponent(this.$.timer);
		var level = (s.level === undefined) ? 1 : s.level;

		// Launch Learn game
		if (s.name == "LearnGame") {
			FoodChain.context.object = new FoodChain.LearnGame({level: level}).renderInto(document.getElementById("body"));
		}
		
		// Launch Build game
		else if (s.name == "BuildGame") {
			FoodChain.context.object = new FoodChain.BuildGame({level: level}).renderInto(document.getElementById("body"));		
		}
		
		// Launch Play game
		else if (s.name == "PlayGame") {
			FoodChain.context.object = new FoodChain.PlayGame({level: level}).renderInto(document.getElementById("body"));
		}		
	}
});
