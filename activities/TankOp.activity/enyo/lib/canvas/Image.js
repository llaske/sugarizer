/**
	_enyo.canvas.Image_ is a canvas control that draws an image, stretched to
	fit the rectangle specified	by the _bounds_ property.
*/
enyo.kind({
	name: "enyo.canvas.Image",
	kind: enyo.canvas.Control,
	published: {
		//* Source URL for the image
		src: ""
	},
	//* @protected
	create: function() {
		this.image = new Image();
		this.inherited(arguments);
		this.srcChanged();
	},
	srcChanged: function() {
		if (this.src) {
			this.image.src = this.src;
		}
	},
	renderSelf: function(ctx) {
		ctx.drawImage(this.image, this.bounds.l, this.bounds.t);
	}
});