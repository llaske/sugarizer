define(function () {

    'use strict';

    var env = {};

    env.getEnvironment = function (callback) {
        // FIXME: we assume this code runs on the same thread as the
        // javascript executed from sugar-toolkit-gtk3 (python)

        if (env.isSugarizer()) {
            var getUrlParameter = function(name) {
                var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
                return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
            };
            window.top.sugar = {};
            window.top.sugar.environment = {
				activityId: getUrlParameter("aid"),
				activityName: getUrlParameter("n"),
				bundleId: getUrlParameter("a"),
				objectId: getUrlParameter("o"),
				sharedId: getUrlParameter("s"),
				help: getUrlParameter("h"),
				standAlone: getUrlParameter("sa")
			};
			if (typeof chrome != 'undefined' && chrome.app && chrome.app.runtime) {
				chrome.storage.local.get('sugar_settings', function(values) {
					window.top.sugar.environment.user = JSON.parse(values.sugar_settings);
					callback(null, window.top.sugar.environment);
				});
			} else {
				window.top.sugar.environment.user = JSON.parse(localStorage.sugar_settings);
				setTimeout(function () {
					callback(null, window.top.sugar.environment);
				}, 0);
			}
        } else if (env.isStandalone()) {
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

    env.getHost = function() {
        return window.location.hostname;
    };

    env.isStandalone = function () {
		var webActivityURLScheme = "activity:";
        var fileURLScheme = "file:";
        var currentURLScheme = env.getURLScheme();

        // the control of hostname !== '0.0.0.0' is used
        // for compatibility with F18 and webkit1
        return currentURLScheme !== webActivityURLScheme &&
			currentURLScheme !== fileURLScheme &&
			window.location.hostname !== '0.0.0.0';
    };

    env.isSugarizer = function() {
		// HACK: If in Chrome App automatic deduction that in Sugarizer
		if (typeof chrome != 'undefined' && chrome.app && chrome.app.runtime) {
			return true;
        } else if (typeof(Storage)!=="undefined" && typeof(window.localStorage)!=="undefined") {
            try {
                return (window.localStorage.getItem('sugar_settings') !== null);
            } catch(err) {
                return false;
            }
        }
        return false;
    };

    env.isSugarizerOS = function() {
	if (typeof window.sugarizerOS != 'undefined')
	    return true;
	return false;
    }

    return env;
});
