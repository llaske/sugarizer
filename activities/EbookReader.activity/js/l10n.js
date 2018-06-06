

// Localization component
var Localization = {
	template: '<div/>',
	data: function() {
		return {
			l10n: null
		}
	},
	mounted: function() {
		var vm = this;
		require(["sugar-web/env", "webL10n"], function (env, webL10n) {
			env.getEnvironment(function(err, environment) {
				vm.l10n = webL10n;
				var defaultLanguage = (typeof chrome != 'undefined' && chrome.app && chrome.app.runtime) ? chrome.i18n.getUILanguage() : navigator.language;
				var language = environment.user ? environment.user.language : defaultLanguage;
				webL10n.language.code = language;
console.log(webL10n.language.code);
				window.addEventListener("localized", function() {
					vm.$emit("localized");
				});
			});
		});
	},
	methods: {
		get: function(str) {
console.log(this.l10n.language.code)
			return this.l10n.get(str);
		}
	}
}
