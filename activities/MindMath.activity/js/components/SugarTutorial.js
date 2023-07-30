// Tutorial component based on bootstrap tour
const SugarTutorial= {
	render() {},
	data: function () {
		return {
			l10n: {
				stringTutoPrev: 'Prev',
				stringTutoNext: 'Next',
			}
		}
	},
	methods: {
		activityLocalized: function (localize) {
			localize(this.l10n);
		},

		show: function (steps) {
			steps= steps.filter(function (obj) {
				return !('element' in obj) || ((obj.element).length && document.querySelector(obj.element) && document.querySelector(obj.element).style.display != 'none');
			 });
			introJs().setOptions({
				tooltipClass: 'customTooltip',
				steps: steps,
				prevLabel: this.l10n.stringTutoPrev,
				nextLabel: this.l10n.stringTutoNext,
				exitOnOverlayClick: false,
				nextToDone: false,
				showBullets: false
			  }).start();
		}
	}
};
