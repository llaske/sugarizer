/**
	_enyo.canvas.Circle_ is a canvas control that draws a circle fitting the
	parameters specified in the	_bounds_ property.
*/
enyo.kind({
	name: "enyo.canvas.Circle",
	kind: enyo.canvas.Shape,
	//* @protected
	renderSelf: function(ctx) {
		ctx.beginPath();
		ctx.arc(this.bounds.l, this.bounds.t, this.bounds.w, 0, Math.PI*2);
		this.draw(ctx);
	}
});
