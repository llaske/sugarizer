/**
	onyx.MoreToolbar is a kind of <a href="#onyx.Toolbar">onyx.Toolbar</a> that can adapt to different screen sizes by moving overflowing controls and content into an <a href="#onyx.Menu">onyx.Menu</a>

		{kind: "onyx.MoreToolbar", components: [
			{content: "More Toolbar", unmoveable: true},
			{kind: "onyx.Button", content: "Alpha"},
			{kind: "onyx.Button", content: "Beta"},
			{kind: "onyx.Button", content: "Gamma", unmoveable: true},
			{kind: "onyx.Button", content: "Epsilon"}
		]},
		
	A control can be forced to never move to the menu by setting the optional unmovable property to true (default is false).
	
	Optionally you can specify a class to be applied to the menu via the menuClass property. You can also specify a class for items that have been moved via the the movedClass property.
*/

enyo.kind({
	name: "onyx.MoreToolbar",
	//* @public
	classes: "onyx-toolbar onyx-more-toolbar",
	//* style class to be applied to the menu
	menuClass: "",
	//* style class to be applied to individual controls moved from the toolbar to the menu
	movedClass: "",
	//* @protected
	layoutKind: "FittableColumnsLayout",
	noStretch: true,
	handlers: {
		onHide: "reflow"
	},
	tools: [
		{name: "client", fit: true, classes: "onyx-toolbar-inline"},
		{name: "nard", kind: "onyx.MenuDecorator", showing: false, onActivate: "activated", components: [
			{kind: "onyx.IconButton", classes: "onyx-more-button"},
			{name: "menu", kind: "onyx.Menu", classes: "onyx-more-menu", prepend: true}
		]}
	],
	initComponents: function() {
		if(this.menuClass && this.menuClass.length>0 && !this.$.menu.hasClass(this.menuClass)) {
			this.$.menu.addClass(this.menuClass);
		}
		this.createChrome(this.tools);
		this.inherited(arguments);
	},
	reflow: function() {
		this.inherited(arguments);
		if (this.isContentOverflowing()) {
			this.$.nard.show();
			if (this.popItem()) {
				this.reflow();
			}
		} else if (this.tryPushItem()) {
			this.reflow();
		} else if (!this.$.menu.children.length) {
			this.$.nard.hide();
			this.$.menu.hide();
		}
	},
	activated: function(inSender, inEvent) {
		this.addRemoveClass("active",inEvent.originator.active);
	},
	popItem: function() {
		var c = this.findCollapsibleItem();
		if (c) {
			//apply movedClass is needed
			if(this.movedClass && this.movedClass.length>0 && !c.hasClass(this.movedClass)) {
				c.addClass(this.movedClass);
			}
			this.$.menu.addChild(c);
			var p = this.$.menu.hasNode();
			if (p && c.hasNode()) {
				c.insertNodeInParent(p);
			}
			return true;
		}
	},
	pushItem: function() {
		var c$ = this.$.menu.children;
		var c = c$[0];
		if (c) {
			//remove any applied movedClass
			if(this.movedClass && this.movedClass.length>0 && c.hasClass(this.movedClass)) {
				c.removeClass(this.movedClass);
			}
			this.$.client.addChild(c);
			var p = this.$.client.hasNode();
			if (p && c.hasNode()) {
				var nextChild = undefined;
				var currIndex;
				for(var i=0; i<this.$.client.children.length; i++) {
					var curr = this.$.client.children[i];
					if(curr.toolbarIndex!=undefined && curr.toolbarIndex!=i) {
						nextChild = curr;
						currIndex = i;
						break;
					}
				}
				if(nextChild && nextChild.hasNode()) {
					c.insertNodeInParent(p, nextChild.node);
					var newChild = this.$.client.children.pop();
					this.$.client.children.splice(currIndex, 0, newChild);
				} else {
					c.appendNodeToParent(p);
				}
			}
			return true;
		}
	},
	tryPushItem: function() {
		if (this.pushItem()) {
			if (!this.isContentOverflowing()) {
				return true;
			} else {
				this.popItem();
			}
		}
	},
	isContentOverflowing: function() {
		if (this.$.client.hasNode()) {
			var c$ = this.$.client.children;
			var n = c$[c$.length-1].hasNode();
			if(n) {
				//Workaround: scrollWidth value not working in Firefox, so manually compute
				//return (this.$.client.node.scrollWidth > this.$.client.node.clientWidth);
				return ((n.offsetLeft + n.offsetWidth) > this.$.client.node.clientWidth);
			}
		}
	},
	findCollapsibleItem: function() {
		var c$ = this.$.client.children;
		for (var i=c$.length-1; c=c$[i]; i--) {
			if (!c.unmoveable) {
				return c;
			} else {
				if(c.toolbarIndex==undefined) {
					c.toolbarIndex = i;
				}
			}
		}
	}
});
