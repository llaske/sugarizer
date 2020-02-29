// Entry component with image, text and sound
enyo.kind({
	name: "Abcd.Entry",
	kind: "Abcd.Item",
	published: { index: "", imageonly: false, textonly: false, soundonly: false, tojournal: 0 },
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
		this.tojournalChanged();
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

	tojournalChanged: function() {
		if (this.tojournal) {
			this.$.soundIcon.setSrc("icons/journal.svg");
		} else {
			this.$.soundIcon.setSrc("images/sound_off"+(this.soundonly?1:0)+".png");
		}
		this.$.soundIcon.render();
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

	// Export to Image or Sound
	exportToImage: function() {
		// Get image into a canvas
		var entry = Abcd.entries[this.index];
		var image = this.$.itemImage.hasNode();
		var imgCanvas = document.createElement("canvas");
		var imgContext = imgCanvas.getContext("2d");
		imgCanvas.width = imgCanvas.height = 210;
		imgContext.drawImage(image, 0, 0, imgCanvas.width, imgCanvas.height);
		var imgAsDataURL = imgCanvas.toDataURL("image/png");

		// Save in datastore
		var metadata = {
			mimetype: "image/png",
			title: __$FC(entry.text)+".png",
			activity: "org.olpcfrance.MediaViewerActivity",
			timestamp: new Date().getTime(),
			creation_time: new Date().getTime(),
			file_size: 0
		};
		Abcd.datastore.create(metadata, function() {
			console.log("image '"+__$FC(entry.text)+"' saved in journal.")
		}, imgAsDataURL);
	},

	exportToSound: function() {
		// Compute format
		var format = "";
		var mimetype = ""
		format = ".mp3";
		mimetype = "audio/mpeg";
		var url = "";
		if (this.sound.indexOf("http") == 0) {
			url = this.sound+format;
		} else {
			url = window.location.href;
			url = url.substring(0, url.indexOf('/index.html'));
			url += "/"+this.sound+format;
		}

		// Load file
		var request = new XMLHttpRequest();
		request.open("GET",url,true);
		request.setRequestHeader("Content-type",mimetype);
		request.responseType = "arraybuffer";
		var that = this;
		request.onload = function() {
			if (request.status == 200 || request.status == 0) {
				var entry = Abcd.entries[that.index];
				var blob = new Uint8Array(this.response);
				var base64 = "data:"+mimetype+";base64,"+Abcd.toBase64(blob);
				var metadata = {
					mimetype: mimetype,
					title: __$FC(entry.text)+format,
					activity: "org.olpcfrance.MediaViewerActivity",
					timestamp: new Date().getTime(),
					creation_time: new Date().getTime(),
					file_size: 0
				};
				Abcd.datastore.create(metadata, function() {
					console.log("sound '"+__$FC(entry.text)+"' saved in journal.");
				}, base64);
			}
		};
		request.send();
	},

	// Play sound using the media
	play: function(media) {
		// Journal mode, generate image/sound in journal
		if (this.tojournal) {
			if (this.tojournal == 1) {
				this.exportToImage();
			} else {
				this.exportToSound();
			}

			// Update entry icon
			this.tojournal = 0;
			this.indexChanged();
			return;
		}

		// Play sound
		if (this.sound != null) {
			this.$.soundIcon.setSrc("images/sound_on"+(this.soundonly?1:0)+".png");
			media.play(this.sound);
		}
	},

	endOfSound: function(e, s) {
		if (s.sound == this.sound) {
			this.doEntrySoundEnded();
			this.$.soundIcon.setSrc("images/sound_off"+(this.soundonly?1:0)+".png");
		}
	},

	abort: function() {
		 if (this.$.soundIcon !== undefined)
			this.$.soundIcon.setSrc("images/sound_off"+(this.soundonly?1:0)+".png");
	}
});
