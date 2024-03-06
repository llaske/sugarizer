define(["l10n"], function (l10n) {
	var tutorial = {};

	tutorial.start = function() {
		console.log("Language")
		console.log(l10n.language)
		var steps = [
			{
				title: l10n.get("TutoExplainTitle"),
				intro: l10n.get("TutoExplainContent")
			},
			{
				element: "#mode-button",
				position: "bottom",
				title: l10n.get("TutoModeTitle"),
				intro: l10n.get("TutoModeContent")
			},
			{
				element: "#color-button",
				position: "bottom",
				title: l10n.get("TutoColorTitle"),
				intro: l10n.get("TutoColorContent")
			},
			{
				element: "#run-button",
				title: l10n.get("TutoRunTitle"),
				intro: l10n.get("TutoRunContent")
			}
		];
		
		steps= steps.filter(function (obj) {
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

	};

	return tutorial;
});