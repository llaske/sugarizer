// HTML5 local storage handling

LocalStorage = {};

// Test if HTML5 storage is available
LocalStorage.test = function() {
	return (typeof(Storage)!=="undefined" && typeof(window.localStorage)!=="undefined");
};
	
// Set a value in the storage
LocalStorage.setValue = function(key, value) {
	if (this.test()) {
		try {
			window.localStorage.setItem(key, JSON.stringify(value));
		} catch(err) {
		}
	}
};
	
// Get a value in the storage
LocalStorage.getValue = function(key) {
	if (this.test()) {
		try {
			return JSON.parse(window.localStorage.getItem(key));
		} catch(err) {
			return null;
		}
	}
	return null;
};