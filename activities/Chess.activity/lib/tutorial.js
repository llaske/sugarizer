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
				element: "#easy-button",
				placement: "bottom",
				title: l10n.get("TutoEasyTitle"),
				content: l10n.get("TutoEasyContent")
			},
			{
				element: "#hard-button",
				placement: "bottom",
				title: l10n.get("TutoHardTitle"),
				content: l10n.get("TutoHardContent")
			},
			{
				element: "#network-button",
				placement: "bottom",
				title: l10n.get("TutoNetworkTitle"),
				content: l10n.get("TutoNetworkContent")
			},
			{
				element: "#restart-button",
				placement: "bottom",
				title: l10n.get("TutoRestartTitle"),
				content: l10n.get("TutoRestartContent")
			},
			{
				element: "#undo-button",
				placement: "bottom",
				title: l10n.get("TutoUndoTitle"),
				content: l10n.get("TutoUndoContent")
			},
			{
				element: "#move-history",
				placement: "bottom",
				title: l10n.get("TutoMoveHistoryTitle"),
				content: l10n.get("TutoMoveHistoryContent")
			},
			{
				element: "#header",
				placement: "bottom",
				title: l10n.get("TutoHeaderTitle"),
				content: l10n.get("TutoHeaderContent")
			},
			{
				element: "#information",
				placement: "right",
				title: l10n.get("TutoInformationTitle"),
				content: l10n.get("TutoInformationContent")
			},
			{
				element: "#spectators",
				placement: "bottom",
				title: l10n.get("TutoSpectatorsTitle"),
				content: l10n.get("TutoSpectatorsContent")
			},
			{
				element: "#board",
				placement: "right",
				title: l10n.get("TutoBoardTitle"),
				content: l10n.get("TutoBoardContent")
			},
			{
				element: "#board",
				placement: "right",
				title: l10n.get("TutoKingTitle"),
				content: l10n.get("TutoKingContent")
			},
			{
				element: "#board",
				placement: "right",
				title: l10n.get("TutoQueenTitle"),
				content: l10n.get("TutoQueenContent")
			},
			{
				element: "#board",
				placement: "right",
				title: l10n.get("TutoRookTitle"),
				content: l10n.get("TutoRookContent")
			},
			{
				element: "#board",
				placement: "right",
				title: l10n.get("TutoBishopTitle"),
				content: l10n.get("TutoBishopContent")
			},
			{
				element: "#board",
				placement: "right",
				title: l10n.get("TutoKnightTitle"),
				content: l10n.get("TutoKnightContent")
			},
			{
				element: "#board",
				placement: "right",
				title: l10n.get("TutoPawnTitle"),
				content: l10n.get("TutoPawnContent")
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
						<div class='icon-tutorial-text'>"+l10n.get("TutoPrev")+"</div>\
					</div>\
					<span data-role='separator' style='margin: 4px'>|</span>\
					<div class='tutorial-next-icon icon-button' data-role='next'>\
						<div class='tutorial-next-icon1 web-activity'>\
							<div class='tutorial-next-icon2 web-activity-icon'></div>\
							<div class='tutorial-next-icon3 web-activity-disable'></div>\
						</div>\
						<div class='icon-tutorial-text'>"+l10n.get("TutoNext")+"</div>\
					</div>\
					<div class='tutorial-end-icon icon-button' data-role='end'>\
						<div class='tutorial-end-icon1 web-activity'>\
							<div class='tutorial-end-icon2 web-activity-icon'></div>\
							<div class='tutorial-end-icon3 web-activity-disable'></div>\
						</div>\
						<div class='icon-tutorial-text'>"+l10n.get("TutoEnd")+"</div>\
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
