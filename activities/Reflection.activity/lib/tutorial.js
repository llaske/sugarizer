define(["l10n"], function (l10n) {
  var tutorial = {};

  tutorial.start = function () {
    var steps = [
      {
        position: "bottom",
        title: l10n.get("TutoExplainTitle"),
        intro: l10n.get("TutoExplainContent"),
      },
      {
        element: "#buddy-button",
        position: "bottom",
        title: l10n.get("TutoBuddyTitle"),
        intro: l10n.get("TutoBuddyContent"),
      },
      {
        element: "#rainbow-button",
        position: "bottom",
        title: l10n.get("TutoRainbowTitle"),
        intro: l10n.get("TutoRainbowContent"),
      },
      {
        element: "#horizontal-button",
        position: "bottom",
        title: l10n.get("TutoHorizontalTitle"),
        intro: l10n.get("TutoHorizontalContent"),
      },
      {
        element: "#vertical-button",
        position: "bottom",
        title: l10n.get("TutoVerticalTitle"),
        intro: l10n.get("TutoVerticalContent"),
      },
      {
        element: "#bilateral-button",
        position: "bottom",
        title: l10n.get("TutoBilateralTitle"),
        intro: l10n.get("TutoBilateralContent"),
      },
      {
        element: "#robot-button",
        position: "bottom",
        title: l10n.get("TutoRobotTitle"),
        intro: l10n.get("TutoRobotContent"),
      },
      {
        element: "#actualcanvas",
        position: "top",
        title: l10n.get("TutoCanvasTitle"),
        intro: l10n.get("TutoCanvasContent"),
      },
    ];

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
