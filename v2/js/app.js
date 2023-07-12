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
				stringSearchHome: "",
			},
			isFirstScreen: true,
		}
	},
	mounted() {
		this.SugarL10n = this.$refs.SugarL10n;
	},
	methods: {
		localized(){
			this.SugarL10n.localize(this.l10n);
			console.log("this.l10n: ", this.l10n.stringSearchHome);
			document.getElementById("newuser_text").innerText = this.SugarL10n.get("NewUser");
			document.getElementById("login_text").innerText = this.SugarL10n.get("Login");
			document.getElementById("serverurl").innerText = this.SugarL10n.get("ServerUrl");
			document.getElementById("name").innerText = this.SugarL10n.get("Name");
			document.getElementById("pass_text").innerText = this.SugarL10n.get("Password");
			document.getElementById("buddyicon_text").innerText = this.SugarL10n.get("ClickToColor");
			document.getElementById("loginscreen_cookietext").innerHTML = this.SugarL10n.get("CookieConsent");
			document.getElementById("loginscreen_policytext").innerHTML = this.SugarL10n.get("PolicyLink", {url: "https://sugarizer.org/policy.html"});
			document.getElementById("back-btn").nextElementSibling.innerText = this.SugarL10n.get("Back");
			document.getElementById("next-btn").nextElementSibling.innerText = this.SugarL10n.get("Next");
			document.getElementById("done-btn").nextElementSibling.innerText = this.SugarL10n.get("Done");
		},

		setIsFirstScreen(value) {
			this.isFirstScreen = value;
		},
	},
});

app.mount('#app');