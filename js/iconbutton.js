// // Class for a Sugar button with an icon and a text
// enyo.kind({
// 	name: "Sugar.IconButton",
// 	kind: enyo.Control,
// 	published: {
// 		icon: null,
// 		text: null,
// 		colorized: false,
// 		colorizedColor: null,
// 	},
// 	classes: "icon-button",
// 	components: [
// 		{ name: "icon", kind: "Sugar.Icon", size: 20, x: 6, y: 6},
// 		{ name: "text", classes: "icon-button-text" }
// 	],

// 	// Constructor
// 	create: function() {
// 		this.inherited(arguments);
// 		this.iconChanged();
// 		this.textChanged();
// 		this.colorizedChanged();
// 		if (l10n.language.direction == "rtl") {
// 			this.setAttribute("dir", "rtl");
// 			this.$.text.addClass("rtl-10");
// 		}
// 	},

// 	// Property changed
// 	iconChanged: function() {
// 		this.$.icon.setIcon(this.icon);
// 	},

// 	textChanged: function() {
// 		this.$.text.setContent(this.text);
// 	},

// 	colorizedChanged: function() {
// 		if (this.colorized) {
// 			this.$.icon.setColorized(this.colorized);
// 			this.$.icon.setColorizedColor(this.colorizedColor);
// 		}
// 	},
// });





// Class for a Sugar button with an icon and a text
enyo.kind({
	name: "Sugar.IconButton",
	kind: enyo.Control,
	published: {
		icon: null,
		text: null,
		colorized: false,
		colorizedColor: null,
	},
	classes: "icon-button",
	components: [
		{ name: "icon", kind: "Sugar.Icon", size: 20, x: 6, y: 6},
		{ name: "text", classes: "icon-button-text" }
	],

	// ==== NEW: Add CSS for modern and soothing button styling ====
	css: `
		.icon-button {
			display: flex;
			align-items: center;
			justify-content: center;
			padding: 8px 16px;
			border-radius: 8px; /* Rounded corners */
			background-color: #f0f0f0; /* Light gray background */
			border: 1px solid #ddd; /* Subtle border */
			cursor: pointer;
			transition: background-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
			box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Subtle shadow */
		}
		.icon-button:hover {
			background-color: #e0e0e0; /* Darker gray on hover */
			transform: translateY(-2px); /* Slight lift on hover */
			box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15); /* Enhanced shadow on hover */
		}
		.icon-button:active {
			transform: translateY(0); /* Reset lift on click */
			box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Reset shadow on click */
		}
		.icon-button-text {
			margin-left: 8px; /* Space between icon and text */
			font-size: 14px;
			color: #333; /* Dark text color */
			font-weight: 500; /* Slightly bold text */
		}
		.rtl-10 .icon-button-text {
			margin-left: 0;
			margin-right: 8px; /* Adjust for RTL layout */
		}
	`,

	// Constructor
	create: function() {
		this.inherited(arguments);
		this.iconChanged();
		this.textChanged();
		this.colorizedChanged();
		if (l10n.language.direction == "rtl") {
			this.setAttribute("dir", "rtl");
			this.$.text.addClass("rtl-10");
		}
	},

	// Property changed
	iconChanged: function() {
		this.$.icon.setIcon(this.icon);
	},

	textChanged: function() {
		this.$.text.setContent(this.text);
	},

	colorizedChanged: function() {
		if (this.colorized) {
			this.$.icon.setColorized(this.colorized);
			this.$.icon.setColorizedColor(this.colorizedColor);
		}
	},
});