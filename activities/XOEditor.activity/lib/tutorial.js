define(["l10n"], function(l10n) {
	var tutorial = {};

	tutorial.start = function() {
		var steps = [
			{
				orphan: true,
				position: "bottom",
				title: l10n.get("TutoExplainTitle"),
				intro: l10n.get("TutoExplainContent")
			},
			{
				element: "#actualcanvas",
				position: "top",
				title: l10n.get("TutoCanvasTitle"),
				intro: l10n.get("TutoCanvasContent")
			},
			{
				element: "#save-button",
				position: "bottom",
				title: l10n.get("TutoSaveTitle"),
				intro: l10n.get("TutoSaveContent")
			},
			{
				element: "#reset-button",
				position: "bottom",
				title: l10n.get("TutoResetTitle"),
				intro: l10n.get("TutoResetContent")
			},
		];
		steps = steps.filter(
			(step) =>
			  !("element" in step) ||
			  (step.element.length &&
				document.querySelector(step.element) &&
				document.querySelector(step.element).style.display != "none" &&
				document.querySelector(step.element).getBoundingClientRect().y != 0)
		  );

		  introJs()
		  .setOptions({
			tooltipClass: "customTooltip",
			steps: steps,
			prevLabel: l10n.get("TutoPrev"),
			nextLabel: l10n.get("TutoNext"),
			exitOnOverlayClick: false,
			nextToDone: false,
			showBullets: false,
		  })
		  .start();
	};

	return tutorial;
});
