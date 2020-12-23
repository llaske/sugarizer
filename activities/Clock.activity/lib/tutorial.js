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
				element: "#clock-container",
				placement: "right",
				title: l10n.get("TutoHandTitle"),
				content: l10n.get("TutoHandContent")
			},
			{
				element: "#simple-clock-button",
				placement: "bottom",
				title: l10n.get("TutoSimpleTitle"),
				content: l10n.get("TutoSimpleContent")
			},
			{
				element: "#nice-clock-button",
				placement: "bottom",
				title: l10n.get("TutoNiceTitle"),
				content: l10n.get("TutoNiceContent")
			},
			{
				element: "#write-time-button",
				placement: "bottom",
				title: l10n.get("TutoTimeTitle"),
				content: l10n.get("TutoTimeContent")
			},
			{
				element: "#write-date-button",
				placement: "bottom",
				title: l10n.get("TutoDateTitle"),
				content: l10n.get("TutoDateContent")
			},
			{
				element: "#write-seconds-button",
				placement: "bottom",
				title: l10n.get("TutoSecondsTitle"),
				content: l10n.get("TutoSecondsContent")
			},
			{
				element: "#show-am-pm",
				placement: "bottom",
				title: l10n.get("ShowAmPmTitle"),
				content: l10n.get("TutoShowAmPmContent")
			},
			{
				element: "#set-time-button",
				placement: "bottom",
				title: l10n.get("TutoSetTimeTitle"),
				content: l10n.get("TutoSetTimeContent")
			},
			{
				element: "#set-timeGame-button",
				placement: "bottom",
				title: l10n.get("TutoSetTimeGameTitle"),
				content: l10n.get("TutoSetTimeGameContent")
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
