/**
	_enyo.Arranger_ is an <a href="#enyo.Layout">enyo.Layout</a> that considers
	one of the controls it lays out as active. The other controls are placed
	relative to the active control as makes sense for the layout.

	Arranger supports dynamic layouts, meaning it's possible to transition
	between its layouts	via animation. Typically, arrangers should lay out
	controls using CSS transforms, since these are optimized for animation. To
	support this, the controls in an Arranger are absolutely positioned, and
	the Arranger kind has an `accelerated` property, which marks controls for
	CSS compositing. The default setting of "auto" ensures that this will occur
	if enabled by the platform.

	For more information, see the documentation on
	[Arrangers](https://github.com/enyojs/enyo/wiki/Arrangers)
	in the Enyo	Developer Guide.
*/
enyo.kind({
	name: "enyo.Arranger",
	kind: "Layout",
	layoutClass: "enyo-arranger",
	/**
		Sets controls being laid out to use CSS compositing. A setting of "auto"
		will mark controls for compositing if the platform supports it.
	*/
	accelerated: "auto",
	//* Property of the drag event used to calculate the amount a drag moves the layout
	dragProp: "ddx",
	//* Property of the drag event used to calculate the direction of a drag
	dragDirectionProp: "xDirection",
	//* Property of the drag event used to calculate whether a drag should occur
	canDragProp: "horizontal",
	/**
		If set to true, transitions between non-adjacent arrangements will go
		through the intermediate arrangements. This is useful when direct
		transitions between arrangements would be visually jarring.
	*/
	incrementalPoints: false,
	/**
		Called when removing an arranger (for example, when switching a Panels
		control to a different arrangerKind). Subclasses should implement this
		function to reset whatever properties they've changed on child controls.
		You *must* call the superclass implementation in your subclass's
		_destroy_ function.
	*/
	destroy: function() {
		var c$ = this.container.getPanels();
		for (var i=0, c; c=c$[i]; i++) {
			c._arranger = null;
		}
		this.inherited(arguments);
	},
	//* @public
	/**
		Arranges the given array of controls (_inC_) in the layout specified by
		_inName_. When implementing this method, rather than apply styling
		directly to controls, call _arrangeControl(inControl, inArrangement)_
		with an _inArrangement_	object with styling settings. These will then be
		applied via the	_flowControl(inControl, inArrangement)_ method.
	*/
	arrange: function(inC, inName) {
	},
	/**
		Sizes the controls in the layout. This method is called only at reflow
		time. Note that sizing is separated from other layout done in the
		_arrange_ method because it is expensive and not suitable for dynamic
		layout.
	*/
	size: function() {
	},
	/**
		Called when a layout transition begins. Implement this method to perform
		tasks that should only occur when a transition starts; for example, some
		controls could be shown or hidden. In addition, the	_transitionPoints_
		array may be set on the container to dictate the named arrangments
		between which the transition occurs.
	*/
	start: function() {
		var f = this.container.fromIndex, t = this.container.toIndex;
		var p$ = this.container.transitionPoints = [f];
		// optionally add a transition point for each index between from and to.
		if (this.incrementalPoints) {
			var d = Math.abs(t - f) - 2;
			var i = f;
			while (d >= 0) {
				i = i + (t < f ? -1 : 1);
				p$.push(i);
				d--;
			}
		}
		p$.push(this.container.toIndex);
	},
	/**
		Called when a layout transition completes. Implement this method to
		perform tasks that should only occur when a transition ends; for
		example, some controls could be shown or hidden.
	*/
	finish: function() {
	},
	//* @protected
	canDragEvent: function(inEvent) {
		return inEvent[this.canDragProp];
	},
	calcDragDirection: function(inEvent) {
		return inEvent[this.dragDirectionProp];
	},
	calcDrag: function(inEvent) {
		return inEvent[this.dragProp];
	},
	drag: function(inDp, inAn, inA, inBn, inB) {
		var f = this.measureArrangementDelta(-inDp, inAn, inA, inBn, inB);
		return f;
	},
	measureArrangementDelta: function(inX, inI0, inA0, inI1, inA1) {
		var d = this.calcArrangementDifference(inI0, inA0, inI1, inA1);
		var s = d ? inX / Math.abs(d) : 0;
		s = s * (this.container.fromIndex > this.container.toIndex ? -1 : 1);
		//enyo.log("delta", s);
		return s;
	},
	//* @public
	/**
	Called when dragging the layout, this method returns the difference in
	pixels between the arrangement _inA0_ for layout setting _inI0_	and
	arrangement _inA1_ for layout setting _inI1_. This data is used to calculate
	the percentage that a drag should move the layout between two active states.
	*/
	calcArrangementDifference: function(inI0, inA0, inI1, inA1) {
	},
	//* @protected
	_arrange: function(inIndex) {
		var c$ = this.getOrderedControls(inIndex);
		this.arrange(c$, inIndex);
	},
	arrangeControl: function(inControl, inArrangement) {
		inControl._arranger = enyo.mixin(inControl._arranger || {}, inArrangement);
	},
	flow: function() {
		this.c$ = [].concat(this.container.getPanels());
		this.controlsIndex = 0;
		for (var i=0, c$=this.container.getPanels(), c; c=c$[i]; i++) {
			enyo.dom.accelerate(c, this.accelerated);
			if (enyo.platform.safari) {
				// On Safari-desktop, sometimes having the panel's direct child set to accelerate isn't sufficient
				// this is most often the case with Lists contained inside another control, inside a Panels
				var grands=c.children;
				for (var j=0, kid; kid=grands[j]; j++) {
					enyo.dom.accelerate(kid, this.accelerated);
				}
			} 
		}
	},
	reflow: function() {
		var cn = this.container.hasNode();
		this.containerBounds = cn ? {width: cn.clientWidth, height: cn.clientHeight} : {};
		this.size();
	},
	flowArrangement: function() {
		var a = this.container.arrangement;
		if (a) {
			for (var i=0, c$=this.container.getPanels(), c; c=c$[i]; i++) {
				this.flowControl(c, a[i]);
			}
		}
	},
	//* @public
	/**
		Lays out the control (_inControl_) according to the settings stored in
		the	_inArrangment_ object. By default, _flowControl_ will apply settings
		of left, top, and opacity. This method should only be implemented to
		apply other settings made via _arrangeControl_.
	*/
	flowControl: function(inControl, inArrangement) {
		enyo.Arranger.positionControl(inControl, inArrangement);
		var o = inArrangement.opacity;
		if (o != null) {
			enyo.Arranger.opacifyControl(inControl, o);
		}
	},
	//* @protected
	// Gets an array of controls arranged in state order.
	// note: optimization, dial around a single array.
	getOrderedControls: function(inIndex) {
		var whole = Math.floor(inIndex);
		var a = whole - this.controlsIndex;
		var sign = a > 0;
		var c$ = this.c$ || [];
		for (var i=0; i<Math.abs(a); i++) {
			if (sign) {
				c$.push(c$.shift());
			} else {
				c$.unshift(c$.pop());
			}
		}
		this.controlsIndex = whole;
		return c$;
	},
	statics: {
		// Positions a control via transform: translateX/Y if supported and falls back to left/top if not.
		positionControl: function(inControl, inBounds, inUnit) {
			var unit = inUnit || "px";
			if (!this.updating) {
				if (enyo.dom.canTransform() && !enyo.platform.android) {
					var l = inBounds.left, t = inBounds.top;
					var l = enyo.isString(l) ? l : l && (l + unit);
					var t = enyo.isString(t) ? t : t && (t + unit);
					enyo.dom.transform(inControl, {translateX: l || null, translateY: t || null});
				} else {
					inControl.setBounds(inBounds, inUnit);
				}
			}
		},
		opacifyControl: function(inControl, inOpacity) {
			var o = inOpacity;
			// FIXME: very high/low settings of opacity can cause a control to
			// blink so cap this here.
			o = o > .99 ? 1 : (o < .01 ? 0 : o);
			// note: we only care about ie8
			if (enyo.platform.ie < 9) {
				inControl.applyStyle("filter", "progid:DXImageTransform.Microsoft.Alpha(Opacity=" + (o * 100) + ")");
			} else {
				inControl.applyStyle("opacity", o);
			}
		}
	}
});
