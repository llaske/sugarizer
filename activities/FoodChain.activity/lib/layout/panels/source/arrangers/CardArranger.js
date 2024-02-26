/**
	_enyo.CardArranger_ is an <a href="#enyo.Arranger">enyo.Arranger</a> that
	displays only one active control. The non-active controls are hidden with
	_setShowing(false)_. Transitions between arrangements are handled by fading
	from one control to the next.
*/
enyo.kind({
	name: "enyo.CardArranger",
	kind: "Arranger",
	layoutClass: "enyo-arranger enyo-arranger-fit",
	calcArrangementDifference: function(inI0, inA0, inI1, inA1) {
		return this.containerBounds.width;
	},
	arrange: function(inC, inName) {
		for (var i=0, c, b, v; c=inC[i]; i++) {
			v = (i == 0) ? 1 : 0;
			this.arrangeControl(c, {opacity: v});
		}
	},
	start: function() {
		this.inherited(arguments);
		var c$ = this.container.getPanels();
		for (var i=0, c; c=c$[i]; i++) {
			var wasShowing=c.showing;
			c.setShowing(i == this.container.fromIndex || i == (this.container.toIndex));
			if (c.showing && !wasShowing) {
				c.resized();
			}
		}
		
	},
	finish: function() {
		this.inherited(arguments);
		var c$ = this.container.getPanels();
		for (var i=0, c; c=c$[i]; i++) {
			c.setShowing(i == this.container.toIndex);
		}
	},
	destroy: function() {
		var c$ = this.container.getPanels();
		for (var i=0, c; c=c$[i]; i++) {
			enyo.Arranger.opacifyControl(c, 1);
			if (!c.showing) {
				c.setShowing(true);
			}
		}
		this.inherited(arguments);
	}
});
