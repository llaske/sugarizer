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
				element: "#qr-code",
				placement: "right",
				title: l10n.get("TutoQRTitle"),
				content: l10n.get("TutoQRContent")
			},
			{
				element: "#photo-button",
				placement: "bottom",
				title: l10n.get("TutoPhotoTitle"),
				content: l10n.get("TutoPhotoContent")
			},
			{
				element: "#png-button",
				placement: "bottom",
				title: l10n.get("TutoPNGTitle"),
				content: l10n.get("TutoPNGContent")
			},
			{
				element: "#qrtextdropdown",
				placement: "bottom",
				title: l10n.get("TutoListTitle"),
				content: l10n.get("TutoListContent")
			},
			{
				element: "#user-text",
				placement: "bottom",
				title: l10n.get("TutoInputTitle"),
				content: l10n.get("TutoInputContent")
			},
			{
				element: "#generate-button",
				placement: "left",
				title: l10n.get("TutoGenerateTitle"),
				content: l10n.get("TutoGenerateContent")
			}
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
