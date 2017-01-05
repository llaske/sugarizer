var l10n_s;

requirejs.config({
	baseUrl: "lib",
	paths: {
		activity: "../js"
	}
});

requirejs(["activity/activity"]);

requirejs(["webL10n","sugar-web/env","moment-with-locales.min","sugar-web/datastore"], function(l10n, env, moment,datastore) {
	l10n_s = l10n; //global declaration of translate interface

	datastore.localStorage.load(function() {
		getSettings(function(settings) { //globally setting language from sugar settings
			l10n_s.language.code = settings.language;
			moment.locale(settings.language);
		});
	});

	function getSettings(callback) {
		var defaultSettings = {
			name: "",
			language: (typeof chrome != 'undefined' && chrome.app && chrome.app.runtime) ? chrome.i18n.getUILanguage() : navigator.language
		};
		if (!env.isSugarizer()) {
			callback(defaultSettings);
			return;
		}
		loadedSettings = datastore.localStorage.getValue('sugar_settings');
		callback(loadedSettings);
	}
});
