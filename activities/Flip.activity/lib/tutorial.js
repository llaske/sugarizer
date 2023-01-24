define(["webL10n"], function (l10n) {
	var tutorial = {};

	tutorial.start = function() {
		var steps = [
			{
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
			(obj) =>
			  !("element" in obj) ||
			  (obj.element.length &&
				document.querySelector(obj.element) &&
				document.querySelector(obj.element).style.display != "none")
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
