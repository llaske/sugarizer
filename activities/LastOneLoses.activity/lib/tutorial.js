define(["l10n"], function(l10n) {
	var tutorial = {};

	tutorial.start = function() {
		var steps = [
			{
				title: l10n.get("TutoExplainTitle"),
				intro: l10n.get("TutoExplainContent")
			},
			{
				element: "#lOLGameApp_box",
				position: "top",
				title: l10n.get("TutoBoardTitle"),
				intro: l10n.get("TutoBoardContent")
			},
			{
				element: "#new-game-button",
				position: "bottom",
				title: l10n.get("TutoNewgameTitle"),
				intro: l10n.get("TutoNewgameContent")
			},
			{
				element: "#level-easy-button",
				position: "bottom",
				title: l10n.get("TutoEasyTitle"),
				intro: l10n.get("TutoEasyContent")
			},
			{
				element: "#level-medium-button",
				position: "bottom",
				title: l10n.get("TutoMediumTitle"),
				intro: l10n.get("TutoMediumContent")
			},
			{
				element: "#level-hard-button",
				position: "bottom",
				title: l10n.get("TutoHardTitle"),
				intro: l10n.get("TutoHardContent")
			},
			{
				element: "#switch-player-button",
				position: "bottom",
				title: l10n.get("TutoSwitchTitle"),
				intro: l10n.get("TutoSwitchContent")
			},
			{
				element: "#network-button",
				position: "bottom",
				title: l10n.get("TutoNetworkTitle"),
				intro: l10n.get("TutoNetworkContent")
			}
		];
		steps = steps.filter((obj) =>  !('element' in obj) || ((obj.element).length && document.querySelector(obj.element) && document.querySelector(obj.element).style.display != 'none'));
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
