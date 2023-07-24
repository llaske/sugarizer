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
			SugarL10n: null,
			l10n: {
				mainscreen: {
					stringSearchHome: "",
				},
				firstscreen: {
					stringNewUser: "",
					stringLogin: "",
					stringServerUrl: "",
					stringName: "",
					stringPassword: "",
					stringClickToColor: "",
					stringCookieConsent: "",
					stringPolicyLink: "",
					stringBack: "",
					stringNext: "",
					stringDone: "",
					stringUserAlreadyExist: "",
					stringInvalidUser: "",
				},
			},
			isFirstScreen: null,
			token: null,
		}
	},
	mounted() {
		this.checkUserLoggedIn();
		this.SugarL10n = this.$refs.SugarL10n;
	},
	methods: {
		localized(){
			this.SugarL10n.localize(this.l10n.mainscreen);
			this.SugarL10n.localize(this.l10n.firstscreen);
		},

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