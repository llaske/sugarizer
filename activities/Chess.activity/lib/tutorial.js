define([], function () {
	var tutorial = {};

	tutorial.start = function() {
		var steps = [
			{
				element: "",
				orphan: true,
				placement: "bottom",
				title: "Chess Activity",
				content: "Welcome into the Chess activity. This activity is to play a game of chess ."
			},
			{
				element: "#board",
				placement: "bottom",
				title: "Chessboard",
				content: "Choose the pawn and start playing by selecting and dragging  it ."
			},
			{
                element: "#level",
                placement: "bottom",
				title: "Difficulty Level",
				content: "Choose the difficulty level "
            },
            {
                element: "#move-history",
                placement: "bottom",
				title: "Move History  ",
				content: "Keeps the log of all the played moves "
            },
            {
                element: "#undo",
                placement: "bottom",
				title: "Undo ",
				content: "Reverse a move "
            },
            {
                element: "#reset",
                placement: "bottom",
				title: "Move History  ",
				content: "Reset the game  "
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