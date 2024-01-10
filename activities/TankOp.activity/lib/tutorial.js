define(["l10n"], function (l10n) {
    var tutorial = {};

    tutorial.start = function (play) {
        var steps;
        if (!play) {
            steps = [
                {
                    title: l10n.get("TutoExplainTitle"),
                    intro: l10n.get("TutoExplainContent")
                },
                {
                    element: "#app_control2",
                    position: "top",
                    title: l10n.get("TutoChangeMissionTitle"),
                    intro: l10n.get("TutoChangeMissionContent")
                },
                {
                    element: "#app_image2",
                    position: "top",
                    title: l10n.get("TutoStartActivityTitle"),
                    intro: l10n.get("TutoStartActivityContent")
                },
                {
                    element: "#app_control7",
                    position: "top",
                    title: l10n.get("TutoCompletedMissionsTitle"),
                    intro: l10n.get("TutoCompletedMissionsContent")
                },
                {
                    element: "#fullscreen-button",
                    position: "bottom",
                    title: l10n.get("TutoFullScreenButtonTitle"),
                    intro: l10n.get("TutoFullScreenButtonContent")
                },
                {
                    element: "#stop-button",
                    position: "left",
                    title: l10n.get("TutoStopButtonTitle"),
                    intro: l10n.get("TutoStopButtonContent")
                },
                {
                    element: "#app_image3",
                    position: "left",
                    title: l10n.get("TutoCreditsTitle"),
                    intro: l10n.get("TutoCreditsContent")
                }
            ];
        }
        else {
            steps = [
                {
                    title: l10n.get("TutoPlayExplainTitle"),
                    intro: l10n.get("TutoPlayExplainContent")
                },
                {
                    element: "canvas",
                    position: "right",
                    title: l10n.get("TutoGameTitle"),
                    intro: l10n.get("TutoGameContent")
                },
                {
                    element: "#play_keyboard",
                    position: "left",
                    title: l10n.get("TutoPlayControlsTitle"),
                    intro: l10n.get("TutoPlayControlsContent")
                },
                {
                    element: "#play_image12",
                    position: "top",
                    title: l10n.get("TutoPlayFire"),
                    intro: l10n.get("TutoPlayFireContent")
                },
                {
                    element: "#play_wave",
                    position: "left",
                    title: l10n.get("TutoWaveTitle"),
                    intro: l10n.get("TutoWaveContent")
                },
                {
                    element: "#play_score",
                    position: "left",
                    title: l10n.get("TutoScoreTitle"),
                    intro: l10n.get("TutoScoreContent")
                },
                {
                    element: "#play_image",
                    position: "top",
                    title: l10n.get("TutoPlayHomeTitle"),
                    intro: l10n.get("TutoPlayHomeContent")
                }
            ];
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