define(["webL10n"], function (l10n) {
	var tutorial = {};
	tutorial.start = function() {
		steps = [];
		if(pianoMode) {
			steps = [
				{
					element:"#app_"+currentPianoMode,
					placement: "bottom",
					title: l10n.get("TutoCurrentModeTitle"),
					content: l10n.get("TutoCurrentModeContent")
				},
				{
					element:"#"+document.querySelectorAll(".container")[0].id,
					placement:"top",
					title: l10n.get("TutoPianoTitle"),
					content: l10n.get("TutoPianoContent")
				},
				{
					element: "#instruments-button",
					placement:"bottom",
					title: l10n.get("TutoInstrumentInfoTitle"),
					content: l10n.get("TutoInstrumentInfoContent")
				},
				{
					element: "#simon-button",
					placement:"bottom",
					title: l10n.get("TutoSimonInfoTitle"),
					content: l10n.get("TutoSimonInfoContent")
				}
			]
		} else if (simonMode) {
			steps = [
				{
					element:"#app_"+currentSimonMode,
					placement: "bottom",
					title: l10n.get("TutoCurrentModeTitle"),
					content: l10n.get("TutoSimonModeContent")
				},
				{
					element:"#Simon-board",
					placement:"top",
					title: l10n.get("TutoSimonTitle"),
					content: l10n.get("TutoSimonContent")
				},
				{
					element:"#Red",
					placement:"left",
					title: l10n.get("TutoRedTitle"),
					content: l10n.get("TutoRedContent")
				},
				{
					element:"#Green",
					placement:"right",
					title: l10n.get("TutoGreenTitle"),
					content: l10n.get("TutoGreenContent")
				},
				{
					element:"#Yellow",
					placement:"left",
					title: l10n.get("TutoYellowTitle"),
					content: l10n.get("TutoYellowContent")
				},
				{
					element:"#Blue",
					placement:"right",
					title: l10n.get("TutoBlueTitle"),
					content: l10n.get("TutoBlueContent")
				},
				{
					element: "#SimonStart",
					placement:"bottom",
					title: l10n.get("TutoSimonCentreInfo"),
					content: l10n.get("TutoSimonCentreContent")
				},
				{
					element: "#SimonLevel",
					placement:"bottom",
					title: l10n.get("TutoSimonLevelInfo"),
					content: l10n.get("TutoSimonLevelContent")
				},
				{
					element: "#SimonScroe",
					placement:"bottom",
					title: l10n.get("TutoSimonScoreInfo"),
					content: l10n.get("TutoSimonScoreContent")
				},
				{
					element: "#instruments-button",
					placement:"bottom",
					title: l10n.get("TutoInstrumentInfoTitle"),
					content: l10n.get("TutoInstrumentInfoContent")
				},
				{
					element: "#piano-button",
					placement:"bottom",
					title: l10n.get("TutoPianoInfoTitle"),
					content: l10n.get("TutoPianoInfoContent")
				}
			]
		}else {
			steps = [
				{
					element: "",
					orphan: true,
					placement: "bottom",
					title: l10n.get("TutoExplainTitle"),
					content: l10n.get("TutoExplainContent")
				},
				{
					element: "#app_items",
					placement: "top",
					title: l10n.get("TutoSoundsTitle"),
					content: l10n.get("TutoSoundsContent")
				},
				{
					element: "#app_collections",
					placement: "bottom",
					title: l10n.get("TutoFilterTitle"),
					content: l10n.get("TutoFilterContent")
				},
				{
					element: "#piano-button",
					placement: "bottom",
					title: l10n.get("TutoPianoInfoTitle"),
					content: l10n.get("TutoPianoInfoContent")
				},
				{
					element: "#simon-button",
					placement:"bottom",
					title: l10n.get("TutoSimonInfoTitle"),
					content: l10n.get("TutoSimonInfoContent")
				}
			]
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
			storage: false,
			backdrop: true,
			steps: steps
		});
		tour.init();
		tour.start(true);

	};

	return tutorial;
});
