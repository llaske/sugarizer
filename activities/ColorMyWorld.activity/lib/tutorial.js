define(["webL10n"], function (webL10n) {
	var tutorial = {};

	tutorial.start = function() {
		console.log("Language")
		console.log(webL10n.language.code)
		var steps = [
			{
				title: document.webL10n.get("TutoExplainTitle"),
				intro: document.webL10n.get("TutoExplainContent")
			},
			{
				element: "#mode-button",
				position: "bottom",
				title: document.webL10n.get("TutoModeTitle"),
				intro: document.webL10n.get("TutoModeContent")
			},
			{
				element: "#color-button",
				position: "bottom",
				title: document.webL10n.get("TutoColorTitle"),
				intro: document.webL10n.get("TutoColorContent")
			},
			{
				element: "#run-button",
				title: document.webL10n.get("TutoRunTitle"),
				intro: document.webL10n.get("TutoRunContent")
			}
		];
		
		steps= steps.filter(function (obj) {
			return !('element' in obj) || ((obj.element).length && document.querySelector(obj.element) && document.querySelector(obj.element).style.display != 'none');
	    });

		introJs().setOptions({
			tooltipClass: 'customTooltip',
			steps: steps,
			prevLabel: document.webL10n.get("TutoPrev"),
			nextLabel: document.webL10n.get("TutoNext"),
			exitOnOverlayClick: false,
			nextToDone: false,
			showBullets: false
		}).start();

	};

	return tutorial;
});