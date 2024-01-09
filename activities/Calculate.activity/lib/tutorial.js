define(["l10n"], function (l10n) {
	var tutorial = {};

	tutorial.start = function() {
		var steps = [
			{
				title: l10n.get("TutoExplainTitle"),
				intro: l10n.get("TutoExplainContent")
			},
			{
				element: "#calc-input-div",
				position: "top",
				title: l10n.get("TutoInputTitle"),
				intro: l10n.get("TutoInputContent")
			},
			{
				element: "#label-input",
				position: "bottom",
				title: l10n.get("TutoLabelTitle"),
				intro: l10n.get("TutoLabelContent")
			},
			{
				element: "#results-zone",
				position: "top",
				title: l10n.get("TutoResultTitle"),
				intro: l10n.get("TutoResultContent")
			},
			{
				element: "#trigo-palette",
				position: "bottom",
				title: l10n.get("TutoTrigoTitle"),
				intro: l10n.get("TutoTrigoContent")
			},
			{
				element: "#algebra-palette",
				position: "bottom",
				title: l10n.get("TutoAlgebraTitle"),
				intro: l10n.get("TutoAlgebraContent")
			},
			{
				element: "#base-palette",
				position: "bottom",
				title: l10n.get("TutoBaseTitle"),
				intro: l10n.get("TutoBaseContent")
			},
			{
				element: "#radian-degree-palette",
				position: "bottom",
				title: l10n.get("TutoAngleTitle"),
				intro: l10n.get("TutoAngleContent")
			},
			{
				element: "#output-digits-palette",
				position: "bottom",
				title: l10n.get("TutoOutputTitle"),
				intro: l10n.get("TutoOutputContent")
			},
			{
				element: "#calc-input",
				position: "bottom",
				title: l10n.get("TutoFunctionTitle"),
				intro: l10n.get("TutoFunctionContent")
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
