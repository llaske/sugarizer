define(["webL10n", "bootstrap-tour-standalone.min"], function (l10n, bootstrapTour) {
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
				element: "#en-button",
				placement: "bottom",
				title: l10n.get("TutoEnTitle"),
				content: l10n.get("TutoEnContent")
			},
			{
				element: "#fr-button",
				title: l10n.get("TutoFrTitle"),
				content: l10n.get("TutoFrContent")
            },
            {
                element: "#pt_BR-button",
                title: l10n.get("TutoPtTitle"),
                content: l10n.get("TutoPtContent")
			},
			{
				element: ".game-LearnGame",
				title: l10n.get("TutoLearnTitle"),
				content: l10n.get("TutoLearnContent")
			},
			{
				element: ".game-PlayGame",
				title: l10n.get("TutoPlayTitle"),
				content: l10n.get("TutoPlayContent")
			},
			{
				element: ".game-BuildGame",
				title: l10n.get("TutoBuildTitle"),
				content: l10n.get("TutoBuildContent")
			},
			{
				element: ".information",
				title: l10n.get("TutoShadowTitle"),
				content: l10n.get("TutoShadowContent")
			},
			{
				element: "#learnGame_card",
				title: l10n.get("TutoLCardTitle"),
				content: l10n.get("TutoLCardContent")
			},
			{
				element: "#playGame_card",
				title: l10n.get("TutoPCardTitle"),
				content: l10n.get("TutoPCardContent")
			},
			{
				element: "#buildGame_card",
				title: l10n.get("TutoBCardTitle"),
				content: l10n.get("TutoBCardContent")
			},
			{
				element: "#learnGame_pause_button",
				title: l10n.get("TutoLPauseTitle"),
				content: l10n.get("TutoLPauseContent")
			},
			{
				element: "#learnGame_play_button",
				title: l10n.get("TutoLPlayTitle"),
				content: l10n.get("TutoLPlayContent")
			},
			{
				element: "#learnGame_home_button",
				title: l10n.get("TutoLHomeTitle"),
				content: l10n.get("TutoLHomeContent")
			},
			{
				element: "#learnGame_forward_button",
				title: l10n.get("TutoLForwTitle"),
				content: l10n.get("TutoLForwContent")				
			},
			{
				element: "#buildGame_validate_button",
				title: l10n.get("TutoBValidTitle"),
				content: l10n.get("TutoBValidContent")
			},
			{
				element: "#buildGame_play_button",
				title: l10n.get("TutoBPlayTitle"),
				content: l10n.get("TutoBPlayContent")
			},
			{
				element: "#buildGame_pause_button",
				title: l10n.get("TutoBPauseTitle"),
				content: l10n.get("TutoBPauseContent")
			},
			{
				element: "#buildGame_home_button",
				title: l10n.get("TutoBHomeTitle"),
				content: l10n.get("TutoBHomeContent")
			},
			{
				element: "#buildGame_restart_button",
				title: l10n.get("TutoBRestartTitle"),
				content: l10n.get("TutoBRestartContent")
			},
			{
				element: "#buildGame_forward_button",
				title: l10n.get("TutoBForwTitle"),
				content: l10n.get("TutoBForwContent")
			},
			{
				element: "#playGame_play_button",
				title: l10n.get("TutoPPlayTitle"),
				content: l10n.get("TutoPPlayContent")
			},
			{
				element: "#playGame_pause_button",
				title: l10n.get("TutoPPauseTitle"),
				content: l10n.get("TutoPPauseContent")
			},
			{
				element: "#playGame_home_button",
				title: l10n.get("TutoPHomeTitle"),
				content: l10n.get("TutoPHomeContent")
			},
			{
				element: "#playGame_forward_button",
				title: l10n.get("TutoPForwTitle"),
				content: l10n.get("TutoPForwContent")
			}
			
		];
		var tour = new bootstrapTour({steps: steps});var tour = new Tour({
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