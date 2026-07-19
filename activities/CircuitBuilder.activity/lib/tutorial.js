define(["l10n"], function (l10n) {
    var tutorial = {};

    tutorial.start = function() {
        var steps = [
            {
                title: l10n.get("TutoExplainTitle"),
                intro: l10n.get("TutoExplainContent")
            },
            {
                element: ".start-stop-button",
                position: "bottom",
                title: l10n.get("TutoStartStopTitle"),
                intro: l10n.get("TutoStartStopContent")
            },
            {
                element: ".reset-button",
                position: "bottom",
                title: l10n.get("TutoResetTitle"),
                intro: l10n.get("TutoResetContent")
            },
            {
                element: ".mark-button",
                position: "bottom",
                title: l10n.get("TutoMarkTitle"),
                intro: l10n.get("TutoMarkContent")
            },
            {
                element: ".counter",
                position: "right",
                title: l10n.get("TutoCounterTitle"),
                intro: l10n.get("TutoCounterContent")
            },
            {
                element: "#add-stopwatch",
                position: $('#add-stopwatch').outerHeight() * 2 + $('#add-stopwatch').position().top
                            + $('#canvas').scrollTop() > $("#canvas").height()? "top" : "right",
                title: l10n.get("TutoAddTitle"),
                intro: l10n.get("TutoAddContent")
            },
            {
                element: ".remove",
                position: "left",
                title: l10n.get("TutoRemoveTitle"),
                intro: l10n.get("TutoRemoveContent")
            },
            {
                element: "#export-csv-button",
                position: "bottom",
                title: l10n.get("exportAsCSV"),
                intro: l10n.get("TutoCsvButton")
            },
        ];

        steps = steps.filter(function (obj) {
            return !('element' in obj) || ((obj.element).length && document.querySelector(obj.element) && document.querySelector(obj.element).style.display != 'none');
        });
        introJs().setOptions({
            tooltipClass: 'customTooltip',
            steps: steps,
            prevLabel: l10n.get("TutoPrev"),
            nextLabel: l10n.get("TutoNext"),
            exitOnOverlayClick: false,
            nextToDone: false,
            showBullets: false
        }).start();

    };

    return tutorial;
});
