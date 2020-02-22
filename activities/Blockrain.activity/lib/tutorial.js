define([], function () {
	var tutorial = {};

	tutorial.start = function() {
		var steps = [
			{
				element: "",
				orphan: true,
				placement: "bottom",
				title: "Blockrain",
				content: "Welcome into the Blockrain activity. Blockrain is a tile-matching puzzle video game."
            },
            {
				element: "#canvas",
				placement: "right",
				title: "Rules",
				content: "You can only move the pieces in specific ways, your game is over if your pieces reach the top of the screen, and you can only remove pieces from the screen by filling all the blank space in a line (horizontally)."
            },
			{
				element: "#btn-next",
				placement: "bottom",
				title: "Change Theme",
				content: "Click here to change the there of the game."
            },
			{
				element: "#up-arrow",
				placement: "right",
				title: "Rotate",
				content: "Click here to rotate the incoming blocks."
            },
			{
				element: "#down-arrow",
				placement: "right",
				title: "Move Down",
				content: "Click here to move the incoming blocks in downward direction."
            },
			{
				element: "#left-arrow",
				placement: "left",
				title: "Move Left",
				content: "Click here to move the incoming blocks in left direction."
            },
			{
				element: "#right-arrow",
				placement: "left",
				title: "Move Right",
				content: "Click here to move the incoming blocks in right direction."
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