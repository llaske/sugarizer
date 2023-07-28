// Tutorial component based on bootstrap tour
const SugarTutorial= {
	render() {},
	data: function () {
		return {
			l10n: {
				stringTutoPrev: 'Prev',
				stringTutoNext: 'Next',
				stringTutoEnd: 'End',
			}
		}
	},
	mounted() {
		let vm = this;
		var localizeCheck = function() {
			var SugarL10n = vm.$root.$refs.SugarL10n;
			if (SugarL10n.activityInitialized) {
				SugarL10n.localize(vm.l10n)
			} else {
				window.setTimeout(localizeCheck, 100);
			}
		}
		window.setTimeout(localizeCheck, 100);
	},
	methods: {
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
