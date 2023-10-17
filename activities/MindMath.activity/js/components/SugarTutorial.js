const SugarTutorial = {
	render() {},
	created() {
		this.l10n = {
			stringTutoPrev: "Prev",
			stringTutoNext: "Next",
		};

		const vm = this;
		window.addEventListener(
			"localized",
			function (e) {
				e.detail.l10n.localize(vm.l10n);
			},
			{ once: true },
		);
	},
	methods: {
		show: function (steps) {
			steps = steps.filter(function (obj) {
				return !("element" in obj) || (obj.element.length && document.querySelector(obj.element) && document.querySelector(obj.element).style.display != "none");
			});
			introJs()
				.setOptions({
					tooltipClass: "customTooltip",
					steps: steps,
					prevLabel: this.l10n.stringTutoPrev,
					nextLabel: this.l10n.stringTutoNext,
					exitOnOverlayClick: false,
					nextToDone: false,
					showBullets: false,
				})
				.start();
		},
	},
};
