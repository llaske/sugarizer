/**
	Slideable is a control that can be dragged either horizontally or vertically
	between a minimum and a maximum value.  When released from dragging, a
	Slideable will animate to its minimum or maximum position, depending on the
	direction of the drag.

	The *min* value specifies a position left of or above the	initial position,
	to which the Slideable may be dragged.
	The *max* value specifies a position right of or below the initial position,
	to which the Slideable may be dragged.
	The *value* property specifies the current position of the Slideable,
	between the minimum and maximum positions.

	*min*, *max*, and *value* may be specified in units of "px" or "%".
	
	The *axis* property controls whether the Slideable slides left-right (h) or
	up-down (v).

	The following control is placed 90% off the screen to the right, and slides
	to its natural position.

		{kind: "enyo.Slideable", value: -90, min: -90, unit: "%",
			classes: "enyo-fit", style: "width: 300px;",
			components: [
				{content: "stuff"}
			]
		}
*/
enyo.kind({
	name: "enyo.Slideable",
	kind: "Control",
	published: {
		//* Direction of sliding; can be "h" or "v"
		axis: "h",
		//* A value between min and max to position the Slideable
		value: 0,
		//* Unit for min, max, and value; can be "px" or "%"
		unit: "px",
		//* A minimum value to slide to
		min: 0,
		//* A maximum value to slide to
		max: 0,
		accelerated: "auto",
		//* Set to false to prevent the Slideable from dragging with elasticity past its min/max value.
		overMoving: true,
		//* Set to false to disable dragging.
		draggable: true
	},
	events: {
		//* Fires when the Slideable finishes animating.
		onAnimateFinish: "",
		onChange: ""
	},
	// Set to true to prevent a drag from bubbling beyond the Slideable.
	preventDragPropagation: false,
	//* @protected
	tools: [
		{kind: "Animator", onStep: "animatorStep", onEnd: "animatorComplete"}
	],
	handlers: {
		ondragstart: "dragstart",
		ondrag: "drag",
		ondragfinish: "dragfinish"
	},
	kDragScalar: 1,
	dragEventProp: "dx",
	unitModifier: false,
	canTransform: false,
	//* @protected
	create: function() {
		this.inherited(arguments);
		this.acceleratedChanged();
		this.transformChanged();
		this.axisChanged();
		this.valueChanged();
		this.addClass("enyo-slideable");
	},
	initComponents: function() {
		this.createComponents(this.tools);
		this.inherited(arguments);
	},
	rendered: function() {
		this.inherited(arguments);
		this.canModifyUnit();
		this.updateDragScalar();
	},
	resizeHandler: function() {
		this.inherited(arguments);
		this.updateDragScalar();
	},
	canModifyUnit: function() {
		if (!this.canTransform) {
			var b = this.getInitialStyleValue(this.hasNode(), this.boundary);
			// If inline style of "px" exists, while unit is "%"
			if (b.match(/px/i) && (this.unit === "%")) {
				// Set unitModifier - used to over-ride "%"
				this.unitModifier = this.getBounds()[this.dimension];
			}
		}
	},
	getInitialStyleValue: function(inNode, inBoundary) {
		var s = enyo.dom.getComputedStyle(inNode);
		if (s) {
			return s.getPropertyValue(inBoundary);
		} else if (inNode && inNode.currentStyle) {
			return inNode.currentStyle[inBoundary];
		}
		return "0";
	},
	updateBounds: function(inValue, inDimensions) {
		var inBounds = {};
		inBounds[this.boundary] = inValue;
		this.setBounds(inBounds, this.unit);
		
		this.setInlineStyles(inValue, inDimensions);
	},
	updateDragScalar: function() {
		if (this.unit == "%") {
			var d = this.getBounds()[this.dimension];
			this.kDragScalar = d ? 100 / d : 1;

			if (!this.canTransform) {
				this.updateBounds(this.value, 100);
			}
		}
	},
	transformChanged: function() {
		this.canTransform = enyo.dom.canTransform();
	},
	acceleratedChanged: function() {
		if (!(enyo.platform.android > 2)) {
			enyo.dom.accelerate(this, this.accelerated);
		}
	},
	axisChanged: function() {
		var h = this.axis == "h";
		this.dragMoveProp = h ? "dx" : "dy";
		this.shouldDragProp = h ? "horizontal" : "vertical";
		this.transform = h ? "translateX" : "translateY";
		this.dimension = h ? "width" : "height";
		this.boundary = h ? "left" : "top";
	},
	setInlineStyles: function(inValue, inDimensions) {
		var inBounds = {};
		
		if (this.unitModifier) {
			inBounds[this.boundary] = this.percentToPixels(inValue, this.unitModifier);
			inBounds[this.dimension] = this.unitModifier;
			this.setBounds(inBounds);
		} else {
			if (inDimensions) {
				inBounds[this.dimension] = inDimensions;
			} else {
				inBounds[this.boundary] = inValue;
			}
			this.setBounds(inBounds, this.unit);
		}
	},
	valueChanged: function(inLast) {
		var v = this.value;
		if (this.isOob(v) && !this.isAnimating()) {
				this.value = this.overMoving ? this.dampValue(v) : this.clampValue(v);
		}
		// FIXME: android cannot handle nested compositing well so apply acceleration only if needed
		// desktop chrome doesn't like this code path so avoid...
		if (enyo.platform.android > 2) {
			if (this.value) {
				if (inLast === 0 || inLast === undefined) {
					enyo.dom.accelerate(this, this.accelerated);
				}
			} else {
				enyo.dom.accelerate(this, false);
			}
		}

		// If platform supports transforms
		if (this.canTransform) {
			enyo.dom.transformValue(this, this.transform, this.value + this.unit);
		// else update inline styles
		} else {
			this.setInlineStyles(this.value, false);
		}
		this.doChange();
	},
	getAnimator: function() {
		return this.$.animator;
	},
	isAtMin: function() {
		return this.value <= this.calcMin();
	},
	isAtMax: function() {
		return this.value >= this.calcMax();
	},
	calcMin: function() {
		return this.min;
	},
	calcMax: function() {
		return this.max;
	},
	clampValue: function(inValue) {
		var min = this.calcMin();
		var max = this.calcMax();
		return Math.max(min, Math.min(inValue, max));
	},
	dampValue: function(inValue) {
		return this.dampBound(this.dampBound(inValue, this.min, 1), this.max, -1);
	},
	dampBound: function(inValue, inBoundary, inSign) {
		var v = inValue;
		if (v * inSign < inBoundary * inSign) {
			v = inBoundary + (v - inBoundary) / 4;
		}
		return v;
	},
	percentToPixels: function(value, dimension) {
		return Math.floor((dimension / 100) * value);
	},
	pixelsToPercent: function(value) {
		var boundary = this.unitModifier ? this.getBounds()[this.dimension] : this.container.getBounds()[this.dimension];
		return (value / boundary) * 100;
	},
	// dragging
	shouldDrag: function(inEvent) {
		return this.draggable && inEvent[this.shouldDragProp];
	},
	isOob: function(inValue) {
		return inValue > this.calcMax() || inValue < this.calcMin();
	},
	dragstart: function(inSender, inEvent) {
		if (this.shouldDrag(inEvent)) {
			inEvent.preventDefault();
			this.$.animator.stop();
			inEvent.dragInfo = {};
			this.dragging = true;
			this.drag0 = this.value;
			this.dragd0 = 0;
			return this.preventDragPropagation;
		}
	},
	drag: function(inSender, inEvent) {
		if (this.dragging) {
			inEvent.preventDefault();
			var d = this.canTransform ? inEvent[this.dragMoveProp] * this.kDragScalar : this.pixelsToPercent(inEvent[this.dragMoveProp]);
			var v = this.drag0 + d;
			var dd = d - this.dragd0;
			this.dragd0 = d;
			if (dd) {
				inEvent.dragInfo.minimizing = dd < 0;
			}
			this.setValue(v);
			return this.preventDragPropagation;
		}
	},
	dragfinish: function(inSender, inEvent) {
		if (this.dragging) {
			this.dragging = false;
			this.completeDrag(inEvent);
			inEvent.preventTap();
			return this.preventDragPropagation;
		}
	},
	completeDrag: function(inEvent) {
		if (this.value !== this.calcMax() && this.value != this.calcMin()) {
			this.animateToMinMax(inEvent.dragInfo.minimizing);
		}
	},
	// animation
	isAnimating: function() {
		return this.$.animator.isAnimating();
	},
	play: function(inStart, inEnd) {
		this.$.animator.play({
			startValue: inStart,
			endValue: inEnd,
			node: this.hasNode()
		});
	},
	//* @public
	//* Animates to the given value.
	animateTo: function(inValue) {
		this.play(this.value, inValue);
	},
	//* Animates to the minimum value.
	animateToMin: function() {
		this.animateTo(this.calcMin());
	},
	//* Animates to the maximum value.
	animateToMax: function() {
		this.animateTo(this.calcMax());
	},
	//* @protected
	animateToMinMax: function(inMin) {
		if (inMin) {
			this.animateToMin();
		} else {
			this.animateToMax();
		}
	},
	animatorStep: function(inSender) {
		this.setValue(inSender.value);
		return true;
	},
	animatorComplete: function(inSender) {
		this.doAnimateFinish(inSender);
		return true;
	},
	//* @public
	//* Toggles between min and max with animation.
	toggleMinMax: function() {
		this.animateToMinMax(!this.isAtMin());
	}
});
