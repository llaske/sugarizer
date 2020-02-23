define(["webL10n"], function (l10n) {
    var tutorial = {};

    tutorial.start = function(play) {
        var homeSteps = [
            {
                element: "",
                orphan: true,
                placement: "bottom",
                title: l10n.get("TutoExplainTitle"),
                content: l10n.get("TutoExplainContent")
            },
            {
                element: "#app_control2",
                placement: "top",
                title: l10n.get("TutoChangeMissionTitle"),
                content: l10n.get("TutoChangeMissionContent")
            },
            {
                element: "#app_image2",
                placement: "top",
                title: l10n.get("TutoStartActivityTitle"),
                content: l10n.get("TutoStartActivityContent")
            },
            {
                element: "#app_control7",
                placement: "top",
                title: l10n.get("TutoCompletedMissionsTitle"),
                content: l10n.get("TutoCompletedMissionsContent")
            },
            {
                element: "#fullscreen-button",
                placement: "bottom",
                title: l10n.get("TutoFullScreenButtonTitle"),
                content: l10n.get("TutoFullScreenButtonContent")
            },
            {
                element: "#stop-button",
                placement: "left",
                title: l10n.get("TutoStopButtonTitle"),
                content: l10n.get("TutoStopButtonContent")
            },
            {
                element: "#app_image3",
                placement: "left",
                title: l10n.get("TutoCreditsTitle"),
                content: l10n.get("TutoCreditsContent")
            }
        ];
        
        var playSteps = [
            {
                element: "",
                orphan: true,
                placement: "bottom",
                title: l10n.get("TutoPlayExplainTitle"),
                content: l10n.get("TutoPlayExplainContent")
            },
            {
                element: "canvas",
                placement: "right",
                title: l10n.get("TutoGameTitle"),
                content: l10n.get("TutoGameContent")
            },
            {
                element: "#play_keyboard",
                placement: "left",
                title: l10n.get("TutoPlayControlsTitle"),
                content: l10n.get("TutoPlayControlsContent")
            },
            {
                element: "#play_image12",
                placement: "top",
                title: l10n.get("TutoPlayFire"),
                content: l10n.get("TutoPlayFireContent")
            },
            {
                element: "#play_wave",
                placement: "left",
                title: l10n.get("TutoWaveTitle"),
                content: l10n.get("TutoWaveContent")
            },
            {
                element: "#play_score",
                placement: "left",
                title: l10n.get("TutoScoreTitle"),
                content: l10n.get("TutoScoreContent")
            },
            {
                element: "#play_image",
                placement: "top",
                title: l10n.get("TutoPlayHomeTitle"),
                content: l10n.get("TutoPlayHomeContent")
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
            steps: play? playSteps : homeSteps
        });
        tour.init();
        tour.start(true);

    };

    return tutorial;
});