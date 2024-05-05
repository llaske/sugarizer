define(["l10n"], function (l10n) {
	var tutorial = {};

	tutorial.start = function() {
		var steps = [
			{
				title: l10n.get("TutoExplainTitle"),
				intro: l10n.get("TutoExplainContent")
			},
			{
				element: "#maze",
				position: "top",
				title: l10n.get("TutoCanvasTitle"),
				intro: l10n.get("TutoCanvasContent")
			},
			{
				element: "#network-button",
				position: "bottom",
				title: l10n.get("TutoNetworkTitle"),
				intro: l10n.get("TutoNetworkContent")
			},
			{
				element: "#restart-button",
				position: "bottom",
				title: l10n.get("TutoRestartTitle"),
				intro: l10n.get("TutoRestartContent")
			},
		];
		 				steps = steps.filter((obj) =>  !('element' in obj) || ((obj.element).length && document.querySelector(obj.element) && document.querySelector(obj.element).style.display != 'none'));
		introJs().setOptions({
			tooltipClass: 'customTooltip',
			steps: steps,
			prevLabel: l10n.get("TutoPrev"),
			nextLabel: l10n.get("TutoNext"),
			exitOnOverlayClick: false,
			nextToDone: false,
			showBullets: false
		}).start();
	}

	return tutorial;
});
