define(["l10n"], function (l10n) {
    var tutorial = {};

    tutorial.start = function () {
        var steps = [{
                title: l10n.get("TutoExplainTitle"),
                intro: l10n.get("TutoExplainContent")
            },
            {
                element: "#restart-button",
                position: "bottom",
                title: l10n.get("TutoRestartTitle"),
                intro: l10n.get("TutoRestartContent")
            },
            {
                element: "#filter-button",
                position: "bottom",
                title: l10n.get("TutoFilterTitle"),
                intro: l10n.get("TutoFilterContent")
            },
            {
                element: "#level-button",
                position: "bottom",
                title: l10n.get("TutoLevelTitle"),
                intro: l10n.get("TutoLevelContent")
            },
            {
                element: "#time",
                position: "bottom",
                title: l10n.get("TutoTimeTitle"),
                intro: l10n.get("TutoTimeContent")
            },
            {
                element: "#score",
                position: "bottom",
                title: l10n.get("TutoScoreTitle"),
                intro: l10n.get("TutoScoreContent")
            },
            {
                element: "#question",
                position: "bottom",
                title: l10n.get("TutoQuestionTitle"),
                intro: l10n.get("TutoQuestionContent")
            },
            {
                element: "#choices",
                position: "bottom",
                title: l10n.get("TutoChoicesTitle"),
                intro: l10n.get("TutoChoicesContent")
            },
            {
                element: "#network-button",
                position: "bottom",
                title: l10n.get("TutoNetworkTitle"),
                intro: l10n.get("TutoNetworkContent")
            },
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
