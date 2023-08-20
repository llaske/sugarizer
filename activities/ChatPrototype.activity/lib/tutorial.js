define(["l10n"], function (l10n) {
	var tutorial = {};

	tutorial.start = function() {
		var steps = [
			{
				position: "bottom",
				title: l10n.get('TutoExplainTitle'),
				intro: l10n.get("TutoExplainContent")
			},
			{
				element: "#network-button",
				position: "bottom",
				title: l10n.get("TutoNetworkTitle"),
				intro: l10n.get("TutoNetworkContent")
			},
			{
				element: "#message",
				position: "top",
				title: l10n.get("TutoMessageTitle"),
				intro: l10n.get("TutoMessageContent")
			},
			{
				element: "#smiley-button",
				position: "top",
				title: l10n.get("TutoSmileyTitle"),
				intro: l10n.get("TutoSmileyContent")
			},
			{
				element: "#sad-button",
				position: "top",
				title: l10n.get("TutoSadTitle"),
				intro: l10n.get("TutoSadContent")
			},
			{
				element: "#others-button",
				position: "top",
				title: l10n.get("TutoEmojiTitle"),
				intro: l10n.get("TutoEmojiContent")
			}
		];
		var object = {
				element: "#image-upload",
				orphan: false,
				position: "bottom",
				title: l10n.get("TutoImageTitle"),
				intro: l10n.get("TutoImageContent")
			};
		if(window.getComputedStyle(document.getElementById("image-upload")).visibility !== "hidden"){
			steps.push(object);
		}
		steps.push({
			element: "#stop-button",
			position: "bottom",
			title: l10n.get("TutoStopTitle"),
			intro: l10n.get("TutoStopContent")
		});

		steps = steps.filter((obj) => !('element' in obj) || ((obj.element).length && document.querySelector(obj.element) && document.querySelector(obj.element).style.display != 'none'));

		introJs().setOptions({
			tooltipClass: 'customTooltip',
			steps: steps,
			prevLabel: l10n.get("TutoPrev"),
			nextLabel: l10n.get("TutoNext"),
			exitOnOverlayClick: false,
			nextToDone: false,
			showBullets: false
		}).start();
	};
	return tutorial;
});
