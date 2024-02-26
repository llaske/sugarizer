requirejs.config({
    baseUrl: "lib",
    paths: {
        activity: "../js",
        examples: "../examples",
        template: "../template.html"
    }
});

requirejs(["activity/activity"]);
