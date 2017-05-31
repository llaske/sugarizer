

// Tutorial handling
define(["webL10n", "activity/activity"], function () {
	var tutorial = {};
	var tour;
	var l10n = l10n_s;

	tutorial.elements = [];

	// Init tutorial
	tutorial.init = function() {
		var prevString = l10n.get("TutoPrev");
		var nextString = l10n.get("TutoNext");
		var endString = l10n.get("TutoEnd");
		var steps = [
			{
				element: "",
				orphan: true,
				placement: "bottom",
				title: l10n.get("TutoExplainTitle"),
				content: l10n.get("TutoExplainContent")
			},
			{
				element: tutorial.getElement("board"),
				placement: "right",
				title: l10n.get("TutoBoardTitle"),
				content: l10n.get("TutoBoardContent")
			},
			{
				element: tutorial.getElement("activity"),
				placement: "bottom",
				title: l10n.get("TutoActivityTitle"),
				content: l10n.get("TutoActivityContent")
			},
			{
				element: tutorial.getElement("node"),
				placement: "bottom",
				title: l10n.get("TutoNodeTitle"),
				content: l10n.get("TutoNodeContent")
			},
			{
				element: tutorial.getElement("link"),
				placement: "bottom",
				title: l10n.get("TutoLinkTitle"),
				content: l10n.get("TutoLinkContent")
			},
			{
				element: tutorial.getElement("remove"),
				placement: "bottom",
				title: l10n.get("TutoRemoveTitle"),
				content: l10n.get("TutoRemoveContent")
			},
			{
				element: tutorial.getElement("undo"),
				placement: "bottom",
				title: l10n.get("TutoUndoTitle"),
				content: l10n.get("TutoUndoContent")
			},
			{
				element: tutorial.getElement("redo"),
				placement: "bottom",
				title: l10n.get("TutoRedoTitle"),
				content: l10n.get("TutoRedoContent")
			},
			{
				element: tutorial.getElement("zoom"),
				placement: "bottom",
				title: l10n.get("TutoZoomTitle"),
				content: l10n.get("TutoZoomContent")
			},
			{
				element: tutorial.getElement("png"),
				placement: "bottom",
				title: l10n.get("TutoPngTitle"),
				content: l10n.get("TutoPngContent")
			},
			{
				element: tutorial.getElement("textvalue"),
				placement: "bottom",
				title: l10n.get("TutoTextTitle"),
				content: l10n.get("TutoTextContent")
			},
			{
				element: tutorial.getElement("foreground"),
				placement: "bottom",
				title: l10n.get("TutoForegroundTitle"),
				content: l10n.get("TutoForegroundContent")
			},
			{
				element: tutorial.getElement("background"),
				placement: "bottom",
				title: l10n.get("TutoBackgroundTitle"),
				content: l10n.get("TutoBackgroundContent")
			},
			{
				element: tutorial.getElement("bold"),
				placement: "bottom",
				title: l10n.get("TutoBoldTitle"),
				content: l10n.get("TutoBoldContent")
			},
			{
				element: tutorial.getElement("italic"),
				placement: "bottom",
				title: l10n.get("TutoItalicTitle"),
				content: l10n.get("TutoItalicContent")
			},
			{
				element: tutorial.getElement("font"),
				placement: "bottom",
				title: l10n.get("TutoFontTitle"),
				content: l10n.get("TutoFontContent")
			},
			{
				element: tutorial.getElement("fontplus"),
				placement: "bottom",
				title: l10n.get("TutoFontPlusTitle"),
				content: l10n.get("TutoFontPlusContent")
			},
			{
				element: tutorial.getElement("fontminus"),
				placement: "bottom",
				title: l10n.get("TutoFontMinusTitle"),
				content: l10n.get("TutoFontMinusContent")
			},
			{
				element: tutorial.getElement("stop"),
				placement: "bottom",
				title: l10n.get("TutoStopTitle"),
				content: l10n.get("TutoStopContent")
			},
		];
		tour = new Tour({
			template: "\
			<div class='popover tour'>\
				<div class='arrow'></div>\
				<h3 class='popover-title tutorial-title'></h3>\
				<div class='popover-content'></div>\
				<div class='popover-navigation'>\
					<div class='tutorial-prev-icon icon-button' data-role='prev'>\
						<div class='tutorial-prev-icon1 web-activity'>\
							<div class='tutorial-prev-icon2 web-activity-icon'></div>\
							<div class='tutorial-prev-icon3 web-activity-disable'></div>\
						</div>\
						<div class='icon-tutorial-text'>"+prevString+"</div>\
					</div>\
					<span data-role='separator'>|</span>\
					<div class='tutorial-next-icon icon-button' data-role='next'>\
						<div class='tutorial-next-icon1 web-activity'>\
							<div class='tutorial-next-icon2 web-activity-icon'></div>\
							<div class='tutorial-next-icon3 web-activity-disable'></div>\
						</div>\
						<div class='icon-tutorial-text'>"+nextString+"</div>\
					</div>\
					<div class='tutorial-end-icon icon-button' data-role='end'>\
						<div class='tutorial-end-icon1 web-activity'>\
							<div class='tutorial-end-icon2 web-activity-icon'></div>\
							<div class='tutorial-end-icon3 web-activity-disable'></div>\
						</div>\
						<div class='icon-tutorial-text'>"+endString+"</div>\
					</div>\
				</div>\
			</div>",
			storage: false,
			backdrop: true,
			steps: steps
		});
		tour.init();
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
		tour.start(true);
	};

	return tutorial;
});
