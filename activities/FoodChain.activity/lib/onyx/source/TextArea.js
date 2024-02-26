/**
	An onyx-styled TextArea control. In addition to the features of
	<a href="#enyo.TextArea">enyo.TextArea</a>, onyx.TextArea has a
	*defaultFocus* property that can be set to true to focus the TextArea when
	it's rendered. Only one TextArea should be set as the *defaultFocus*.

	Typically, an onyx.TextArea is placed inside an
	<a href="#onyx.InputDecorator">onyx.InputDecorator</a>, which provides
	styling, e.g.:

		{kind: "onyx.InputDecorator", components: [
			{kind: "onyx.TextArea", onchange: "inputChange"}
		]}
*/
enyo.kind({
	name: "onyx.TextArea",
	kind: "enyo.TextArea",
	classes: "onyx-textarea"
});
