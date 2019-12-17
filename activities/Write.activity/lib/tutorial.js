define(["webL10n"], function (l10n) {
	var tutorial = {};

	tutorial.start = function() {
		var steps = [
			{
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
				element: "#color-button-1",
				placement: "bottom",
				title: l10n.get("TutoForegroundTitle"),
				content: l10n.get("TutoForegroundContent")
            },
            {
				element: "#color-button-2",
				placement: "bottom",
				title: l10n.get("TutoBackgroundTitle"),
				content: l10n.get("TutoBackgroundContent")
            },
            {
				element: "#format-text",
				placement: "bottom",
				title: l10n.get("TutoFormatTitle"),
				content: l10n.get("TutoFormatContent")
            },
            {
				element: "#paragraph",
				placement: "bottom",
				title: l10n.get("TutoParagraphTitle"),
				content: l10n.get("TutoParagraphContent")
            },
            {
				element: "#list",
				placement: "bottom",
				title: l10n.get("TutoListTitle"),
				content: l10n.get("TutoListContent")
            },
            {
				element: "#resize-inc",
				placement: "bottom",
				title: l10n.get("TutoIncreaseTitle"),
				content: l10n.get("TutoIncreaseContent")
            },
            {
				element: "#font-button",
				placement: "bottom",
				title: l10n.get("TutoFontTitle"),
				content: l10n.get("TutoFontContent")
            },
            {
				element: "#resize-dec",
				placement: "bottom",
				title: l10n.get("TutoDecreaseTitle"),
				content: l10n.get("TutoDecreaseContent")
            },
            {
				element: "#insert-picture",
				placement: "bottom",
				title: l10n.get("TutoInsertTitle"),
				content: l10n.get("TutoInsertContent")
            },
            {
				element: "#edit-undo",
				placement: "bottom",
				title: l10n.get("TutoUndoTitle"),
				content: l10n.get("TutoUndoContent")
            },
            {
				element: "#edit-redo",
				placement: "bottom",
				title: l10n.get("TutoRedoTitle"),
				content: l10n.get("TutoRedoContent")
            },
            {
				element: "#edit-copy",
				placement: "bottom",
				title: l10n.get("TutoCopyTitle"),
				content: l10n.get("TutoCopyContent")
            },
            {
				element: "#edit-paste",
				placement: "bottom",
				title: l10n.get("TutoPasteTitle"),
				content: l10n.get("TutoPasteContent")
            },
            {
				element: "#export",
				placement: "bottom",
				title: l10n.get("TutoExportTitle"),
				content: l10n.get("TutoExportContent")
            },
            {
				element: "#canvas",
				placement: "top",
				title: l10n.get("TutoCanvasTitle"),
				content: l10n.get("TutoCanvasContent")
			},
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
						<div class='icon-tutorial-text'>" + l10n.get("TutoPrev") + "</div>\
					</div>\
					<span data-role='separator' style='margin: 4px'>|</span>\
					<div class='tutorial-next-icon icon-button' data-role='next'>\
						<div class='tutorial-next-icon1 web-activity'>\
							<div class='tutorial-next-icon2 web-activity-icon'></div>\
							<div class='tutorial-next-icon3 web-activity-disable'></div>\
						</div>\
						<div class='icon-tutorial-text'>" + l10n.get("TutoNext") + "</div>\
					</div>\
					<div class='tutorial-end-icon icon-button' data-role='end'>\
						<div class='tutorial-end-icon1 web-activity'>\
							<div class='tutorial-end-icon2 web-activity-icon'></div>\
							<div class='tutorial-end-icon3 web-activity-disable'></div>\
						</div>\
						<div class='icon-tutorial-text'>" + l10n.get("TutoEnd") + "</div>\
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