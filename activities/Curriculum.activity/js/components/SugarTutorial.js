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
			var vm = this;
			var tour = new Tour({
				template: `
				<div class='popover tour'>
					<div class='arrow'></div>
					<h3 class='popover-title tutorial-title'></h3>
					<div class='popover-content'></div>
					<div class='popover-navigation' style='display: flex; flex-wrap:wrap; justify-content: center; align-items: center'>
						<div class='tutorial-prev-icon tutorial-icon-button' data-role='prev'>
							<div class='tutorial-prev-icon1 web-activity'></div>
							<div class='tutorial-icon-text'>${this.l10n.stringTutoPrev}</div>
						</div>
						<span data-role='separator' style='margin: 4px'>|</span>
						<div class='tutorial-next-icon tutorial-icon-button' data-role='next'>
							<div class='tutorial-next-icon1 web-activity'></div>
							<div class='tutorial-icon-text'>${this.l10n.stringTutoNext}</div>
						</div>
						<div class='tutorial-end-icon tutorial-icon-button' data-role='end'>
							<div class='tutorial-end-icon1 web-activity'></div>
							<div class='tutorial-icon-text'>${this.l10n.stringTutoEnd}</div>
						</div>
					</div>
				</div>`,
				storage: false,
				backdrop: true,
				steps: steps,
				onStart: function (tour) {
					vm.$emit('start', tour);
				},
				onShow: function (tour) {
					vm.$emit('show', tour);
				},
				onEnd: function (tour) {
					vm.$emit('end', tour);
				},
			});
			tour.init();
			tour.start(true);
		}
	}
});
