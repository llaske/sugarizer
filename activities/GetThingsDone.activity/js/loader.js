var l10n_s;

requirejs.config({
    baseUrl: "lib",
    paths: {
        activity: "../js"
    }
});

requirejs(["activity/activity"]);

requirejs(["webL10n","sugar-web/env","moment-with-locales.min"], function(l10n, env, moment) {
   l10n_s = l10n; //global declaration of translate interface

   getSettings(function(settings) { //globally setting language from sugar settings
			l10n_s.language.code = settings.language;
			moment.locale(settings.language);
	});

   function getSettings(callback) {
		var defaultSettings = {
			name: "",
			language: navigator.language
		};
		if (!env.isSugarizer()) {
			callback(defaultSettings);
			return;
		}
		if (typeof chrome != 'undefined' && chrome.app && chrome.app.runtime) {
			var loadedSettings = JSON.parse(values.sugar_settings);
			chrome.storage.local.get('sugar_settings', function(values) {
				callback(loadedSettings);
			});
		} else {
			var loadedSettings = JSON.parse(localStorage.sugar_settings);
			callback(loadedSettings);
		}
	}
});
