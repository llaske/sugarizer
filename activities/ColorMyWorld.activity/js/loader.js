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

requirejs(["l10n/l10n","sugar-web/env","sugar-web/datastore"], function(l10n, env) {
	l10n_s = document.webL10n; //global declaration of translate interface

	env.getEnvironment(function(err, environment) {
		var defaultLanguage = (typeof chrome != 'undefined' && chrome.app && chrome.app.runtime) ? chrome.i18n.getUILanguage() : navigator.language;
		var language = environment.user ? environment.user.language : defaultLanguage;
		l10n_s.setLanguage(language);
		console.log(">>"+language);
	});
});
