define(["webL10n"], function (l10n) {
	var tutorial = {};

	tutorial.start = function() {
		var steps = [
			{
				element: "",
				orphan: true,
				placement: "bottom",
				title: l10n.get("TutoExplainTitle"),
				content: l10n.get("TutoExplainContent")
			},
			{
				element: "#calc-input-div",
				placement: "top",
				title: l10n.get("TutoInputTitle"),
				content: l10n.get("TutoInputContent")
			},
			{
				element: "#label-input",
				placement: "bottom",
				title: l10n.get("TutoLabelTitle"),
				content: l10n.get("TutoLabelContent")
			},
			{
				element: "#results-zone",
				placement: "top",
				title: l10n.get("TutoResultTitle"),
				content: l10n.get("TutoResultContent")
			},
			{
				element: "#trigo-palette",
				placement: "bottom",
				title: l10n.get("TutoTrigoTitle"),
				content: l10n.get("TutoTrigoContent")
			},
			{
				element: "#algebra-palette",
				placement: "bottom",
				title: l10n.get("TutoAlgebraTitle"),
				content: l10n.get("TutoAlgebraContent")
			},
			{
				element: "#base-palette",
				placement: "bottom",
				title: l10n.get("TutoBaseTitle"),
				content: l10n.get("TutoBaseContent")
			},
			{
				element: "#radian-degree-palette",
				placement: "bottom",
				title: l10n.get("TutoAngleTitle"),
				content: l10n.get("TutoAngleContent")
			},
			{
				element: "#output-digits-palette",
				placement: "bottom",
				title: l10n.get("TutoOutputTitle"),
				content: l10n.get("TutoOutputContent")
			},
			{
				element: "#calc-input",
				placement: "bottom",
				title: l10n.get("TutoFunctionTitle"),
				content: l10n.get("TutoFunctionContent")
			},
		];
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
