requirejs.config({
    baseUrl: "lib",
    paths: {
        activity: "../js"
    },
    urlArgs: "v=" + Date.now()
});

requirejs(["activity/activity"]);
