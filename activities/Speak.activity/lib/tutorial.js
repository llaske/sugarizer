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
                element: "#gamemode1-button",
                placement: "bottom",
                title: l10n.get("TutoReadTitle"),
                content: l10n.get("TutoReadContent")
            },
            {
                element: "#gamemode2-button",
                placement: "bottom",
                title: l10n.get("TutoQuestionTitle"),
                content: l10n.get("TutoQuestionContent")
            },
            {
                element: "#gamemode3-button",
                placement: "bottom",
                title: l10n.get("TutoVoiceTitle"),
                content: l10n.get("TutoVoiceContent")
            },
            {
                element: "#language-button",
                placement: "bottom",
                title: l10n.get("TutoLanguageTitle"),
                content: l10n.get("TutoLanguageContent")
            },
            {
                element: "#speech-button",
                placement: "bottom",
                title: l10n.get("TutoSpeechTitle"),
                content: l10n.get("TutoSpeechContent")
            },
            {
                element: "#face-button",
                placement: "bottom",
                title: l10n.get("TutoFaceTitle"),
                content: l10n.get("TutoFaceContent")
            },
            {
                element: "#userText",
                placement: "bottom",
                title: l10n.get("TutoTextTitle"),
                content: l10n.get("TutoTextContent")
            },
            {
                element: "#combo-box",
                placement: "bottom",
                title: l10n.get("TutoHistoryTitle"),
                content: l10n.get("TutoHistoryContent")
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