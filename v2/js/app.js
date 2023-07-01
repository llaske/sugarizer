// Rebase require directory
requirejs.config({
	baseUrl: "lib",
	paths: {
		activity: "../js"
	}
});

const app = Vue.createApp({
	components: {
		"icon": Icon,
		"firstscreen": FirstScreen,
	},
	data() {
		return {
			isFirstScreen: true,
		}
	},
	mounted() {
	},
	methods: {
		homeClicked() {
			let location = "../index.html";
			document.location.href = location;
		},
		setIsFirstScreen(value) {
			this.isFirstScreen = value;
		},
	},
});

app.mount('#app');