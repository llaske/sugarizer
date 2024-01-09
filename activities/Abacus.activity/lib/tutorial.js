define(["l10n"], function (l10n) {
	var tutorial = {};

	tutorial.start = function() {
		var steps = [
			{
				position: "bottom",
				title: l10n.get("TutoExplainTitle"),
				intro: l10n.get("TutoExplainContent")
			},
			{
				element: "#abacus-button",
				position: "bottom",
				title: l10n.get("TutoAbacusTitle"),
				intro: l10n.get("TutoAbacusContent")
			},
			{
				element: "#settings-button",
				position: "bottom",
				title: l10n.get("TutoCustomTitle"),
				intro: l10n.get("TutoCustomContent")
			},
			{
				element: "#copy-button",
				position: "bottom",
				title: l10n.get("TutoCopyTitle"),
				intro: l10n.get("TutoCopyContent")
			},
			{
				element: "#clear-button",
				position: "bottom",
				title: l10n.get("TutoClearTitle"),
				intro: l10n.get("TutoClearContent")
			},
			{
				element: "#actualcanvas",
				position: "top",
				title: l10n.get("TutoCanvasTitle"),
				intro: l10n.get("TutoCanvasContent")
			},
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
	}
	return tutorial;
});
