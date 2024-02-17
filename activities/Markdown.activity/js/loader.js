requirejs.config({
    baseUrl: "lib",
    paths: {
        activity: "../js",
        markdownconverter: "../lib/Markdown.Converter",
        markdowneditor: "../lib/Markdown.Editor",
        markdownsanitizer: "../lib/Markdown.Sanitizer",
    }
});

requirejs(["activity/activity"]);

requirejs(["l10n","sugar-web/env","moment-with-locales.min","sugar-web/datastore"], function(l10n, env, moment) {
	env.getEnvironment(function(err, environment) {
		var defaultLanguage = (typeof chrome != 'undefined' && chrome.app && chrome.app.runtime) ? chrome.i18n.getUILanguage() : navigator.language;
		var language = environment.user ? environment.user.language : defaultLanguage;
		l10n.init(language);
		moment.locale(language);
	});
});
