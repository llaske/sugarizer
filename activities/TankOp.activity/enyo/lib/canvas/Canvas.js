/**
	_enyo.Canvas_ is a control that generates a &lt;canvas&gt; HTML tag. It may
	contain other canvas components that are derived not from
	<a href="#enyo.Control">enyo.Control</a>, but from 
	<a href="#enyo.canvas.Control">enyo.canvas.Control</a>.  These aren't true
	controls in the sense of being DOM elements; they are, rather, shapes drawn
	into the canvas.
*/
enyo.kind({
	name: "enyo.Canvas",
	kind: enyo.Control,
	tag: "canvas",
	attributes: {
		//* Width of the canvas element
		width: 500,
		//* Height of the canvas element
		height: 500
	},
	defaultKind: "enyo.canvas.Control",
	//* @protected
	generateInnerHtml: function() {
		return '';
	},
	teardownChildren: function() {
	},
	rendered: function() {
		this.renderChildren();
	},
	/*
		addChild and removeChild of Control kind assumes children are Controls.
		CanvasControls are not, so we use UiComponent's version, the superkind of Control
	*/
	addChild: function() {
		enyo.UiComponent.prototype.addChild.apply(this, arguments);
	},
	removeChild: function() {
		enyo.UiComponent.prototype.removeChild.apply(this, arguments);
	},
	renderChildren: function(inContext) {
		var ctx = inContext;
		var canvas = this.hasNode();
		if (!ctx) {
			if (canvas.getContext) {
				ctx = canvas.getContext('2d');
			}
		}
		if (ctx) {
			for (var i=0, c; c=this.children[i]; i++) {
				c.render(ctx);
			}
		}
	},
	//* @public
	/**
		Refreshes the canvas context, clears existing drawings, and redraws all
		of the children.
	*/
	update: function() {
		var canvas = this.hasNode();
		if (canvas.getContext) {
			var ctx = canvas.getContext('2d');
			var b = this.getBounds();
			// clear canvas
			ctx.clearRect(0, 0, b.width, b.height);
			this.renderChildren(ctx);
		}
	}
});
