define([
	"l10n"
], function (
	l10n
) {
	var tutorial = {};

	tutorial.start = function () {
		var steps = [
			{
				title: l10n.get("TutorialTitle"),
				intro: l10n.get("TutorialIntro")
			},
			{
				element: "#network-button",
				position: "bottom",
				title: l10n.get("NetworkTitle"),
				intro: l10n.get("NetworkIntro"),
			},
			{
				element: "#play-pause-button",
				position: "bottom",
				title: l10n.get("PlayPauseTitle"),
				intro: l10n.get("PlayPauseIntro"),
			},
			{
				element: "#speed-button",
				position: "bottom",
				title: l10n.get("SpeedTitle"),
				intro: l10n.get("SpeedIntro"),
			},
			{
				element: "#zoom-button",
				position: "bottom",
				title: l10n.get("ZoomTitle"),
				intro: l10n.get("ZoomIntro"),
			},
			{
				element: "#minus-button",
				position: "bottom",
				title: l10n.get("RemoveTitle"),
				intro: l10n.get("RemoveIntro"),
			},
			{
				element: "#addStickman-button",
				position: "bottom",
				title: l10n.get("AddStickmanTitle"),
				intro: l10n.get("AddStickmanIntro"),
			},
			{
				element: "#stickman-canvas",
				position: "top",
				title: l10n.get("JointColorsTitle"),
				intro: l10n.get("JointColorsIntro"),
			},
			{
				element: "#template-button",
				position: "bottom",
				title: l10n.get("TemplatesTitle"),
				intro: l10n.get("TemplatesIntro"),
			},
			{
				element: "#importJournal-button",
				position: "bottom",
				title: l10n.get("ImportFromJournalTitle"),
				intro: l10n.get("ImportFromJournalIntro"),
			},
			{
				element: "#import-button",
				position: "bottom",
				title: l10n.get("ImportTitle"),
				intro: l10n.get("ImportIntro"),
			},
			{
				element: "#export-button",
				position: "bottom",
				title: l10n.get("ExportTitle"),
				intro: l10n.get("ExportIntro"),
			},
			{
				element: "#timeline",
				position: "top",
				title: l10n.get("TimelineTitle"),
				intro: l10n.get("TimelineIntro"),
			},
			{
				element: "#add-button",
				position: "top",
				title: l10n.get("AddFrameTitle"),
				intro: l10n.get("AddFrameIntro"),
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
			prevLabel: l10n.get("Previous"),
			nextLabel: l10n.get("Next"),
			exitOnOverlayClick: false,
			nextToDone: false,
			showBullets: false
		}).start();

	};

	return tutorial;
});