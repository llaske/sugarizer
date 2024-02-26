/**
	The base kind for items that live inside an
	<a href="#enyo.Canvas">enyo.Canvas</a> control.

	If you're using this kind directly, you may implement an _onRender_ event
	handler in the owner to handle drawing into the canvas.

	If you're deriving a new kind based on this one, override the _renderSelf_
	method and use that for your drawing code.
*/
enyo.kind({
	name: "enyo.canvas.Control",
	kind: enyo.UiComponent,
	defaultKind: "enyo.canvas.Control",
	published: {
		//* Structure with l (left), t (top), w (width), and h (height) members.
		//* The default constructor sets those properties to random values.
		bounds: null
	},
	events: {
		//* Event providing hook to render this control. The event structure 
		//* includes a _context_ member holding the active canvas context.
		onRender: ""
	},
	//* @protected
	constructor: function() {
		this.bounds = {l: enyo.irand(400), t: enyo.irand(400), w: enyo.irand(100), h: enyo.irand(100)};
		this.inherited(arguments);
	},
	importProps: function(inProps) {
		this.inherited(arguments);
		if (inProps.bounds) {
			enyo.mixin(this.bounds, inProps.bounds);
			delete inProps.bounds;
		}
	},
	renderSelf: function(inContext) {
		this.doRender({context: inContext});
	},
	render: function(inContext) {
		if (this.children.length) {
			this.renderChildren(inContext);
		} else {
			this.renderSelf(inContext);
		}
	},
	renderChildren: function(inContext) {
		for (var i=0, c; c=this.children[i]; i++) {
			c.render(inContext);
		}
	}
});
