// Tutorial component based on bootstrap tour
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
		let vm = this;
		if (this.$root.$refs.SugarL10n) {
			this.$root.$refs.SugarL10n.$on('localized', function () {
				vm.$root.$refs.SugarL10n.localize(vm.l10n);
			});
		}
	},
	methods: {
		show: function (steps) {
			steps = steps.filter(function (obj) {
				return !('element' in obj) || ((obj.element).length && document.querySelector(obj.element) && document.querySelector(obj.element).style.display != 'none');
			})
			var isSingleStepTut = steps.length === 1;
			if(isSingleStepTut)	steps.push({});

			introJs().setOptions({
				tooltipClass: 'customTooltip',
				steps: steps,
				prevLabel: this.l10n.stringTutoPrev,
				nextLabel: this.l10n.stringTutoNext,
				exitOnOverlayClick: false,
				nextToDone: false,
				showBullets: false,
				hidePrev: false,
			}).onafterchange(() => {
				var btn = document.querySelector(".introjs-nextbutton");
				if (isSingleStepTut && btn) {
					btn.classList.add("introjs-disabled");
					btn.style.pointerEvents = "none";
					document.querySelector(".introjs-tooltipbuttons").style.cursor = "auto";
				}
			}).start();
		}
	}
});
