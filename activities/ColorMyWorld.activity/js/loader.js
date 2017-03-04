var l10n_s;

//This file corresponds to app.js in volo application
//3rd party dependencies, like jQuery -> lib
requirejs.config({
    baseUrl: "lib",
    paths: {
        activity: "../js",
		l10n: "../js"
    }
});

//application logic goes in ../js/activity.js
requirejs(["activity/activity"]);

requirejs(["l10n/l10n","sugar-web/env","sugar-web/datastore"], function(l10n, env, datastore) {
	l10n_s = document.webL10n; //global declaration of translate interface

	datastore.localStorage.load(function() {
		getSettings(function(settings) { //globally setting language from sugar settings
			l10n_s.setLanguage(settings.language);
			console.log(">>"+settings.language);
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
