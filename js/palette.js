
var _displayedPalette = null;

// Class for a Sugar palette
enyo.kind({
	name: "Sugar.Palette",
	kind: enyo.Control,
	published: {
		icon: null,
		text: null,
		contents: null,
		contentsClasses: "",
		header: null
	},
	classes: "palette-sugarizer palette-down",
	components: [
		{ name: "icon", kind: "Sugar.Icon", classes: "palette-icon", size: 20, x: 6, y: 6 },
		{ name: "text", classes: "palette-text" }
	],

	// Constructor
	create: function() {
		this.inherited(arguments);
		this.iconChanged();
		this.textChanged();
	},

	rendered: function() {
		this.inherited(arguments);
	},

	// Property changed
	iconChanged: function() {
		this.$.icon.setIcon(this.icon);
	},

	textChanged: function() {
		this.$.text.setContent(this.text);
	},

	displayPopup: function(view) {
		if (_displayedPalette) {
			_displayedPalette.switchPalette(view);
			_displayedPalette = null;
		}
		if (this.contents == null) {
			return;
		}
		var id = this.hasNode().id+"_content";
		this.palette = view.createComponent({
			name: id,
			classes: "palette-content "+this.contentsClasses
		});
		if (this.header) {
			this.palette.createComponent({content: this.header, classes: "palette-header"}, {owner: this.palette});
			this.palette.createComponent({classes: "palette-hr"}, {owner: this.palette});
		}
		this.paletteEvents = [];
		for (var i = 0 ; i < this.contents.length ; i++) {
			var newObject = this.palette.createComponent(this.contents[i], {owner: this.palette});
			var tapMethod = this.contents[i].ontap;
			if (tapMethod) {
				this.palette[tapMethod] = enyo.bind(this, "bindedFunction");
				this.paletteEvents.push({"event": "tap", "object": newObject, "name": tapMethod})
			}
		}
		this.palette.render();
		_updatePosition(this);
		_displayedPalette = this;
	},

	setItems: function(items) {
		this.contents = items;
	},

	bindedFunction: function(o, e) {
		for (var i = 0 ; i < this.paletteEvents.length ; i++) {
			if (this.paletteEvents[i].event == e.type && this.paletteEvents[i].object == o) {
				enyo.call(this.parent, this.paletteEvents[i].name, [o, e]);
			}
		}
	},

	hidePopup: function(view) {
		var that = this;
		var toDestroy = null;
		enyo.forEach(view.getControls(), function(item) {
			if (item.getAttribute("id") == that.palette.getAttribute("id")) {
				toDestroy = item;
			}
		});
		if (toDestroy) {
			toDestroy.destroy();
		}
		_displayedPalette = null;
	},

	switchPalette: function(view) {
		var isOpen = this.isOpen();
		this.addRemoveClass("palette-down", isOpen);
		this.addRemoveClass("palette-up", !isOpen);
		if (!isOpen) {
			this.displayPopup(view);
		} else {
			this.hidePopup(view);
		}
	},

	isOpen: function() {
		return this.hasClass("palette-up");
	}
});


// Internal functions adapted from sugar-web/palette.js

function _getOffset(elem, paletteElem) {
	// Ugly hack to consider the palette margin.
	var style = elem.currentStyle || window.getComputedStyle(elem, '');

	// Remove 'px' from the strings.
	var x = -2 * style.marginLeft.slice(0, -2);
	var y = -1 * style.marginTop.slice(0, -2);

	var rect = elem.getBoundingClientRect();
	x = rect.left;
	y += rect.top;

	// Shift to the right if overflow screen
	var delta = x + paletteElem.offsetWidth - document.getElementById("canvas").offsetWidth;
	if (delta > 0) {
		x -= delta;
	}

	return {
		top: y,
		left: x,
		width: rect.width,
		height: rect.height
	};
}

function _updatePosition(that) {
	var invokerOffset = _getOffset(that.hasNode(), that.palette.hasNode());
	var paletteX = invokerOffset.left;
	var paletteY = invokerOffset.top;

	var paletteElem = document.getElementById(that.palette.getAttribute("id"));
	paletteElem.style.left = paletteX + "px";
	paletteElem.style.top = paletteY + "px";
}
