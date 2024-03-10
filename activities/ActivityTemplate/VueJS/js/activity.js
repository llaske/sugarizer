// Rebase require directory
requirejs.config({
	baseUrl: "lib",
	paths: {
		activity: "../js"
	}
});

// Vue main app
const app = Vue.createApp({
	components: {
		"sugar-activity": SugarActivity,
		"sugar-toolbar": SugarToolbar,
		"sugar-toolitem": SugarToolitem,
	},

	data: function () {
		return {};
	},
	methods: {},
});

app.mount("#app");
