define(["webL10n"], function (l10n) {
//define([], function () {
	var tutorial = {};

	tutorial.start = function(language) {
        
        //l10n.language.code = "e";
        //console.log("In tutorial lang: "+language);
        //console.log("In tutorial lang: "+l10n.language.code);
		var steps = [
			{
				element: "",
				orphan: true,
				placement: "bottom",
				title: l10n.get("TutoExplainTitle"),
				content: l10n.get("TutoExplainContent")
            },
            {
				element: "#previous-button",
				placement: "bottom",
				title: l10n.get("Previous"),
				content: l10n.get("TutoPreviousExplanation")
            },
            {
				element: "#next-button",
				placement: "bottom",
				title: l10n.get("Next"),
				content: l10n.get("TutoNextExplanation")
			},
			{
				element: "#add-button",
				placement: "bottom",
				title: l10n.get("TutoAddPage"),
				content: l10n.get("TutoAddPageExplanation")
            },
            {
				element: "#add-globe",
				placement: "bottom",
				title: l10n.get("Add")+l10n.get("globe"),
				content: l10n.get("TutoAddGlobeExplanation")
            },
			{
                element: "#text-button",
                placement: "bottom",
				title: l10n.get("TutoEditText"),
				content: l10n.get("TutoEditTextExplanation")
            },
            {
				element: "#sort-button",
				placement: "bottom",
				title: l10n.get("TutoSortBoxes"),
				content: l10n.get("TutoSortBoxesExplanation")
            },
            {
				element: "#clean-all-button",
				placement: "bottom",
				title: l10n.get("TutoCleanAll"),
				content: l10n.get("TutoCleanAllExplanation")
            },
            {
				element: "#image-save",
				placement: "bottom",
				title: l10n.get("TutoImageSave"),
				content: l10n.get("TutoImageSaveExplanation")
            },
            {
				element: "#page-counter",
				placement: "left",
				title: l10n.get("TutoPageCounter"),
				content: l10n.get("TutoPageCounterExplanation")
            },
            {
				element: "#stop-button",
				placement: "left",
				title: l10n.get("TutoStop"),
				content: l10n.get("TutoStopExplanation")
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
            steps: steps
        });
		tour.init();
		tour.start(true);

	};

	return tutorial;
});

