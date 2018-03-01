
// Credits popup
enyo.kind({
	name: "Abcd.ResultPopup",
	kind: "onyx.Popup",
	classes: "result-popup",
	centered: true,
	modal: true,
	floating: true, 	
	components: [	
		{ kind: "Image", src: "", classes: "result-image",name:"image" },
		{ kind: "Scroller", classes: "credit-content", components: [
			{ content: "", classes:"result-title",name:"popup_score"},
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