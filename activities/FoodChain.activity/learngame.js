// Level config
FoodChain.learnLevels = [
	{ size: 2, count: 5, time: 10 },  // Level 1
	{ size: 2, count: 10, time: 15 }, // Level 2
	{ size: 2, count: 15, time: 20 }, // Level 3
	{ size: 3, count: 5, time: 10 },  // Level 4
	{ size: 3, count: 10, time: 15 }, // Level 5
	{ size: 3, count: 15, time: 20 }  // Level 6
];

// Learn Game class
enyo.kind({
	name: "FoodChain.LearnGame",
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
			{ name: "startbox", classes: "start-box", components: [] },
			{ components: [
				{ name: "herbbox", classes: "end-box", ontap: "chooseAsEnd", ondrop: "drop", ondragover: "dragover", components: [
					{ name: "herbname", classes: "box-name herb-color" }
				]},
				{ name: "carnbox", classes: "end-box", ontap: "chooseAsEnd", ondrop: "drop", ondragover: "dragover", components: [
					{ name: "carnname", classes: "box-name" }
				]},
				{ name: "omnibox", classes: "end-box omni-box-two", ontap: "chooseAsEnd", ondrop: "drop", ondragover: "dragover", components: [
					{ name: "omniname", classes: "box-name" }
				]}
			]},
			
			// Buttons bar
			{ name: "play", kind: "ShadowButton", img: "play", classes: "play", ontap: "play" },	
			{ name: "pause", kind: "ShadowButton", img: "pause", classes: "play", ontap: "pause" },	
			{ name: "forward", kind: "ShadowButton", img: "forward", classes: "restart", ontap: "next" },
			{ name: "home", kind: "ShadowButton", img: "home", classes: "home", ontap: "home" },
		
			// End of sound event
			{kind: "Signals", onEndOfSound: "endSound"}			
		]}		
	],
	
	// Constructor
	create: function() {
		this.inherited(arguments);
		this.cardlist = null;
		this.nextaction = 0;
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
		this.$.herbname.setContent(__$FC(FoodChain.feedStrategy[0].name));
		this.$.carnname.setContent(__$FC(FoodChain.feedStrategy[1].name));
		this.$.omniname.setContent(__$FC(FoodChain.feedStrategy[2].name));			
		
		// Update cards
		enyo.forEach(this.$.startbox.getControls(), function(card) {
			card.setLocale();
		});		
	},
	
	// Level changed, init board then start game
	levelChanged: function() {
		
		// Box handling
		FoodChain.context.level = this.level;
		if (FoodChain.learnLevels[this.level-1].size == 2) {
			FoodChain.addRemoveClass(this.$.herbbox, "herb-box-two", "herb-box-three");
			FoodChain.addRemoveClass(this.$.carnbox, "carn-box-two", "carn-box-three");
			FoodChain.addRemoveClass(this.$.omnibox, "omni-box-two", "omni-box-three");	
			this.$.omnibox.hide();
		} else {
			FoodChain.addRemoveClass(this.$.herbbox, "herb-box-three", "herb-box-two");
			FoodChain.addRemoveClass(this.$.carnbox, "carn-box-three", "carn-box-two");
			FoodChain.addRemoveClass(this.$.omnibox, "omni-box-three", "omni-box-two");			
			this.$.omnibox.show();
		}	
		this.dragobject = null;
		this.selectedobject = null;
		
		// Compute the card list to sort
		if (this.cardlist == null) {
			this.cardlist = FoodChain.randomFeedList(FoodChain.learnLevels[this.level-1].size, FoodChain.learnLevels[this.level-1].count);
		}
		
		// Display the first card
		this.currentcard = 0;
		var card = this.$.startbox.createComponent({ kind: "FoodChain.Card", cardname: this.cardlist[this.currentcard].cardname, x: 10, y: 10, ontap: "taped", ondragstart: "dragstart", ondragfinish: "dragfinish"}, {owner: this});	
		FoodChain.sound.play(card.sound);	
		
		// Saving context
		FoodChain.saveContext();
		
		// Button handling
		this.$.play.hide();
		this.$.pause.show();
		this.$.forward.hide();
		this.$.home.hide();
		
		// Timer and level init
		this.$.level.setContent(" "+this.level);
		this.timecount = {mins:0, secs:0, tenth:0};
		this.$.timercount.removeClass("timer-overtime");
		this.displayTimer();	
		
		this.render();
	},
	
	// Sound ended, start game
	endSound: function(e, s) {
		// What next ?
		if (this.nextaction == 1) {
			// Right play, next card or next level
			this.nextaction = 0;
			this.dragobject.getContainer().removeClass("box-win");			
			this.dragobject.destroy();
			this.dragobject = null;
			
			// Next level
			if (this.currentcard+1 == this.cardlist.length) {
				this.computeLevelScore();
				this.$.play.hide();
				this.$.pause.hide();				
				this.$.home.show();
				this.render();
				if (this.level != FoodChain.learnLevels.length)
					this.$.forward.show();

			// Display next card
			} else {
				this.currentcard = this.currentcard + 1;
				var card = this.$.startbox.createComponent({ kind: "FoodChain.Card", cardname: this.cardlist[this.currentcard].cardname, x: 5, y: 5, ontap: "taped", ondragstart: "dragstart", ondragfinish: "dragfinish"}, {owner: this});	
				FoodChain.sound.play(card.sound);	
				this.render();
			}
			
			return;
		}
		
		else if (this.nextaction == 2) {
			// Bad play, put card at start
			this.nextaction = 0;
			this.dragobject.getContainer().removeClass("box-lost");
			this.dragobject.setContainer(this.$.startbox);
			this.dragobject = null;
			this.render();
		}
		
		// Start timer
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
			if (currentcount >= FoodChain.learnLevels[this.level-1].time) {
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
		FoodChain.sound.play(s.sound);
		FoodChain.log(s.cardname+" taped");
		this.selectedobject = s;
		s.addClass("card-dragged");
	},
	
	// Card drag start, change style to dragged
	dragstart: function(s, e) {
		if (this.$.timer.paused)
			return true;	
		s.addClass("card-dragged");
		this.$.startbox.addClass("box-dragging");
		this.$.herbbox.addClass("box-dragging");
		this.$.carnbox.addClass("box-dragging");
		this.$.omnibox.addClass("box-dragging");
		FoodChain.sound.play(s.sound);
		this.dragobject = s;
		this.selectedobject = null;
	},
	
	// Card drag end, change style to not dragged
	dragfinish: function(s, e) {
		s.removeClass("card-dragged");
		this.$.startbox.removeClass("box-dragging");
		this.$.herbbox.removeClass("box-dragging");
		this.$.carnbox.removeClass("box-dragging");
		this.$.omnibox.removeClass("box-dragging");
	},
	
	// Drag over the box, allow dragging
	dragover: function(s, e) {
		if (this.dragobject == null)
			return true;
		e.preventDefault();
		return false;
	},
	
	// Choose the final box for the card, same as drop but without drag
	chooseAsEnd: function(s, e) {
		if (this.selectedobject == null)
			return true;
		this.selectedobject.removeClass("card-dragged");			
		this.dragobject = this.selectedobject;
		this.drop(s, e);
		this.selectedobject = null;
	},
	
	// Dropped in the box, check if correct
	drop: function(s, e) {
		if (this.dragobject == null || this.$.timer.paused)
			return true;		
		e.preventDefault();
		
		// Draw in the new box
		this.dragobject.setContainer(s);
		this.dragobject.moveTo(5,0);
		this.render();
		
		// Test if in the right box
		this.$.timer.pause();
		var win = (s.name.substring(0,4) == FoodChain.feedStrategy[this.cardlist[this.currentcard].strategy].name.substring(0,4));
		if (win) {
			this.nextaction = 1;
			this.addScore(1);
			FoodChain.sound.play("audio/applause");
			s.addClass("box-win");
		}
		else {
			this.nextaction = 2;
			FoodChain.sound.play("audio/disappointed");
			s.addClass("box-lost");
		}
	},
	
	// Compute score
	addScore: function(score) {
		FoodChain.context.score += score;
		this.$.score.setContent(String("0000"+FoodChain.context.score).slice(-4));
	},
	
	// Compute score for this level
	computeLevelScore: function() {
		var score = 0;
		var currentcount = this.timecount.mins * 60 + this.timecount.secs;
		if (currentcount < FoodChain.learnLevels[this.level-1].time) {
			score += (FoodChain.learnLevels[this.level-1].time - currentcount);
		}
		this.addScore(score);
	},	
	
	// Resume game
	play: function() {
		// Show cards
		enyo.forEach(this.$.startbox.getControls(), function(card) {
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
		enyo.forEach(this.$.startbox.getControls(), function(card) {
			card.hide();
		});
		
		// Show play button, hide pause button
		this.$.timer.pause();
		this.$.pause.hide();
		this.$.play.show();
		this.$.home.show();
	},
	
	// Go to the next level
	next: function() {
		this.level = this.level + 1;
		this.cardlist = null;
		this.levelChanged();
	},
	
	// Go to the home page of the app
	home: function() {
		this.$.timer.stop();
		FoodChain.goHome();
	}
});
