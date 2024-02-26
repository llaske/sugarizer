/**
	_enyo.canvas.Shape_ is the base kind for shapes that can be drawn into the
	canvas.	It doesn't have a default rendering, but an event handler may call
	the _draw_ method on it.

	Kinds derived from this one should provide their own implementation of
	_renderSelf_. If more complex operations are needed for filled mode or
	outline	mode, override the _fill_ or _outline_ methods, respectively.
*/
enyo.kind({
	name: "enyo.canvas.Shape",
	kind: enyo.canvas.Control,
	published: {
		//* Color used to draw the interior of the shape
		color: "red",
		//* Color used to draw the outline of the shape
		outlineColor: ""
	},
	//* @protected
	fill: function(inContext) {
		inContext.fill();
	},
	outline: function(inContext) {
		inContext.stroke();
	},
	//* @public
	/**
		Draws the shape by invoking the shape's fill or outline methods,
		usually invoked by the derived shape's renderSelf method in response
		to the parent of the CanvasControls rendering.
	*/
	draw: function(inContext) {
		if (this.color) {
			inContext.fillStyle = this.color;
			this.fill(inContext);
		}
		if (this.outlineColor) {
			inContext.strokeStyle = this.outlineColor;
			this.outline(inContext);
		}
	}
});
