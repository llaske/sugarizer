define(["l10n"], function (l10n) {
	var tutorial = {};

	tutorial.start = function() {
		var steps = [
			{
				title: l10n.get("TutoExplainTitle"),
				intro: l10n.get("TutoExplainContent")
			},
			{
				element: "#viewport",
				position: "top",
				title: l10n.get("TutoBoardTitle"),
				intro: l10n.get("TutoBoardContent")
			},
			{
				element: "#circle-button",
				position: "bottom",
				title: l10n.get("TutoCircleTitle"),
				intro: l10n.get("TutoCircleContent")
			},
			{
				element: "#box-button",
				position: "bottom",
				title: l10n.get("TutoBoxTitle"),
				intro: l10n.get("TutoBoxContent")
			},
			{
				element: "#triangle-button",
				position: "bottom",
				title: l10n.get("TutoTriangleTitle"),
				intro: l10n.get("TutoTriangleContent")
			},
			{
				element: "#polygon-button",
				position: "bottom",
				title: l10n.get("TutoPolygonTitle"),
				intro: l10n.get("TutoPolygonContent")
			},
			{
				element: "#gravity-button",
				position: "bottom",
				title: l10n.get("TutoGravityTitle"),
				intro: l10n.get("TutoGravityContent")
			},
			{
				element: "#sensor-button",
				position: "bottom",
				title: l10n.get("TutoSensorTitle"),
				intro: l10n.get("TutoSensorContent")
			},
			{
				element: "#apple-button",
				position: "bottom",
				title: l10n.get("TutoAppleTitle"),
				intro: l10n.get("TutoAppleContent")
			},
			{
				element: "#clear-button",
				position: "bottom",
				title: l10n.get("TutoClearTitle"),
				intro: l10n.get("TutoClearContent")
			},
			{
				element: "#run-button",
				position: "bottom",
				title: l10n.get("TutoPauseTitle"),
				intro: l10n.get("TutoPauseContent")
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
