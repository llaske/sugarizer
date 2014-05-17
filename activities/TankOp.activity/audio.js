// TankOp audio stuff

// Basic HTML 5 Audio Element encapsulation
enyo.kind({
	name: "HTML5.Audio",
	kind: enyo.Control,
	tag: "audio",
	published: {
		src: "", crossorigin: "", preload: "auto",
		mediagroup: "", loop: false, muted: "", controlsbar: false
	},
	events: {
		onSoundEnded: "",
		onSoundTimeupdate: ""
	},
	
	// Constructor
	create: function() {
		this.inherited(arguments);
		
		this.srcChanged();
		this.crossoriginChanged();
		this.preloadChanged();
		this.loopChanged();
		this.mutedChanged();
		this.controlsbarChanged();
	},

	// Render
	rendered: function() {
		this.inherited(arguments);
		
		// Handle init
		if (this.hasNode() != null) {		
			// Handle sound ended event
			var audio = this;
			enyo.dispatcher.listen(audio.hasNode(), "ended", function() { 
				audio.doSoundEnded();
			});			
			enyo.dispatcher.listen(audio.hasNode(), "timeupdate", function(s) { 
				audio.doSoundTimeupdate({timeStamp: s.timeStamp});
			});			
		}
	},
	
	// Property changed
	srcChanged: function() {
		this.setAttribute("src", this.src);
	},

	crossoriginChanged: function() {
		this.setAttribute("crossorigin", this.crossorigin);
	},
	
	preloadChanged: function() {
		this.setAttribute("preload", this.preload);
	},

	loopChanged: function() {
		this.setAttribute("loop", this.loop);
	},
	
	mutedChanged: function() {
		if (this.muted.length != 0)
			this.setAttribute("muted", this.muted);
	},
	
	controlsbarChanged: function() {
		this.setAttribute("controls", this.controlsbar);
	},
	
	// Test if component could play a file type
	canPlayType: function(typename) {
		var node = this.hasNode();
		if (node == null)
			return false;
		return node.canPlayType(typename);
	},
	
	// Play audio
	play: function() {
		var node = this.hasNode();
		if (node == null)
			return;	
		node.play();
	},
	
	// Pause audio
	pause: function() {
		var node = this.hasNode();
		if (node == null)
			return;		
		node.pause();
	},
	
	// Test if audio is paused
	paused: function() {
		var node = this.hasNode();
		if (node == null)
			return false;		
		return node.paused;
	},

	// Test if audio is ended
	ended: function() {
		var node = this.hasNode();
		if (node == null)
			return false;		
		return node.ended;
	}	
});

// TankOp Audio engine
enyo.kind({
	name: "TankOp.Audio",
	kind: enyo.Control,
	components: [
		{ name: "sound", kind: "HTML5.Audio", preload: "auto", autobuffer: true, controlsbar: false, 
		  onSoundEnded: "broadcastEnd", onSoundTimeupdate: "broadcastUpdate" }
	],
	
	// Constructor
	create: function() {
		this.inherited(arguments);
		this.format = null;
	},

	// First render, test sound format supported
	rendered: function() {
		this.inherited(arguments);
		
		if (this.$.sound.canPlayType("audio/ogg"))
			this.format = ".ogg";
		else if (this.$.sound.canPlayType("audio/mpeg"))
			this.format = ".mp3";
	},
	
	// Play a sound
	play: function(sound, loop) {
		if (this.format == null)
			return;
		if (enyo.platform.android) // HACK: PhoneGap don't handle local HTML5 sound
			this.$.sound.setSrc("http://server.sugarizer.org/activities/TankOp.activity/"+sound+this.format);
		else
			this.$.sound.setSrc(sound+this.format);
		this.$.sound.setLoop(loop === true);
		this.timeStamp = new Date().getTime();
		this.render();
		this.$.sound.play();
	},
	
	// Pause
	pause: function() {
		if (this.format == null)
			return;
		this.$.sound.pause();
	},
	
	// End of sound detected, broadcast the signal
	broadcastEnd: function() {
		enyo.Signals.send("onEndOfSound", this.$.sound.src.substring(0,this.$.sound.src.length-4));
	},
	
	broadcastUpdate: function(s, e) {
		enyo.Signals.send("onSoundTimeupdate", e.timeStamp-this.timeStamp);	
	}
});