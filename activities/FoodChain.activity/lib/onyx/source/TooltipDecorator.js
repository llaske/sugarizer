/**
	A control that activates an <a href="#onyx.Tooltip">onyx.Tooltip</a>. It
	surrounds a control such as a button and displays the tooltip when the
	control generates an _onEnter_ event:

		{kind: "onyx.TooltipDecorator", components: [
			{kind: "onyx.Button", content: "Tooltip"},
			{kind: "onyx.Tooltip", content: "I'm a tooltip for a button."}
		]}

	Here's an example with an <a href="#onyx.Input">onyx.Input</a> control and a
	decorator around the input:

		{kind: "onyx.TooltipDecorator", components: [
			{kind: "onyx.InputDecorator", components: [
				{kind: "onyx.Input", placeholder: "Just an input..."}
			]},
			{kind: "onyx.Tooltip", content: "I'm a tooltip for an input."}
		]}
*/
enyo.kind({
	name: "onyx.TooltipDecorator",
	defaultKind: "onyx.Button",
	classes: "onyx-popup-decorator",
	handlers: {
		onenter: "enter",
		onleave: "leave"
	},
	enter: function() {
		this.requestShowTooltip();
	},
	leave: function() {
		this.requestHideTooltip();
	},
	tap: function() {
		this.requestHideTooltip();
	},
	requestShowTooltip: function() {
		this.waterfallDown("onRequestShowTooltip");
	},
	requestHideTooltip: function() {
		this.waterfallDown("onRequestHideTooltip");
	}
});