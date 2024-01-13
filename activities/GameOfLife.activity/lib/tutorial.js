define(["l10n"], function (l10n) {
	var tutorial = {};
  
	var insertIcon = function (icon) {
	  return (
		"<div id='icon-tutorial' style='min-width:55px;height:100px;margin-top:15px;margin-left:5px;margin-right:10px;background-repeat:no-repeat;background-image:url(" +
		icon +
		");background-size: 100px 100px'/></div>"
	  );
	};
  
	tutorial.start = function () {
	  var steps = [
		{
		  title: l10n.get("TutoExplainTitle"),
		  intro: l10n.get("TutoExplainContent"),
		},
		{
		  element: "#canvas",
		  position: "top",
		  title: l10n.get("TutoCanvasTitle"),
		  intro: l10n.get("TutoCanvasContent"),
		},
		{
		  element: "#canvas",
		  position: "top",
		  title: l10n.get("TutoUnderTitle"),
		  intro:
			insertIcon("./images/underpopulation.png") +
			l10n.get("TutoUnderContent"),
		},
		{
		  element: "#canvas",
		  position: "top",
		  title: l10n.get("TutoNextTitle"),
		  intro:
			insertIcon("./images/overpopulation.png") +
			l10n.get("TutoNextContent"),
		},
		{
		  element: "#canvas",
		  position: "top",
		  title: l10n.get("TutoOverTitle"),
		  intro:
			insertIcon("./images/nextgeneration.png") +
			l10n.get("TutoOverContent"),
		},
		{
		  element: "#canvas",
		  position: "top",
		  title: l10n.get("TutoReproductionTitle"),
		  intro:
			insertIcon("./images/reproduction.png") +
			l10n.get("TutoReproductionContent"),
		},
		{
		  element: ".generation-container",
		  position: "bottom",
		  title: l10n.get("TutoCountTitle"),
		  intro: l10n.get("TutoCountContent"),
		},
		{
		  element: "#play-pause",
		  position: "bottom",
		  title: l10n.get("TutoRunTitle"),
		  intro: l10n.get("TutoRunContent"),
		},
		{
		  element: "#speed-button",
		  position: "bottom",
		  title: l10n.get("TutoSpeedTitle"),
		  intro: l10n.get("TutoSpeedContent"),
		},
		{
		  element: "#size-button",
		  position: "bottom",
		  title: l10n.get("TutoSizeTitle"),
		  intro: l10n.get("TutoSizeContent"),
		},
		{
		  element: "#deadCells-button",
		  position: "bottom",
		  title: l10n.get("TutoDeadCellsTitle"),
		  intro: l10n.get("TutoDeadCellsContent"),
		},
		{
		  element: "#random",
		  position: "bottom",
		  title: l10n.get("TutoRandomTitle"),
		  intro: l10n.get("TutoRandomContent"),
		},
		{
		  element: "#glider",
		  position: "bottom",
		  title: l10n.get("TutoGliderTitle"),
		  intro: l10n.get("TutoGliderContent"),
		},
		{
		  element: "#no",
		  position: "bottom",
		  title: l10n.get("TutoNoTitle"),
		  intro: l10n.get("TutoNoContent"),
		},
		{
		  element: "#clear",
		  position: "bottom",
		  title: l10n.get("TutoClearTitle"),
		  intro: l10n.get("TutoClearContent"),
		},
	  ];
  
	  steps = steps.filter(
		(obj) =>
		  !("element" in obj) ||
		  (obj.element.length &&
			document.querySelector(obj.element) &&
			document.querySelector(obj.element).style.display != "none")
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
  