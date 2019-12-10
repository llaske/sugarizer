define(["webL10n"], function (l10n) {
	var tutorial = {};

	tutorial.start = function () {
		var steps = [{
				element: "",
				orphan: true,
				placement: "bottom",
				title: l10n.get("TutoExplainTitle"),
				content: l10n.get("TutoExplainContent")
			},
			{
				element: "#network-button",
				placement: "bottom",
				title: l10n.get("TutoNetworkTitle"),
				content: l10n.get("TutoNetworkContent")
			},
			{
				element: "#colors-button-fill",
				placement: "bottom",
				title: l10n.get("TutoColorsButtonFillTitle"),
				content: l10n.get("TutoColorsButtonFillContent")
			},
			{
				element: "#colors-button-stroke",
				placement: "bottom",
				title: l10n.get("TutoColorsButtonStrokeTitle"),
				content: l10n.get("TutoColorsButtonStrokeContent")
			},
			{
				element: "#undo-button",
				placement: "bottom",
				title: l10n.get("TutoUndoTitle"),
				content: l10n.get("TutoUndoContent")
			},
			{
				element: "#redo-button",
				placement: "bottom",
				title: l10n.get("TutoRedoTitle"),
				content: l10n.get("TutoRedoContent")
			},
			{
				element: "#size-button",
				placement: "bottom",
				title: l10n.get("TutoSizeTitle"),
				content: l10n.get("TutoSizeContent")
			},
			{
				element: "#pen-button",
				placement: "bottom",
				title: l10n.get("TutoPenTitle"),
				content: l10n.get("TutoPenContent")
			},
			{
				element: "#eraser-button",
				placement: "bottom",
				title: l10n.get("TutoEraserTitle"),
				content: l10n.get("TutoEraserContent")
			},
			{
				element: "#stamps-button",
				placement: "bottom",
				title: l10n.get("TutoStampsTitle"),
				content: l10n.get("TutoStampsContent")
			},
			{
				element: "#text-button",
				placement: "bottom",
				title: l10n.get("TutoTextTitle"),
				content: l10n.get("TutoTextContent")
			},
			{
				element: "#insertimage-button",
				placement: "bottom",
				title: l10n.get("TutoInsertimageTitle"),
				content: l10n.get("TutoInsertimageContent")
			},
			{
				element: "#drawings-button",
				placement: "bottom",
				title: l10n.get("TutoDrawingsTitle"),
				content: l10n.get("TutoDrawingsContent")
			},
			{
				element: "#bucket-button",
				placement: "bottom",
				title: l10n.get("TutoBucketTitle"),
				content: l10n.get("TutoBucketContent")
			},
			{
				element: "#filters-button",
				placement: "bottom",
				title: l10n.get("TutoFiltersTitle"),
				content: l10n.get("TutoFiltersContent")
			},
			{
				element: "#copy-button",
				placement: "bottom",
				title: l10n.get("TutoCopyTitle"),
				content: l10n.get("TutoCopyContent")
			},
			{
				element: "#paste-button",
				placement: "bottom",
				title: l10n.get("TutoPasteTitle"),
				content: l10n.get("TutoPasteContent")
			},
			{
				element: "#clear-button",
				placement: "bottom",
				title: l10n.get("TutoClearTitle"),
				content: l10n.get("TutoClearContent")
			},
			{
				element: "#paint-canvas",
				placement: "top",
				title: l10n.get("TutoCanvasTitle"),
				content: l10n.get("TutoCanvasContent")
			}
		];
		var tour = new Tour({
			template: "\
			<div class='popover tour'>\
				<div class='arrow'></div>\
				<h3 class='popover-title tutorial-title'></h3>\
				<div class='popover-content'></div>\
				<div class='popover-navigation' style='display: flex; flex-wrap:wrap; justify-content: center; align-items: center'>\
					<div class='tutorial-prev-icon icon-button' data-role='prev'>\
						<div class='tutorial-prev-icon1 web-activity'>\
							<div class='tutorial-prev-icon2 web-activity-icon'></div>\
							<div class='tutorial-prev-icon3 web-activity-disable'></div>\
						</div>\
						<div class='icon-tutorial-text'>Prev</div>\
					</div>\
					<span data-role='separator' style='margin: 4px'>|</span>\
					<div class='tutorial-next-icon icon-button' data-role='next'>\
						<div class='tutorial-next-icon1 web-activity'>\
							<div class='tutorial-next-icon2 web-activity-icon'></div>\
							<div class='tutorial-next-icon3 web-activity-disable'></div>\
						</div>\
						<div class='icon-tutorial-text'>Next</div>\
					</div>\
					<div class='tutorial-end-icon icon-button' data-role='end'>\
						<div class='tutorial-end-icon1 web-activity'>\
							<div class='tutorial-end-icon2 web-activity-icon'></div>\
							<div class='tutorial-end-icon3 web-activity-disable'></div>\
						</div>\
						<div class='icon-tutorial-text'>End</div>\
					</div>\
				</div>\
			</div>",
			storage: false,
			backdrop: true,
			steps: steps
		});
		tour.init();
		tour.start(true);

	};

	return tutorial;
});