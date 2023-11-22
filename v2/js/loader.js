// Rebase require directory
requirejs.config({
	baseUrl: "lib",
	paths: {
		activity: "../js"
	}
});

// Sugarizer context
let sugarizer = {
	modules: {},

	// Init function
	init: async function() {	
		return new Promise(function(resolve, reject) {
			// Load modules
			requirejs(["xocolor","server"], function(xocolor, server) {
				sugarizer.modules.xocolor = xocolor;
				sugarizer.modules.server = server;
				resolve();
			});
		});
	}
};
