define(["webL10n"], function (l10n) {
	var tutorial = {};

	tutorial.start = function() {
		var tour = new Tour({
			template: "\
			<div class='popover tour'>\
				<div class='arrow'></div>\
				<h3 class='popover-title tutorial-title'></h3>\
				<table><tr><td style='vertical-align:top;'><div id='icon-tutorial' style='visibility:hidden;display:inline-block;'></div>\
				</td><td><div class='popover-content'></div></td></tr></table>\
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
			steps: [],
			onShown: function() {
				if (tutorial.icons && tutorial.icons.steps && tutorial.icons.steps[tour.getCurrentStep()]) {
					var icon = tutorial.icons.steps[tour.getCurrentStep()];
					var iconElement = document.getElementById("icon-tutorial");
					iconElement.style.visibility = 'visible';
					iconElement.style.backgroundImage = "url('"+ icon.directory + "/" + icon.icon + "')";
					iconElement.style.backgroundSize = icon.size + "px";
					iconElement.style.width = icon.size + "px";
					iconElement.style.height = icon.size + "px";
					iconElement.style.marginTop = "15px";
					iconElement.style.marginLeft = "5px";
					if (icon.color) {
						iconLib.colorize(iconElement, icon.color, function(){});
					}
				}
			},
			onEnd: function() {
				tutorial.elements = [];
				tutorial.icons = null;
			}
		});
		tour.addSteps([
			{
				element: "",
				orphan: true,
				placement: "bottom",
				title: l10n.get("TutoExplainTitle"),
				content: l10n.get("TutoExplainContent")
			},
			{
				element: "#canvas",
				placement: "top",
				title: l10n.get("TutoCanvasTitle"),
				content: l10n.get("TutoCanvasContent")
			},
			{
				element: "#canvas",
				placement: "top",
				title: l10n.get("TutoUnderTitle"),
				content: l10n.get("TutoUnderContent")
			},
			{
				element: "#canvas",
				placement: "top",
				title: l10n.get("TutoNextTitle"),
				content: l10n.get("TutoNextContent")
			},
			{
				element: "#canvas",
				placement: "top",
				title: l10n.get("TutoOverTitle"),
				content: l10n.get("TutoOverContent")
			},
			{
				element: "#canvas",
				placement: "top",
				title: l10n.get("TutoReproductionTitle"),
				content: l10n.get("TutoReproductionContent"),
			},
			{
				element: ".generation-container",
				placement: "bottom",
				title: l10n.get("TutoCountTitle"),
				content: l10n.get("TutoCountContent"),
			},
			{
				element: "#play-pause",
				placement: "bottom",
				title: l10n.get("TutoRunTitle"),
				content: l10n.get("TutoRunContent"),
			},
			{
				element: "#speed-button",
				placement: "bottom",
				title: l10n.get("TutoSpeedTitle"),
				content: l10n.get("TutoSpeedContent"),
			},
			{
				element: "#size-button",
				placement: "bottom",
				title: l10n.get("TutoSizeTitle"),
				content: l10n.get("TutoSizeContent"),
			},
			{
				element: "#random",
				placement: "bottom",
				title: l10n.get("TutoRandomTitle"),
				content: l10n.get("TutoRandomContent"),
			},
			{
				element: "#glider",
				placement: "bottom",
				title: l10n.get("TutoGliderTitle"),
				content: l10n.get("TutoGliderContent"),
			},
			{
				element: "#no",
				placement: "bottom",
				title: l10n.get("TutoNoTitle"),
				content: l10n.get("TutoNoContent"),
			},
			{
				element: "#clear",
				placement: "bottom",
				title: l10n.get("TutoClearTitle"),
				content: l10n.get("TutoClearContent"),
			},
		]);
		tutorial.icons = {
			steps: {
				2: {icon: 'underpopulation.png', directory: 'images', size: 100},
				3: {icon: 'nextgeneration.png', directory: 'images', size: 100},
				4: {icon: 'overpopulation.png', directory: 'images', size: 100},
				5: {icon: 'reproduction.png', directory: 'images', size: 100},
			}
		};
		tour.init();
		tour.start(true);

	};

	return tutorial;
});
