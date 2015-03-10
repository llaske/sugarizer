

// Chrome App entry point, needed only when in Chrome App
chrome.app.runtime.onLaunched.addListener(function() {
	// Create window
	var mainwin = chrome.app.window.create('../sandbox.html', {
		id: "mainwin",
		state: "fullscreen"
	},function(created) {
	});
});
