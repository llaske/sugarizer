define(["l10n"], function (l10n) {
	var tutorial = {};

	tutorial.start = function () {
		var steps = [{
			title: l10n.get("TutoExplainTitle"),
			intro: l10n.get("TutoExplainContent")
		},
		{
			element: "#photo-button",
			position: "bottom",
			title: l10n.get("TutoPhotoTitle"),
			intro: l10n.get("TutoPhotoContent")
		},
		{
			element: "#video-button",
			position: "bottom",
			title: l10n.get("TutoVideoTitle"),
			intro: l10n.get("TutoVideoContent")
		},
		{
			element: "#audio-button",
			position: "bottom",
			title: l10n.get("TutoAudioTitle"),
			intro: l10n.get("TutoAudioContent")
		}
		];

		steps = steps.filter(
			(obj) =>
			  !("element" in obj) ||
			  (obj.element.length &&
				document.querySelector(obj.element) &&
				document.querySelector(obj.element).style.display != "none")
		  );
		  introJs()
			.setOptions({
			  tooltipClass: "customTooltip",
			  steps: steps,
			  prevLabel: l10n.get("TutoPrev"),
			  nextLabel: l10n.get("TutoNext"),
			  exitOnOverlayClick: false,
			  nextToDone: false,
			  showBullets: false,
			})
			.start();

	};

	return tutorial;
});