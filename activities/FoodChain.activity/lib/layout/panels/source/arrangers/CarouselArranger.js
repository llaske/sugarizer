/**
	_enyo.CarouselArranger_ is an <a href="#enyo.Arranger">enyo.Arranger</a>
	that displays the active control, along with some number of inactive
	controls to fill the available space. The active control is positioned on
	the left side of the container, and the rest of the views are laid out to
	the right.

	One of the controls may have _fit: true_ set, in which case it will take up
	any remaining space after all of the other controls have been sized.

	For best results with CarouselArranger, you should set a minimum width for
	each control via a CSS style, e.g., _min-width: 25%_ or _min-width: 250px_.

	Transitions between arrangements are handled by sliding the new controls in
	from the right and sliding the old controls off to the left.
*/
enyo.kind({
	name: "enyo.CarouselArranger",
	kind: "Arranger",
	size: function() {
		var c$ = this.container.getPanels();
		var padding = this.containerPadding = this.container.hasNode() ? enyo.FittableLayout.calcPaddingExtents(this.container.node) : {};
		var pb = this.containerBounds;
		pb.height -= padding.top + padding.bottom;
		pb.width -= padding.left + padding.right;
		// used space
		var fit;
		for (var i=0, s=0, m, c; c=c$[i]; i++) {
			m = enyo.FittableLayout.calcMarginExtents(c.hasNode());
			c.width = c.getBounds().width;
			c.marginWidth = m.right + m.left;
			s += (c.fit ? 0 : c.width) + c.marginWidth;
			if (c.fit) {
				fit = c;
			}
		}
		if (fit) {
				var w = pb.width - s;
				fit.width = w >= 0 ? w : fit.width;
			}
		for (var i=0, e=padding.left, m, c; c=c$[i]; i++) {
			c.setBounds({top: padding.top, bottom: padding.bottom, width: c.fit ? c.width : null});
		}
	},
	arrange: function(inC, inName) {
		if (this.container.wrap) {
			this.arrangeWrap(inC, inName);
		} else {
			this.arrangeNoWrap(inC, inName);
		}
	},
	arrangeNoWrap: function(inC, inName) {
		var c$ = this.container.getPanels();
		var s = this.container.clamp(inName);
		var nw = this.containerBounds.width;
		// do we have enough content to fill the width?
		for (var i=s, cw=0, c; c=c$[i]; i++) {
			cw += c.width + c.marginWidth;
			if (cw > nw) {
				break;
			}
		}
		// if content width is less than needed, adjust starting point index and offset
		var n = nw - cw;
		var o = 0;
		if (n > 0) {
			var s1 = s;
			for (var i=s-1, aw=0, c; c=c$[i]; i--) {
				aw += c.width + c.marginWidth;
				if (n - aw <= 0) {
					o = (n - aw);
					s = i;
					break;
				}
			}
		}
		// arrange starting from needed index with detected offset so we fill space
		for (var i=0, e=this.containerPadding.left + o, w, c; c=c$[i]; i++) {
			w = c.width + c.marginWidth;
			if (i < s) {
				this.arrangeControl(c, {left: -w});
			} else {
				this.arrangeControl(c, {left: Math.floor(e)});
				e += w;
			}
		}
	},
	arrangeWrap: function(inC, inName) {
		for (var i=0, e=this.containerPadding.left, m, c; c=inC[i]; i++) {
			this.arrangeControl(c, {left: e});
			e += c.width + c.marginWidth;
		}
	},
	calcArrangementDifference: function(inI0, inA0, inI1, inA1) {
		var i = Math.abs(inI0 % this.c$.length);
		return inA0[i].left - inA1[i].left;
	},
	destroy: function() {
		var c$ = this.container.getPanels();
		for (var i=0, c; c=c$[i]; i++) {
			enyo.Arranger.positionControl(c, {left: null, top: null});
			c.applyStyle("top", null);
			c.applyStyle("bottom", null);
			c.applyStyle("left", null);
			c.applyStyle("width", null);
		}
		this.inherited(arguments);
	}	
});
