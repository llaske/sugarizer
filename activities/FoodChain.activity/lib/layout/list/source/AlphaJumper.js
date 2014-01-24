enyo.kind({
	name: "enyo.AlphaJumper",
	classes: "enyo-alpha-jumper enyo-border-box",
	published: {
		marker: null
	},
	events: {
		onAlphaJump: ""
	},
	handlers: {
		ondown: "down",
		onmove: "move",
		onup: "up"
	},
	initComponents: function() {
		for (var s="A".charCodeAt(0), i=s; i<s+26; i++) {
			this.createComponent({content: String.fromCharCode(i)});
		}
		this.inherited(arguments);
	},
	down: function(inSender, inEvent) {
		if (this.tracking) {
			enyo.dispatcher.release();
		}
		this.tracking = true;
		if (this.hasNode()) {
			var b = this.node.getBoundingClientRect();
			// IE8 does not return width
			var w = (b.width === undefined) ? (b.right - b.left) : b.width;
			this.x = b.left + w/2;
		}
		enyo.dispatcher.capture(this);
		this.track(inEvent);
	},
	move: function(inSender, inEvent) {
		if (this.tracking) {
			this.track(inEvent);
		}
	},
	up: function() {
		if (this.tracking) {
			enyo.dispatcher.release();
			this.setMarker(null);
			this.tracking = false;
		}
	},
	track: function(inEvent) {
		var n = document.elementFromPoint(this.x, inEvent.pageY);
		var c = this.nodeToControl(n);
		if (c) {
			this.setMarker(c);
		}
	},
	nodeToControl: function(inNode) {
		for (var i=0, c$=this.controls, c; c=c$[i]; i++) {
			if (inNode == c.hasNode()) {
				return c;
			}
		}
	},
	markerChanged: function(inLast) {
		if (inLast) {
			inLast.removeClass("active");
		}
		if (this.marker) {
			this.marker.addClass("active");
			this.doAlphaJump({letter: this.marker.getContent(), index: this.marker.indexInContainer()});
		}
	}
});