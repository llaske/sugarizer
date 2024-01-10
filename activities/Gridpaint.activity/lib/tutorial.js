define(["l10n"], function (l10n) {
	var tutorial = {};

	tutorial.start = function() {
		var steps=[]
		if(mode=='edit'){
		 steps =[
			
			{
				element: "#canvas",
				position: "top",
				title: l10n.get("TutoEditTitle"),
				intro: l10n.get("TutoEditContent")
			},
			{
				element: "#clear-button",
				position: "bottom",
				title: l10n.get("TutoClearTitle"),
				intro: l10n.get("TutoClearContent")
			}
			
		]}
		else{
				steps=[
					{
						title: l10n.get("TutoExplainTitle"),
						intro: l10n.get("TutoExplainContent")
					},
					{
						element: "#canvas",
						position: "top",
						title: l10n.get("TutoGridTitle"),
						intro: l10n.get("TutoGridContent")
					}
				]
		}

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