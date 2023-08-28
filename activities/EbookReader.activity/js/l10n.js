

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
			requirejs(["sugar-web/env", "l10n"], function (env, l10n) {
				env.getEnvironment(function(err, environment) {
					vm.l10n = l10n;
					var defaultLanguage = (typeof chrome != 'undefined' && chrome.app && chrome.app.runtime) ? chrome.i18n.getUILanguage() : navigator.language;
					var language = environment.user ? environment.user.language : defaultLanguage;
					l10n.init(language);					window.addEventListener("localized", function() {
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
		get: function(str) {
			if (!this.dictionary) {
				return str;
			}
			var item = this.dictionary[str];
			if (!item || !item.textContent) {
				return str;
			}
			return item.textContent;
		}
	}
}