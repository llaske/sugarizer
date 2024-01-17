define(["l10n"], function (l10n) {
    var tutorial = {};

    tutorial.start = function () {
        var steps = [{
                title: l10n.get("TutoExplainTitle"),
                intro: l10n.get("TutoExplainContent")
            },
            {
                element: "#filter-button",
                position: "bottom",
                title: l10n.get("TutoFilterTitle"),
                intro: l10n.get("TutoFilterContent")
            },
            {
                element: "#favorite-button",
                position: "bottom",
                title: l10n.get("TutoFavoriteTitle"),
                intro: l10n.get("TutoFavoriteContent")
            },
            {
                element: "#library-button",
                position: "bottom",
                title: l10n.get("TutoLibraryTitle"),
                intro: l10n.get("TutoLibraryContent")
            },
            {
                element: "#exportvideo-button",
                position: "bottom",
                title: l10n.get("TutoExportvideoTitle"),
                intro: l10n.get("TutoExportvideoContent")
            },
            {
                element: "#search",
                position: "bottom",
                title: l10n.get("TutoSearchTitle"),
                intro: l10n.get("TutoSearchContent")
            },
            {
                element: "#app_item",
                title: l10n.get("TutoVideoTitle"),
                intro: l10n.get("TutoVideoContent")
            }
        ];
        
        steps = steps.filter((step) =>  !('element' in step) || ((step.element).length && document.querySelector(step.element) && document.querySelector(step.element).style.display != 'none'));

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
