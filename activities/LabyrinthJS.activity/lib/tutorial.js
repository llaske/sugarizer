

// Tutorial handling
define(["l10n", "activity/activity"], function () {
	var tutorial = {};
	var tour;
	var l10n = l10n_s;

	tutorial.elements = [];

	// Init tutorial
	tutorial.init = function() {
		var steps = [
			{
				position: "bottom",
				title: l10n.get("TutoExplainTitle"),
				intro: l10n.get("TutoExplainContent")
			},
			{
				element: tutorial.getElement("board"),
				position: "top",
				title: l10n.get("TutoBoardTitle"),
				intro: l10n.get("TutoBoardContent")
			},
			{
				element: tutorial.getElement("activity"),
				position: "bottom",
				title: l10n.get("TutoActivityTitle"),
				intro: l10n.get("TutoActivityContent")
			},
			{
				element: tutorial.getElement("node"),
				position: "bottom",
				title: l10n.get("TutoNodeTitle"),
				intro: l10n.get("TutoNodeContent")
			},
			{
				element: tutorial.getElement("link"),
				position: "bottom",
				title: l10n.get("TutoLinkTitle"),
				intro: l10n.get("TutoLinkContent")
			},
			{
				element: tutorial.getElement("remove"),
				position: "bottom",
				title: l10n.get("TutoRemoveTitle"),
				intro: l10n.get("TutoRemoveContent")
			},
			{
				element: tutorial.getElement("undo"),
				position: "bottom",
				title: l10n.get("TutoUndoTitle"),
				intro: l10n.get("TutoUndoContent")
			},
			{
				element: tutorial.getElement("redo"),
				position: "bottom",
				title: l10n.get("TutoRedoTitle"),
				intro: l10n.get("TutoRedoContent")
			},
			{
				element: tutorial.getElement("zoom"),
				position: "bottom",
				title: l10n.get("TutoZoomTitle"),
				intro: l10n.get("TutoZoomContent")
			},
			{
				element: tutorial.getElement("png"),
				position: "bottom",
				title: l10n.get("TutoPngTitle"),
				intro: l10n.get("TutoPngContent")
			},
			{
				element: tutorial.getElement("textvalue"),
				position: "bottom",
				title: l10n.get("TutoTextTitle"),
				intro: l10n.get("TutoTextContent")
			},
			{
				element: tutorial.getElement("foreground"),
				position: "bottom",
				title: l10n.get("TutoForegroundTitle"),
				intro: l10n.get("TutoForegroundContent")
			},
			{
				element: tutorial.getElement("background"),
				position: "bottom",
				title: l10n.get("TutoBackgroundTitle"),
				intro: l10n.get("TutoBackgroundContent")
			},
			{
				element: tutorial.getElement("bold"),
				position: "bottom",
				title: l10n.get("TutoBoldTitle"),
				intro: l10n.get("TutoBoldContent")
			},
			{
				element: tutorial.getElement("italic"),
				position: "bottom",
				title: l10n.get("TutoItalicTitle"),
				intro: l10n.get("TutoItalicContent")
			},
			{
				element: tutorial.getElement("font"),
				position: "bottom",
				title: l10n.get("TutoFontTitle"),
				intro: l10n.get("TutoFontContent")
			},
			{
				element: tutorial.getElement("fontplus"),
				position: "bottom",
				title: l10n.get("TutoFontPlusTitle"),
				intro: l10n.get("TutoFontPlusContent")
			},
			{
				element: tutorial.getElement("fontminus"),
				position: "bottom",
				title: l10n.get("TutoFontMinusTitle"),
				intro: l10n.get("TutoFontMinusContent")
			},
			{
				element: tutorial.getElement("stop"),
				position: "bottom",
				title: l10n.get("TutoStopTitle"),
				intro: l10n.get("TutoStopContent")
			},
		];
		steps = steps.filter(
            (step) =>
                !("element" in step) ||
                (step.element &&
                    step.element.style.display != "none" &&
                    step.element.getBoundingClientRect().y != 0)
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
	}

	// Handle tutorial element id
	tutorial.setElement = function(name, id) {
		tutorial.elements[name] = id;
	}
	tutorial.getElement = function(name) {
		return tutorial.elements[name];
	}

	// Start tutorial
	tutorial.start = function() {
		tutorial.init();
	};

	return tutorial;
});
