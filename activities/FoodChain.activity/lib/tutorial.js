define(["l10n"], function (l10n) {
  var tutorial = {};

  tutorial.start = function () {
    var currentView = FoodChain.context.game;
    var steps = [];
    if (currentView == "") {
      steps = [
        {
          position: "bottom",
          title: l10n.get("TutoExplainTitle"),
          intro: l10n.get("TutoExplainContent"),
        },
        {
          element: "#app_LearnGame_button",
          position: "right",
          title: l10n.get("TutoLearnTitle"),
          intro: l10n.get("TutoLearnContent"),
        },
        {
          element: "#app_BuildGame_button",
          position: "right",
          title: l10n.get("TutoBuildTitle"),
          intro: l10n.get("TutoBuildContent"),
        },
        {
          element: "#app_PlayGame_button",
          position: "left",
          title: l10n.get("TutoPlayGameTitle"),
          intro: l10n.get("TutoPlayGameContent"),
        },
        {
          element: "#en-button",
          position: "bottom",
          title: l10n.get("TutoEnTitle"),
          intro: l10n.get("TutoEnContent"),
        },
        {
          element: "#fr-button",
          position: "bottom",
          title: l10n.get("TutoFrTitle"),
          intro: l10n.get("TutoFrContent"),
        },
        {
          element: "#pt_BR-button",
          position: "bottom",
          title: l10n.get("TutoPtTitle"),
          intro: l10n.get("TutoPtContent"),
        },
        {
          element: "#app_shadowButton_button",
          position: "left",
          title: l10n.get("TutoInfoTitle"),
          intro: l10n.get("TutoInfoContent"),
        },
      ];
    } else if (currentView == "FoodChain.BuildGame") {
      steps = [
        {
          position: "bottom",
          title: l10n.get("TutoExplainGameTitle"),
          intro: l10n.get("TutoExplainGameContent"),
        },
        {
          element: "#buildGame_gamebox",
          position: "top",
          title: l10n.get("TutoBoardTitle"),
          intro: l10n.get("TutoBoardContent"),
        },
        {
          element: "#buildGame_home_button",
          position: "bottom",
          title: l10n.get("TutoHomeTitle"),
          intro: l10n.get("TutoHomeContent"),
        },
        {
          element: "#buildGame_validate_button",
          position: "bottom",
          title: l10n.get("TutoValidateTitle"),
          intro: l10n.get("TutoValidateContent"),
        },
        {
          element: "#buildGame_pause_button",
          position: "bottom",
          title: l10n.get("TutoPauseTitle"),
          intro: l10n.get("TutoPauseContent"),
        },
        {
          element: "#buildGame_play_button",
          position: "bottom",
          title: l10n.get("TutoPlayTitle"),
          intro: l10n.get("TutoPlayContent"),
        },
      ];
    } else if (currentView == "FoodChain.LearnGame") {
      steps = [
        {
          position: "bottom",
          title: l10n.get("TutoExplainLearnTitle"),
          intro: l10n.get("TutoExplainLearnContent"),
        },
        {
          element: "#learnGame_home_button",
          position: "bottom",
          title: l10n.get("TutoHomeTitle"),
          intro: l10n.get("TutoHomeContent"),
        },
        {
          element: "#learnGame_card",
          position: "bottom",
          title: l10n.get("TutoStartTitle"),
          intro: l10n.get("TutoStartContent"),
        },
        {
          element: "#learnGame_herbbox",
          position: "top",
          title: l10n.get("TutoHerbTitle"),
          intro: l10n.get("TutoHerbContent"),
        },
        {
          element: "#learnGame_carnbox",
          position: "top",
          title: l10n.get("TutoCarnTitle"),
          intro: l10n.get("TutoCarnContent"),
        },
        {
          element: "#learnGame_pause_button",
          position: "bottom",
          title: l10n.get("TutoPauseTitle"),
          intro: l10n.get("TutoPauseContent"),
        },
        {
          element: "#learnGame_play_button",
          position: "bottom",
          title: l10n.get("TutoPlayTitle"),
          intro: l10n.get("TutoPlayContent"),
        },
      ];
    } else if (currentView == "FoodChain.PlayGame") {
      steps = [
        {
          position: "bottom",
          title: l10n.get("TutoExplainPlayTitle"),
          intro: l10n.get("TutoExplainPlayContent"),
        },
        {
          element: "#canvas",
          position: "top",
          title: l10n.get("TutoCanvasTitle"),
          intro: l10n.get("TutoCanvasContent"),
        },
        {
          element: "#playGame_lifes",
          position: "top",
          title: l10n.get("TutoLivesTitle"),
          intro: l10n.get("TutoLivesContent"),
        },
        {
          element: "#playGame_home_button",
          position: "left",
          title: l10n.get("TutoHomeTitle"),
          intro: l10n.get("TutoHomeContent"),
        },
        {
          element: "#playGame_pause_button",
          position: "left",
          title: l10n.get("TutoPauseTitle"),
          intro: l10n.get("TutoPauseContent"),
        },
        {
          element: "#playGame_play_button",
          position: "left",
          title: l10n.get("TutoPlayTitle"),
          intro: l10n.get("TutoPlayContent"),
        },
      ];
    }

    steps = steps.filter(
      (step) =>
        !("element" in step) ||
        (step.element.length &&
          document.querySelector(step.element) &&
          document.querySelector(step.element).style.display != "none" &&
          document.querySelector(step.element).getBoundingClientRect().y != 0)
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
