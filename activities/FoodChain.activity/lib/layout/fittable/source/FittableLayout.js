/** 
	_enyo.FittableLayout_ provides the base positioning and boundary logic for
	the fittable layout strategy. The fittable layout strategy is based on
	laying out items in either a set of rows or a set of columns, with most of
	the items having natural size, but one item expanding to fill the remaining
	space. The item that expands is labeled with the attribute _fit: true_.

	For example, in the following kind, the second component fills the available
	space in the container between the first and third components.

		enyo.kind({
			kind: "FittableRows",
			components: [
				{content: "1"},
				{content: "2", fit:true},
				{content: "3"}
			]
		});
	
	<a href="#enyo.FittableColumnsLayout">enyo.FittableColumnsLayout</a> and
	<a href="#enyo.FittableRowsLayout">enyo.FittableRowsLayout</a> (or their
	subkinds) are used for layout rather than _enyo.FittableLayout_ because they
	specify properties that _enyo.FittableLayout_ expects to be available when
	laying items out.
*/
enyo.kind({
	name: "enyo.FittableLayout",
	kind: "Layout",
	//* @protected
	calcFitIndex: function() {
		for (var i=0, c$=this.container.children, c; c=c$[i]; i++) {
			if (c.fit && c.showing) {
				return i;
			}
		}
	},
	getFitControl: function() {
		var c$=this.container.children;
		var f = c$[this.fitIndex];
		if (!(f && f.fit && f.showing)) {
			this.fitIndex = this.calcFitIndex();
			f = c$[this.fitIndex];
		}
		return f;
	},
	getLastControl: function() {
		var c$=this.container.children;
		var i = c$.length-1;
		var c = c$[i];
		while ((c=c$[i]) && !c.showing) {
			i--;
		}
		return c;
	},
	_reflow: function(measure, cMeasure, mAttr, nAttr) {
		this.container.addRemoveClass("enyo-stretch", !this.container.noStretch);
		var f = this.getFitControl();
		// no sizing if nothing is fit.
		if (!f) {
			return;
		}
		//
		// determine container size, available space
		var s=0, a=0, b=0, p;
		var n = this.container.hasNode();
		// calculate available space
		if (n) {
			// measure 1
			p = enyo.FittableLayout.calcPaddingExtents(n);
			// measure 2
			s = n[cMeasure] - (p[mAttr] + p[nAttr]);
			//console.log("overall size", s);
		}
		//
		// calculate space above fitting control
		// measure 3
		var fb = f.getBounds();
		// offset - container padding.
		a = fb[mAttr] - ((p && p[mAttr]) || 0);
		//console.log("above", a);
		//
		// calculate space below fitting control
		var l = this.getLastControl();
		if (l) {
			// measure 4
			var mb = enyo.FittableLayout.getComputedStyleValue(l.hasNode(), "margin", nAttr) || 0;
			if (l != f) {
				// measure 5
				var lb = l.getBounds();
				// fit offset + size
				var bf = fb[mAttr] + fb[measure];
				// last offset + size + ending margin
				var bl = lb[mAttr] + lb[measure] + mb;
				// space below is bottom of last item - bottom of fit item.
				b = bl - bf;
			} else {
				b = mb;
			}
		}
		
		// calculate appropriate size for fit control
		var fs = s - (a + b);
		//console.log(f.id, fs);
		// note: must be border-box;
		f.applyStyle(measure, fs + "px");
	},
	//* @public
	/**
		Updates the layout to reflect any changes to contained components or the
		layout container.
	*/
	reflow: function() {
		if (this.orient == "h") {
			this._reflow("width", "clientWidth", "left", "right");
		} else {
			this._reflow("height", "clientHeight", "top", "bottom");
		}
	},
	statics: {
		//* @protected
		_ieCssToPixelValue: function(inNode, inValue) {
			var v = inValue;
			// From the awesome hack by Dean Edwards
			// http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291
			var s = inNode.style;
			// store style and runtime style values
			var l = s.left;
			var rl = inNode.runtimeStyle && inNode.runtimeStyle.left;
			// then put current style in runtime style.
			if (rl) {
				inNode.runtimeStyle.left = inNode.currentStyle.left;
			}
			// apply given value and measure its pixel value
			s.left = v;
			v = s.pixelLeft;
			// finally restore previous state
			s.left = l;
			if (rl) {
				s.runtimeStyle.left = rl;
			}
			return v;
		},
		_pxMatch: /px/i,
		getComputedStyleValue: function(inNode, inProp, inBoundary, inComputedStyle) {
			var s = inComputedStyle || enyo.dom.getComputedStyle(inNode);
			if (s) {
				return parseInt(s.getPropertyValue(inProp + "-" + inBoundary));
			} else if (inNode && inNode.currentStyle) {
				var v = inNode.currentStyle[inProp + enyo.cap(inBoundary)];
				if (!v.match(this._pxMatch)) {
					v = this._ieCssToPixelValue(inNode, v);
				}
				return parseInt(v);
			}
			return 0;
		},
		//* Gets the boundaries of a node's margin or padding box.
		calcBoxExtents: function(inNode, inBox) {
			var s = enyo.dom.getComputedStyle(inNode);
			return {
				top: this.getComputedStyleValue(inNode, inBox, "top", s),
				right: this.getComputedStyleValue(inNode, inBox, "right", s),
				bottom: this.getComputedStyleValue(inNode, inBox, "bottom", s),
				left: this.getComputedStyleValue(inNode, inBox, "left", s)
			};
		},
		//* Gets the calculated padding of a node.
		calcPaddingExtents: function(inNode) {
			return this.calcBoxExtents(inNode, "padding");
		},
		//* Gets the calculated margin of a node.
		calcMarginExtents: function(inNode) {
			return this.calcBoxExtents(inNode, "margin");
		}
	}
});

/** 
	_enyo.FittableColumnsLayout_ provides a container in which items are laid
	out in a set of vertical columns, with most of the items having natural
	size, but one expanding to fill the remaining space. The one that expands is
	labeled with the attribute _fit: true_.

	_enyo.FittableColumnsLayout_ is meant to be used as a value for the
	_layoutKind_ property of other kinds. _layoutKind_ provides a way to add
	layout behavior in a pluggable fashion while retaining the ability to use a
	specific base kind.
	
	For example, the following code will align three components as columns, with
	the second filling the available container space between the first and third.

		enyo.kind({
		  kind: enyo.Control,
		  layoutKind: "FittableColumnsLayout",
			components: [
				{content: "1"},
				{content: "2", fit:true},
				{content: "3"}
			]
		});
	
	Alternatively, if a specific base kind is not needed, then instead of
	setting the _layoutKind_ attribute, you can set the base kind to
	<a href="#enyo.FittableColumns">enyo.FittableColumns</a>:

		enyo.kind({
			kind: "FittableColumns",
			components: [
				{content: "1"},
				{content: "2", fit:true},
				{content: "3"}
			]
		});
*/
enyo.kind({
	name: "enyo.FittableColumnsLayout",
	kind: "FittableLayout",
	orient: "h",
	layoutClass: "enyo-fittable-columns-layout"
});


/** 
	_enyo.FittableRowsLayout_ provides a container in which items are laid out
	in a set of horizontal rows, with most of the items having natural size, but
	one expanding to fill the remaining space. The one that expands is labeled
	with the attribute _fit: true_.

	_enyo.FittableRowsLayout_ is meant to be used as a value for the
	_layoutKind_ property of other kinds. _layoutKind_ provides a way to add
	layout behavior in a pluggable fashion while retaining the ability to use a
	specific base kind.

	For example, the following code will align three components as rows, with
	the second filling the available container space between the first and third.

		enyo.kind({
		  kind: enyo.Control,
		  layoutKind: "FittableRowsLayout",
			components: [
				{content: "1"},
				{content: "2", fit:true},
				{content: "3"}
			]
		});

	Alternatively, if a specific base kind is not needed, then instead of
	setting the _layoutKind_ attribute, you can set the base kind to
	<a href="#enyo.FittableRows">enyo.FittableRows</a>:

		enyo.kind({
			kind: "FittableRows",
			components: [
				{content: "1"},
				{content: "2", fit:true},
				{content: "3"}
			]
		});	
*/
enyo.kind({
	name: "enyo.FittableRowsLayout",
	kind: "FittableLayout",
	layoutClass: "enyo-fittable-rows-layout",
	orient: "v"
});
