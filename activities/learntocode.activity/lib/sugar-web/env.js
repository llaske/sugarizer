define(function () {

    'use strict';

    var env = {};

    env.getEnvironment = function (callback) {
        // FIXME: we assume this code runs on the same thread as the
        // javascript executed from sugar-toolkit-gtk3 (python)

        if (env.isStandalone()) {
            setTimeout(function () {
                callback(null, {});
            }, 0);
        } else {
            var environmentCallback = function () {
                callback(null, window.top.sugar.environment);
            };

            if (window.top.sugar) {
                setTimeout(function () {
                    environmentCallback();
                }, 0);
            } else {
                window.top.sugar = {};
                window.top.sugar.onEnvironmentSet = function () {
                    environmentCallback();
                };
            }
        }
    };

    env.getObjectId = function (callback) {
        env.getEnvironment(function (error, environment) {
            callback(environment.objectId);
        });
    };

    env.getURLScheme = function () {
        return window.location.protocol;
    };

    env.isStandalone = function () {
        var webActivityURLScheme = "activity:";
        var currentURLScheme = env.getURLScheme();

        return currentURLScheme !== webActivityURLScheme;
    };

    return env;
});
