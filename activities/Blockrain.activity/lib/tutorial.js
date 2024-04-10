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
				element: "#canvas",
				position: "top",
				title: l10n.get("TutoCanvasTitle"),
				intro: l10n.get("TutoCanvasContent")
			},
			{
				element: "#up-arrow",
				position: "right",
				title: l10n.get("TutoRotateTitle"),
				intro: l10n.get("TutoRotateContent")
			},
			{
				element: "#down-arrow",
				position: "right",
				title: l10n.get("TutoDownTitle"),
				intro: l10n.get("TutoDownContent")
			},
			{
				element: "#left-arrow",
				position: "left",
				title: l10n.get("TutoLeftTitle"),
				intro: l10n.get("TutoLeftContent")
			},
			{
				element: "#right-arrow",
				position: "left",
				title: l10n.get("TutoRightTitle"),
				intro: l10n.get("TutoRightContent")
			},
			{
				element: "#play-button",
				position: "bottom",
				title: l10n.get("TutoPlayTitle"),
				intro: l10n.get("TutoPlayContent")
			},
			{
				element: "#btn-next",
				position: "bottom",
				title: l10n.get("TutoThemeTitle"),
				intro: l10n.get("TutoThemeContent")
			}
		];

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
