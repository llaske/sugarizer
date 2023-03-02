define(["webL10n"], function (l10n) {
    var tutorial = {};
    tutorial.start = function () {
        steps = [];
        if (pianoMode) {
            steps = [
                {
                    element: "#app_" + currentPianoMode,
                    position: "bottom",
                    title: l10n.get("TutoCurrentModeTitle"),
                    intro: l10n.get("TutoCurrentModeContent"),
                },
                {
                    element:
                        "#" + document.querySelectorAll(".container")[0].id,
                    position: "top",
                    title: l10n.get("TutoPianoTitle"),
                    intro: l10n.get("TutoPianoContent"),
                },
                {
                    element: "#instruments-button",
                    position: "bottom",
                    title: l10n.get("TutoInstrumentInfoTitle"),
                    intro: l10n.get("TutoInstrumentInfoContent"),
                },
                {
                    element: "#simon-button",
                    position: "bottom",
                    title: l10n.get("TutoSimonInfoTitle"),
                    intro: l10n.get("TutoSimonInfoContent"),
                },
            ];
        } else if (simonMode) {
            steps = [
                {
                    element: "#app_" + currentSimonMode,
                    position: "bottom",
                    title: l10n.get("TutoCurrentModeTitle"),
                    intro: l10n.get("TutoSimonModeContent"),
                },
                {
                    element: "#Simon-board",
                    position: "top",
                    title: l10n.get("TutoSimonTitle"),
                    intro: l10n.get("TutoSimonContent"),
                },
                {
                    element: "#Red",
                    position: "left",
                    title: l10n.get("TutoRedTitle"),
                    intro: l10n.get("TutoRedContent"),
                },
                {
                    element: "#Green",
                    position: "right",
                    title: l10n.get("TutoGreenTitle"),
                    intro: l10n.get("TutoGreenContent"),
                },
                {
                    element: "#Yellow",
                    position: "left",
                    title: l10n.get("TutoYellowTitle"),
                    intro: l10n.get("TutoYellowContent"),
                },
                {
                    element: "#Blue",
                    position: "right",
                    title: l10n.get("TutoBlueTitle"),
                    intro: l10n.get("TutoBlueContent"),
                },
                {
                    element: "#SimonStart",
                    position: "bottom",
                    title: l10n.get("TutoSimonCentreInfo"),
                    intro: l10n.get("TutoSimonCentreContent"),
                },
                {
                    element: "#SimonLevel",
                    position: "bottom",
                    title: l10n.get("TutoSimonLevelInfo"),
                    intro: l10n.get("TutoSimonLevelContent"),
                },
                {
                    element: "#SimonScroe",
                    position: "bottom",
                    title: l10n.get("TutoSimonScoreInfo"),
                    intro: l10n.get("TutoSimonScoreContent"),
                },
                {
                    element: "#instruments-button",
                    position: "bottom",
                    title: l10n.get("TutoInstrumentInfoTitle"),
                    intro: l10n.get("TutoInstrumentInfoContent"),
                },
                {
                    element: "#piano-button",
                    position: "bottom",
                    title: l10n.get("TutoPianoInfoTitle"),
                    intro: l10n.get("TutoPianoInfoContent"),
                },
            ];
        } else {
            steps = [
                {
                    position: "bottom",
                    title: l10n.get("TutoExplainTitle"),
                    intro: l10n.get("TutoExplainContent"),
                },
                {
                    element: "#app_items",
                    position: "top",
                    title: l10n.get("TutoSoundsTitle"),
                    intro: l10n.get("TutoSoundsContent"),
                },
                {
                    element: "#app_collections",
                    position: "bottom",
                    title: l10n.get("TutoFilterTitle"),
                    intro: l10n.get("TutoFilterContent"),
                },
                {
                    element: "#piano-button",
                    position: "bottom",
                    title: l10n.get("TutoPianoInfoTitle"),
                    intro: l10n.get("TutoPianoInfoContent"),
                },
                {
                    element: "#simon-button",
                    position: "bottom",
                    title: l10n.get("TutoSimonInfoTitle"),
                    intro: l10n.get("TutoSimonInfoContent"),
                },
            ];
        }

        steps = steps.filter(
            (step) =>
                !("element" in step) ||
                (step.element.length &&
                    document.querySelector(step.element) &&
                    document.querySelector(step.element).style.display !=
                        "none" &&
                    document.querySelector(step.element).getBoundingClientRect()
                        .y != 0)
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
