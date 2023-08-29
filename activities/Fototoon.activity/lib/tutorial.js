define(["l10n"], function (l10n) {
    var tutorial = {};

    tutorial.start = function (language) {

        var steps = [
            {
                title: l10n.get("TutoExplainTitle"),
                intro: l10n.get("TutoExplainContent")
            },
            {
                element: "#previous-button",
                position: "bottom",
                title: l10n.get("Previous"),
                intro: l10n.get("TutoPreviousExplanation")
            },
            {
                element: "#next-button",
                position: "bottom",
                title: l10n.get("Next"),
                intro: l10n.get("TutoNextExplanation")
            },
            {
                element: "#add-button",
                position: "bottom",
                title: l10n.get("TutoAddPage"),
                intro: l10n.get("TutoAddPageExplanation")
            },
            {
                element: "#add-globe",
                position: "bottom",
                title: l10n.get("AddAglobe"),
                intro: l10n.get("TutoAddGlobeExplanation")
            },
            {
                element: "#text-button",
                position: "bottom",
                title: l10n.get("TutoEditText"),
                intro: l10n.get("TutoEditTextExplanation")
            },
            {
                element: "#sort-button",
                position: "bottom",
                title: l10n.get("TutoSortBoxes"),
                intro: l10n.get("TutoSortBoxesExplanation")
            },
            {
                element: "#clean-all-button",
                position: "bottom",
                title: l10n.get("TutoCleanAll"),
                intro: l10n.get("TutoCleanAllExplanation")
            },
            {
                element: "#image-save",
                position: "bottom",
                title: l10n.get("TutoImageSave"),
                intro: l10n.get("TutoImageSaveExplanation")
            },
            {
                element: "#page-counter",
                position: "left",
                title: l10n.get("TutoPageCounter"),
                intro: l10n.get("TutoPageCounterExplanation")
            },
            {
                element: "#stop-button",
                position: "left",
                title: l10n.get("TutoStop"),
                intro: l10n.get("TutoStopExplanation")
            }
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
