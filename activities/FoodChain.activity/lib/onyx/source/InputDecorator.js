/**
	_onyx.InputDecorator_ is a control that provides input styling. Any controls
	in the InputDecorator will appear to be inside an area styled as an	input.
	Usually, an InputDecorator surrounds an	<a href="#onyx.Input">onyx.Input</a>.

		{kind: "onyx.InputDecorator", components: [
			{kind: "onyx.Input"}
		]}

	Other controls, such as buttons, may be placed to the right or left of the
	input control, e.g.:

		{kind: "onyx.InputDecorator", components: [
			{kind: "onyx.IconButton", src: "search.png"},
			{kind: "onyx.Input"},
			{kind: "onyx.IconButton", src: "cancel.png"}
		]}

	Note that the InputDecorator fits around the content inside it. If the
	decorator is sized, then its contents will likely need to be sized as well.

		{kind: "onyx.InputDecorator", style: "width: 500px;", components: [
			{kind: "onyx.Input", style: "width: 100%;"}
		]}
*/
enyo.kind({
	name: "onyx.InputDecorator",
	kind: "enyo.ToolDecorator",
	tag: "label",
	classes: "onyx-input-decorator",
	//* @protected
	handlers: {
		onDisabledChange: "disabledChange",
		onfocus: "receiveFocus",
		onblur: "receiveBlur"
	},
	receiveFocus: function() {
		this.addClass("onyx-focused");
	},
	receiveBlur: function() {
		this.removeClass("onyx-focused");
	},
	disabledChange: function(inSender, inEvent) {
		this.addRemoveClass("onyx-disabled", inEvent.originator.disabled);
	}
});