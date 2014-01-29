requirejs.config({
	baseUrl: "lib",
	paths: {
		activity: "../js"
	}
});

requirejs(["activity/app"]);
