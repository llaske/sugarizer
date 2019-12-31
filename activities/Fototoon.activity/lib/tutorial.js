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
				element: "#previous-button",
				placement: "bottom",
				title: l10n.get("TutoPrevTitle"),
				content: l10n.get("TutoPrevContent")
			},
			{
				element: "#next-button",
				placement: "bottom",
				title: l10n.get("TutoNextTitle"),
				content: l10n.get("TutoNextContent")
			},
			{
				element: "#add-button",
				placement: "bottom",
				title: l10n.get("TutoAddTitle"),
				content: l10n.get("TutoAddContent")
			},
			{
				element: "#add-globe",
				placement: "bottom",
				title: l10n.get("TutoGlobeTitle"),
				content: l10n.get("TutoGlobeContent")
			},
			{
				element: "#text-button",
				placement: "bottom",
				title: l10n.get("TutoTextTitle"),
				content: l10n.get("TutoTextContent")
			},
			{
				element: "#sort-button",
				placement: "bottom",
				title: l10n.get("TutoSortTitle"),
				content: l10n.get("TutoSortContent")
			},
			{
				element: "#clean-all-button",
				placement: "bottom",
				title: l10n.get("TutoCleanTitle"),
				content: l10n.get("TutoCleanContent")
			},
			{
				element: "#image-save",
				placement: "bottom",
				title: l10n.get("TutoSaveTitle"),
				content: l10n.get("TutoSaveContent")
			},
			{
				element: "#page-counter",
				placement: "left",
				title: l10n.get("TutoCountTitle"),
				content: l10n.get("TutoCountContent")
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
