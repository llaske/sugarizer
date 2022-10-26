define(["webL10n"], function (l10n) {
	var tutorial = {};

	tutorial.start = function() {
		var steps = [
			{
				position: "bottom",
				title: l10n.get("TutoExplainTitle"),
				intro: l10n.get("TutoExplainContent")
			},
			{
				element: "#abacus-button",
				position: "bottom",
				title: l10n.get("TutoAbacusTitle"),
				intro: l10n.get("TutoAbacusContent")
			},
			{
				element: "#settings-button",
				position: "bottom",
				title: l10n.get("TutoCustomTitle"),
				intro: l10n.get("TutoCustomContent")
			},
			{
				element: "#copy-button",
				position: "bottom",
				title: l10n.get("TutoCopyTitle"),
				intro: l10n.get("TutoCopyContent")
			},
			{
				element: "#clear-button",
				position: "bottom",
				title: l10n.get("TutoClearTitle"),
				intro: l10n.get("TutoClearContent")
			},
			{
				element: "#actualcanvas",
				position: "top",
				title: l10n.get("TutoCanvasTitle"),
				intro: l10n.get("TutoCanvasContent")
			},
		];
	// 	var tour = new Tour({
	// 		template: "\
	// 		<div class='popover tour'>\
	// 			<div class='arrow'></div>\
	// 			<h3 class='popover-title tutorial-title'></h3>\
	// 			<div class='popover-content'></div>\
	// 			<div class='popover-navigation' style='display: flex; flex-wrap:wrap; justify-content: center; align-items: center'>\
	// 				<div class='tutorial-prev-icon icon-button' data-role='prev'>\
	// 					<div class='tutorial-prev-icon1 web-activity'>\
	// 						<div class='tutorial-prev-icon2 web-activity-icon'></div>\
	// 						<div class='tutorial-prev-icon3 web-activity-disable'></div>\
	// 					</div>\
	// 					<div class='icon-tutorial-text'>"+l10n.get("TutoPrev")+"</div>\
	// 				</div>\
	// 				<span data-role='separator' style='margin: 4px'>|</span>\
	// 				<div class='tutorial-next-icon icon-button' data-role='next'>\
	// 					<div class='tutorial-next-icon1 web-activity'>\
	// 						<div class='tutorial-next-icon2 web-activity-icon'></div>\
	// 						<div class='tutorial-next-icon3 web-activity-disable'></div>\
	// 					</div>\
	// 					<div class='icon-tutorial-text'>"+l10n.get("TutoNext")+"</div>\
	// 				</div>\
	// 				<div class='tutorial-end-icon icon-button' data-role='end'>\
	// 					<div class='tutorial-end-icon1 web-activity'>\
	// 						<div class='tutorial-end-icon2 web-activity-icon'></div>\
	// 						<div class='tutorial-end-icon3 web-activity-disable'></div>\
	// 					</div>\
	// 					<div class='icon-tutorial-text'>"+l10n.get("TutoEnd")+"</div>\
	// 				</div>\
	// 			</div>\
	// 		</div>",
	// 		storage: false,
	// 		backdrop: true,
	// 		steps: steps
	// 	});
	// 	tour.init();
	// 	tour.start(true);

	// };
		steps= steps.filter(function (obj) {
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
	}
	return tutorial;
});
