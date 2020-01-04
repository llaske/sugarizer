define(["webL10n"], function(l10n) {
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
					iconElement.style.visibility = "visible";
					iconElement.style.backgroundImage = "url('" + icon.directory + "/" + icon.icon + "')";
					iconElement.style.backgroundSize = icon.size + "px";
					iconElement.style.width = icon.size + "px";
					iconElement.style.height = icon.size + "px";
					iconElement.style.marginTop = "15px";
					iconElement.style.marginLeft = "5px";
					if (icon.color) {
						iconLib.colorize(iconElement, icon.color, function() {});
					}
				}
			},
			onEnd: function() {
				tutorial.elements = [];
				tutorial.icons = null;
			}
		});
		var currentView = Abcd.context.object;
		if (currentView == null) {
			tour.addSteps([
				{
					element: "",
					orphan: true,
					placement: "bottom",
					title: l10n.get("TutoExplainTitle"),
					content: l10n.get("TutoExplainContent")
				},
				{
					element: "#app_instrument",
					placement: "bottom",
					title: l10n.get("TutoInstrumentTitle"),
					content: l10n.get("TutoInstrumentContent")
				},
				{
					element: "#app_credit",
					placement: "left",
					title: l10n.get("TutoInfoTitle"),
					content: l10n.get("TutoInfoContent")
				},
				{
					element: "#app_learn",
					placement: "top",
					title: l10n.get("TutoLearnButtonTitle"),
					content: l10n.get("TutoLearnButtonContent")
				},
				{
					element: "#app_play",
					placement: "top",
					title: l10n.get("TutoPlayButtonTitle"),
					content: l10n.get("TutoPlayButtonContent")
				},
				{
					element: "#app_build",
					placement: "top",
					title: l10n.get("TutoBuildButtonTitle"),
					content: l10n.get("TutoBuildButtonContent")
				}
			]);
		} else if (Abcd.context.object.id == "learn") {
			if(document.getElementById("png-button").style.visibility=="visible"){
				tour.addSteps([
					{
						element: "",
						orphan: true,
						placement: "bottom",
						title: l10n.get("TutoLearnExplainTitle"),
						content: l10n.get("TutoLearnExplainContent")
					},
					{
						element: "#png-button",
						placement: "bottom",
						title: l10n.get("TutoPngTitle"),
						content: l10n.get("TutoPngContent")
					},
					{
						element: "#sound-button",
						placement: "bottom",
						title: l10n.get("TutoSoundTitle"),
						content: l10n.get("TutoSoundContent")
					},
					{
						element: "#learn_home_home",
						placement: "bottom",
						title: l10n.get("TutoHomeTitle"),
						content: l10n.get("TutoHomeContent")
					},
					{
						element: "#learn_back",
						placement: "bottom",
						title: l10n.get("TutoBackTitle"),
						content: l10n.get("TutoBackContent")
					},
					{
						element: "#learn_prev",
						placement: "bottom",
						title: l10n.get("TutoPrevPageTitle"),
						content: l10n.get("TutoPrevPageContent")
					},
					{
						element: "#learn_startSlideshow",
						placement: "bottom",
						title: l10n.get("TutoListenTitle"),
						content: l10n.get("TutoListenContent")
					},
					{
						element: "#learn_stopSlideshow",
						placement: "bottom",
						title: l10n.get("TutoPauseTitle"),
						content: l10n.get("TutoPauseContent")
					},
					{
						element: "#learn_next",
						placement: "bottom",
						title: l10n.get("TutoNextPageTitle"),
						content: l10n.get("TutoNextPageContent")
					},
					{
						element: ".box-4-theme",
						placement: "top",
						title: l10n.get("TutoLearnBoxThemeTitle"),
						content: l10n.get("TutoLearnBoxThemeContent")
					},
					{
						element: ".box-4-collection",
						placement: "top",
						title: l10n.get("TutoLearnBoxCollectionTitle"),
						content: l10n.get("TutoLearnBoxCollectionContent")
					},
					{
						element: ".box-4-entry",
						placement: "top",
						title: l10n.get("TutoLearnBoxEntryTitle"),
						content: l10n.get("TutoLearnBoxEntryContent")
					},
					{
						element: "#learn_caseButton",
						placement: "bottom",
						title: l10n.get("TutoFontTitle"),
						content: l10n.get("TutoFontContent")
					},
					{
						element: "#learn_languageButton",
						placement: "left",
						title: l10n.get("TutoLangTitle"),
						content: l10n.get("TutoLangContent")
					}
				]);
			}else{
				tour.addSteps([
					{
						element: "",
						orphan: true,
						placement: "bottom",
						title: l10n.get("TutoLearnExplainTitle"),
						content: l10n.get("TutoLearnExplainContent")
					},
					{
						element: "#learn_home_home",
						placement: "bottom",
						title: l10n.get("TutoHomeTitle"),
						content: l10n.get("TutoHomeContent")
					},
					{
						element: "#learn_back",
						placement: "bottom",
						title: l10n.get("TutoBackTitle"),
						content: l10n.get("TutoBackContent")
					},
					{
						element: "#learn_prev",
						placement: "bottom",
						title: l10n.get("TutoPrevPageTitle"),
						content: l10n.get("TutoPrevPageContent")
					},
					{
						element: "#learn_startSlideshow",
						placement: "bottom",
						title: l10n.get("TutoListenTitle"),
						content: l10n.get("TutoListenContent")
					},
					{
						element: "#learn_stopSlideshow",
						placement: "bottom",
						title: l10n.get("TutoPauseTitle"),
						content: l10n.get("TutoPauseContent")
					},
					{
						element: "#learn_next",
						placement: "bottom",
						title: l10n.get("TutoNextPageTitle"),
						content: l10n.get("TutoNextPageContent")
					},
					{
						element: ".box-4-theme",
						placement: "top",
						title: l10n.get("TutoLearnBoxThemeTitle"),
						content: l10n.get("TutoLearnBoxThemeContent")
					},
					{
						element: ".box-4-collection",
						placement: "top",
						title: l10n.get("TutoLearnBoxCollectionTitle"),
						content: l10n.get("TutoLearnBoxCollectionContent")
					},
					{
						element: ".box-4-entry",
						placement: "top",
						title: l10n.get("TutoLearnBoxEntryTitle"),
						content: l10n.get("TutoLearnBoxEntryContent")
					},
					{
						element: "#learn_caseButton",
						placement: "bottom",
						title: l10n.get("TutoFontTitle"),
						content: l10n.get("TutoFontContent")
					},
					{
						element: "#learn_languageButton",
						placement: "left",
						title: l10n.get("TutoLangTitle"),
						content: l10n.get("TutoLangContent")
					}
				]);
			}
		} else if (Abcd.context.object.id == "play") {
			tour.addSteps([
				{
					element: "",
					orphan: true,
					placement: "bottom",
					title: l10n.get("TutoPlayExplainTitle"),
					content: l10n.get("TutoPlayExplainContent")
				},
				{
					element: "#play_home_home",
					placement: "bottom",
					title: l10n.get("TutoHomeTitle"),
					content: l10n.get("TutoHomeContent")
				},
				{
					element: "#play_back",
					placement: "bottom",
					title: l10n.get("TutoBackTitle"),
					content: l10n.get("TutoBackContent")
				},
				{
					element: "#play_filter",
					placement: "bottom",
					title: l10n.get("TutoLearnBoxThemeTitle"),
					content: l10n.get("TutoLearnBoxThemeContent")
				},
				{
					element: "#play_playTypeButton",
					placement: "bottom",
					title: l10n.get("TutoPlay1Title"),
					content: l10n.get("TutoPlay1Content")
				},
				{
					element: "#play_playTypeButton2",
					placement: "bottom",
					title: l10n.get("TutoPlay2Title"),
					content: l10n.get("TutoPlay2Content")
				},
				{
					element: "#play_playTypeButton3",
					placement: "bottom",
					title: l10n.get("TutoPlay3Title"),
					content: l10n.get("TutoPlay3Content")
				},
				{
					element: "#play_playTypeButton4",
					placement: "top",
					title: l10n.get("TutoPlay4Title"),
					content: l10n.get("TutoPlay4Content")
				},
				{
					element: "#play_playTypeButton5",
					placement: "top",
					title: l10n.get("TutoPlay5Title"),
					content: l10n.get("TutoPlay5Content")
				},
				{
					element: "#play_playTypeButton6",
					placement: "top",
					title: l10n.get("TutoPlay6Title"),
					content: l10n.get("TutoPlay6Content")
				},
				{
					element: ".entryPlayFrom",
					placement: "bottom",
					title: l10n.get("TutoPlayEntryBoxTitle"),
					content: l10n.get("TutoPlayEntryBoxContent")
				},
				{
					element: "#play_check",
					placement: "left",
					title: l10n.get("TutoCheckTitle"),
					content: l10n.get("TutoCheckContent")
				},
				{
					element: "#play_caseButton",
					placement: "bottom",
					title: l10n.get("TutoFontTitle"),
					content: l10n.get("TutoFontContent")
				},
				{
					element: "#play_languageButton",
					placement: "left",
					title: l10n.get("TutoLangTitle"),
					content: l10n.get("TutoLangContent")
				}
			]);
		}
		tour.init();
		tour.start(true);
	};

	return tutorial;
});
