/**
	A control that appears or disappears based on its _open_ property. 
	It appears or disappears with a sliding animation whose direction is
	determined by the _orient_ property.
*/
enyo.kind({
	name: "onyx.Drawer",
	published: {
		//* The visibility state of the drawer's associated control
		open: true,
		//* "v" for vertical animation; "h" for horizontal animation
		orient: "v"
	},
	style: "overflow: hidden; position: relative;",
	tools: [
		{kind: "Animator", onStep: "animatorStep", onEnd: "animatorEnd"},
		{name: "client", style: "position: relative;", classes: "enyo-border-box"}
	],
	create: function() {
		this.inherited(arguments);
		this.openChanged();
	},
	initComponents: function() {
		this.createChrome(this.tools);
		this.inherited(arguments);
	},
	openChanged: function() {
		this.$.client.show();
		if (this.hasNode()) {
			if (this.$.animator.isAnimating()) {
				this.$.animator.reverse();
			} else {
				var v = this.orient == "v";
				var d = v ? "height" : "width";
				var p = v ? "top" : "left";
				// unfixing the height/width is needed to properly 
				// measure the scrollHeight/Width DOM property, but
				// can cause a momentary flash of content on some browsers
				this.applyStyle(d, null);
				var s = this.hasNode()[v ? "scrollHeight" : "scrollWidth"];
				this.$.animator.play({
					startValue: this.open ? 0 : s,
					endValue: this.open ? s : 0,
					dimension: d,
					position: p
				});
			}
		} else {
			this.$.client.setShowing(this.open);
		}
	},
	animatorStep: function(inSender) {
		if (this.hasNode()) {
			var d = inSender.dimension;
			this.node.style[d] = this.domStyles[d] = inSender.value + "px";
		}
		var cn = this.$.client.hasNode();
		if (cn) {
			var p = inSender.position;
			var o = (this.open ? inSender.endValue : inSender.startValue);
			cn.style[p] = this.$.client.domStyles[p] = (inSender.value - o) + "px";
		}
		if (this.container) {
			this.container.resized();
		}
	},
	animatorEnd: function() {
		if (!this.open) {
			this.$.client.hide();
		}
		if (this.container) {
			this.container.resized();
		}
	}
});