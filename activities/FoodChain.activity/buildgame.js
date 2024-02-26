// Level config
FoodChain.buildLevels = [
	{ size: 2, time: 2 }, // Level 1
	{ size: 3, time: 5 }, // Level 2
	{ size: 3, time: 3 }, // Level 3
	{ size: 3, time: 2 }, // Level 4
	{ size: 4, time: 5 }, // Level 5
	{ size: 4, time: 3 }, // Level 6
	{ size: 5, time: 3 }  // Level 7
];

// Build Game class
enyo.kind({
	name: "FoodChain.BuildGame",
	kind: enyo.Control,
	published: {level: 1},
	classes: "board",
	components: [
		{ name: "cards", components: [
			// Level - Score - Time bar
			{ components: [
				{ classes: "level-zone", components: [
					{ name: "textlevel", classes: "title level-value" },
					{ name: "level", content: "0", classes: "title level-value" }
				]},
				{ classes: "score-zone", components: [
					{ name: "textscore", classes: "title score-text" },
					{ name: "score", content: "0000", classes: "title score-value" },
					{ name: "timercount", content: "0:0,0", classes: "title timer-value" }					
				]}		
			]},	
			
			// Board zone
			{ name: "gamebox", classes: "box", ontap: "unselect", ondrop: "drop", ondragover: "dragover", components: [] },
			
			// Buttons bar
			{ name: "validate", kind: "ShadowButton", img: "validate", classes: "validate", ontap: "controlOrder" },
			{ name: "play", kind: "ShadowButton", img: "play", classes: "play", ontap: "play" },	
			{ name: "pause", kind: "ShadowButton", img: "pause", classes: "play", ontap: "pause" },	
			{ name: "restart", kind: "ShadowButton", img: "restart", classes: "restart", ontap: "restart" },
			{ name: "forward", kind: "ShadowButton", img: "forward", classes: "restart", ontap: "next" },
			{ name: "home", kind: "ShadowButton", img: "home", classes: "home", ontap: "home" },
		
			// End of sound event
			{kind: "enyo.Signals", onEndOfSound: "endSound"}			
		]}		
	],
	
	// Constructor
	create: function() {
		this.inherited(arguments);
		this.previous = null;
		this.mixed = null;
		this.createComponent({ name: "timer", kind: "Timer", paused: true, onTriggered: "updateTimer" }, {owner: this});		
		this.setLocale();
		this.$.score.setContent(String("0000"+FoodChain.context.score).slice(-4));
		FoodChain.context.game = this.kindName;		
		this.levelChanged();
	},
	
	// Localization changed, update cards and string resource
	setLocale: function() {
		// Update string resources
		this.$.textlevel.setContent(__$FC("level"));
		this.$.textscore.setContent(__$FC("score"));	

		// Update cards
		enyo.forEach(this.$.gamebox.getControls(), function(card) {
			card.setLocale();
		});		
	},
	
	// Level changed, init board then start game
	levelChanged: function() {
		// Delete current cards on board
		FoodChain.context.level = this.level;		
		var cards = [];
		enyo.forEach(this.$.gamebox.getControls(), function(card) {
			cards.push(card);
		});		
		for (var i = 0 ; i < cards.length ; i++) {
			cards[i].destroy();
		}
		
		// Compute the start chain
		if (this.mixed == null) {
			var same;
			do {
				// Pick a random chain and ensure it's not the same that the previous one
				this.chain = FoodChain.randomChain(FoodChain.buildLevels[this.level-1].size);
				if (this.previous == null || this.previous.length != this.chain.length) {
					same = false;
				} else {
					same = true;
					for (var i = 0 ; same && i < this.chain.length ; i++ ) {
						if (this.previous[i] != this.chain[i])
							same = false;
					}
				}
			}  while (same);
			this.mixed = FoodChain.mix(this.chain);
		}
	
		// Display cards
		var step = 99/this.mixed.length;
		var x = 5-this.mixed.length, y = 8;
		this.cards = [];
		for (var i = 0 ; i < this.mixed.length ; i++) {
			var autoplay = (i == 0) ? true: false;
			this.cards.push(this.$.gamebox.createComponent({ kind: "FoodChain.Card", cardname: this.mixed[i], x: x+"%", y: y, ontap: "taped", ondragstart: "dragstart", ondragfinish: "dragfinish"}, {owner: this}));
			if (i == 0) {
				FoodChain.sound.play(this.cards[i].sound);
			} else {
				this.cards[i].hide();
			}
			x = x + step;
		}
		
		// Box handling
		this.dragobject = null;
		this.selectedobject = null;
		this.zmax = 0;
		this.$.gamebox.removeClass("box-win");
		this.$.gamebox.removeClass("box-lost");
		
		// Saving context
		FoodChain.saveContext();
		
		// Button handling
		this.$.play.hide();
		this.$.pause.show();
		this.$.validate.show();
		this.$.restart.hide();
		this.$.forward.hide();
		this.$.home.hide();
		
		// Timer and level init
		this.$.level.setContent(" "+this.level);
		this.timecount = {mins:0, secs:0, tenth:0};
		this.$.timercount.removeClass("timer-overtime");
		this.displayTimer();
		this.$.timer.pause();		
		
		this.render();
	},
	
	// Sound ended, play next card if any
	endSound: function(e, s) {
		// All is already displayed
		if (this.cards == null)
			return;
			
		// Display next card
		for (var i = 0 ; i < this.cards.length ; i++ ) {
			if (this.cards[i] != null && FoodChain.soundMatch(this.cards[i].sound,s.sound)) {
				this.cards[i] = null;
				if (i+1 < this.cards.length) {
					this.cards[i+1].show();
					FoodChain.sound.play(this.cards[i+1].sound);
					return;
				}
			}
		}
		
		// All card displayed, start timer
		this.cards = null;
		this.$.timer.resume();		
	},
	
	// Display timer value
	displayTimer: function() {
		this.$.timercount.setContent(this.timecount.mins+":"+String("00"+this.timecount.secs).slice(-2)+","+this.timecount.tenth);
	},
	
	// Update timer
	updateTimer: function(s, e) {
		this.timecount.tenth = this.timecount.tenth + 1;
		if (this.timecount.tenth == 10) {
			this.timecount.tenth = 0;
			this.timecount.secs = this.timecount.secs + 1;
			var currentcount = this.timecount.mins * 60 + this.timecount.secs;
			if (currentcount >= FoodChain.buildLevels[this.level-1].time) {
				this.$.timercount.addClass("timer-overtime");
			}
			if (this.timecount.secs == 60) {
				this.timecount.secs = 0;
				this.timecount.mins = this.timecount.mins + 1;
			}
		}
		this.displayTimer();
	},
	
	// Play sound when card taped, set card as selected (avoid need of drag&drop)
	taped: function(s, e) {
		if (this.$.timer.paused)
			return true;	
		FoodChain.log(s.cardname+" taped");
		
		// Use selection to avoid drag&drop
		if (this.selectedobject == null) {
			// No selection, set card as selected, play sound
			this.selectedobject = s;
			s.addClass("card-dragged");	
			FoodChain.sound.play(s.sound);
			this.toTop(s);
			return true;
		} else if (s != this.selectedobject) {
			// A card is already selected, swap the 2 card
			var startx = this.selectedobject.getX(), starty = this.selectedobject.getY();
			var endx = s.getX(), endy = s.getY();
			this.selectedobject.moveTo(endx, endy);
			s.moveTo(startx, starty);
			this.selectedobject.removeClass("card-dragged");
			this.selectedobject = null;
			return true;
		}
	},
	
	// Tap on the board unselect current card
	unselect: function() {
		if (this.selectedobject != null) {
			this.selectedobject.removeClass("card-dragged");
			this.selectedobject = null;		
		}
	},
	
	// Card drag start, change style to dragged
	dragstart: function(s, e) {
		if (this.$.timer.paused)
			return true;	
		s.addClass("card-dragged");
		this.$.gamebox.addClass("box-dragging");
		FoodChain.sound.play(s.sound);
		this.dragobject = s;
		this.selectedobject = null;
		this.dragx = 0;
		this.dragy = e.clientY-s.y;
		this.toTop(this.dragobject);
	},
	
	// Card drag end, change style to not dragged
	dragfinish: function(s, e) {
		s.removeClass("card-dragged");
		this.$.gamebox.removeClass("box-dragging");
	},
	
	// Drag over the box, allow dragging
	dragover: function(s, e) {
		if (this.dragobject == null)
			return true;
		e.preventDefault();
		return false;
	},
	
	// Dropped in the box, change card parent
	drop: function(s, e) {
		if (this.dragobject == null || this.$.timer.paused)
			return true;		
		e.preventDefault();
		this.dragobject.moveTo((e.clientX/window.innerWidth)*100+"%", e.clientY-this.dragy);
		this.dragobject = null;
	},
	
	// Set the card to top of the stack
	toTop: function(card) {
		this.zmax = this.zmax + 1;
		card.applyStyle("z-index", this.zmax)
	},
	
	// Validate cards order
	controlOrder: function() {
		// Stop timer
		this.$.timer.pause();
		
		// Hide button
		this.$.play.hide();
		this.$.pause.hide();
		this.$.validate.hide();		
		
		// Get cards
		var cards = [];
		enyo.forEach(this.$.gamebox.getControls(), function(card) {
			cards.push(card);
		});	
		
		// Sort using x card position
		cards = cards.sort(function (c1, c2) { return c1.x.replace("%","") - c2.x.replace("%",""); });
		
		// Check order
		var win = true;
		for (var i = 0 ; win && i < this.chain.length ; i++) {
			if (cards[i].cardname != this.chain[i])
				win = false;
		}
		
		// Play win or loose sound
		if (win) {
			FoodChain.sound.play("audio/applause");
			this.$.gamebox.addClass("box-win");
			this.computeScore();
			this.$.home.show();
			if (this.level != FoodChain.buildLevels.length)
				this.$.forward.show();
		}
		else {
			FoodChain.sound.play("audio/disappointed");
			this.$.gamebox.addClass("box-lost");
			this.$.home.show();
			this.$.restart.show();
		}
	},
	
	// Compute score
	computeScore: function() {
		var score = 10;
		var currentcount = this.timecount.mins * 60 + this.timecount.secs;
		if (currentcount < FoodChain.buildLevels[this.level-1].time) {
			score += (FoodChain.buildLevels[this.level-1].time - currentcount);
		}
		FoodChain.context.score += score;
		this.$.score.setContent(String("0000"+FoodChain.context.score).slice(-4));
	},
	
	// Resume game
	play: function() {
		// Show cards
		enyo.forEach(this.$.gamebox.getControls(), function(card) {
			card.show();
		});
		
		// Show pause button, hide play button
		this.$.timer.resume();
		this.$.play.hide();		
		this.$.pause.show();
		this.$.home.hide();
	},
	
	// Pause game
	pause: function() {
		// Hide cards
		enyo.forEach(this.$.gamebox.getControls(), function(card) {
			card.hide();
		});
		
		// Show play button, hide pause button
		this.$.timer.pause();
		this.$.pause.hide();
		this.$.play.show();
		this.$.home.show();
	},
	
	// Restart the current level
	restart: function() {
		this.levelChanged();
	},
	
	// Go to the next level
	next: function() {
		this.level = this.level + 1;
		this.previous = this.chain;
		this.mixed = null;
		this.levelChanged();
	},
	
	// Go to the home page of the app
	home: function() {
		this.$.timer.stop();	
		FoodChain.goHome();
	}	
});
