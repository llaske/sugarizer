// Tutorial component based on bootstrap tour
Vue.component('sugar-tutorial', {
	data: function () {
		return {
			l10n: {
				stringTutoPrev: '',
				stringTutoNext: '',
				stringTutoEnd: '',
			}
		}
	},
	methods: {

		extractStrings: function (steps) {
			var vm = this;
			var needsLocalization = false;
			// Add strings to l10n object
			steps.forEach(function (step) {
				if (!(step.title in vm.l10n)) {
					vm.l10n[step.title] = '';
					needsLocalization = true;
				}
				if (!(step.content in vm.l10n)) {
					vm.l10n[step.content] = '';
					needsLocalization = true;
				}
			});
			// Localize the l10n object if needed
			if (needsLocalization) {
				this.$root.$refs.SugarLocalization.localize(this.l10n);
				needsLocalization = false;
			}
			// Replace values in the steps
			steps.forEach(function (step) {
				step.title = vm.l10n[step.title];
				step.content = vm.l10n[step.content];
			});
		},

		show: function (steps) {
			this.extractStrings(steps);

			var vm = this;
			var tour = new Tour({
				template: `
				<div class='popover tour'>
					<div class='arrow'></div>
					<h3 class='popover-title tutorial-title'></h3>
					<div class='popover-content'></div>
					<div class='popover-navigation' style='display: flex; flex-wrap:wrap; justify-content: center; align-items: center'>
						<div class='tutorial-prev-icon tutorial-icon-button' data-role='prev'>
							<div class='tutorial-prev-icon1 web-activity'>
								<div class='tutorial-prev-icon2 web-activity-icon'></div>
								<div class='tutorial-prev-icon3 web-activity-disable'></div>
							</div>
							<div class='tutorial-icon-text'>${this.l10n.stringTutoPrev}</div>
						</div>
						<span data-role='separator' style='margin: 4px'>|</span>
						<div class='tutorial-next-icon tutorial-icon-button' data-role='next'>
							<div class='tutorial-next-icon1 web-activity'>
								<div class='tutorial-next-icon2 web-activity-icon'></div>
								<div class='tutorial-next-icon3 web-activity-disable'></div>
							</div>
							<div class='tutorial-icon-text'>${this.l10n.stringTutoNext}</div>
						</div>
						<div class='tutorial-end-icon tutorial-icon-button' data-role='end'>
							<div class='tutorial-end-icon1 web-activity'>
								<div class='tutorial-end-icon2 web-activity-icon'></div>
								<div class='tutorial-end-icon3 web-activity-disable'></div>
							</div>
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
