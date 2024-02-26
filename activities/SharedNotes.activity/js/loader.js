var l10n_s;

requirejs.config({
    baseUrl: "lib",
    paths: {
        activity: "../js"
    }
});

requirejs(["activity/activity"]);

requirejs(["webL10n","sugar-web/env","sugar-web/datastore"], function(l10n, env,datastore) {
	l10n_s = l10n;
});
