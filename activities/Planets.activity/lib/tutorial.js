define(["webL10n"], function (l10n) {
	var tutorial = {};

	tutorial.start = function() {
		steps = [];
    if (currentview === "ListView"){
      steps = [{
  				element: "",
  				orphan: true,
  				placement: "bottom",
  				title: l10n.get("TutoExplainTitle"),
  				content: l10n.get("TutoExplainContent")
  			},
  			{
  				element: "#planet-Mercury",
  				placement: "right",
  				title: l10n.get("TutoPlanetImage"),
  				content: l10n.get("TutoPlanetImageContent")
  			},
  			{
  				element: "#position-button",
          placement: "bottom",
  				title: l10n.get("TutoPositionButtonTitle"),
  				content: l10n.get("TutoPositionButtonContent")
  			}];
    }
    else if (currentview === "ExploreView"){
      steps = [
        {
   				element: "",
          orphan: true,
  				placement: "bottom",
  				title: l10n.get("TutoExploreOverviewTitle"),
  				content: l10n.get("TutoExploreOverviewContent")
   			},
        {
   				element: "#info-button",
           placement: "bottom",
   				title: l10n.get("TutoInfoButtonTitle"),
   				content: l10n.get("TutoInfoButtonContent")
   			},
   			{
   				element: "#rotation-button",
           placement: "bottom",
   				title: l10n.get("TutoRotateButtonTitle"),
   				content: l10n.get("TutoRotateButtonContent")
   			},
   			{
   				element: "#image-button",
           placement: "bottom",
   				title: l10n.get("TutoImageButtonTitle"),
   				content: l10n.get("TutoImageButtonContent")
   			},
   			{
   				element: "#planet-info",
           placement: "right",
   				title: l10n.get("TutoPlanetInfoTitle"),
   				content: l10n.get("TutoPlanetInfoContent")
   			},
   			{
   				element: "#planet-display",
           placement: "left",
   				title: l10n.get("TutoPlanetDisplayTitle"),
   				content: l10n.get("TutoPlanetDisplayContent")
   			}
      ];
    }
    else {
      steps = [
        {
   				element: "",
          orphan: true,
  				placement: "bottom",
  				title: l10n.get("TutoPositionOverviewTitle"),
  				content: l10n.get("TutoPositionOverviewContent")
   			},
        {
  				element: "#planet-pos",
          placement: "top",
  				title: l10n.get("TutoPlanetPositionTitle"),
  				content: l10n.get("TutoPlanetPositionContent")
  			},
  			{
  				element: "#list-button",
          placement: "bottom",
  				title: l10n.get("TutoListButtonTitle"),
  				content: l10n.get("TutoListButtonContent")
  			}];
    }
		var tour = new Tour({
      template: "\
  		<div class='popover tour'>\
  			<div class='arrow'></div>\
  			<h3 class='popover-title tutorial-title'></h3>\
  			<div class='popover-content'></div>\
  			<div class='popover-navigation' style='display: flex; flex-wrap:wrap; justify-content: center; align-items: center'>\
  				<div class='tutorial-prev-icon icon-button' data-role='prev'>\
  					<div class='tutorial-prev-icon1 web-activity'>\
  						<div class='tutorial-prev-icon2 web-activity-icon'></div>\
  						<div class='tutorial-prev-icon3 web-activity-disable'></div>\
  					</div>\
						<div class='icon-tutorial-text'>"+l10n.get("TutoPrev")+"</div>\
  				</div>\
  				<span data-role='separator' style='margin: 4px'>|</span>\
  				<div class='tutorial-next-icon icon-button' data-role='next'>\
  					<div class='tutorial-next-icon1 web-activity'>\
  						<div class='tutorial-next-icon2 web-activity-icon'></div>\
  						<div class='tutorial-next-icon3 web-activity-disable'></div>\
  					</div>\
					<div class='icon-tutorial-text'>"+l10n.get("TutoNext")+"</div>\
  				</div>\
  				<div class='tutorial-end-icon icon-button' data-role='end'>\
  					<div class='tutorial-end-icon1 web-activity'>\
  						<div class='tutorial-end-icon2 web-activity-icon'></div>\
  						<div class='tutorial-end-icon3 web-activity-disable'></div>\
  					</div>\
					<div class='icon-tutorial-text'>"+l10n.get("TutoEnd")+"</div>\
  				</div>\
  			</div>\
  		</div>",
  		storage: false,
  		backdrop: true,
  		steps: steps
    });
		tour.init();
		tour.start(true);

	};

	return tutorial;
});
