define(["webL10n"], function(l10n) {
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
				element: "#buddy-button",
				placement: "bottom",
				title: l10n.get("TutoBuddyTitle"),
				content: l10n.get("TutoBuddyContent")
			},
			{
				element: "#rainbow-button",
				placement: "bottom",
				title: l10n.get("TutoRainbowTitle"),
				content: l10n.get("TutoRainbowContent")
			},
			{
				element: "#horizontal-button",
				placement: "bottom",
				title: l10n.get("TutoHorizontalTitle"),
				content: l10n.get("TutoHorizontalContent")
			},
			{
				element: "#vertical-button",
				placement: "bottom",
				title: l10n.get("TutoVerticalTitle"),
				content: l10n.get("TutoVerticalContent")
			},
			{
				element: "#bilateral-button",
				placement: "bottom",
				title: l10n.get("TutoBilateralTitle"),
				content: l10n.get("TutoBilateralContent")
			},
			{
				element: "#robot-button",
				placement: "bottom",
				title: l10n.get("TutoRobotTitle"),
				content: l10n.get("TutoRobotContent")
			},
			{
				element: "#actualcanvas",
				placement: "top",
				title: l10n.get("TutoCanvasTitle"),
				content: l10n.get("TutoCanvasContent")
			}
		];
		var tour = new Tour({
			template:
				"\
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
                        <div class='icon-tutorial-text'>" +
				l10n.get("TutoPrev") +
				"</div>\
                    </div>\
                    <span data-role='separator' style='margin: 4px'>|</span>\
                    <div class='tutorial-next-icon icon-button' data-role='next'>\
                        <div class='tutorial-next-icon1 web-activity'>\
                            <div class='tutorial-next-icon2 web-activity-icon'></div>\
                            <div class='tutorial-next-icon3 web-activity-disable'></div>\
                        </div>\
                        <div class='icon-tutorial-text'>" +
				l10n.get("TutoNext") +
				"</div>\
                    </div>\
                    <div class='tutorial-end-icon icon-button' data-role='end'>\
                        <div class='tutorial-end-icon1 web-activity'>\
                            <div class='tutorial-end-icon2 web-activity-icon'></div>\
                            <div class='tutorial-end-icon3 web-activity-disable'></div>\
                        </div>\
                        <div class='icon-tutorial-text'>" +
				l10n.get("TutoEnd") +
				"</div>\
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
