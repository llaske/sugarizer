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

	env.getEnvironment(function(err, environment) {
		var defaultLanguage = (typeof chrome != 'undefined' && chrome.app && chrome.app.runtime) ? chrome.i18n.getUILanguage() : navigator.language;
		var language = environment.user ? environment.user.language : defaultLanguage;
		l10n_s.language.code = language;
		moment.locale(language);
	});
});
