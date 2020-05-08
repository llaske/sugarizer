
// Tutorial component based on bootstrap tour
var Tutorial = {
	template: '<div/>',
	data: function() {
		return {
			l10n: {
				stringPrevShort: '',
				stringNextShort: '',
				stringEndShort: '',
				stringTutoTitle: '',
				stringTutoContent: '',
				stringTutoBallTitle: '',
				stringTutoBallContent: '',
				stringTutoBallControlsTitle: '',
				stringTutoBallControlsContent: '',
				stringTutoSlopeTitle: '',
				stringTutoSlopeContent: '',
				stringTutoLogTitle: '',
				stringTutoLogContent: '',
				stringTutoPlayTitle: '',
				stringTutoPlayContent: '',
				stringTutoSettingsTitle: '',
				stringTutoSettingsContent: '',
				stringTutoBallSelectTitle: '',
				stringTutoBallSelectContent: '',
				stringTutoBgSelectTitle: '',
				stringTutoBgSelectContent: '',
				stringTutoFractionsModeTitle: '',
				stringTutoFractionsModeContent: '',
				stringTutoSectorsModeTitle: '',
				stringTutoSectorsModeContent: '',
				stringTutoPercentsModeTitle: '',
				stringTutoPercentsModeContent: '',
			}
		}
	},
	methods: {
		localized: function(localization) {
			localization.localize(this.l10n);
		},

		show: function(type) {
			let vm = this;
			var steps = [];
			
			steps.push(
				{
					element: "",
					orphan: true,
					placement: "bottom",
					title: this.l10n.stringTutoTitle,
					content: this.l10n.stringTutoContent
				}
			);
			steps = steps.concat([
				{
					element: "#mainCanvas",
					placement: "top",
					backdrop: false,
					title: this.l10n.stringTutoBallTitle,
					content: this.l10n.stringTutoBallContent
				},
				{
					element: "#mainCanvas",
					placement: "top",
					title: this.l10n.stringTutoBallControlsTitle,
					content: this.l10n.stringTutoBallControlsContent
				},
				{
					element: "#slopeCanvas",
					placement: "top",
					backdrop: false,
					title: this.l10n.stringTutoSlopeTitle,
					content: this.l10n.stringTutoSlopeContent
				},
				{
					element: ".log",
					placement: "right",
					title: this.l10n.stringTutoLogTitle,
					content: this.l10n.stringTutoLogContent
				},
				{
					element: "#play-button",
					placement: "bottom",
					title: this.l10n.stringTutoPlayTitle,
					content: this.l10n.stringTutoPlayContent
				},
				{
					element: "#pause-button",
					placement: "bottom",
					title: this.l10n.stringTutoPlayTitle,
					content: this.l10n.stringTutoPlayContent
				},
				{
					element: "#settings-button",
					placement: "bottom",
					title: this.l10n.stringTutoSettingsTitle,
					content: this.l10n.stringTutoSettingsContent
				},
				{
					element: "#ball-button",
					placement: "bottom",
					title: this.l10n.stringTutoBallSelectTitle,
					content: this.l10n.stringTutoBallSelectContent
				},
				{
					element: "#bg-button",
					placement: "bottom",
					title: this.l10n.stringTutoBgSelectTitle,
					content: this.l10n.stringTutoBgSelectContent
				},
				{
					element: "#fractions-button",
					placement: "bottom",
					title: this.l10n.stringTutoFractionsModeTitle,
					content: this.l10n.stringTutoFractionsModeContent
				},
				{
					element: "#sectors-button",
					placement: "bottom",
					title: this.l10n.stringTutoSectorsModeTitle,
					content: this.l10n.stringTutoSectorsModeContent
				},
				{
					element: "#percents-button",
					placement: "bottom",
					title: this.l10n.stringTutoPercentsModeTitle,
					content: this.l10n.stringTutoPercentsModeContent
				},
			]);
			
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
				steps: steps,
				onShow: function (tour) {
					if(tour._current == 7) {
						vm.$emit('startpos');
					} 
					else if(tour._current == 8) {
						vm.$emit('end');
					}
				},
				onEnd: function (tour) {
					vm.$emit('end');
				},
			});
			tour.init();
			tour.start(true);
		}
	}
}
