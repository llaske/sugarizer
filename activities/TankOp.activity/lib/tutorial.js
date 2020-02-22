define([], function () {
	var tutorial = {};

	tutorial.start = function() {
		var steps = [
			{
				element: "",
				orphan: true,
				placement: "bottom",
				title: "Tank Operation Activity",
				content: "Welcome into the Tank Operation activity. Tank Operation is an arcade game that helps kids practice their math facts with different level of difficulty."
			},
			{
				element: "#fullscreen-button",
				placement: "bottom",
				title: "FullScreen Button",
				content: "Press this button to switch to Full Screen mode."
            },
            {
				element: "#stop-button",
				placement: "left",
				title: "Stop Button",
				content: "Press this button to switch to Full Screen mode."
            },
            {
				element: "#app_image3",
				placement: "left",
				title: "Credits",
				content: "Press this button to know about developers behind this activity."
            },
            {
				element: "#app_control6",
				placement: "top",
				title: "Change Mission",
				content: "Press the left and right buttons to change mission."
            },
			{
				element: "#app_image2",
                title: "Start Activity",
                placement: "bottom",
				content: "Press this button to start the activity."
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