requirejs.config({
    baseUrl: "lib",
    urlArgs: "bust=" + (new Date()).getTime() + 4000,
    paths: {
        activity: "../js"
    }
});

requirejs(["activity/activity"]);
