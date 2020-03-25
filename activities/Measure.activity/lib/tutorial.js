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
				element: "#speech-button",
				placement: "bottom",
				title: l10n.get("Tutodespeech-buttonTitle"),
				content: l10n.get("Tutodespeech-buttonContent")
			},
			{
				element: "#timebased",
				placement: "bottom",
				title: l10n.get("TutoTimeBaseTitle"),
				content: l10n.get("TutoTimeBaseContent")
			},
			{
				element: "#defaultCanvas0",
				placement: "right",
				title: l10n.get("TutodefaultCanvas0Title"),
				content: l10n.get("TutodefaultCanvas0Content")
			},
			
			{
				element: "#timeyslider",
				placement: "up",
				title: l10n.get("TutotimeysliderTitle"),
				content: l10n.get("TutotimeysliderContent")
			},
			{
				element: "#timebtny1",
				placement: "up",
				title: l10n.get("Tutotimebtny1Title"),
				content: l10n.get("Tutotimebtny1Content")
			},
			{
				element: "#timebtny2",
				placement: "up",
				title: l10n.get("Tutotimebtny2Title"),
				content: l10n.get("Tutotimebtny2Content")
			},
			{
				element: "#timexslider",
				placement: "up",
				title: l10n.get("TutotimexsliderTitle"),
				content: l10n.get("TutotimexsliderContent")
			},
			{
				element: "#timebtnx1",
				placement: "up",
				title: l10n.get("Tutotimebtnx1Title"),
				content: l10n.get("Tutotimebtnx1Content")
			},
			{
				element: "#timebtnx2",
				placement: "up",
				title: l10n.get("Tutotimebtnx2Title"),
				content: l10n.get("Tutotimebtnx2Content")
			},
			{
				element: "#defaultCanvas1",
				placement: "right",
				title: l10n.get("TutodefaultCanvas1Title"),
				content: l10n.get("TutodefaultCanvas1Content")
			},
			{
				element: "#freqyslider",
				placement: "up",
				title: l10n.get("TutofreqysliderTitle"),
				content: l10n.get("TutofreqysliderContent")
			},
			{
				element: "#freqbtny1",
				placement: "up",
				title: l10n.get("Tutofreqbtny1Title"),
				content: l10n.get("Tutofreqbtny1Content")
			},
			{
				element: "#freqbtny2",
				placement: "up",
				title: l10n.get("Tutofreqbtny2Title"),
				content: l10n.get("Tutofreqbtny2Content")
			},
			{
				element: "#freqxslider",
				placement: "up",
				title: l10n.get("TutofreqxsliderTitle"),
				content: l10n.get("TutofreqxsliderContent")
			},
			{
				element: "#freqbtnx1",
				placement: "up",
				title: l10n.get("Tutofreqbtnx1Title"),
				content: l10n.get("Tutofreqbtnx1Content")
			},
			{
				element: "#freqbtnx2",
				placement: "up",
				title: l10n.get("Tutofreqbtnx2Title"),
				content: l10n.get("Tutofreqbtnx2Content")
			},
			{
				element: "#help-button",
				placement: "bottom",
				title: l10n.get("TutoHelpTitle"),
				content: l10n.get("TutoHelpContent")
			},
			{
				element: "#fullscreen-button",
				placement: "bottom",
				title: l10n.get("TutoFullscreenTitle"),
				content: l10n.get("TutoFullscreenContent")
			},
			{
				element: "#stop-button",
				placement: "bottom",
				title: l10n.get("TutoStopTitle"),
				content: l10n.get("TutoStopContent")
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