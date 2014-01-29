/**
	An onyx-styled input control. In addition to the features of
	<a href="#enyo.Input">enyo.Input</a>, onyx.Input has a *defaultFocus*
	property that can be set to true to	focus the input when it's rendered.
	Only one input should be set as the *defaultFocus*.

	Typically, an onyx.Input is placed inside an
	<a href="#onyx.InputDecorator">onyx.InputDecorator</a>, which provides
	styling, e.g.:

		{kind: "onyx.InputDecorator", components: [
			{kind: "onyx.Input", placeholder: "Enter some text...", onchange: "inputChange"}
		]}

*/
enyo.kind({
	name: "onyx.Input",
	kind: "enyo.Input",
	classes: "onyx-input"
});
