define(["l10n"], function (l10n) {
    var tutorial = {};

    tutorial.start = function() {
        var steps = [
            {
                title: l10n.get("TutoExplainTitle"),
                intro: l10n.get("TutoExplainContent")
            },
            {
                element: "#mainCanvas",
                position: "top",
                title: l10n.get("HowToPlayTitle"),
                intro: l10n.get("HowToPlayContent")
            },
            {
                element: "#new-game",
                position: "bottom",
                title: l10n.get("NewGame"),
                intro: l10n.get("NewGameContent")
            },
            {
                element: "#replay",
                position: "bottom",
                title: l10n.get("Replay"),
                intro: l10n.get("ReplayContent")
            },
            {
                element: "#undo",
                position: "bottom",
                title: l10n.get("Undo"),
                intro: l10n.get("UndoContent")
            },
            {
                element: "#redo",
                position: "bottom",
                title: l10n.get("Redo"),
                intro: l10n.get("RedoContent")
            },
            {
                element: "#easy",
                position: "bottom",
                title: l10n.get("Easy"),
                intro: l10n.get("EasyContent")
            },
            {
                element: "#medium",
                position: "bottom",
                title: l10n.get("Medium"),
                intro: l10n.get("MediumContent")
            },
            {
                element: "#hard",
                position: "bottom",
                title: l10n.get("Hard"),
                intro: l10n.get("HardContent")
            },
        ];
        if(window.innerHeight >= 500){
            steps.push({
                title: l10n.get("KeyboardKeysTitle"),
                intro: l10n.get("KeyboardKeysContent")
            });
        }
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