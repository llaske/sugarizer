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
			requirejs(["xocolor","server","settings"], function(xocolor, server, settings) {
				sugarizer.modules.xocolor = xocolor;
				sugarizer.modules.server = server;
				sugarizer.modules.settings = settings;
				resolve();
			});
		});
	}
};
