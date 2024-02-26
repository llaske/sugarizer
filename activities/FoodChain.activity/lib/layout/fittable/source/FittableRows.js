/**
	_enyo.FittableRows_ provides a container in which items are laid out in a
	set	of horizontal rows, with most of the items having natural size, but one
	expanding to fill the remaining space. The one that expands is labeled with
	the attribute _fit: true_.
	
	For example, the following code will align three components as rows, with
	the second filling the available container space between the first and third.

		enyo.kind({
			kind: "FittableRows",
			components: [
				{content: "1"},
				{content: "2", fit:true},
				{content: "3"}
			]
		});

	Alternatively, you may set a kind's _layoutKind_ property to
	<a href="#enyo.FittableRowsLayout">enyo.FittableRowsLayout</a>
	to use a different base kind while still employing the fittable layout
	strategy, e.g.:

		enyo.kind({
		  kind: enyo.Control,
		  layoutKind: "FittableRowsLayout",
			components: [
				{content: "1"},
				{content: "2", fit:true},
				{content: "3"}
			]
		});
*/
enyo.kind({
	name: "enyo.FittableRows",
	layoutKind: "FittableRowsLayout",
	/** By default, items in rows stretch to fit horizontally; set to true to
		avoid this behavior. */
	noStretch: false
});
