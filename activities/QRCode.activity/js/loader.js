var l10n_s;

requirejs.config({
    baseUrl: "lib",
    paths: {
        activity: "../js"
    }
});

requirejs(["activity/activity"]);

requirejs(["webL10n","sugar-web/env","sugar-web/datastore"], function(l10n, env, datastore) {
    l10n_s = l10n;

    datastore.localStorage.load(function() {
        getSettings(function(settings) {
            l10n_s.language.code = settings.language;
        });
    });

    function getSettings(callback) {
        var defaultSettings = {
            language: (typeof chrome != 'undefined' && chrome.app && chrome.app.runtime) ? chrome.i18n.getUILanguage() : navigator.language
        };
        if (!env.isSugarizer()) {
            callback(defaultSettings);
            return;
        }
        callback(datastore.localStorage.getValue('sugar_settings'));
    }
})