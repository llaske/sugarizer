define(["l10n"], function (l10n) {
	var tutorial = {};

	tutorial.start = function () {
		var steps = [];
		var currentView = Abcd.context.object;
		if (currentView == null) {
			steps.push(
				{
					position: "bottom",
					title: l10n.get("TutoExplainTitle"),
					intro: l10n.get("TutoExplainContent"),
				},
				{
					element: "#app_learn",
					position: "top",
					title: l10n.get("TutoLearnButtonTitle"),
					intro: l10n.get("TutoLearnButtonContent"),
				},
				{
					element: "#app_play",
					position: "top",
					title: l10n.get("TutoPlayButtonTitle"),
					intro: l10n.get("TutoPlayButtonContent"),
				},
				{
					element: "#app_build",
					position: "top",
					title: l10n.get("TutoBuildButtonTitle"),
					intro: l10n.get("TutoBuildButtonContent"),
				},
				{
					element: "#app_instrument",
					position: "bottom",
					title: l10n.get("TutoInstrumentTitle"),
					intro: l10n.get("TutoInstrumentContent"),
				},
				{
					element: "#app_credit",
					position: "left",
					title: l10n.get("TutoInfoTitle"),
					intro: l10n.get("TutoInfoContent"),
				},
			);
		} else if (Abcd.context.object.id.startsWith("learn")) {
			steps.push(
				{
					position: "bottom",
					title: l10n.get("TutoLearnExplainTitle"),
					intro: l10n.get("TutoLearnExplainContent"),
				},
				{
					element: ".box-4-theme",
					position: "top",
					title: l10n.get("TutoLearnBoxThemeTitle"),
					intro: l10n.get("TutoLearnBoxThemeContent"),
				},
				{
					element: ".box-4-collection",
					position: "top",
					title: l10n.get("TutoLearnBoxCollectionTitle"),
					intro: l10n.get("TutoLearnBoxCollectionContent"),
				},
				{
					element: ".box-4-entry",
					position: "top",
					title: l10n.get("TutoLearnBoxEntryTitle"),
					intro: l10n.get("TutoLearnBoxEntryContent"),
				},
				{
					element: "#learn_caseButton",
					position: "bottom",
					title: l10n.get("TutoFontTitle"),
					intro: l10n.get("TutoFontContent"),
				},
				{
					element: "#learn_languageButton",
					position: "left",
					title: l10n.get("TutoLangTitle"),
					intro: l10n.get("TutoLangContent"),
				},
				{
					element: "#learn_home_home",
					position: "bottom",
					title: l10n.get("TutoHomeTitle"),
					intro: l10n.get("TutoHomeContent"),
				},
				{
					element: "#learn_back",
					position: "bottom",
					title: l10n.get("TutoBackTitle"),
					intro: l10n.get("TutoBackContent"),
				},
				{
					element: "#learn_prev",
					position: "bottom",
					title: l10n.get("TutoPrevPageTitle"),
					intro: l10n.get("TutoPrevPageContent"),
				},
				{
					element: "#learn_startSlideshow",
					position: "bottom",
					title: l10n.get("TutoListenTitle"),
					intro: l10n.get("TutoListenContent"),
				},
				{
					element: "#learn_stopSlideshow",
					position: "bottom",
					title: l10n.get("TutoPauseTitle"),
					intro: l10n.get("TutoPauseContent"),
				},
				{
					element: "#learn_next",
					position: "bottom",
					title: l10n.get("TutoNextPageTitle"),
					intro: l10n.get("TutoNextPageContent"),
				},
			);
			if (
				document.getElementById("png-button").style.visibility ==
				"visible"
			) {
				steps.push(
					{
						element: "#png-button",
						position: "bottom",
						title: l10n.get("TutoPngTitle"),
						intro: l10n.get("TutoPngContent"),
					},
					{
						element: "#sound-button",
						position: "bottom",
						title: l10n.get("TutoSoundTitle"),
						intro: l10n.get("TutoSoundContent"),
					},
				);
			}
		} else if (Abcd.context.object.id.startsWith("play")) {
			steps.push(
				{
					position: "bottom",
					title: l10n.get("TutoPlayExplainTitle"),
					intro: l10n.get("TutoPlayExplainContent"),
				},
				{
					element: "#play_playTypeButton",
					position: "bottom",
					title: l10n.get("TutoPlay1Title"),
					intro: l10n.get("TutoPlay1Content"),
				},
				{
					element: "#play_playTypeButton2",
					position: "bottom",
					title: l10n.get("TutoPlay2Title"),
					intro: l10n.get("TutoPlay2Content"),
				},
				{
					element: "#play_playTypeButton3",
					position: "bottom",
					title: l10n.get("TutoPlay3Title"),
					intro: l10n.get("TutoPlay3Content"),
				},
				{
					element: "#play_playTypeButton4",
					position: "top",
					title: l10n.get("TutoPlay4Title"),
					intro: l10n.get("TutoPlay4Content"),
				},
				{
					element: "#play_playTypeButton5",
					position: "top",
					title: l10n.get("TutoPlay5Title"),
					intro: l10n.get("TutoPlay5Content"),
				},
				{
					element: "#play_playTypeButton6",
					position: "top",
					title: l10n.get("TutoPlay6Title"),
					intro: l10n.get("TutoPlay6Content"),
				},
				{
					element: ".entryPlayFrom",
					position: "bottom",
					title: l10n.get("TutoPlayEntryBoxTitle"),
					intro: l10n.get("TutoPlayEntryBoxContent"),
				},
				{
					element: "#play_check",
					position: "left",
					title: l10n.get("TutoCheckTitle"),
					intro: l10n.get("TutoCheckContent"),
				},
				{
					element: "#play_caseButton",
					position: "bottom",
					title: l10n.get("TutoFontTitle"),
					intro: l10n.get("TutoFontContent"),
				},
				{
					element: "#play_languageButton",
					position: "left",
					title: l10n.get("TutoLangTitle"),
					intro: l10n.get("TutoLangContent"),
				},
				{
					element: "#play_home_home",
					position: "bottom",
					title: l10n.get("TutoHomeTitle"),
					intro: l10n.get("TutoHomeContent"),
				},
				{
					element: "#play_back",
					position: "bottom",
					title: l10n.get("TutoBackTitle"),
					intro: l10n.get("TutoBackContent"),
				},
				{
					element: "#play_filter",
					position: "bottom",
					title: l10n.get("TutoLearnBoxThemeTitle"),
					intro: l10n.get("TutoLearnBoxThemeContent"),
				},
			);
		}
		steps = steps.filter((obj) =>  !('element' in obj) || (obj.element.length && document.querySelector(obj.element) && document.querySelector(obj.element).style.display != "none" && document.querySelector(obj.element).offsetParent));
		var isSingleStepTut = steps.length === 1;
			if(isSingleStepTut)	steps.push({});

		introJs().setOptions({
			tooltipClass: 'customTooltip',
			steps: steps,
			prevLabel: l10n.get("TutoPrev"),
			nextLabel: l10n.get("TutoNext"),
			exitOnOverlayClick: false,
			showBullets: false,
			disableInteraction: true,
			nextToDone: false,
		}).onafterchange(() => {
			isSingleStepTut && document.querySelector(".introjs-nextbutton") && document.querySelector(".introjs-nextbutton").classList.add("introjs-disabled");
			var btn = document.querySelector(".introjs-nextbutton");
			if (isSingleStepTut && btn) {
				btn.classList.add("introjs-disabled");
				btn.style.pointerEvents = "none";
				document.querySelector(".introjs-tooltipbuttons").style.cursor = "auto";
			}
		}).start();
	};

	return tutorial;
});
