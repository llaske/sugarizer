define(["l10n"], function (l10n) {
	var tutorial = {};

	tutorial.start = function() {
		steps = [];
    if (currentview === "ListView"){
      steps = [{
  				title: l10n.get("TutoExplainTitle"),
  				intro: l10n.get("TutoExplainContent")
  			},
  			{
  				element: "#planet-Mercury",
  				position: "right",
  				title: l10n.get("TutoPlanetImage"),
  				intro: l10n.get("TutoPlanetImageContent")
  			},
  			{
  				element: "#position-button",
                position: "bottom",
  				title: l10n.get("TutoPositionButtonTitle"),
  				intro: l10n.get("TutoPositionButtonContent")
  			}];
    }
    else if (currentview === "ExploreView"){
      steps = [
        {
  				title: l10n.get("TutoExploreOverviewTitle"),
  				intro: l10n.get("TutoExploreOverviewContent")
   			},
        {
   				element: "#info-button",
                position: "bottom",
   				title: l10n.get("TutoInfoButtonTitle"),
   				intro: l10n.get("TutoInfoButtonContent")
   			},
   			{
   				element: "#rotation-button",
                position: "bottom",
   				title: l10n.get("TutoRotateButtonTitle"),
   				intro: l10n.get("TutoRotateButtonContent")
   			},
   			{
   				element: "#image-button",
                position: "bottom",
   				title: l10n.get("TutoImageButtonTitle"),
   				intro: l10n.get("TutoImageButtonContent")
   			},
   			{
   				element: "#planet-info",
                position: "right",
   				title: l10n.get("TutoPlanetInfoTitle"),
   				intro: l10n.get("TutoPlanetInfoContent")
   			},
   			{
   				element: "#planet-display",
                position: "left",
   				title: l10n.get("TutoPlanetDisplayTitle"),
   				intro: l10n.get("TutoPlanetDisplayContent")
   			}
      ];
    }
    else {
      steps = [
        {
  				title: l10n.get("TutoPositionOverviewTitle"),
  				intro: l10n.get("TutoPositionOverviewContent")
   			},
        {
  				element: "#planet-pos",
                position: "top",
  				title: l10n.get("TutoPlanetPositionTitle"),
  				intro: l10n.get("TutoPlanetPositionContent")
  			},
  			{
  				element: "#list-button",
                position: "bottom",
  				title: l10n.get("TutoListButtonTitle"),
  				intro: l10n.get("TutoListButtonContent")
  			}];
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
