

// Class to load all game images in cache
enyo.kind({
	name: "LcdDisplay",
	kind: enyo.Control,
	classes: "lcd-border",
	published: { size: 3, value: "" },	
	components: [
		// Value
		{name: "digits", components: [
		]},
		
		// Preload image
		{kind: "Image", id:"led_nums", src:"images/led_values.png", classes: "image-preload", showing: false }
	],
	
	// Constructor
	create: function() {
		this.inherited(arguments);
		
		this.sizeChanged();
		this.valueChanged();
	},
	
	// Size changed, reinit
	sizeChanged: function() {
		// Resize
		var wsize = window.innerWidth;
		var digitwidth;
		var digitheight;
		var zoom;
		if (wsize <= 480) {
			digitwidth = 20;
			digitheight = 32;
		} else {
			digitwidth = 30;
			digitheight = 48;
		}		
		this.applyStyle("width", (digitwidth*this.size)+"px");
		this.applyStyle("height", digitheight+"px");
		
		// Clean digits
		var items = [];
		enyo.forEach(this.$.digits.getControls(), function(item) { items.push(item); });		
		for (var i = 0 ; i < items.length ; i++) { items[i].destroy(); };	

		// Create digits
		for (var i = 0 ; i < this.size ; i++) {
			this.$.digits.createComponent({ classes: "lcd-num lcd-image-empty" }, {owner: this}).render();
		}		
	},
	
	// Value changed
	valueChanged: function() {
		// Get digit value	
		var getDigitValue = function(valueto, index) {
			if (index >= valueto.length)
				return '';
			return valueto[index];
		};
		
		// Get matching class for the digit
		var getMatchingClass = function(digit) {
			var prefix = "lcd-image-";
			if (digit >= '0' && digit <= '9')
				prefix += digit;
			else if (digit == '-')
				prefix += "dash";
			else
				prefix += "empty";
			return prefix;
		};
		
		// Align to number of digits to size
		var complete = this.size - this.value.length;
		for (var i = 0 ; i < complete ; i++)
			this.value = ' '+this.value;

		// Set each digit value using the right class
		var digits = this.$.digits.getControls();
		for (var i = 0 ; i < this.size ; i++) {
			var newdigit = getDigitValue(this.value, i);
			var classes = digits[i].getClassAttribute();
			digits[i].addRemoveClass(classes.substr(classes.indexOf("lcd-image-")), false);
			digits[i].addRemoveClass(getMatchingClass(newdigit), true);
		}		
	}
});