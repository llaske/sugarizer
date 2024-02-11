

// Localization component
var Localization = {
	template: '<div/>',
	data: function() {
		return {
			l10n: null,
			code: null,
			dictionary: null,
			eventReceived: false
		}
	},
	mounted: function() {
		var vm = this;
		if (vm.l10n == null) {
			requirejs(["sugar-web/env", "i18next.min"], function (env, i18next) {
				env.getEnvironment(function(err, environment) {
					vm.l10n = i18next;
					var defaultLanguage = (typeof chrome != 'undefined' && chrome.app && chrome.app.runtime) ? chrome.i18n.getUILanguage() : navigator.language;
					var language = environment.user ? environment.user.language : defaultLanguage;
					vm.l10n.init(language);
					window.addEventListener("localized", function() {
						if (!vm.eventReceived) {
							vm.code = language;
							vm.dictionary = vm.l10n.dictionary;
							vm.$emit("localized");
							vm.eventReceived = true;
						}
					});
				});
			});
		}
	},
	methods: {
		// Get a single string value
		get: function(str) {
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
		localize: function(strings) {
			var vm = this;
			Object.keys(strings).forEach(function(key, index) {
				strings[key] = vm.get(key.substr(6));
			});
		}
	}
}
