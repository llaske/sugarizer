// Rebase require directory
requirejs.config({
	baseUrl: "lib",
	paths: {
		activity: "../js"
	}
});

const app = Vue.createApp({
	components: {
		"sugar-localization": SugarL10n,
		"firstscreen": FirstScreen,
		"mainscreen": MainScreen,
	},
	data() {
		return {
			isFirstScreen: null,
			token: null,
		}
	},
	
	created: function () {
		this.checkUserLoggedIn();
	},

	methods: {
		setIsFirstScreen(value) {
			this.isFirstScreen = value;
		},

		checkUserLoggedIn() {
			if (localStorage.getItem("sugar_settings") !== null && localStorage.getItem("sugar_settings") !== undefined && localStorage.getItem("sugar_settings") !== "{}") {
				this.token = JSON.parse(localStorage.getItem("sugar_settings")).token;
				axios.get("/api/v1/users/" + this.token.x_key, {
					headers: {
						'x-key': this.token.x_key,
						'x-access-token': this.token.access_token,
					},
				}).then((response) => {
					if (response.status == 200) {
						this.setIsFirstScreen(false);
					} else {
						this.setIsFirstScreen(true);
					}
				}).catch((error) => {
					console.log("Error: ", error);
					this.setIsFirstScreen(true);
				});
			} else {
				this.setIsFirstScreen(true);
			}
		},
	},
});

app.mount('#app');