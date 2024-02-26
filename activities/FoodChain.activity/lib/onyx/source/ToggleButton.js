/**
	A control that looks like a switch with labels for two states. Each time a ToggleButton is tapped,
	it switches its value and fires an onChange event.
	
		{kind: "onyx.ToggleButton", onContent: "foo", offContent: "bar", onChange: "buttonToggle"}
	
		buttonToggle: function(inSender, inEvent) {
			this.log("Toggled to value " + inEvent.value);
		}
	
	To find out the value of the button, use getValue:
	
		queryToggleValue: function() {
			return this.$.toggleButton.getValue();
		}
		
	The color of the toggle button can be customized by applying a background color:
	
		{kind: "onyx.ToggleButton", style: "background-color: #35A8EE;"}
*/
enyo.kind({
	name: "onyx.ToggleButton",
	classes: "onyx-toggle-button",
	published: {
		active: false,
		value: false,
		onContent: "On",
		offContent: "Off",
		disabled: false
	},
	events: {
		/**
			The onChange event fires when the user changes the value of the toggle button, 
			but not when the value is changed programmatically.
		*/
		onChange: ""
	},
	//* @protected
	handlers: {
		ondragstart: "dragstart",
		ondrag: "drag",
		ondragfinish: "dragfinish"
	},
	components: [
		{name: "contentOn", classes: "onyx-toggle-content on"},
		{name: "contentOff", classes: "onyx-toggle-content off"},
		{classes: "onyx-toggle-button-knob"}
	],
	create: function() {
		this.inherited(arguments);
		this.value = Boolean(this.value || this.active);
		this.onContentChanged();
		this.offContentChanged();
		this.disabledChanged();
	},
	rendered: function() {
		this.inherited(arguments);
		this.valueChanged();
	},
	valueChanged: function() {
		this.addRemoveClass("off", !this.value);
		this.$.contentOn.setShowing(this.value);
		this.$.contentOff.setShowing(!this.value);
		this.setActive(this.value);
	},
	activeChanged: function() {
		this.setValue(this.active);
		this.bubble("onActivate");
	},
	onContentChanged: function() {
		this.$.contentOn.setContent(this.onContent || "");
		this.$.contentOn.addRemoveClass("empty", !this.onContent);
	},
	offContentChanged: function() {
		this.$.contentOff.setContent(this.offContent || "");
		this.$.contentOff.addRemoveClass("empty", !this.onContent);
	},
	disabledChanged: function() {
		this.addRemoveClass("disabled", this.disabled);
	},
	updateValue: function(inValue) {
		if (!this.disabled) {
			this.setValue(inValue);
			this.doChange({value: this.value});
		}
	},
	tap: function() {
		this.updateValue(!this.value);
	},
	dragstart: function(inSender, inEvent) {
		if (inEvent.horizontal) {
			inEvent.preventDefault();
			this.dragging = true;
			this.dragged = false;
			return true;
		}
	},
	drag: function(inSender, inEvent) {
		if (this.dragging) {
			var d = inEvent.dx;
			if (Math.abs(d) > 10) {
				this.updateValue(d > 0);
				this.dragged = true;
			}
			return true;
		}
	},
	dragfinish: function(inSender, inEvent) {
		this.dragging = false;
		if (this.dragged) {
			inEvent.preventTap();
		}
	}
})
