define(["webL10n"], function (l10n) {
	var tutorial = {};
	tutorial.start = function() {
		var steps = [
			{
				title: l10n.get("TutoExplainTitle"),
				intro: l10n.get("TutoExplainContent")
			},
			{
				element: "#clock-container",
				position: "right",
				title: l10n.get("TutoHandTitle"),
				intro: l10n.get("TutoHandContent")
			},
			{
				element: "#simple-clock-button",
				position: "bottom",
				title: l10n.get("TutoSimpleTitle"),
				intro: l10n.get("TutoSimpleContent")
			},
			{
				element: "#nice-clock-button",
				position: "bottom",
				title: l10n.get("TutoNiceTitle"),
				intro: l10n.get("TutoNiceContent")
			},
			{
				element: "#write-time-button",
				position: "bottom",
				title: l10n.get("TutoTimeTitle"),
				intro: l10n.get("TutoTimeContent")
			},
			{
				element: "#write-date-button",
				position: "bottom",
				title: l10n.get("TutoDateTitle"),
				intro: l10n.get("TutoDateContent")
			},
			{
				element: "#write-seconds-button",
				position: "bottom",
				title: l10n.get("TutoSecondsTitle"),
				intro: l10n.get("TutoSecondsContent")
			},
			{
				element: "#show-am-pm",
				position: "bottom",
				title: l10n.get("ShowAmPmTitle"),
				intro: l10n.get("TutoShowAmPmContent")
			},
			{
				element: "#show-mins",
				position: "bottom",
				title: l10n.get("ShowMinsTitle"),
				intro: l10n.get("TutoShowMinsContent")
			},
			{
				element: "#set-time-button",
				position: "bottom",
				title: l10n.get("TutoSetTimeTitle"),
				intro: l10n.get("TutoSetTimeContent")
			},
			{
				element: "#set-timeGame-button",
				position: "bottom",
				title: l10n.get("TutoSetTimeGameTitle"),
				intro: l10n.get("TutoSetTimeGameContent")
			}
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
