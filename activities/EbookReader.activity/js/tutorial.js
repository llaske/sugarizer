
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
				stringTutoContentsButtonTitle: '',
				stringTutoContentsButtonContent: '',
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
					position: "bottom",
					title: this.l10n.stringTutoExplainTitle,
					intro: this.l10n.stringTutoExplainContent
				},
				{
					element: options.book,
					position: "right",
					title: this.l10n.stringTutoBookTitle,
					intro: this.l10n.stringTutoBookContent
				},
				{
					element: options.switchbutton,
					position: "bottom",
					title: this.l10n.stringTutoLibraryButtonTitle,
					intro: this.l10n.stringTutoLibraryButtonContent
				},
				{
					element: options.contentsbutton,
					position: "bottom",
					title: this.l10n.stringTutoContentsButtonTitle,
					intro: this.l10n.stringTutoContentsButtonContent
				},
				{
					element: options.settingsbutton,
					position: "bottom",
					title: this.l10n.stringTutoSettingsButtonTitle,
					intro: this.l10n.stringTutoSettingsButtonContent
				},
				{
					element: options.fullscreenbutton,
					position: "bottom",
					title: this.l10n.stringTutoFullscreenButtonTitle,
					intro: this.l10n.stringTutoFullscreenButtonContent
				},
				{
					element: options.prevbutton,
					position: "right",
					title: this.l10n.stringTutoPrevButtonTitle,
					intro: this.l10n.stringTutoPrevButtonContent
				},
				{
					element: options.nextbutton,
					position: "left",
					title: this.l10n.stringTutoNextButtonTitle,
					intro: this.l10n.stringTutoNextButtonContent
				},
			];
			steps = steps.filter(
                (step) =>
                    !("element" in step) ||
                    (step.element &&
                        step.element.style.display != "none" &&
                        step.element.getBoundingClientRect().y != 0)
            );
			introJs()
			.setOptions({
				tooltipClass: "customTooltip",
				steps: steps,
				prevLabel: this.l10n.stringPrevShort,
				nextLabel: this.l10n.stringNextShort,
				exitOnOverlayClick: false,
				nextToDone: false,
				showBullets: false,
			})
			.start();
		}
	}
}
