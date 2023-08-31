define(["l10n"], function(l10n) {
	var tutorial = {};

	tutorial.start = function() {
		var steps = [
			{
				title: l10n.get("TutoExplainTitle"),
				intro: l10n.get("TutoExplainContent")
			},
			{
				element: "#add-button",
				position: "bottom",
				title: l10n.get("TutoAddTitle"),
				intro: l10n.get("TutoAddContent")
			},
			{
				element: "#minus-button",
				position: "bottom",
				title: l10n.get("TutoMinusTitle"),
				intro: l10n.get("TutoMinusContent")
			},
			{
				element: "#const-button",
				position: "bottom",
				title: l10n.get("TutoConstTitle"),
				intro: l10n.get("TutoConstContent")
			},
			{
				element: "#star-button",
				position: "bottom",
				title: l10n.get("TutoStarTitle"),
				intro: l10n.get("TutoStarContent")
			},
			{
				element: "#location-button",
				position: "bottom",
				title: l10n.get("TutoLocationTitle"),
				intro: l10n.get("TutoLocationContent")
			},
			{
				element: "#world-button",
				position: "bottom",
				title: l10n.get("TutoWorldTitle"),
				intro: l10n.get("TutoWorldContent")
			},
			{
				element: "#view-button",
				position: "bottom",
				title: l10n.get("TutoViewTitle"),
				intro: l10n.get("TutoViewContent")
			},
			{
				element: ".starmap_clock",
				position: "bottom",
				title: l10n.get("TutoTimeTitle"),
				intro: l10n.get("TutoTimeContent")
			}
		];
		
		steps = steps.filter(function (obj) {
			return !('element' in obj) || ((obj.element).length && document.querySelector(obj.element) && document.querySelector(obj.element).style.display != 'none');
	    });
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
