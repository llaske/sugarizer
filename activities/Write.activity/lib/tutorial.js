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
				element: "#canvas",
				position: "top",
				title: l10n.get("TutoCanvasTitle"),
				intro: l10n.get("TutoCanvasContent")
			},
			{
				element: "#color-button-1",
				position: "bottom",
				title: l10n.get("TutoForegroundTitle"),
				intro: l10n.get("TutoForegroundContent")
			},
			{
				element: "#color-button-2",
				position: "bottom",
				title: l10n.get("TutoBackgroundTitle"),
				intro: l10n.get("TutoBackgroundContent")
			},
			{
				element: "#format-text",
				position: "bottom",
				title: l10n.get("TutoFormatTitle"),
				intro: l10n.get("TutoFormatContent")
			},
			{
				element: "#paragraph",
				position: "bottom",
				title: l10n.get("TutoParagraphTitle"),
				intro: l10n.get("TutoParagraphContent")
			},
			{
				element: "#list",
				position: "bottom",
				title: l10n.get("TutoListTitle"),
				intro: l10n.get("TutoListContent")
			},
			{
				element: "#resize-inc",
				position: "bottom",
				title: l10n.get("TutoIncreaseTitle"),
				intro: l10n.get("TutoIncreaseContent")
			},
			{
				element: "#font-button",
				position: "bottom",
				title: l10n.get("TutoFontTitle"),
				intro: l10n.get("TutoFontContent")
			},
			{
				element: "#resize-dec",
				position: "bottom",
				title: l10n.get("TutoDecreaseTitle"),
				intro: l10n.get("TutoDecreaseContent")
			},
			{
				element: "#insert-picture",
				position: "bottom",
				title: l10n.get("TutoInsertTitle"),
				intro: l10n.get("TutoInsertContent")
			},
			{
				element: "#super-script",
				position: "bottom",
				title: l10n.get("TutoSuperTitle"),
				intro: l10n.get("TutoSuperContent")
			},
			{
				element: "#sub-script",
				position: "bottom",
				title: l10n.get("TutoSubTitle"),
				intro: l10n.get("TutoSubContent")
			},
			{
				element: "#edit-undo",
				position: "bottom",
				title: l10n.get("TutoUndoTitle"),
				intro: l10n.get("TutoUndoContent")
			},
			{
				element: "#edit-redo",
				position: "bottom",
				title: l10n.get("TutoRedoTitle"),
				intro: l10n.get("TutoRedoContent")
			},
			{
				element: "#edit-copy",
				position: "bottom",
				title: l10n.get("TutoCopyTitle"),
				intro: l10n.get("TutoCopyContent")
			},
			{
				element: "#edit-paste",
				position: "bottom",
				title: l10n.get("TutoPasteTitle"),
				intro: l10n.get("TutoPasteContent")
			},
			{
				element: "#export",
				position: "bottom",
				title: l10n.get("TutoExportTitle"),
				intro: l10n.get("TutoExportContent")
			},
			{
				element: "#network-button",
				position: "bottom",
				title: l10n.get("TutoNetworkTitle"),
				intro: l10n.get("TutoNetworkContent")
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
