const SugarPopup = {
	render() {},
	data: function () {
		return {
			humane: null,
		};
	},
	created() {
		var vm = this;
		requirejs(["humane"], function (humane) {
			vm.humane = humane;
		});
	},
	methods: {
		log(text) {
			this.humane.log(text);
		},
	},
};
