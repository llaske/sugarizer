define(["l10n"], function (l10n) {
	var tutorial = {};
	tutorial.start = function () {
		var steps = [
			{
				title: l10n.get("TutoExplainTitle"),
				intro: l10n.get("TutoExplainContent")
			},
			{
				element: "#qr-code",
				position: "right",
				title: l10n.get("TutoQRTitle"),
				intro: l10n.get("TutoQRContent")
			},
			{
				element: "#user-text",
				position: "bottom",
				title: l10n.get("TutoInputTitle"),
				intro: l10n.get("TutoInputContent")
			},
			{
				element: "#generate-button",
				position: "left",
				title: l10n.get("TutoGenerateTitle"),
				intro: l10n.get("TutoGenerateContent")
			},
			{
				element: "#qrtextdropdown",
				position: "bottom",
				title: l10n.get("TutoListTitle"),
				intro: l10n.get("TutoListContent")
			},
			{
				element: "#photo-button",
				position: "bottom",
				title: l10n.get("TutoPhotoTitle"),
				intro: l10n.get("TutoPhotoContent")
			},
			{
				element: "#png-button",
				position: "bottom",
				title: l10n.get("TutoPNGTitle"),
				intro: l10n.get("TutoPNGContent")
			}
		];
		steps = steps.filter((obj) => !('element' in obj) || ((obj.element).length && document.querySelector(obj.element) && document.querySelector(obj.element).style.display != 'none'));
		introJs().setOptions({
			tooltipClass: 'customTooltip',
			steps: steps,
			prevLabel: l10n.get("TutoPrev"),
			nextLabel: l10n.get("TutoNext"),
			exitOnOverlayClick: false,
			nextToDone: false,
			showBullets: false
		}).start();
	}
	return tutorial;
});
