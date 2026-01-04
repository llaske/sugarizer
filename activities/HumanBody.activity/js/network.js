// Initialize namespace first to avoid "not defined" errors
if (typeof HumanBody === 'undefined') {
	HumanBody = {};
}

HumanBody.NetworkCheck = {
	connected: false,
	remoteBaseUrl: "https://dev.sugarizer.org/",
	checkCompleted: false,

	// Check if local models are available by trying to load a ping file
	check: function (callback) {
		const self = this;
		const timestamp = new Date().getTime();
		const pingUrl = `models/_ping.png?${timestamp}`;
		const pingImage = new Image();

		pingImage.onload = () => {
			self.connected = true;
			self.checkCompleted = true;
			if (callback) callback(self.connected);
		};

		pingImage.onerror = () => {
			self.connected = false;
			self.checkCompleted = true;
			if (callback) callback(self.connected);
		};

		pingImage.src = pingUrl;
		
		// Timeout fallback in case of hanging requests
		setTimeout(() => {
			if (!self.checkCompleted) {
				self.connected = false;
				self.checkCompleted = true;
				if (callback) callback(self.connected);
			}
		}, 5000);
	},

	// Get the base URL for models (empty if local, remote URL if not local)
	getModelsBaseUrl: function () {
		if (this.connected) {
			return ""; // Local files available
		} else {
			// Remote URL - configured to point to Sugarizer server
			return this.remoteBaseUrl + "activities/HumanBody.activity/";
		}
	},

	// Set remote base URL (typically the Sugarizer server URL)
	setRemoteBaseUrl: function (url) {
		this.remoteBaseUrl = url.endsWith('/') ? url : url + '/';
	},

	// Get connection status
	isConnected: function () {
		return this.connected;
	}
};