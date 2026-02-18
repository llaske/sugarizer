define([
	"l10n",
], function (
	l10n,
) {
	var tutorial = {};

	tutorial.start = function () {
		var steps = [
			{
				title: l10n.get("TutorialWelcomeTitle"),
				intro: l10n.get("TutorialWelcomeIntro")
			},
			{
				element: "#network-button",
				position: "bottom",
				title: l10n.get("TutorialNetworkTitle"),
				intro: l10n.get("TutorialNetworkIntro"),
			},
			{
				element: "#model-button",
				position: "bottom",
				title: l10n.get("TutorialModelTitle"),
				intro: l10n.get("TutorialModelIntro")
			},
			{
				element: "#settings-button",
				position: "bottom",
				title: l10n.get("TutorialSettingsTitle"),
				intro: l10n.get("TutorialSettingsIntro"),
			},
			{
				element: "#color-button-fill",
				position: "bottom",
				title: l10n.get("TutorialColorTitle"),
				intro: l10n.get("TutorialColorIntro"),
			},
			{
				element: "#zoom-button",
				position: "bottom",
				title: l10n.get("TutorialZoomTitle"),
				intro: l10n.get("TutorialZoomIntro"),
			},
			{
				element: "#image-button",
				position: "bottom",
				title: l10n.get("TutorialImageTitle"),
				intro: l10n.get("TutorialImageIntro"),
			},
			{
				element: "#orientation-buttons",
				position: "bottom",
				title: l10n.get("TutorialOrientationTitle"),
				intro: l10n.get("TutorialOrientationIntro"),
			},
			{
				element: "#fullscreen-button",
				position: "bottom",
				title: l10n.get("FullScreenTitle"),
				intro: l10n.get("FullScreenIntro"),
			},
		];
		
		steps = steps.filter(function (obj) {
			return !('element' in obj) || ((obj.element).length && document.querySelector(obj.element) && document.querySelector(obj.element).style.display != 'none');
		});
		
		introJs().setOptions({
			tooltipClass: 'customTooltip',
			steps: steps,
			prevLabel: l10n.get("TutorialPrev"),
			nextLabel: l10n.get("TutorialNext"),
			exitOnOverlayClick: false,
			nextToDone: false,
			showBullets: false
		}).start();

	};

	return tutorial;
});