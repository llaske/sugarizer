define([], function () {
    var tutorial = {};

    tutorial.start = function() {
        var steps = [
            {
                element: "",
                orphan: true,
                placement: "bottom",
                title: "Chess Activity",
                content: "Welcome to Chess Activity.This activity is used to play the game of chess with the computer or other players on the server."
            },
            {
                element: "#myBoard",
                placement: "right",
                title: "Board",
                content: "This is the chess board of Chess activity."
            },
            {
                element: "#status",
                placement: "right",
                title: "status area",
                content: "This shows the current status of the board."
            },
            {
                element: "#start-button",
                placement: "left",
                title: "start",
                content: "It is used to restart the game."
            }
        ];
        var tour = new Tour({template: "\
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