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
