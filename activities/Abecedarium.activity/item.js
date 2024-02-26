// Moveable item
enyo.kind({
	name: "Abcd.Item",
	kind: enyo.Control,
	published: { x: -1, y: -1, z: -1, selected: false },
	
	// Constructor
	create: function() {
		this.inherited(arguments);
		this.xChanged();
		this.yChanged();
		this.zChanged();
		this.selectedChanged();
	},
	
	// Localization changed, update 
	setLocale: function() {
		this.render();
	},
	
	// Coordinate setup
	xChanged: function() {
		if (this.x != -1) this.applyStyle("margin-left", this.x+"px");
	},
	
	// Coordinate setup
	yChanged: function() {
		if (this.y != -1) this.applyStyle("margin-top", this.y+"px");
	},
	
	// Coordinate setup
	zChanged: function() {	
		if (this.z != -1) this.applyStyle("z-index", this.z);
	},
	
	// Selection changed
	selectedChanged: function() {
		var className = "item"+this.kind.substring(5)+"-selected";
		if (this.selected)
			this.addClass(className);
		else
			this.removeClass(className);
	},
	
	// Change position
	moveTo: function(x, y) {
		this.x = x;
		this.xChanged();
		this.y = y;
		this.yChanged();
	}
});