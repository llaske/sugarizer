/**
	A control that activates an <a href="#onyx.Picker">onyx.Picker</a>. It
	loosely couples the Picker with an activating
	<a href="#onyx.PickerButton">onyx.PickerButton</a>. The decorator must
	surround both the activating button and the picker itself. When the button
	is activated, the picker shows itself in the correct position relative to
	the activator.
	
		{kind: "onyx.PickerDecorator", components: [
			{}, //this uses the defaultKind property of PickerDecorator to inherit from PickerButton
			{kind: "onyx.Picker", components: [
				{content: "Gmail", active: true},
				{content: "Yahoo"},
				{content: "Outlook"},
				{content: "Hotmail"}
			]}
		]}
 */
enyo.kind({
	name: "onyx.PickerDecorator",
	kind: "onyx.MenuDecorator",
	classes: "onyx-picker-decorator",
	defaultKind: "onyx.PickerButton",
	handlers: {
		onChange: "change"
	},
	change: function(inSender, inEvent) {
		this.waterfallDown("onChange", inEvent);
	}
});
