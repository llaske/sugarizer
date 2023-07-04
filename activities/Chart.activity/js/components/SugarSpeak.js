// Speak component based on Speak activity
Vue.component('sugar-speak', {
	template: `
		<script src="../Speak.activity/mespeak.js" type="text/javascript"></script>
	`,
	data: function () {
		return {
			configDone: false,
			userLanguage: '',
			speed: 150,
			pitch: 50
		}
	},
	mounted() {
		var vm = this;
		requirejs(["sugar-web/env"], function(env) {
			env.getEnvironment(function(err, environment) {
				var defaultLanguage = (typeof window.chrome !== 'undefined' && window.chrome.app && window.chrome.app.runtime) ? window.chrome.i18n.getUILanguage() : navigator.language;
				if (!environment.user) {
					environment.user = { language: defaultLanguage };
				}
				vm.userLanguage = environment.user.language;
			});
		});
	},
	methods: {
		speech: function(text, language) {
			var vm = this;
			if (!vm.configDone) {
				vm.configDone = true;
				meSpeak.loadConfig("../Speak.activity/mespeak_config.json");
			}
			if (!language) {
				language = vm.userLanguage;
			}
			meSpeak.loadVoice(`../Speak.activity/voices/${language}.json`, function() {
				meSpeak.speak(text, {speed: vm.speed, pitch: vm.pitch}, function() {
					vm.$emit('played');
				});
			});
		}
	}
});
