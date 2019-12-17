

// Collections size on the screen
var entriesByScreen = 8;


// Learn app class
enyo.kind({
	name: "Abcd.Learn",
	kind: enyo.Control,
	classes: "board",
	published: {
		context: null,
	},
	components: [
		{components: [
			{name: "colorBar", classes: "colorBar"},
			{name: "home", kind: "Abcd.HomeButton"},
			{name: "startSlideshow", kind: "Image", src: "images/slideshow.png", showing: false, ontap: "startSlideshow", classes: "standardButton slideshow"},
			{name: "stopSlideshow", kind: "Image", src: "images/pause.png", showing: false, ontap: "stopSlideshow", classes: "standardButton slideshow"},
			{kind: "Abcd.CaseButton"},
			{kind: "Abcd.LanguageButton"}
		]},
		{components: [
			{name: "pageCount", content: "-/-", classes: "pageCount", showing: false},
			{name: "back", kind: "Image", src: "images/back.png", showing: false, classes: "standardButton backButton", ontap: "backTaped"},
			{name: "prev", kind: "Image", src: "images/previous.png", showing: false, classes: "standardButton prevButton", ontap: "displayPrevEntries"},
			{name: "next", kind: "Image", src: "images/next.png", showing: false, classes: "standardButton nextButton", ontap: "displayNextEntries"}
		]},
		{name: "box", classes: "learnBox", components: [
		]}
	],

	// Constructor, save home
	create: function() {
		// Initialize
		this.inherited(arguments);
		this.theme = this.collection = this.entry = this.position = -1;
		this.collections = [];
		this.playing = null;
		this.slideshowIndex = -1;
		this.exportPNG = enyo.bind(this, "clickExportPNG");
		this.exportSOUND = enyo.bind(this, "clickExportSOUND");

		// Set previous context
		this.restoreContext();
		if (this.theme != -1) {
			if (this.theme == 4)
				this.displayLetters({letter: this.collection});
			else if (this.collection != -1)
				this.displayEntries({index: this.collection});
			else
				this.displayCollections({index: this.theme});
		} else
			this.displayThemes();
	},

	// Context handling
	restoreContext: function() {
		if (this.context == null || this.context == "")
			return;
		var values = this.context.split('|');
		this.theme = values[0];
		this.collection = values[1];
		this.entry = parseInt(values[2]);
	},

	saveContext: function() {
		var values = [];
		values.push(this.theme);
		values.push(this.collection);
		values.push(this.position);
		return values.join("|");
	},

	// Localization changed
	setLocale: function() {
		// If on an entry, redisplay from the beginning to avoid displaying non translated text
		var current = this.$.box.getControls()[0];
		if (current.kind == "Abcd.Entry") {
			this.entry = -1;
			if (this.theme != 4)
				this.displayEntries({index: Abcd.entries[current.index].coll});
			else
				this.displayLetters({letter:this.collection});
			return;
		}

		// Change entry localization if any
		enyo.forEach(this.$.box.getControls(), function(entry) {
			if (entry.kind != 'Control')
				entry.setLocale();
		});
	},

	// Case changed
	setCase: function() {
		// Redraw entry
		enyo.forEach(this.$.box.getControls(), function(entry) {
			if (document.getElementById("main-toolbar").style.visibility == "hidden")
			Abcd.changeVisibility({switchToEnglish: false, switchToFrench: false, switchToSpanish: false});
			if (entry.kind == 'Abcd.Letter')
				entry.letterChanged();
			else if (entry.kind != 'Control')
				entry.indexChanged();
		});
	},

	// Handle click on exportPNG buttons
	clickExportPNG: function() {
		var pngButton = document.getElementById("png-button");
		var tojournal;
		if (pngButton.classList.contains("active")) {
			tojournal = 0;
		} else {
			tojournal = 1;
		}
		this.putEntriesJournalModeTo(tojournal);
	},

	// Handle click on exportSOUND buttons
	clickExportSOUND: function() {
		var soundButton = document.getElementById("sound-button");
		var tojournal;
		if (soundButton.classList.contains("active")) {
			tojournal = 0;
		} else {
			tojournal = 2;
		}
		this.putEntriesJournalModeTo(tojournal);
	},

	putEntriesJournalModeTo: function(tojournal) {
		if (tojournal == 1) {
			document.getElementById("png-button").classList.add("active");
			document.getElementById("sound-button").classList.remove("active");
		} else if (tojournal == 2) {
			document.getElementById("sound-button").classList.add("active");
			document.getElementById("png-button").classList.remove("active");
		} else {
			document.getElementById("png-button").classList.remove("active");
			document.getElementById("sound-button").classList.remove("active");
		}
		enyo.forEach(this.$.box.getControls(), function(entry) {
			if (entry.kind == "Abcd.Entry") {
				entry.tojournal = tojournal;
				entry.tojournalChanged();
			}
		});
	},

	// Display themes and letters
	displayThemes: function() {
		// Display themes
		this.theme = -1;
		var length = Abcd.themes.length;
		this.cleanBox();
		this.$.box.addClass("box-4-theme");
		this.$.box.createComponent({ classes: "linebreak" }).render();
		Abcd.changeVisibility(this, {home: true, back: false, prev: false, next: false, pageCount: false, startSlideshow: false, stopSlideshow: false});
		document.getElementById("png-button").style.visibility = "hidden";
		document.getElementById("sound-button").style.visibility = "hidden";
		document.getElementById("png-button").classList.remove("active");
		document.getElementById("sound-button").classList.remove("active");
		document.getElementById("png-button").removeEventListener("click", this.exportPNG);
		document.getElementById("sound-button").removeEventListener("click", this.exportSOUND);
		this.$.colorBar.addClass("themeColor"+this.theme);
		for (var i = 0 ; i < length ; i++) {
			this.$.box.createComponent(
				{ kind: "Abcd.Theme", index: i, ontap: "displayCollections" },
				{ owner: this }
			).render();
		}
		this.$.box.createComponent({ classes: "linebreak" }).render();

		// Display letters
		for (var i = 0 ; i < 26 ; i++) {
			this.$.box.createComponent(
				{ kind: "Abcd.Letter", letter: String.fromCharCode(65+i), ontap: "displayLetters" },
				{ owner: this }
			).render();
		}

		// Save context
		Abcd.saveContext();
	},

	// Display all collection for a theme
	displayCollections: function(inSender, inEvent) {
		this.theme = inSender.index;
		var length = Abcd.collections.length;
		this.cleanBox();
		Abcd.changeVisibility(this, {home: false, back: true, prev: false, next: false, pageCount: false, startSlideshow: false, stopSlideshow: false});
		this.$.colorBar.removeClass("themeColor-1");
		this.$.colorBar.addClass("themeColor"+this.theme);
		this.$.box.removeClass("box-4-theme");
		this.$.box.addClass("box-4-collection");
		document.getElementById("png-button").style.visibility = "hidden";
		document.getElementById("sound-button").style.visibility = "hidden";
		document.getElementById("png-button").classList.remove("active");
		document.getElementById("sound-button").classList.remove("active");
		document.getElementById("png-button").removeEventListener("click", this.exportPNG);
		document.getElementById("sound-button").removeEventListener("click", this.exportSOUND);
		this.$.box.createComponent({ classes: "linebreak" }).render();
		this.$.box.createComponent({ classes: "linebreak" }).render();
		for (var i = 0 ; i < length ; i++) {
			if (Abcd.collections[i].theme != this.theme) continue;
			this.$.box.createComponent({ kind: "Abcd.Collection", index: i, ontap: "displayEntries"}, {owner: this}).render();
		}

		// Save context
		Abcd.saveContext();
	},

	// Display entries in a collection
	displayEntries: function(inSender, inEvent) {
		// Get items in collection
		this.$.box.removeClass("box-4-collection");
		this.$.colorBar.addClass("themeColor"+this.theme);
		var index = inSender.index;
		this.collection = index;
		this.collections = [];
		var length = Abcd.collections[index].entries.length;
		for (var i = 0 ; i < length ; i++) {
			var entry = Abcd.collections[index].entries[i];
			if (Abcd.entries[entry][Abcd.context.lang] == 1)
				this.collections.push(entry);
		}

		// Display it
		this.displayEntriesFrom(this.entry+1);
	},

	// Display entries from a letter
	displayLetters: function(inSender, inEvent) {
		// Play letter sound
		if (inSender.kind !== undefined)
			inSender.play(Abcd.sound);

		// Get items with this letters
		this.collection = inSender.letter;
		if (Abcd.letters[this.collection] === undefined)
			return;
		this.collections = Abcd.letters[this.collection];

		// Display it
		this.theme = 4;
		this.$.colorBar.addClass("themeColor"+this.theme);
		this.$.box.removeClass("box-4-theme");
		document.getElementById("png-button").style.visibility = "hidden";
		document.getElementById("sound-button").style.visibility = "hidden";
		document.getElementById("png-button").classList.remove("active");
		document.getElementById("sound-button").classList.remove("active");
		document.getElementById("png-button").removeEventListener("click", this.exportPNG);
		document.getElementById("sound-button").removeEventListener("click", this.exportSOUND);
		this.displayEntriesFrom(this.entry+1);
	},

	displayEntriesFrom: function(position) {
		// Prepare header
		this.cleanBox();
		this.$.box.addClass("box-4-entry");
		Abcd.changeVisibility(this, {home: false, back: true, pageCount: true, startSlideshow: true, stopSlideshow: false});

		// Draw N entries
		length = this.collections.length;
		var count = 0;
		for (var i = position ; i < length ; i++) {
			this.$.box.createComponent({ kind: "Abcd.Entry", index:this.collections[i], ontap: "play", onEntrySoundEnded: "soundEnd"}, {owner: this}).render();
			this.entry = i;
			if (++count == entriesByScreen)
				break;
		}

		// Change button visibility and counter
		if (position != 0)
			this.$.prev.show();
		else
			this.$.prev.hide();
		if (this.entry+1 < length)
			this.$.next.show();
		else
			this.$.next.hide();
		this.$.pageCount.setContent(Math.ceil(i/entriesByScreen)+"/"+Math.ceil(length/entriesByScreen));
		this.position = position-1;
		document.getElementById("png-button").style.visibility = "visible";
		document.getElementById("sound-button").style.visibility = "visible";
		document.getElementById("png-button").addEventListener("click", this.exportPNG);
		document.getElementById("sound-button").addEventListener("click", this.exportSOUND);

		// Save context
		Abcd.saveContext();
	},

	displayNextEntries: function() {
		if (this.entry+1 < this.collections.length) {
			this.displayEntriesFrom(this.entry+1);
		}
	},

	displayPrevEntries: function() {
		this.displayEntriesFrom(Math.max(0,this.entry-entriesByScreen-this.entry%entriesByScreen));
	},

	backTaped: function() {
		var current = this.$.box.getControls()[0];
		this.entry = -1;
		if (current.kind == "Abcd.Entry" && this.theme != 4) {
			this.collection = -1;
			this.displayCollections({index: this.theme});
			this.$.box.removeClass("box-4-entry");
			return;
		}
		this.$.colorBar.removeClass("themeColor"+this.theme);
		this.$.box.removeClass("box-4-collection");
		this.displayThemes();
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

	// Slideshow handling
	startSlideshow: function(inSender, inObject) {
		this.slideshowIndex = 0;
		Abcd.changeVisibility(this, {startSlideshow: false, stopSlideshow: true});
		var first = this.$.box.getControls()[this.slideshowIndex];
		this.play(first);
	},

	stopSlideshow: function(inSender, inObject) {
		this.slideshowIndex = -1;
		Abcd.changeVisibility(this, {startSlideshow: true, stopSlideshow: false});
	},

	// Play entry sound
	play: function(inSender, inObject) {
		if (this.playing != null)
			this.playing.abort();
		this.playing = inSender;
		var tojournal = inSender.tojournal;
		inSender.play(Abcd.sound);
		if (tojournal) {
			this.putEntriesJournalModeTo(false);
		}
	},

	soundEnd: function(inSender, inObject) {
		this.playing = null;
		if (this.slideshowIndex != -1) {
			var next = this.$.box.getControls()[++this.slideshowIndex];
			if (next !== undefined)
				this.play(next);
			else
				this.stopSlideshow();
		}
	}
});
