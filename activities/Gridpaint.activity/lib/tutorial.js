define(["webL10n"], function (l10n) {
	var tutorial = {};

	tutorial.start = function() {
		var steps = []
		if(mode=='edit'){
			steps = [
			{
				title: l10n.get("TutoEditTitle"),
				intro: l10n.get("TutoEditContent")
			},
			{
				element: "#clear-button",
				position: "top",
				title: l10n.get("TutoClearTitle"),
				intro: l10n.get("TutoClearContent")
			}
			]
			
		}else {
			steps = [
			{
				position: "top",
				title: l10n.get("TutoExplainTitle"),
				intro: l10n.get("TutoExplainContent")
			},
			{
				position: "top",
				title: l10n.get("TutoGridTitle"),
				intro: l10n.get("TutoGridContent")
			}
			]

		}
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