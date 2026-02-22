define(["l10n"], function (l10n) {
	var tutorial = {};

	tutorial.start = function () {
		var steps = [
			{
				title: l10n.get("TutoExplainTitle"),
				intro: l10n.get("TutoExplainContent")
			},
			{
				element: "#colors-button-fill",
				position: "bottom",
				title: l10n.get("TutoColorsButtonFillTitle"),
				intro: l10n.get("TutoColorsButtonFillContent")
			},
			{
				element: "#colors-button-stroke",
				position: "bottom",
				title: l10n.get("TutoColorsButtonStrokeTitle"),
				intro: l10n.get("TutoColorsButtonStrokeContent")
			},
			{
				element: "#undo-button",
				position: "bottom",
				title: l10n.get("TutoUndoTitle"),
				intro: l10n.get("TutoUndoContent")
			},
			{
				element: "#redo-button",
				position: "bottom",
				title: l10n.get("TutoRedoTitle"),
				intro: l10n.get("TutoRedoContent")
			},
			{
				element: "#size-button",
				position: "bottom",
				title: l10n.get("TutoSizeTitle"),
				intro: l10n.get("TutoSizeContent")
			},
			{
				element: "#pen-button",
				position: "bottom",
				title: l10n.get("TutoPenTitle"),
				intro: l10n.get("TutoPenContent")
			},
			{
				element: "#eraser-button",
				position: "bottom",
				title: l10n.get("TutoEraserTitle"),
				intro: l10n.get("TutoEraserContent")
			},
			{
				element: "#stamps-button",
				position: "bottom",
				title: l10n.get("TutoStampsTitle"),
				intro: l10n.get("TutoStampsContent")
			},
			{
				element: "#text-button",
				position: "bottom",
				title: l10n.get("TutoTextTitle"),
				intro: l10n.get("TutoTextContent")
			},
			{
				element: "#insertimage-button",
				position: "bottom",
				title: l10n.get("TutoInsertimageTitle"),
				intro: l10n.get("TutoInsertimageContent")
			},
			{
				element: "#drawings-button",
				position: "bottom",
				title: l10n.get("TutoDrawingsTitle"),
				intro: l10n.get("TutoDrawingsContent")
			},
			{
				element: "#bucket-button",
				position: "bottom",
				title: l10n.get("TutoBucketTitle"),
				intro: l10n.get("TutoBucketContent")
			},
			{
				element: "#filters-button",
				position: "bottom",
				title: l10n.get("TutoFiltersTitle"),
				intro: l10n.get("TutoFiltersContent")
			},
			{
				element: "#copy-button",
				position: "bottom",
				title: l10n.get("TutoCopyTitle"),
				intro: l10n.get("TutoCopyContent")
			},
			{
				element: "#paste-button",
				position: "bottom",
				title: l10n.get("TutoPasteTitle"),
				intro: l10n.get("TutoPasteContent")
			},
			{
				element: "#save-image-button",
				position: "bottom",
				title: l10n.get("TutoSaveImageButtonTitle"),
				intro: l10n.get("TutoSaveImageButtonContent"),
			},
			{
				element: "#clear-button",
				position: "bottom",
				title: l10n.get("TutoClearTitle"),
				intro: l10n.get("TutoClearContent")
			},
			{
				element: "#network-button",
				position: "bottom",
				title: l10n.get("TutoNetworkTitle"),
				intro: l10n.get("TutoNetworkContent")
			}
		];
	
		steps = steps.filter((step) =>  !('element' in step) || ((step.element).length && document.querySelector(step.element) && document.querySelector(step.element).style.display != 'none'));
	
		introJs().setOptions({
			tooltipClass: 'customTooltip',
			steps: steps,
			prevLabel: l10n.get("TutoPrev"),
			nextLabel: l10n.get("TutoNext"),
			exitOnOverlayClick: false,
			nextToDone: false,
			showBullets: false
		}).start();
		
	};

	return tutorial;
});
