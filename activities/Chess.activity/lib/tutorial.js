define(["webL10n"], function (l10n) {
	var tutorial = {};

	tutorial.start = function() {
		var steps = [
			{
				element: "",
				orphan: true,
				placement: "bottom",
				title: l10n.get("TITLE"),
				content: l10n.get("TTC")
			},
			{
				element: "#myBoard",
				orphan: true,
				placement: "right",
				title: l10n.get("TICT"),
				content: l10n.get("TICC")
			},
			{
				element: "",
				orphan: true,
				placement: "top",
				title: l10n.get("TCPT"),
				content: l10n.get("TCPC")
			},
			{
				element: "img[data-piece='bR']:first",
				orphan: true,
				placement: "right",
				title: l10n.get("TRT"),
				content: l10n.get("TRC")			
			},
			{
				element: "img[data-piece='wN']:first",
				orphan: true,
				placement: "right",
				title: l10n.get("TNT"),
				content: l10n.get("TNC")			
			},
			{
				element: "img[data-piece='bB']:first",
				orphan: true,
				placement: "right",
				title: l10n.get("TBT"),
				content: l10n.get("TBC")			
			},
			{
				element: "img[data-piece='wQ']:first",
				orphan: true,
				placement: "right",
				title: l10n.get("TQT"),
				content: l10n.get("TQC")			
			},
			{
				element: "img[data-piece='bK']:first",
				orphan: true,
				placement: "right",
				title: l10n.get("TKT"),
				content: l10n.get("TKC")			
			},
			{
				element: "img[data-piece='wP']:first",
				orphan: true,
				placement: "right",
				title: l10n.get("TPT"),
				content: l10n.get("TPC")			
			},
			{
				element: "#newgame-button",
				orphan: true,
				placement: "bottom",
				title: l10n.get("NGB"),
				content: l10n.get("NGBC")
			},
			{
				element: "#swap-button",
				orphan: true,
				placement: "bottom",
				title: l10n.get("SWB"),
				content: l10n.get("SWBC")
			},
			{
				element: "#diff_indicator",
				orphan: true,
				placement: "bottom",
				title: l10n.get("TDLT"),
				content: l10n.get("TDLC")			
			},
			{
				element: "#dedifficulty-button",
				orphan: true,
				placement: "bottom",
				title: l10n.get("DDB"),
				content: l10n.get("DDBC")
			},
			{
				element: "#indifficulty-button",
				orphan: true,
				placement: "bottom",
				title: l10n.get("IDB"),
				content: l10n.get("IDBC")
			},
			{
				element: "#network-button",
				orphan: true,
				placement: "bottom",
				title: l10n.get("NB"),
				content: l10n.get("NBC")
			},
			{
				element: "#fullscreen-button",
				orphan: true,
				placement: "bottom",
				title: l10n.get("FB"),
				content: l10n.get("FBC")
			},
			{
				element: "#stop-button",
				orphan: true,
				placement: "bottom",
				title: l10n.get("TSTB"),
				content: l10n.get("STBC")			
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