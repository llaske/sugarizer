// Entry component with image, text and sound
enyo.kind({
	name: "Abcd.Entry",
	kind: "Abcd.Item",
	published: { index: "", imageonly: false, textonly: false, soundonly: false },
	classes: "entry",
	components: [
		{ name: "spinner", kind: "Image", src: "images/spinner-light.gif", classes: "spinner"},	
		{ name: "contentBox", showing: false, components: [
			{ name: "itemImage", classes: "entryImage", kind: "Image", onload: "imageLoaded", onerror: "imageError" },
			{ name: "soundIcon", kind: "Image", classes: "entrySoundIcon" },
			{ name: "itemText", classes: "entryText" }
		]},
		{kind: "Signals", onEndOfSound: "endOfSound"}		
	],
	events: {
		onEntrySoundEnded: ""
	},
	
	// Constructor
	create: function() {
		this.inherited(arguments);
		this.sound = null;
		this.imageonlyChanged();
		this.textonlyChanged();
		this.soundonlyChanged();
		this.indexChanged();		
	},
	
	// Display only when image is load
	imageLoaded: function() {
		if (this.index !== "") {
			this.$.spinner.hide();
			this.$.contentBox.show();
		}
	},

	// Error loading image, probably lost connection to database
	imageError: function() {
		Abcd.goHome();
	},
	
	// Unique visibility options
	imageonlyChanged: function() {
		if (this.imageonly)
			Abcd.changeVisibility(this, {itemImage: true, soundIcon: false, itemText: false});
	},
	
	textonlyChanged: function() {
		if (this.textonly)
			Abcd.changeVisibility(this, {itemImage: false, soundIcon: false, itemText: true});
	},
	
	soundonlyChanged: function() {
		if (this.soundonly)
			Abcd.changeVisibility(this, {itemImage: false, soundIcon: true, itemText: false});
	},
	
	// Localization changed, update text & sound 
	setLocale: function() {
		this.indexChanged();
		this.inherited(arguments);
	},
	
	// Card setup
	indexChanged: function() {
		// Get content
		var entry = Abcd.entries[this.index];
		var image = Abcd.context.getDatabase()+"images/database/"+entry.code+".png";
		var text = __$FC(entry.text);
		if (Abcd.context.casevalue == 1)
			text = text.toUpperCase();
			
		// Get sound
		if (this.soundonly) this.$.soundIcon.addClass("entrySoundIconOnly");			
		if (entry[Abcd.context.lang]) {
			this.sound = Abcd.context.getDatabase()+"audio/"+Abcd.context.lang+"/database/"+entry.code;
			this.$.soundIcon.setSrc("images/sound_off"+(this.soundonly?1:0)+".png");
		} else {
			this.sound = null;
			this.$.soundIcon.setSrc("images/sound_none"+(this.soundonly?1:0)+".png");
		}
		
		// Display all
		this.$.itemImage.setAttribute("src", image);
		this.$.itemText.removeClass("entryText0");
		this.$.itemText.removeClass("entryText1");
		this.$.itemText.removeClass("entryText2");
		this.$.itemText.addClass("entryText"+Abcd.context.casevalue);
		if (this.imageonly) this.$.itemImage.addClass("entryImageOnly");
		this.$.itemText.setContent(text);
		if (this.textonly) this.$.itemText.addClass("entryTextOnly");
	},
	
	// Play sound using the media
	play: function(media) {
		if (this.sound != null) {
			this.$.soundIcon.setSrc("images/sound_on"+(this.soundonly?1:0)+".png");	
			media.play(this.sound);
		}
	},
	
	endOfSound: function(e, s) {
		if (s == this.sound) {
			this.doEntrySoundEnded();
			this.$.soundIcon.setSrc("images/sound_off"+(this.soundonly?1:0)+".png");
		}
	},

	abort: function() {
		 if (this.$.soundIcon !== undefined)
			this.$.soundIcon.setSrc("images/sound_off"+(this.soundonly?1:0)+".png");	
	}
});