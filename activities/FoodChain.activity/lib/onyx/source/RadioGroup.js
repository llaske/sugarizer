/**
	A group of <a href="#onyx.RadioButton">onyx.RadioButton</a> objects
	laid out horizontally. Within the same radio group, tapping on one radio button
	will release any previously tapped radio button.
	
		{kind: "onyx.RadioGroup", components: [
			{content: "foo", active: true},
			{content: "bar"},
			{content: "baz"}
		]}
*/
enyo.kind({
	name: "onyx.RadioGroup",
	kind: "Group",
	highlander: true,
	defaultKind: "onyx.RadioButton"
});

