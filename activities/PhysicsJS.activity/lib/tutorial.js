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
                element: "#viewport",
                placement: "top",
                title: l10n.get("TutoBoardTitle"),
                content: l10n.get("TutoBoardContent")
            },
            {
                element: "#circle-button",
                placement: "bottom",
                title: l10n.get("TutoCircleTitle"),
                content: l10n.get("TutoCircleContent")
            },
            {
                element: "#box-button",
                placement: "bottom",
                title: l10n.get("TutoBoxTitle"),
                content: l10n.get("TutoBoxContent")
            },
            {
                element: "#triangle-button",
                placement: "bottom",
                title: l10n.get("TutoTriangleTitle"),
                content: l10n.get("TutoTriangleContent")
            },
            {
                element: "#polygon-button",
                placement: "bottom",
                title: l10n.get("TutoPolygonTitle"),
                content: l10n.get("TutoPolygonContent")
            },
            {
                element: "#gravity-button",
                placement: "bottom",
                title: l10n.get("TutoGravityTitle"),
                content: l10n.get("TutoGravityContent")
            },
            {
                element: "#sensor-button",
                placement: "bottom",
                title: l10n.get("TutoSensorTitle"),
                content: l10n.get("TutoSensorContent")
            },
            {
                element: "#apple-button",
                placement: "bottom",
                title: l10n.get("TutoAppleTitle"),
                content: l10n.get("TutoAppleContent")
            },
            {
                element: "#clear-button",
                placement: "bottom",
                title: l10n.get("TutoClearTitle"),
                content: l10n.get("TutoClearContent")
            },
            {
                element: "#run-button",
                placement: "bottom",
                title: l10n.get("TutoPauseTitle"),
                content: l10n.get("TutoPauseContent")
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