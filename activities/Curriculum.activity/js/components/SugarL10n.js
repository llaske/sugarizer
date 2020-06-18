// Localization component
Vue.component('sugar-localization', {
	template: '<div/>',
	data: function () {
		return {
			l10n: null,
			code: null,
			dictionary: null,
			eventReceived: false,
			activityInitialized: false,
		}
	},
	computed: {
		readyToEmit: function () {
			return (this.dictionary != null) && this.activityInitialized;
		}
	},
	watch: {
		readyToEmit: function (newVal, oldVal) {
			if (newVal) {
				this.$emit("localized");
				this.eventReceived = true;
			}
		}
	},
	mounted: function () {
		var vm = this;
		if (vm.l10n == null) {
			requirejs(["sugar-web/env", "webL10n"], function (env, webL10n) {
				env.getEnvironment(function (err, environment) {
					vm.l10n = webL10n;
					var defaultLanguage = (typeof chrome != 'undefined' && chrome.app && chrome.app.runtime) ? chrome.i18n.getUILanguage() : navigator.language;
					var language = environment.user ? environment.user.language : defaultLanguage;
					webL10n.language.code = language;
					window.addEventListener("localized", function () {
						if (!vm.eventReceived) {
							vm.code = language;
							vm.dictionary = vm.l10n.dictionary;
						} else if (webL10n.language.code != language) {
							webL10n.language.code = language;
						}
					});
				});
			});
			//Activity initialization check
			var SugarActivity = vm.$root.$children.find(function(child) {
				return child.$options.name == 'SugarActivity';
			});
			SugarActivity.$on('initialized', function () {
				vm.activityInitialized = true;
			});
		}
	},
	methods: {
		// Get a single string with parameters
		get: function (str, params) {
			return this.l10n.get(str, params);
		},

		// Get a single string value
		getString: function (str) {
			if (!this.dictionary) {
				return str;
			}
			var item = this.dictionary[str];
			if (!item || !item.textContent) {
				return str;
			}
			return item.textContent;
		},

		// Get values for a set of strings on the form of {stringKey1: '', stringKey2: '', ...}
		localize: function (strings) {
			var vm = this;
			Object.keys(strings).forEach(function (key, index) {
				strings[key] = vm.getString(key.substr(6));
			});
		}
	}
});
