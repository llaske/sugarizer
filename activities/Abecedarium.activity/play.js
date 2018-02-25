

// Collections size on the screen
var entriesByGame = 4;
// var score=0;


// Learn app class
enyo.kind({
	name: "Abcd.Play",
	kind: enyo.Control,
	classes: "board",
	published: {
		context: null,
	},	
	components: [
		{kind: "Signals", onEndOfSound: "endSound"},
		{components: [
			{name: "colorBar", classes: "colorBar"},		
			{name: "home", kind: "Abcd.HomeButton"},
			{kind: "Abcd.CaseButton"},
			{kind: "Abcd.LanguageButton"}
		]},
		{components: [
			{name: "filterLetter", kind: "Abcd.Letter", letter: "", classes: "filterLetter"},
			{name: "filterCollection", kind: "Abcd.Collection", index: 0, classes: "filterCollection", showing: false},
			{name: "itemCount", content: "-/-", classes: "itemCount", showing: false},		
			{name: "back", kind: "Image", src: "images/back.png", showing: false, classes: "standardButton backButton", ontap: "backTaped"},
			{tag:'p',content:"",name:"score",showing:false,classes:"score"},
			{name: "filter", kind: "Image", src: "images/filter.png", showing: false, classes: "standardButton filterButton", ontap: "filterTaped"},
			{name: "check", kind: "Image", src: "images/check.png", showing: false, classes: "standardButton checkButton", ontap: "checkTaped"}
		]},		
		{name: "resultPopup", kind: "Abcd.ResultPopup"},	
		{name: "box", classes: "playbox", components: [
		]},
		{name: "filterPopup", kind: "Abcd.FilterPopup", onFilterChanged: "filterChanged"}
	],
	
	// Constructor
	create: function() {
		this.inherited(arguments);
		this.score=0;
		this.tries=0;
		
		this.theme = -1;
		this.themeButton = null;
		this.gamecount = 0;
		this.playing = null;
		this.from = null;
		this.selected = null;
		this.forbidentry = false;
		this.filter = null;
		
		this.restoreContext();
		this.filterChanged({filter: this.filter});
		if (this.theme != -1)
			this.doGame(this.themeButton);
		else
			this.displayButtons();
	},
	
	// Context handling
	restoreContext: function() {
		if (this.context == null || this.context == "")
			return;
		var values = this.context.split('|');
		this.theme = values[0];
		this.gamecount = parseInt(values[1]);
		this.themeButton = { from: values[2], to: values[3] };
		if (values[4] != "")
			this.filter = { kind: values[4], index: values[5], letter: values[5] };
	},
	
	saveContext: function() {
		var values = [];
		values.push(this.theme);
		values.push(this.gamecount);
		if (this.themeButton != null) {
			values.push(this.themeButton.from);
			values.push(this.themeButton.to);
		} else {
			values.push("");
			values.push("");
		}
		if (this.filter != null) {
			values.push(this.filter.kind);
			values.push(this.filter.kind == "Abcd.Letter"?this.filter.letter:this.filter.index)
		} else {
			values.push("");
			values.push("");
		}
		return values.join("|");
	},
	
	// Delete all the box content
	cleanBox: function() {
		var items = [];
		enyo.forEach(this.$.box.getControls(), function(item) {
			items.push(item);
		});		
		for (var i = 0 ; i < items.length ; i++) {
			items[i].destroy();
		}	
	},
	
	// Display game choice buttons
	displayButtons: function() {
		this.cleanBox();
		Abcd.changeVisibility(this, {home: true, back: false, filter: true, check: false, itemCount: false});
		this.$.colorBar.removeClass("themeColor"+this.theme);
		this.theme = -1;
		this.$.colorBar.addClass("themeColor"+this.theme);
		if (this.filter == null)
			this.$.filterLetter.hide();
		
		// Draw From picture buttons
		this.$.box.createComponent(
			{kind: "Abcd.PlayTypeButton", from: "picture", to: "letter"+Abcd.context.casevalue, ontap: "doGame", theme: "play-button-color1"},
			{owner: this}
		).render();
		this.$.box.createComponent(
			{kind: "Abcd.PlayTypeButton", from: "picture", to: "listen", ontap: "doGame", theme: "play-button-color1"},
			{owner: this}
		).render();
		
		// Draw From letter buttons
		this.$.box.createComponent(
			{kind: "Abcd.PlayTypeButton", from: "letter"+Abcd.context.casevalue, to: "picture", ontap: "doGame", theme: "play-button-color2"},
			{owner: this}
		).render();
		this.$.box.createComponent(
			{kind: "Abcd.PlayTypeButton", from: "letter"+Abcd.context.casevalue, to: "listen", ontap: "doGame", theme: "play-button-color2"},
			{owner: this}
		).render();

		// Draw From listen buttons
		this.$.box.createComponent(
			{ kind: "Abcd.PlayTypeButton", from: "listen", to: "picture", ontap: "doGame", theme: "play-button-color3" },
			{ owner: this }
		).render();
		this.$.box.createComponent(
			{ kind: "Abcd.PlayTypeButton", from: "listen", to: "letter"+Abcd.context.casevalue, ontap: "doGame", theme: "play-button-color3" },
			{ owner: this }
		).render();	
	},
	
	// Localization changed
	setLocale: function() {
		// Remove filter because too risky
		this.filter = null;
		this.$.filterLetter.hide();		
		this.$.filterCollection.hide();		
		
		// If playing, change game because could inexist in the current language
		if (this.theme != -1)
			this.computeGame();
			
	},
	
	// Case changed
	setCase: function() {
		// Redraw button
		enyo.forEach(this.$.box.getControls(), function(item) {
			if (item.kind == 'Abcd.Entry')
				item.indexChanged();
			else
				item.setCase();				
		});
		
		// Redraw filter letter and filter popup
		if (this.filter != null) {
			if (this.filter.kind == "Abcd.Letter")
				this.$.filterLetter.letterChanged();
			else
				this.$.filterCollection.indexChanged();
		}
	},
	
	// Display filter dialog
	filterTaped: function() {
		this.$.filterPopup.display(this.filter);
	},
	
	// Process filter change
	filterChanged: function(s, e) {
		this.filter = s.filter;
		this.$.filterLetter.hide();
		this.$.filterCollection.hide();		
		if (this.filter != null) {
			if (this.filter.kind == "Abcd.Letter") {
				this.$.filterLetter.show();
				this.$.filterLetter.setLetter(this.filter.letter);
			} else {
				this.$.filterCollection.show();
				this.$.filterCollection.setIndex(this.filter.index);			
			}
		}
	},
	
	// Convert value to entry option
	convertToEntryOption: function(value) {
		return {
			soundonly: value == "listen",
			imageonly: value == "picture",
			textonly: value.substr(0, 6) == "letter"
		};
	},
	
	// Start game
	doGame: function(button, event) {		
		// Redraw bar
		Abcd.changeVisibility(this, {home: false, back: true, filter: false, check: true, itemCount: true,score:true});
		this.themeButton = button;
		if (this.themeButton.from == "picture") this.theme = 5;
		else if (this.themeButton.from == "listen") this.theme = 7;
		else this.theme = 6;
		this.$.colorBar.removeClass("themeColor-1");
		this.$.colorBar.addClass("themeColor"+this.theme);
		
		// Compute game
		this.computeGame();
	},
	
	// Compute game
	computeGame: function() {
		// Compute card to find
		this.cleanBox();
		this.forbidentry = false;
		this.$.itemCount.setContent((this.gamecount+1)+"/"+entriesByGame);
		var tofind = Abcd.randomEntryIndex(undefined, this.filter);
		var options = this.convertToEntryOption(this.themeButton.from);		
		var fromEntry = this.from = this.$.box.createComponent(
			{kind: "Abcd.Entry", index:tofind, soundonly: options["soundonly"], imageonly: options["imageonly"], textonly: options["textonly"], ontap: "entryTaped"},
			{owner: this}
		);
		fromEntry.addClass("entryPlayFrom");
		fromEntry.render();
		
		// Play from card if its a sound
		if (options["soundonly"]) {
			this.playing = fromEntry;
			this.playing.play(Abcd.sound);	
		}
		
		// Compute cards to choose
		var excludes = [];
		excludes.push(tofind);
		for (var i = 0 ; i < 2 ; i++) {
			var wrong = Abcd.randomEntryIndex(excludes, this.filter);
			excludes.push(wrong);
		}
		excludes = Abcd.mix(excludes);
		
		// Draw cards
		var len = excludes.length;
		for (var i = 0 ; i < len ; i++) {
			options = this.convertToEntryOption(this.themeButton.to);
			var toEntry = this.$.box.createComponent(
				{kind: "Abcd.Entry", index:excludes[i], soundonly: options["soundonly"], imageonly: options["imageonly"], textonly: options["textonly"], ontap: "entryTaped"},
				{owner: this}
			);
			toEntry.addClass("entryPlayTo");
			toEntry.render();
		}
		
		// Save context
		Abcd.saveContext();		
	},
		
	// Entry taped play sound and/or select entry
	entryTaped: function(entry, event) {
		// No selection now
		if (this.forbidentry)
			return;
			
		// Play sound
		if (entry.soundonly) {
			if (this.playing != null)
				this.playing.abort();
			this.playing = entry;
			this.playing.play(Abcd.sound);
		}
		
		// Don't select the from entry
		if (entry.hasClass("entryPlayFrom"))
			return;
		
		// Select the entry
		if (!entry.hasClass("entryPlaySelected")) {
			if (this.selected != null)
				this.selected.removeClass("entryPlaySelected");
			entry.addClass("entryPlaySelected");
			this.selected = entry;
		}
	},
	
	// Go to the home of the game
	backTaped: function() {
		this.$.colorBar.removeClass("themeColor"+this.theme);
		this.theme = -1;
		this.score=0;
		this.tries=0;
		this.gamecount = 0;
		this.selected = null;		
		this.displayButtons();
	},
	
	// Check taped
	checkTaped: function() {
		this.forbidentry = true;
		if (this.playing != null){
			this.playing.abort();
		}
		if (this.selected == null) {
			Abcd.sound.play("audio/disappointed");
			this.$.check.hide();
			this.tries=this.tries+1;
			this.selected = this.from;
			this.selected.addClass("entryPlayWrong");
		} else if (this.selected.index == this.from.index) {
			Abcd.sound.play("audio/applause");
			this.$.check.hide();
			this.selected.removeClass("entryPlaySelected");
			this.selected.addClass("entryPlayRight");
			this.score=this.score+1;
			this.tries=this.tries+1;
			console.log("applude score:"+this.score);
			console.log("tries:"+this.tries);
		} else {
			Abcd.sound.play("audio/disappointed");
			this.$.check.hide();
			this.selected.removeClass("entryPlaySelected");
			this.selected.addClass("entryPlayWrong");
			this.tries=this.tries+1;
			console.log("dis tries:"+this.tries);
			console.log("score:"+this.score);
		}
	},
	
	// End sound
	endSound: function(e, s) {
		this.$.score.setContent("Score: "+this.score+"/"+this.tries);
		// Prematured end
		if (this.selected == null)
			return;
		// if(this.score==4){
		// 	var acc=(100*this.score)/this.tries;
		// 	var result=new Abcd.ResultPopup({});
		// 	result.$.accuracy.setContent(acc);
		// 	result.show();
		// }	
			
		// Bad check, retry
		if (s.sound == "audio/disappointed") {
			this.$.check.show();
			this.selected.removeClass("entryPlaySelected");
			this.selected.removeClass("entryPlayWrong");
			this.selected = null;
			this.forbidentry = false;
			if(this.score==4){
				var acc=(100*this.score)/this.tries;
				var result=new Abcd.ResultPopup({});
				result.$.accuracy.setContent("Your accuracy is: "+acc+"%");
				result.show();
				// this.$.resultPopup.show();
				this.score=0;
				this.tries=0;
			}
			
		// Good check
		} else if (s.sound == "audio/applause") {
			this.$.check.show();
			// Clean state
			this.selected.removeClass("entryPlaySelected");
			this.selected.removeClass("entryPlayRight");
			this.selected = null;
			if(this.score==4){
				var acc=(100*this.score)/this.tries;
				var result=new Abcd.ResultPopup({});
				if(acc>=50){
					var name="images/thumbsup.jpg";
					result.$.image.setAttribute("src",name);
				}
				else{
					var name="images/thumbsdown.jpg";
					result.$.image.setAttribute("src",name);
				}
				result.$.accuracy.setContent("Your accuracy is: "+acc+"%");
				result.show();
				// this.$.resultPopup.show();
				this.score=0;
				this.tries=0;
			}
			// Next game or try another game
			if ( ++this.gamecount == entriesByGame ) {
				this.$.check.show();
				this.gamecount = 0;
				this.displayButtons();
				if(this.score==4){
					this.score=0;
					this.tries=0;
				}
			} else
				this.computeGame();
				if(this.score==4){
					this.score=0;
					this.tries=0;
				}
		}
	}
});
