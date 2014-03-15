/**
	_enyo.FittableColumns_ provides a container in which items are laid out in a
	set of vertical columns, with most items having natural size, but one
	expanding to fill the remaining space. The one that expands is labeled with
	the attribute _fit: true_.

	For example, the following code will align three components as columns, with
	the second filling the available container space between the first and third:

		enyo.kind({
			kind: "FittableColumns",
			components: [
				{content: "1"},
				{content: "2", fit:true},
				{content: "3"}
			]
		});

	Alternatively, you may set a kind's _layoutKind_ property to
	<a href="#enyo.FittableColumnsLayout">enyo.FittableColumnsLayout</a>
	to use a different base kind while still employing the fittable	layout
	strategy, e.g.:

		enyo.kind({
		  kind: enyo.Control,
		  layoutKind: "FittableColumnsLayout",
			components: [
				{content: "1"},
				{content: "2", fit:true},
				{content: "3"}
			]
		});
*/

enyo.kind({
	name: "enyo.FittableColumns",
	layoutKind: "FittableColumnsLayout",
	/** By default, items in columns stretch to fit vertically; set to true to
		avoid this behavior. */
	noStretch: false
});
