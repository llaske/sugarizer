
// Credits popup
enyo.kind({
	name: "Abcd.ResultPopup",
	kind: "onyx.Popup",
	classes: "result-popup",
	centered: true,
	modal: true,
	floating: true, 	
	components: [	
		{ kind: "Image", src: "", classes: "credit-image",name:"image" },
		{ kind: "Scroller", classes: "credit-content", components: [
			{ content: "Score", classes:"credit-title"},
			{ content: "Your accuracy is :", classes:"result-name",name:"accuracy"}
		]},
		// { kind: "Image", src: "images/class.png", classes: "credit-image" },
	],
	
	// Constructor
	create: function() {
		this.inherited(arguments);
	},
	
	rendered: function() {
	}
});