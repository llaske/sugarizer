define(["l10n"], function (l10n) {
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
				title: l10n.get("TutoBoardTitle"),
				intro: l10n.get("TutoBoardContent")
			},
			{
				element: "#flip-count",
				position: "bottom",
				title: l10n.get("TutoCountTitle"),
				intro: l10n.get("TutoCountContent")
			},
			{
				element: "#new-game-button",
				position: "bottom",
				title: l10n.get("TutoNewTitle"),
				intro: l10n.get("TutoNewContent")
			},
			{
				element: "#size-button",
				position: "bottom",
				title: l10n.get("TutoSizeTitle"),
				intro: l10n.get("TutoSizeContent")
			},
			{
				element: "#solve-button",
				position: "bottom",
				title: l10n.get("TutoSolveTitle"),
				intro: l10n.get("TutoSolveContent")
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
