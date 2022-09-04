// Tutorial component based on IntroJs
Vue.component('sugar-tutorial', {
	data: function () {
		return {
			l10n: {
				stringTutoPrev: 'Prev',
				stringTutoNext: 'Next',
			}
		}
	},
	mounted() {
		let vm = this;
		if (this.$root.$refs.SugarL10n) {
			this.$root.$refs.SugarL10n.$on('localized', function () {
				vm.$root.$refs.SugarL10n.localize(vm.l10n);
			});
		}
	},
	methods: {
		show: function (steps) {
			var vm = this;
			steps = steps.filter((step) =>  !('element' in step) || ((step.element).length && document.querySelector(step.element) && document.querySelector(step.element).style.display != 'none'));
			introJs().setOptions({
				tooltipClass: 'customTooltip',
				steps: steps,
				prevLabel: this.l10n.stringTutoPrev,
				nextLabel: this.l10n.stringTutoNext,
				exitOnOverlyClick: false,
				nextToDone: false,
				showBullets: false
			}).onchange((element) => {
				const step = steps.find((step) => step.element === `#${element.id}`);
				if(step && step.onShow){
					step.onShow();
				}
			}).onbeforechange((element) => {
				const previousStepIndex = steps.indexOf(steps.find((step) => step.element === `#${element.id}`)) - 1;
				const previousStep = steps[previousStepIndex];
				if(previousStep && previousStep.onHide){
					previousStep.onHide();
				}
			}).start();
		}
	}
});
