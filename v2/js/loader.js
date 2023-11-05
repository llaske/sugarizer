// Rebase require directory
requirejs.config({
	baseUrl: "lib",
	paths: {
		activity: "../js"
	}
});

// Load modules
let sugarizer = {
	modules: {},
};
requirejs(["xocolor"], function(xocolor) {
	sugarizer.modules.xocolor = xocolor;
});