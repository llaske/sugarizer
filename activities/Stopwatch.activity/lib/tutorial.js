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
                element: "#add-stopwatch",
                placement: "right",
                title: l10n.get("TutoAddTitle"),
                content: l10n.get("TutoAddContent")
            },
            {
                element: "#1 .counter",
                placement: "right",
                title: l10n.get("TutoCounterTitle"),
                content: l10n.get("TutoCounterContent")
            },
            {
                element: "#1 .remove",
                placement: "left",
                title: l10n.get("TutoRemoveTitle"),
                content: l10n.get("TutoRemoveContent")
            },
            {
                element: "#1 .start-stop-button",
                placement: "bottom",
                title: l10n.get("TutoStartStopTitle"),
                content: l10n.get("TutoStartStopContent")
            },
            {
                element: "#1 .reset-button",
                placement: "bottom",
                title: l10n.get("TutoResetTitle"),
                content: l10n.get("TutoResetContent")
            },
            {
                element: "#1 .mark-button",
                placement: "bottom",
                title: l10n.get("TutoMarkTitle"),
                content: l10n.get("TutoMarkContent")
            }
        ];

        var scrollToAddButton = function(){
            $('#canvas').animate({
                scrollTop: $('#add-stopwatch').offset().top
            }, 500);
        }

        var scrollToTop = function(){
            $('#canvas').animate({
                scrollTop: $('#1 .counter').offset().top
            }, 500);
        }

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
            autoscroll: true,
            onNext: function (tour) {
                var currentStep = tour.getCurrentStep();
                if (currentStep === 2)  scrollToAddButton();
                if (currentStep === 3)  scrollToTop();
            },
            onPrev: function (tour) {
                var currentStep = tour.getCurrentStep();
                if (currentStep === 4)  scrollToAddButton();
                if (currentStep === 3)  scrollToTop();
            },
            storage: false,
            backdrop: true,
            steps: steps
        });
        tour.init();
        tour.start(true);

    };

    return tutorial;
});
