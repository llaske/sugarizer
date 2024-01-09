define(["webL10n"], function (l10n) {
	var tutorial = {};

	tutorial.start = function() {
		var steps = [
			{
				title: l10n.get("TutoExplainTitle"),
				intro: l10n.get("TutoExplainContent")
			},
			{
				element: "#add-button",
				position: "bottom",
				title: l10n.get("TutoAddTitle"),
				intro: l10n.get("TutoAddContent")
			},
			{
				element: "#picture-button",
				title: l10n.get("TutoBackgroundTitle"),
				intro: l10n.get("TutoBackgroundContent")
			}
		];
    steps= steps.filter(function (obj) {
        return !('element' in obj) || ((obj.element).length && document.querySelector(obj.element) && document.querySelector(obj.element).style.display != 'none');
    });
		introJs().setOptions({
			tooltipClass: 'customTooltip',
			steps: steps,
			prevLabel:	l10n.get("TutoPrev"),
			nextLabel:  l10n.get("TutoNext"),
			exitOnOverlayClick: false,
			nextToDone: false,
			showBullets: false
		}).start();

	};

	return tutorial;
});