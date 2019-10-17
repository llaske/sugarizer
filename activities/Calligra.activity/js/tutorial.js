
// Tutorial component based on bootstrap tour
var Tutorial = {
	template: '<div/>',
	data: function() {
		return {
			l10n: {
				stringPrevShort: '',
				stringNextShort: '',
				stringEndShort: '',
				stringTutoExplainTitle: '',
				stringTutoExplainContent: '',
				stringTutoFullscreenButtonTitle: '',
				stringTutoFullscreenButtonContent: '',
				stringTutoTemplateButtonTitle: '',
				stringTutoTemplateButtonContent: ''
			}
		}
	},
	methods: {
		localized: function(localization) {
			localization.localize(this.l10n);
		},

		show: function(options) {
			options = options || {};
			var steps = [
				{
					element: "",
					orphan: true,
					placement: "bottom",
					title: this.l10n.stringTutoExplainTitle,
					content: this.l10n.stringTutoExplainContent
				},
				{
					element: options.templatebutton,
					placement: "bottom",
					title: this.l10n.stringTutoTemplateButtonTitle,
					content: this.l10n.stringTutoTemplateButtonContent
				},
				{
					element: options.fullscreenbutton,
					placement: "bottom",
					title: this.l10n.stringTutoFullscreenButtonTitle,
					content: this.l10n.stringTutoFullscreenButtonContent
				},
			];
			var tour = new Tour({
				template: "\
				<div class='popover tour'>\
					<div class='arrow'></div>\
					<h3 class='popover-title tutorial-title'></h3>\
					<div class='popover-content'></div>\
					<div class='popover-navigation' style='display: flex; flex-wrap:wrap; justify-content: center; align-items: center'>\
						<div class='tutorial-prev-icon tutorial-icon-button' data-role='prev'>\
							<div class='tutorial-prev-icon1 web-activity'>\
								<div class='tutorial-prev-icon2 web-activity-icon'></div>\
								<div class='tutorial-prev-icon3 web-activity-disable'></div>\
							</div>\
							<div class='tutorial-icon-text'>"+this.l10n.stringPrevShort+"</div>\
						</div>\
						<span data-role='separator' style='margin: 4px'>|</span>\
						<div class='tutorial-next-icon tutorial-icon-button' data-role='next'>\
							<div class='tutorial-next-icon1 web-activity'>\
								<div class='tutorial-next-icon2 web-activity-icon'></div>\
								<div class='tutorial-next-icon3 web-activity-disable'></div>\
							</div>\
							<div class='tutorial-icon-text'>"+this.l10n.stringNextShort+"</div>\
						</div>\
						<div class='tutorial-end-icon tutorial-icon-button' data-role='end'>\
							<div class='tutorial-end-icon1 web-activity'>\
								<div class='tutorial-end-icon2 web-activity-icon'></div>\
								<div class='tutorial-end-icon3 web-activity-disable'></div>\
							</div>\
							<div class='tutorial-icon-text'>"+this.l10n.stringEndShort+"</div>\
						</div>\
					</div>\
				</div>",
				storage: false,
				backdrop: true,
				steps: steps
			});
			tour.init();
			tour.start(true);
		}
	}
}
