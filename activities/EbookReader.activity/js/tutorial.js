
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
				stringTutoBookTitle: '',
				stringTutoBookContent: '',
				stringTutoLibraryButtonTitle: '',
				stringTutoLibraryButtonContent: '',
				stringTutoSettingsButtonTitle: '',
				stringTutoSettingsButtonContent: '',
				stringTutoFullscreenButtonTitle: '',
				stringTutoFullscreenButtonContent: '',
				stringTutoNextButtonTitle: '',
				stringTutoNextButtonContent: '',
				stringTutoPrevButtonTitle: '',
				stringTutoPrevButtonContent: '',
			}
		}
	},
	methods: {
		localized: function(localization) {
			var vm = this;
			Object.keys(this.l10n).forEach(function(key, index) {
				vm.l10n[key] = localization.get(key.substr(6));
			});
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
					element: options.book,
					placement: "right",
					title: this.l10n.stringTutoBookTitle,
					content: this.l10n.stringTutoBookContent
				},
				{
					element: options.switchbutton,
					placement: "bottom",
					title: this.l10n.stringTutoLibraryButtonTitle,
					content: this.l10n.stringTutoLibraryButtonContent
				},
				{
					element: options.settingsbutton,
					placement: "bottom",
					title: this.l10n.stringTutoSettingsButtonTitle,
					content: this.l10n.stringTutoSettingsButtonContent
				},
				{
					element: options.fullscreenbutton,
					placement: "bottom",
					title: this.l10n.stringTutoFullscreenButtonTitle,
					content: this.l10n.stringTutoFullscreenButtonContent
				},
				{
					element: options.prevbutton,
					placement: "right",
					title: this.l10n.stringTutoPrevButtonTitle,
					content: this.l10n.stringTutoPrevButtonContent
				},
				{
					element: options.nextbutton,
					placement: "left",
					title: this.l10n.stringTutoNextButtonTitle,
					content: this.l10n.stringTutoNextButtonContent
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
