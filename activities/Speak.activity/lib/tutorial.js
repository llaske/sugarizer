define(["l10n"], function (l10n) {
	var tutorial = {};

	tutorial.start = function() {
		var steps = [
			{
				title: l10n.get("TutoExplainTitle"),
				intro: l10n.get("TutoExplainContent")
			},
			{
				element: "#gamemode1-button",
				position: "bottom",
				title: l10n.get("TutoReadTitle"),
				intro: l10n.get("TutoReadContent")
			},
			{
				element: "#gamemode2-button",
				position: "bottom",
				title: l10n.get("TutoQuestionTitle"),
				intro: l10n.get("TutoQuestionContent")
			},
			{
				element: "#gamemode3-button",
				position: "bottom",
				title: l10n.get("TutoVoiceTitle"),
				intro: l10n.get("TutoVoiceContent")
			},
			{
				element: "#language-button",
				position: "bottom",
				title: l10n.get("TutoLanguageTitle"),
				intro: l10n.get("TutoLanguageContent")
			},
			{
				element: "#speech-button",
				position: "bottom",
				title: l10n.get("TutoSpeechTitle"),
				intro: l10n.get("TutoSpeechContent")
			},
			{
				element: "#face-button",
				position: "bottom",
				title: l10n.get("TutoFaceTitle"),
				intro: l10n.get("TutoFaceContent")
			},
			{
				element: "#userText",
				position: "bottom",
				title: l10n.get("TutoTextTitle"),
				intro: l10n.get("TutoTextContent")
			},
			{
				element: "#combo-box",
				position: "bottom",
				title: l10n.get("TutoHistoryTitle"),
				intro: l10n.get("TutoHistoryContent")
			},
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
