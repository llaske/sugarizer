define(["webL10n"], function (l10n) {
    var tutorial = {};

    tutorial.start = function () {
        var prevString = l10n.get("TutoPrev");
        var nextString = l10n.get("TutoNext");
        var endString = l10n.get("TutoEnd");
        var steps = [
            {
                element: "",
                orphan: true,
                placement: "bottom",
                title: l10n.get("TutoExplainTitle"),
                content: l10n.get("TutoExplainContent")
            },
            {
                element: "#network-button",
                title: l10n.get("TutoNetworkTitle"),
                content: l10n.get("TutoNetworkContent")
            },
            {
                element: "#game-templates-button",
                title: l10n.get("TutoTemplatesTitle"),
                content: l10n.get("TutoTemplatesContent")
            },
            {
                element: "#game-size-button",
                title: l10n.get("TutoSizeTitle"),
                content: l10n.get("TutSizeContent")
            },
            {
                element: "#game-reset-button",
                title: l10n.get("TutoResetTitle"),
                content: l10n.get("TutoResetContent")
            },
            {
                element: "#game-editor-button",
                title: l10n.get("TutoEditorTitle"),
                content: l10n.get("TutoEditorContent")
            },
            {
                element: "#game-editor-insert-mode-button",
                title: l10n.get("TutoInsertTitle"),
                content: l10n.get("TutoInsertContent")
            },
            {
                element: "#game-editor-play-mode-button",
                title: l10n.get("TutoPlayTitle"),
                content: l10n.get("TutoPlayContent")
            },
            {
                element: "#game-editor-clear-button",
                title: l10n.get("TutoClearTitle"),
                content: l10n.get("TutoClearContent")
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
                        <div class='icon-tutorial-text'>"+ prevString + "</div>\
                    </div>\
                    <span data-role='separator' style='margin: 4px'>|</span>\
                    <div class='tutorial-next-icon icon-button' data-role='next'>\
                        <div class='tutorial-next-icon1 web-activity'>\
                            <div class='tutorial-next-icon2 web-activity-icon'></div>\
                            <div class='tutorial-next-icon3 web-activity-disable'></div>\
                        </div>\
                        <div class='icon-tutorial-text'>"+ nextString + "</div>\
                    </div>\
                    <div class='tutorial-end-icon icon-button' data-role='end'>\
                        <div class='tutorial-end-icon1 web-activity'>\
                            <div class='tutorial-end-icon2 web-activity-icon'></div>\
                            <div class='tutorial-end-icon3 web-activity-disable'></div>\
                        </div>\
                        <div class='icon-tutorial-text'>"+ endString + "</div>\
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
