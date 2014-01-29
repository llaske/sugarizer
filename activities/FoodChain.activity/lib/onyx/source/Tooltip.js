/**
	_onyx.Tooltip_ is a kind of <a href="#onyx.Popup">onyx.Popup</a> that works
	with an	<a href="#onyx.TooltipDecorator">onyx.TooltipDecorator</a>. It
	automatically displays a tooltip when the user hovers over the decorator.
	The tooltip is positioned around the decorator where there is available
	window space. 

		{kind: "onyx.TooltipDecorator", components: [
			{kind: "onyx.Button", content: "Tooltip"},
			{kind: "onyx.Tooltip", content: "I'm a tooltip for a button."}
		]}

	You may manually display the tooltip by calling its _show_ method.
*/
enyo.kind({
	name: "onyx.Tooltip",
	kind: "onyx.Popup",
	classes: "onyx-tooltip below left-arrow",
	autoDismiss: false,
	showDelay: 500,
	defaultLeft: -6, //default margin-left value
	handlers: {
		onRequestShowTooltip: "requestShow",
		onRequestHideTooltip: "requestHide"
	},
	requestShow: function() {
		this.showJob = setTimeout(enyo.bind(this, "show"), this.showDelay);
		return true;
	},
	cancelShow: function() {
		clearTimeout(this.showJob);
	},
	requestHide: function() {
		this.cancelShow();
		return this.inherited(arguments);
	},
	showingChanged: function() {
		this.cancelShow();
		this.adjustPosition(true);
		this.inherited(arguments);
	},
	applyPosition: function(inRect) {
		var s = ""
		for (n in inRect) {
			s += (n + ":" + inRect[n] + (isNaN(inRect[n]) ? "; " : "px; "));
		}
		this.addStyles(s);
	},	
	adjustPosition: function(belowActivator) {
		if (this.showing && this.hasNode()) {
			var b = this.node.getBoundingClientRect();

			//when the tooltip bottom goes below the window height move it above the decorator
			if (b.top + b.height > window.innerHeight) {
				this.addRemoveClass("below", false);
				this.addRemoveClass("above", true);	
			} else 	{
				this.addRemoveClass("above", false);
				this.addRemoveClass("below", true);	
			}
			
			//when the tooltip's right edge is out of the window, align it's right edge with the decorator left edge (approx)
			if (b.left + b.width > window.innerWidth){
				this.applyPosition({'margin-left': -b.width, bottom: "auto"});	
				//use the right-arrow
				this.addRemoveClass("left-arrow", false);
				this.addRemoveClass("right-arrow", true);						
			}
		}
	},
	resizeHandler: function() {
		//reset the tooltip to align it's left edge with the decorator
		this.applyPosition({'margin-left': this.defaultLeft, bottom: "auto"});
		this.addRemoveClass("left-arrow", true);
		this.addRemoveClass("right-arrow", false);
		
		this.adjustPosition(true);
		this.inherited(arguments);			
	}
});
