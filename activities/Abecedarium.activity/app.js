
// Sounds theme
var soundThemes = [ "audio/theme_piano", "audio/theme_guitar", "audio/theme_violon", "audio/theme_oboe", "audio/theme_trompet", "audio/theme_mallets", "audio/theme_soprano"];
var soundNotesPos = [ 24, 536, 1024, 1536, 2057, 2569, 3048, 4040, 4552, 5032, 5560, 6064, 6349, 6570, 6836, 7072, 8056, 8560, 9072, 10071, 10575, 11071, 12063, 13061, 14063, 15062 ];


// Main app class
enyo.kind({
	name: "Abcd.App",
	kind: enyo.Control,
	classes: "main",
	components: [
		{components: [
			{name: "logo", kind: "Image", classes: "logo", src: "images/logo.png"},
			{name: "instrument", kind: "Image", classes: "instrument", src: "images/instrument0.png", ontap: "nextInstrument"},
			{name: "letter", content: "", classes: "letter" }
		]},
		{components: [
			{name: "credit", kind: "Image", src: "images/credit.png", classes: "creditButton", ontap: "displayCredits"},
			{name: "learn", kind: "Image", src: "images/learn.png", classes: "learnButton", ontap: "learnGame"},
			{name: "play", kind: "Image", src: "images/play.png", classes: "playButton", ontap: "playGame"},	
			{name: "build", kind: "Image", src: "images/build.png", classes: "buildButton", ontap: "buildGame"},
			{name: "networkCheck", kind: "Abcd.NetworkCheck", ontap: "networkSettings"}
		]},
		{name: "creditsPopup", kind: "Abcd.CreditsPopup"},		
		{name: "networkPopup", kind: "Abcd.NetworkPopup", onNetworkChanged: "networkChanged"},		
		{kind: "Signals", onEndOfSound: "endOfSound", onSoundTimeupdate: "soundTimeupdate"}
	],
	
	// Constructor, save home
	create: function() {
		this.inherited(arguments);
		Abcd.context.home = this;
	},
	
	// Start the last closed activity if context not null
	rendered: function() {
		if (Abcd.context.screen != "") {
			Abcd.context.object = enyo.create({
				kind: Abcd.context.screen,
				context: Abcd.context.screenContext
			}).renderInto(document.getElementById("body"));
			Abcd.context.screen = "";
			return true;
		}
		this.playTheme();		
		Abcd.context.object = null;
		this.$.networkCheck.check();
	},
	
	// Play theme
	playTheme: function() {
		this.soundindex = 0;
		this.soundpos = 0;
		Abcd.sound.play(soundThemes[this.soundindex]);
	},
	
	// Launch activities
	learnGame: function(e, s) {
		Abcd.sound.pause();
		Abcd.context.object = new Abcd.Learn().renderInto(document.getElementById("body"));
	},
	
	playGame: function(e, s) {
		Abcd.sound.pause();	
		Abcd.context.object = new Abcd.Play().renderInto(document.getElementById("body"));
	},

	// Display credits page
	displayCredits: function(e, s) {
		this.$.creditsPopup.show();
	},
	
	// Handle: display network settings popup and handle change
	networkSettings: function(e, s) {
		this.$.networkPopup.display();
	},
	
	networkChanged: function() {
		this.$.networkCheck.check();
	},
	
	// Sound ended, play next instrument
	endOfSound: function(e, s) {
		if (s == soundThemes[this.soundindex])
			this.nextInstrument();
	},
	
	nextInstrument: function() {
		this.soundindex = (this.soundindex + 1) % soundThemes.length;
		this.soundpos = 0;
		this.$.letter.setContent("");		
		this.$.instrument.setSrc("images/instrument"+this.soundindex+".png");
		Abcd.sound.play(soundThemes[this.soundindex]);	
	},
	
	soundTimeupdate: function(e, s) {
		for (var i = this.soundpos ; i < soundNotesPos.length ; i++) {
			var val = soundNotesPos[i];
			this.soundpos = i;
			if (s >= val - 50 && s < val + 50) {
				this.$.letter.setContent(String.fromCharCode(65+i));
				return;
			}
			if (val > s) {
				break;
			}
		}
		this.$.letter.setContent("");		
	}
});