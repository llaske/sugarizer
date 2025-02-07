// requirejs.config({
// 	baseUrl: "lib",
// 	paths: {
// 		activity: "../js"
// 	}
// });

requirejs.config({
    baseUrl: "lib",
    paths: {
        activity: "../js"
    }
});

// Show loading indicator
console.log("Loading app...");

requirejs(["activity/app"], function(app) {
    // Hide loading indicator and log success
    console.log("App loaded successfully!");
}, function(error) {
    // Hide loading indicator and log error
    console.error("Failed to load app:", error);
});


requirejs(["activity/app"]);
