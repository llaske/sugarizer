/**
	A control that activates an <a href="#onyx.Menu">onyx.Menu</a>. It loosely
	couples the Menu with an activating control, which may be a button or any
	other control with an _onActivate_ event. The decorator must surround both
	the	activating control and the menu itself.	When the control is activated,
	the	menu shows itself in the correct position relative to the activator.
	
		{kind: "onyx.MenuDecorator", components: [
			{content: "Show menu"},
			{kind: "onyx.Menu", components: [
				{content: "1"},
				{content: "2"},
				{classes: "onyx-menu-divider"},
				{content: "3"},
			]}
		]}
 */
enyo.kind({
	name: "onyx.MenuDecorator",
	kind: "onyx.TooltipDecorator",
	defaultKind: "onyx.Button",
	// selection on ios prevents tap events, so avoid.
	classes: "onyx-popup-decorator enyo-unselectable",
	handlers: {
		onActivate: "activated",
		onHide: "menuHidden"
	},
	activated: function(inSender, inEvent) {
		this.requestHideTooltip();
		if (inEvent.originator.active) {
			this.menuActive = true;
			this.activator = inEvent.originator;
			this.activator.addClass("active");
			this.requestShowMenu();
		}
	},
	requestShowMenu: function() {
		this.waterfallDown("onRequestShowMenu", {activator: this.activator});
	},
	requestHideMenu: function() {
		this.waterfallDown("onRequestHideMenu");
	},
	menuHidden: function() {
		this.menuActive = false;
		if (this.activator) {
			this.activator.setActive(false);
			this.activator.removeClass("active");
		}
	},
	enter: function(inSender) {
		if (!this.menuActive) {
			this.inherited(arguments);
		}
	},
	leave: function(inSender, inEvent) {
		if (!this.menuActive) {
			this.inherited(arguments);
		}
	}
});