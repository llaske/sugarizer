// HACK: Force settings to empty the first time - need for Sugar web convergence
if (chrome && chrome.app && chrome.app.runtime) {
	chrome.storage.local.get('sugar_settings', function(value) {
		if (!value.sugar_settings) {
			chrome.storage.local.set({sugar_settings:JSON.stringify({})});
		}
	});
} else if (typeof(Storage)!=="undefined" && typeof(window.localStorage)!=="undefined") {
	try {
		if (window.localStorage.getItem('sugar_settings') === null) {
			 window.localStorage.setItem('sugar_settings', JSON.stringify({}));
		}
	} catch (err) {}
}