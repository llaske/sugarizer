/**
	A progress bar that can have controls inside of it and has a cancel button on the right.
	
		{kind: "onyx.ProgressButton"},
		{kind: "onyx.ProgressButton", barClasses: "onyx-light", progress: 20, components: [
			{content: "0"},
			{content: "100", style: "float: right;"}
		]}

*/
enyo.kind({
	name: "onyx.ProgressButton",
	kind: "onyx.ProgressBar",
	classes: "onyx-progress-button",
	events: {
		onCancel: ""
	},
	components: [
		{name: "progressAnimator", kind: "Animator", onStep: "progressAnimatorStep", onEnd: "progressAnimatorComplete"},
		{name: "bar", classes: "onyx-progress-bar-bar onyx-progress-button-bar"},
		{name: "client", classes: "onyx-progress-button-client"},
		{kind: "onyx.Icon", src: "$lib/onyx/images/progress-button-cancel.png", classes: "onyx-progress-button-icon", ontap: "cancelTap"}
	],
	//* @protected
	cancelTap: function() {
		this.doCancel();
	}
});
