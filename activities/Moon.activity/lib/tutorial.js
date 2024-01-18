define(["l10n"], function (l10n) {
	var tutorial = {};

	tutorial.start = function() {
		var steps = [
			{
				title: l10n.get("TutoExplainTitle"),
				intro: l10n.get("TutoExplainContent"),
			},
			{
				element: "#activity-button",
				position: "bottom",
				title: l10n.get("TutoActivityButtonTitle"),
				intro: l10n.get("TutoActivityButtonContent"),
			},
			{
				element: "#toggle-grid-button",
				position: "bottom",
				title: l10n.get("TutoToggleGridButtonTitle"),
				intro: l10n.get("TutoToggleGridButtonContent"),
			},
			{
				element: "#toggle-hemisphere-button",
				position: "bottom",
				title: l10n.get("TutoToggleHemisphereButtonTitle"),
				intro: l10n.get("TutoToggleHemisphereButtonContent"),
			},
			{
				element: "#save-image-button",
				position: "bottom",
				title: l10n.get("TutoSaveImageButtonTitle"),
				intro: l10n.get("TutoSaveImageButtonContent"),
			},
			{
				element: "#fullscreen-button",
				position: "bottom",
				title: l10n.get("TutoFullScreenButtonTitle"),
				intro: l10n.get("TutoFullScreenButtonContent"),
			},
			{
				element: "#panel-left",
				title: l10n.get("TutoPanelLeftTitle"),
				intro: l10n.get("TutoPanelLeftContent"),
			},
			{
				element: "#stop-button",
				position: "bottom",
				title: l10n.get("TutoStopButtonTitle"),
				intro: l10n.get("TutoStopButtonContent"),
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
