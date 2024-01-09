// Tutorial component based on introJs tour
Vue.component('sugar-tutorial', {
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
		this.introJs = introJs();
		let vm = this;
		if (this.$root.$refs.newSugarL10n) {
			this.$root.$refs.newSugarL10n.$on('localized', function () {
				vm.$root.$refs.newSugarL10n.localize(vm.l10n);
			});
		}
	},
	methods: {
		show: function (steps) {
			steps= steps.filter(function (obj) {
				return !('element' in obj) || ((obj.element).length && document.querySelector(obj.element) && document.querySelector(obj.element).style.display != 'none');
			});
			this.introJs.setOptions({
				tooltipClass: 'customTooltip',
				steps: steps,
				prevLabel: this.l10n.stringTutoPrev,
				nextLabel: this.l10n.stringTutoNext,
				exitOnOverlayClick: false,
				nextToDone: false,
				showBullets: false
			}).start();
		},
	}
});