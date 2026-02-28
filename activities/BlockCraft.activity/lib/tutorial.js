define(["l10n"], function (l10n) {
	var tutorial = {};

	tutorial.start = function() {
		var steps = [
			{
				title: l10n.get("TutoExplainTitle"),
				intro: l10n.get("TutoExplainContent")
			},
			{
				element: "#block-palette",
				position: "right",
				title: l10n.get("TutoPaletteTitle"),
				intro: l10n.get("TutoPaletteContent")
			},
			{
				element: "#grid",
				position: "top",
				title: l10n.get("TutoGridTitle"),
				intro: l10n.get("TutoGridContent")
			},
			{
				element: "#mode-button",
				position: "bottom",
				title: l10n.get("TutoLevelTitle"),
				intro: l10n.get("TutoLevelContent")
			}
		];

		steps = steps.filter(function(step) {
			if (!("element" in step)) return true;
			var el = document.querySelector(step.element);
			return el && el.offsetParent !== null;
		});

		if (typeof introJs !== "undefined") {
			introJs()
				.setOptions({
					tooltipClass: "customTooltip",
					steps: steps,
					prevLabel: l10n.get("TutoPrev"),
					nextLabel: l10n.get("TutoNext"),
					exitOnOverlayClick: false,
					nextToDone: false,
					showBullets: false
				})
				.start();
		}
	};

	return tutorial;
});
