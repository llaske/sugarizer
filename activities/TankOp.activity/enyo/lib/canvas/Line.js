/**
	_enyo.canvas.line_ is a canvas control that draws a line fitting
	the parameters specified in	the _bounds_ property.
*/
enyo.kind({
	name: "enyo.canvas.Line",
	kind: enyo.canvas.Shape,
	//* @protected
	renderSelf: function(ctx) {
		ctx.save();
		ctx.beginPath();
		ctx.strokeStyle = this.bounds.Style;
		ctx.lineWidth = this.bounds.width;
		ctx.lineCap = this.bounds.cap;
		ctx.moveTo(this.bounds.start_x, this.bounds.start_y);
		ctx.lineTo(this.bounds.finish_x, this.bounds.finish_y);
		ctx.stroke();
		ctx.restore();
	}

});
