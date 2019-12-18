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
				element: "#add-button",
				placement: "bottom",
				title: l10n.get("TutoAddTitle"),
				content: l10n.get("TutoAddContent")
			},
			{
				element: "#minus-button",
				placement: "bottom",
				title: l10n.get("TutoMinusTitle"),
				content: l10n.get("TutoMinusContent")
			},
			{
				element: "#const-button",
				placement: "bottom",
				title: l10n.get("TutoConstTitle"),
				content: l10n.get("TutoConstContent")
			},
			{
				element: "#star-button",
				placement: "bottom",
				title: l10n.get("TutoStarTitle"),
				content: l10n.get("TutoStarContent")
			},
			{
				element: "#location-button",
				placement: "bottom",
				title: l10n.get("TutoLocationTitle"),
				content: l10n.get("TutoLocationContent")
			},
			{
				element: "#world-button",
				placement: "bottom",
				title: l10n.get("TutoWorldTitle"),
				content: l10n.get("TutoWorldContent")
			},
			{
				element: "#view-button",
				placement: "bottom",
				title: l10n.get("TutoViewTitle"),
				content: l10n.get("TutoViewContent")
			},
			{
				element: ".starmap_clock",
				placement: "bottom",
				title: l10n.get("TutoTimeTitle"),
				content: l10n.get("TutoTimeContent")
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
