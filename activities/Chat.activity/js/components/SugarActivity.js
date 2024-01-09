const SugarActivity = {
	name: "SugarActivity",
	render() {},
	data: function () {
		return {
			activity: null,
			environment: null,
		};
	},
	created: function () {
		var vm = this;
		requirejs(["sugar-web/activity/activity", "sugar-web/env"], function (activity, env) {
			vm.activity = activity;
			env.getEnvironment(function (err, environment) {
				vm.environment = environment;
				activity.setup();
				vm.$emit("initialized");
			});
		});
	},
	methods: {
		getActivity: function () {
			return this.activity;
		},

		getEnvironment: function () {
			return this.environment;
		},
	},
};
