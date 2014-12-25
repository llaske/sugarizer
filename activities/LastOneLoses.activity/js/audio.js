

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
		if (this.hasNode()) {		
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
		if (!node)
			return false;
		return node.canPlayType(typename);
	},
	
	// Play audio
	play: function() {
		// HACK: HTML5 Audio don't work in PhoneGap on Android < 4.4 and iOS, use Media PhoneGap component instead
		if ((enyo.platform.android || enyo.platform.ios) && document.location.protocol.substr(0,4) != "http") {
			var src = location.pathname.substring(0,1+location.pathname.lastIndexOf('/'))+this.src;
			var that = this;
			var media = new Media(src, function() {
				var timer = window.setInterval(function() {
					window.clearInterval(timer);
					that.doSoundEnded();
				}, this.getDuration()*1000);
			}, function() {});
			media.play();
			return;
		}	
		var node = this.hasNode();
		if (!node)
			return;
		node.play();
	},
	
	// Pause audio
	pause: function() {
		var node = this.hasNode();
		if (!node)
			return;		
		node.pause();
	},
	
	// Test if audio is paused
	paused: function() {
		var node = this.hasNode();
		if (!node)
			return false;		
		return node.paused;
	},

	// Test if audio is ended
	ended: function() {
		var node = this.hasNode();
		if (!node)
			return false;		
		return node.ended;
	}	
});

