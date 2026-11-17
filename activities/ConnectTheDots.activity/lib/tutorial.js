define(["l10n"], function (l10n) {
  var tutorial = {};

  tutorial.start = function () {
    var steps = [];

    // Detect current mode and screen based on visible toolbar buttons and DOM state
    var drawBtn = document.getElementById("draw-button");
    var timerBtn = document.getElementById("timer-button");
    var playBtn = document.getElementById("play-button");
    var gallery = document.getElementById("library-gallery");
    var viewBtn = document.getElementById("view-button");
    var createCatBtn = document.getElementById("create-category-button");
    var createBackBtn = document.getElementById("create-figure-back-button");
    var playBackBtn = document.getElementById("play-figure-back-button");

    var isDrawMode = drawBtn && drawBtn.style.display !== "none";
    var isGameMode = playBtn && playBtn.style.display !== "none";
    var isGalleryVisible = gallery && gallery.style.display !== "none";
    var isSettingView = createCatBtn && createCatBtn.style.display !== "none";
    var isCreatingFigure =
      createBackBtn && createBackBtn.style.display !== "none";
    var isPlayingFigure = playBackBtn && playBackBtn.style.display !== "none";

    if (isDrawMode) {
      // Draw Mode tutorial
      steps = [
        {
          title: l10n.get("TutoExplainTitle"),
          intro: l10n.get("TutoExplainContent"),
        },
        {
          title: l10n.get("TutoDrawModeTitle"),
          intro: l10n.get("TutoDrawModeContent"),
        },
        {
          element: "#canvas",
          position: "top",
          title: l10n.get("TutoDrawCanvasTitle"),
          intro: l10n.get("TutoDrawCanvasContent"),
        },
        {
          element: "#network-button",
          position: "bottom",
          title: l10n.get("TutoNetworkTitle"),
          intro: l10n.get("TutoNetworkContent"),
        },
        {
          element: "#mode-button",
          position: "bottom",
          title: l10n.get("TutoModeButtonTitle"),
          intro: l10n.get("TutoModeButtonContent"),
        },
        {
          element: "#colors-button-fill",
          position: "bottom",
          title: l10n.get("TutoColorButtonTitle"),
          intro: l10n.get("TutoColorButtonContent"),
        },
        {
          element: "#draw-button",
          position: "bottom",
          title: l10n.get("TutoDrawButtonTitle"),
          intro: l10n.get("TutoDrawButtonContent"),
        },
        {
          element: "#erase-button",
          position: "bottom",
          title: l10n.get("TutoEraseButtonTitle"),
          intro: l10n.get("TutoEraseButtonContent"),
        },
        {
          element: "#clear-button",
          position: "bottom",
          title: l10n.get("TutoClearButtonTitle"),
          intro: l10n.get("TutoClearButtonContent"),
        },
				{
					element: "#save-image-button",
					position: "bottom",
					title: l10n.get("TutoSaveImageButtonTitle"),
					intro: l10n.get("TutoSaveImageButtonContent")
				}
      ];
    } else if (isGameMode) {
      // Game Mode tutorial
      steps = [
        {
          title: l10n.get("TutoExplainTitle"),
          intro: l10n.get("TutoExplainContent"),
        },
        {
          title: l10n.get("TutoGameModeTitle"),
          intro: l10n.get("TutoGameModeContent"),
        },
        {
					element: "#gridCanvas",
          position: "top",
          title: l10n.get("TutoGameCanvasTitle"),
          intro: l10n.get("TutoGameCanvasContent"),
        },
        {
          element: "#network-button",
          position: "bottom",
          title: l10n.get("TutoNetworkTitle"),
          intro: l10n.get("TutoNetworkContent"),
        },
        {
          element: "#mode-button",
          position: "bottom",
          title: l10n.get("TutoModeButtonTitle"),
          intro: l10n.get("TutoModeButtonContent"),
        },
        {
          element: "#play-button",
          position: "bottom",
          title: l10n.get("TutoPlayButtonTitle"),
          intro: l10n.get("TutoPlayButtonContent"),
        },
        {
          element: "#robot-button",
          position: "bottom",
          title: l10n.get("TutoRobotButtonTitle"),
          intro: l10n.get("TutoRobotButtonContent"),
        },
        {
          element: "#speed-button",
          position: "bottom",
          title: l10n.get("TutoSpeedButtonTitle"),
          intro: l10n.get("TutoSpeedButtonContent"),
        },
        {
          element: "#restart-button",
          position: "bottom",
          title: l10n.get("TutoRestartButtonTitle"),
          intro: l10n.get("TutoRestartButtonContent"),
        },
        {
          element: "#stop-game-button",
          position: "bottom",
          title: l10n.get("TutoStopGameButtonTitle"),
          intro: l10n.get("TutoStopGameButtonContent"),
        },
      ];
    } else if (isCreatingFigure) {
      // Creating/editing a figure
      steps = [
        {
          title: l10n.get("TutoExplainTitle"),
          intro: l10n.get("TutoExplainContent"),
        },
        {
          title: l10n.get("TutoEditorTitle"),
          intro: l10n.get("TutoEditorContent"),
        },
        {
          element: "#canvas",
          position: "top",
          title: l10n.get("TutoEditorCanvasTitle"),
          intro: l10n.get("TutoEditorCanvasContent"),
        },
        {
          element: "#create-figure-back-button",
          position: "bottom",
          title: l10n.get("TutoGoBackTitle"),
          intro: l10n.get("TutoGoBackContent"),
        },
        {
          element: "#create-figure-minus-button",
          position: "bottom",
          title: l10n.get("TutoRemoveDotTitle"),
          intro: l10n.get("TutoRemoveDotContent"),
        },
      ];
    } else if (isGalleryVisible && isSettingView) {
      // Number mode - Gallery in settings view
      steps = [
        {
          title: l10n.get("TutoExplainTitle"),
          intro: l10n.get("TutoExplainContent"),
        },
        {
          title: l10n.get("TutoSettingViewTitle"),
          intro: l10n.get("TutoSettingViewContent"),
        },
        {
          element: "#library-gallery",
          position: "top",
          title: l10n.get("TutoGalleryTitle"),
          intro: l10n.get("TutoSettingGalleryContent"),
        },
        {
          element: ".btn-add-figure",
          position: "top",
          title: l10n.get("TutoNewFigureTitle"),
          intro: l10n.get("TutoNewFigureContent"),
        },
        {
          element: ".gallery-header-edit-btn",
          position: "bottom",
          title: l10n.get("TutoEditCategoryTitle"),
          intro: l10n.get("TutoEditCategoryContent"),
        },
        {
          element: ".gallery-header-delete-btn",
          position: "bottom",
          title: l10n.get("TutoDeleteCategoryTitle"),
          intro: l10n.get("TutoDeleteCategoryContent"),
        },
        {
          element: ".gallery-card:first-child .edit-btn",
          position: "bottom",
          title: l10n.get("TutoEditFigureTitle"),
          intro: l10n.get("TutoEditFigureContent"),
        },
        {
          element: ".gallery-card:first-child .delete-btn",
          position: "bottom",
          title: l10n.get("TutoDeleteFigureTitle"),
          intro: l10n.get("TutoDeleteFigureContent"),
        },
        {
          element: "#network-button",
          position: "bottom",
          title: l10n.get("TutoNetworkTitle"),
          intro: l10n.get("TutoNetworkContent"),
        },
        {
          element: "#mode-button",
          position: "bottom",
          title: l10n.get("TutoModeButtonTitle"),
          intro: l10n.get("TutoModeButtonContent"),
        },
        {
          element: "#library-button",
          position: "bottom",
          title: l10n.get("TutoLibraryButtonTitle"),
          intro: l10n.get("TutoLibraryButtonContent"),
        },
        {
          element: "#view-button",
          position: "bottom",
          title: l10n.get("TutoViewButtonTitle"),
          intro: l10n.get("TutoViewButtonContent"),
        },
        {
          element: "#create-category-button",
          position: "bottom",
          title: l10n.get("TutoNewCategoryTitle"),
          intro: l10n.get("TutoNewCategoryContent"),
        },
      ];
    } else if (isGalleryVisible) {
      // Number mode - Gallery in play view
      steps = [
        {
          title: l10n.get("TutoExplainTitle"),
          intro: l10n.get("TutoExplainContent"),
        },
        {
          title: l10n.get("TutoNumberModeTitle"),
          intro: l10n.get("TutoNumberModeContent"),
        },
        {
          element: "#library-gallery",
          position: "top",
          title: l10n.get("TutoGalleryTitle"),
          intro: l10n.get("TutoPlayGalleryContent"),
        },
        {
          element: "#network-button",
          position: "bottom",
          title: l10n.get("TutoNetworkTitle"),
          intro: l10n.get("TutoNetworkContent"),
        },
        {
          element: "#mode-button",
          position: "bottom",
          title: l10n.get("TutoModeButtonTitle"),
          intro: l10n.get("TutoModeButtonContent"),
        },
        {
          element: "#library-button",
          position: "bottom",
          title: l10n.get("TutoLibraryButtonTitle"),
          intro: l10n.get("TutoLibraryButtonContent"),
        },
        {
          element: "#view-button",
          position: "bottom",
          title: l10n.get("TutoViewButtonTitle"),
          intro: l10n.get("TutoViewButtonContent"),
        },
        {
          element: "#timer-button",
          position: "bottom",
          title: l10n.get("TutoTimerButtonTitle"),
          intro: l10n.get("TutoTimerButtonContent"),
        },
      ];
    } else if (isPlayingFigure) {
      // Number mode - Playing a figure
      steps = [
        {
          title: l10n.get("TutoExplainTitle"),
          intro: l10n.get("TutoExplainContent"),
        },
        {
          element: "#canvas",
          position: "top",
          title: l10n.get("TutoNumberCanvasTitle"),
          intro: l10n.get("TutoNumberCanvasContent"),
        },
        {
          element: "#network-button",
          position: "bottom",
          title: l10n.get("TutoNetworkTitle"),
          intro: l10n.get("TutoNetworkContent"),
        },
        {
          element: "#mode-button",
          position: "bottom",
          title: l10n.get("TutoModeButtonTitle"),
          intro: l10n.get("TutoModeButtonContent"),
        },
        {
          element: "#timer-button",
          position: "bottom",
          title: l10n.get("TutoTimerButtonTitle"),
          intro: l10n.get("TutoTimerButtonContent"),
        },
        {
          element: "#play-figure-back-button",
          position: "bottom",
          title: l10n.get("TutoGoBackTitle"),
          intro: l10n.get("TutoGoBackContent"),
        },
      ];
    } else {
      // Fallback
      steps = [
        {
          title: l10n.get("TutoExplainTitle"),
          intro: l10n.get("TutoExplainContent"),
        },
      ];
    }

    steps = steps.filter(function (obj) {
      return (
        !("element" in obj) ||
        (obj.element.length &&
          document.querySelector(obj.element) &&
          document.querySelector(obj.element).style.display != "none")
      );
    });

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