

// First screen class
enyo.kind({
	name: "Sugar.FirstScreen",
	kind: enyo.Control,
	components: [
		{name: "namebox", classes: "first-namebox", onresize: "resize", components: [
			{name: "nameline", classes: "first-nameline", components: [
				{name: "text", content: "xxx", classes: "first-nametext"},
				{classes: "first-input", components: [
					{name: "name", kind: "Input", classes: "first-namevalue", onkeydown: "enterclick"}
				]}
			]},
		]},
		{name: "previous", kind: "Sugar.IconButton", icon: {directory: "icons", icon: "go-left.svg"}, classes: "first-leftbutton", ontap: "previous", showing: false},		
		{name: "next", kind: "Sugar.IconButton", icon: {directory: "icons", icon: "go-right.svg"}, classes: "first-rightbutton", ontap: "next"},		
		{name: "colortext", content: "xxx", classes: "first-colortext", showing: false},		
		{name: "owner", kind: "Sugar.Icon", size: constant.sizeOwner, colorized: true, classes: "first-owner-icon", showing: false, onresize: "resize", ontap: "nextcolor"},
	],
	
	// Constructor
	create: function() {
		// Init screen
		this.inherited(arguments);
		this.$.text.setContent(l10n.get("Name"));
		this.$.previous.setText(l10n.get("Back"));
		this.$.next.setText(l10n.get("Next"));
		this.$.owner.setIcon({directory: "icons", icon: "owner-icon.svg"});
		this.$.colortext.setContent(l10n.get("ClickToColor"));		
		var canvas_center = util.getCanvasCenter();
		this.$.owner.applyStyle("margin-left", (canvas_center.x-constant.sizeOwner/2)+"px");
		var middletop = (canvas_center.y-constant.sizeOwner/2);
		this.$.nameline.applyStyle("margin-top", middletop+"px");
		this.$.owner.applyStyle("margin-top", middletop+"px");
		this.$.colortext.applyStyle("margin-top", (middletop-15)+"px");
		this.ownerColor = Math.floor(Math.random()*xoPalette.colors.length);
		this.$.owner.setColorizedColor(xoPalette.colors[this.ownerColor]);		
		this.step = 0;
		
		// Hide toolbar
		var toolbar = document.getElementById("toolbar");
		this.backgroundColor = toolbar.style.backgroundColor;
		toolbar.style.backgroundColor = "white";
	},
	
	// Event handling
	next: function() {
		// Handle click next
		var name = this.$.name.getValue();		
		if (!this.step++) {
			if (name.length == 0)
				return;		
			this.$.namebox.setShowing(false);
			this.$.colortext.setShowing(true);
			this.$.owner.setShowing(true);
			this.$.previous.setShowing(true);
			this.$.next.setText(l10n.get("Done"));
		}
		
		// Handle done click
		else {
			// Save settings
			preferences.setColor(this.ownerColor);
			preferences.setName(name);
			
			// Launch Desktop
			document.getElementById("toolbar").style.backgroundColor = this.backgroundColor;
			app = new Sugar.Desktop();
			app.renderInto(document.getElementById("canvas"));
		}
	},
	
	previous: function() {
		this.$.namebox.setShowing(true);
		this.$.colortext.setShowing(false);
		this.$.owner.setShowing(false);
		this.$.previous.setShowing(false);
		this.$.next.setText(l10n.get("Next"));
		this.step--;
	},
	
	enterclick: function(inSender, inEvent) {
		if (inEvent.keyCode === 13) {
			this.next();
			return true;
		}
	},
	
	nextcolor: function() {
		this.ownerColor = this.ownerColor + 1;
		if (this.ownerColor >= xoPalette.colors.length)
			this.ownerColor = 0;
		this.$.owner.setColorizedColor(xoPalette.colors[this.ownerColor]);	
		this.$.owner.render();
	},
	
	resize: function() {
		var canvas_center = util.getCanvasCenter();	
		this.$.owner.applyStyle("margin-left", (canvas_center.x-constant.sizeOwner/2)+"px");
		var middletop = (canvas_center.y-constant.sizeOwner/2);
		this.$.nameline.applyStyle("margin-top", middletop+"px");
		this.$.owner.applyStyle("margin-top", middletop+"px");
		this.$.colortext.applyStyle("margin-top", (middletop-15)+"px");		
	}
});
