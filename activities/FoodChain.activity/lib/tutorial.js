define(["webL10n"], function (l10n) {
	var tutorial = {};
	
	tutorial.start = function() {
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
			steps: [],
			onShown: function() {
				if (tutorial.icons && tutorial.icons.steps && tutorial.icons.steps[tour.getCurrentStep()]) {
					var icon = tutorial.icons.steps[tour.getCurrentStep()];
					var iconElement = document.getElementById("icon-tutorial");
					iconElement.style.visibility = 'visible';
					iconElement.style.backgroundImage = "url('"+ icon.directory + "/" + icon.icon + "')";
					iconElement.style.backgroundSize = icon.size + "px";
					iconElement.style.width = icon.size + "px";
					iconElement.style.height = icon.size + "px";
					iconElement.style.marginTop = "15px";
					iconElement.style.marginLeft = "5px";
					if (icon.color) {
						iconLib.colorize(iconElement, icon.color, function(){});
					}
				}
			},
			onEnd: function() {
				tutorial.elements = [];
				tutorial.icons = null;
			}
		});
		var currentView=FoodChain.context.game;
		if(currentView==''){
			tour.addSteps([
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
					placement: "bottom",
					title: l10n.get("TutoFrTitle"),
					content: l10n.get("TutoFrContent")
				},
				{
					element: "#pt_BR-button",
					placement: "bottom",
					title: l10n.get("TutoPtTitle"),
					content: l10n.get("TutoPtContent")
				},
				{
					element: "#app_LearnGame_button",
					placement: "right",
					title: l10n.get("TutoLearnTitle"),
					content: l10n.get("TutoLearnContent")
				},
				{
					element: "#app_BuildGame_button",
					placement: "bottom",
					title: l10n.get("TutoBuildTitle"),
					content: l10n.get("TutoBuildContent")
				},
				{
					element: "#app_PlayGame_button",
					placement: "left",
					title: l10n.get("TutoPlayGameTitle"),
					content: l10n.get("TutoPlayGameContent")
				},
				{
					element: "#app_shadowButton_button",
					placement: "left",
					title: l10n.get("TutoInfoTitle"),
					content: l10n.get("TutoInfoContent")
				},
			]
			);
		}else if(currentView=='FoodChain.BuildGame'){
			tour.addSteps([
				{
					element: "",
					orphan: true,
					placement: "bottom",
					title: l10n.get("TutoExplainGameTitle"),
					content: l10n.get("TutoExplainGameContent")
				},
				{
					element: "#buildGame_home_button",
					placement: "bottom",
					title: l10n.get("TutoHomeTitle"),
					content: l10n.get("TutoHomeContent")
				},
				{
					element: "#buildGame_validate_button",
					placement: "bottom",
					title: l10n.get("TutoValidateTitle"),
					content: l10n.get("TutoValidateContent")
				},
				{
					element: "#buildGame_pause_button",
					placement: "bottom",
					title: l10n.get("TutoPauseTitle"),
					content: l10n.get("TutoPauseContent")
				},
				{
					element: "#buildGame_play_button",
					placement: "bottom",
					title: l10n.get("TutoPlayTitle"),
					content: l10n.get("TutoPlayContent")
				},
				{
					element: "#buildGame_gamebox",
					placement: "top",
					title: l10n.get("TutoBoardTitle"),
					content: l10n.get("TutoBoardContent")
				},
			]
			);
		}else if(currentView=='FoodChain.LearnGame'){
			tour.addSteps([
				{
					element: "",
					orphan: true,
					placement: "bottom",
					title: l10n.get("TutoExplainLearnTitle"),
					content: l10n.get("TutoExplainLearnContent")
				},
				{
					element: "#learnGame_home_button",
					placement: "bottom",
					title: l10n.get("TutoHomeTitle"),
					content: l10n.get("TutoHomeContent")
				},
				{
					element: "#learnGame_pause_button",
					placement: "bottom",
					title: l10n.get("TutoPauseTitle"),
					content: l10n.get("TutoPauseContent")
				},
				{
					element: "#learnGame_play_button",
					placement: "bottom",
					title: l10n.get("TutoPlayTitle"),
					content: l10n.get("TutoPlayContent")
				},
				{
					element: "#learnGame_card",
					placement: "bottom",
					title: l10n.get("TutoStartTitle"),
					content: l10n.get("TutoStartContent")
				},
				{
					element: "#learnGame_herbbox",
					placement: "top",
					title: l10n.get("TutoHerbTitle"),
					content: l10n.get("TutoHerbContent")
				},
				{
					element: "#learnGame_carnbox",
					placement: "top",
					title: l10n.get("TutoCarnTitle"),
					content: l10n.get("TutoCarnContent")
				},
			]
			);
		}else if(currentView=='FoodChain.PlayGame'){
			tour.addSteps([
				{
					element: "",
					orphan: true,
					placement: "bottom",
					title: l10n.get("TutoExplainPlayTitle"),
					content: l10n.get("TutoExplainPlayContent")
				},
				{
					element: "#playGame_home_button",
					placement: "left",
					title: l10n.get("TutoHomeTitle"),
					content: l10n.get("TutoHomeContent")
				},
				{
					element: "#playGame_pause_button",
					placement: "left",
					title: l10n.get("TutoPauseTitle"),
					content: l10n.get("TutoPauseContent")
				},
				{
					element: "#playGame_play_button",
					placement: "left",
					title: l10n.get("TutoPlayTitle"),
					content: l10n.get("TutoPlayContent")
				},
				{
					element: "#canvas",
					placement: "top",
					title: l10n.get("TutoCanvasTitle"),
					content: l10n.get("TutoCanvasContent")
				},
				{
					element: "#playGame_lifes",
					placement: "top",
					title: l10n.get("TutoLivesTitle"),
					content: l10n.get("TutoLivesContent")
				},
			]
			);
		}
		tour.init();
		tour.start(true);

	};

	return tutorial;
});
