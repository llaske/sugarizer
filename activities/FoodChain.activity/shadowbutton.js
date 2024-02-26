
// Test SVG support
FoodChain.supportSVG = !!document.createElementNS && !!document.createElementNS('http://www.w3.org/2000/svg', "svg").createSVGRect;


// Button component with image and shadow
enyo.kind({
	name: "ShadowButton",
	kind: enyo.Control,
	published: {
		img: ""
	},
	classes: "shadowbutton-container",
	components: [
		{ name: "button", kind: "Image", classes: "shadowbutton shadowbutton-image", onenter: "showShadow", onleave: "hideShadow" },
		{ name: "buttonshadow", kind: "Image", classes: "shadowbutton-shadow shadowbutton-image" }
	],
	
	// Constructor
	create: function() {
		this.inherited(arguments);
		this.imgChanged();
		this.$.buttonshadow.hide();		
	},	
	
	// Image name changed set images src
	imgChanged: function() {
		var ext = FoodChain.supportSVG ? ".svg" : ".png";
		this.$.button.setAttribute("src", "images/"+this.img+ext);
		this.$.buttonshadow.setAttribute("src", "images/"+this.img+"_shadow"+ext);
	},
	
	// Cursor on image, show shadow
	showShadow: function() {
		this.$.buttonshadow.show();
		return false;
	},

	// Cursor out of image, hide shadow
	hideShadow: function() {
		this.$.buttonshadow.hide();
		return false;
	}
});	