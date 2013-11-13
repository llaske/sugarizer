define(function () {

    var env = {};

    env.getEnvironment = function (callback) {
        var sugar;

        if (window.top.sugar) {
            sugar = window.top.sugar;
        } else {
            sugar = {};
            window.top.sugar = sugar;
        }

        if (sugar.environment) {
            setTimeout(function () {
                callback(null, sugar.environment);
            }, 0);
        } else {
            sugar.onEnvironmentSet = function () {
                callback(null, sugar.environment);
            };
        }
    };

    return env;
});
