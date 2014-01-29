/**
	_onyx.PickerButton_ is a button that, when tapped, shows an
	<a href="#onyx.Picker">onyx.Picker</a>. Once an item is selected, the list
	of items closes, but the item stays selected and the PickerButton displays
	the choice that was made.
 */
enyo.kind({
	name: "onyx.PickerButton",
	kind: "onyx.Button",
	handlers: {
		onChange: "change"
	},
	change: function(inSender, inEvent) {
		this.setContent(inEvent.content);
	}
});