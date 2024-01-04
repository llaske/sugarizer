
// Interface to User
define([], function() {

	var user = {};

	// Convert user fields to math local storage format in v1
	let convertFields = function(user) {
		user.colorvalue = user.color;
		user.color = sugarizer.modules.xocolor.findIndex(user.colorvalue);
		user.privateJournal = user.private_journal;
		user.sharedJournal = user.shared_journal;
		user.private_journal = undefined;
		user.shared_journal = undefined;
		user.activities = sugarizer.modules.activities.get();
		return user;
	}

	// Test if the user is connected
	user.isConnected = function() {
		// In the web, the user is always connected
		if (sugarizer.getClientType() === sugarizer.constant.webAppType) {
			return true;
		}

		// In the app, the user is connected if the server url is set
		let settings = sugarizer.modules.settings.getUser();
		return (!settings || !settings.server || !settings.server.url || settings.server.url.length == 0) ? false : true;
	}

	// Get server url
	user.getServerURL = function() {
		let settings = sugarizer.modules.settings.getUser();
		return settings && settings.server && settings.server.url ? settings.server.url : '';
	}

	// Get option
	user.getOption = function(name) {
		let settings = sugarizer.modules.settings.getUser();
		return settings && settings.options ? settings.options[name] : null;
	}

	// Get private journal
	user.getPrivateJournal = function() {
		let settings = sugarizer.modules.settings.getUser();
		return settings && settings.privateJournal ? settings.privateJournal : null;
	}

	// Get shared journal
	user.getSharedJournal = function() {
		let settings = sugarizer.modules.settings.getUser();
		return settings && settings.sharedJournal ? settings.sharedJournal : null;
	}

	// Check if user exists
	user.checkIfExists = function(baseurl, name) {
		return new Promise((resolve, reject) => {
			// In the app, only one user can be created except if the server url is set
			if (sugarizer.getClientType() === sugarizer.constant.appType && (!baseurl || baseurl.length === 0)) {
				resolve(false);
				return;
			}

			// Check on the server
			const data = {
				name: name,
				role: "student",
				beforeSignup: "true"
			};

			sugarizer.modules.server.postUser(data, baseurl).then((user) => {
				resolve(false);
			}, (error) => {
				if (error === 22) {
					resolve(true);
				} else {
					reject(error);
				}
			});
		});
	}

	// Signup user
	user.signup = function(baseurl, name, password, color) {
		return new Promise((resolve, reject) => {
			const signupData = {
				"name": `${name}`,
				"password": `${password}`,
				"color": {
					"stroke": `${color.stroke}`,
					"fill": `${color.fill}`,
				},
				"role": "student",
				"language": sugarizer.modules.i18next.language,
				"options": {stats: true, sync: true},
			}

			// In the app, create the user locally
			if (sugarizer.getClientType() === sugarizer.constant.appType && (!baseurl || baseurl.length === 0)) {
				signupData.colorvalue = signupData.color;
				signupData.color = sugarizer.modules.xocolor.findIndex(signupData.colorvalue);
				signupData.options = {stats: false, sync: false};
				signupData.server = {url: ""};
				sugarizer.modules.activities.load().then((activities) => {
					signupData.activities = activities;
					sugarizer.modules.settings.setUser(signupData);
					resolve(signupData);
				}, (error) => {
					reject(error);
				});
				return;
			}

			// Create user on the server
			sugarizer.modules.server.postUser(signupData, baseurl).then((user) => {
				resolve(user);
			}, (error) => {
				reject(error);
			}, baseurl);
		});
	}

	// Login user
	user.login = function(baseurl, name, password) {
		return new Promise((resolve, reject) => {
			const loginData = {
				"name": `${name}`,
				"password": `${password}`,
			}

			sugarizer.modules.server.loginUser(loginData, baseurl).then((response) => {
				let data = {
					"token": {
						"x_key": response.user._id,
						"access_token": response.token,
					},
					...response.user
				}
				data = convertFields(data);
				sugarizer.modules.server.getServerInformation(baseurl).then((server) => {
					data.server = server;
					sugarizer.modules.settings.setUser(data);
					resolve(data);
				});
			}, (error) => {
				reject(error);
			});
		});
	}

	// Get user information
	user.get = function() {
		return new Promise((resolve, reject) => {
			// In the app, get the user locally except if the user is connected to a server
			if (sugarizer.getClientType() === sugarizer.constant.appType && !sugarizer.modules.user.isConnected()) {
				resolve(sugarizer.modules.settings.getUser());
				return;
			}

			// Get user from the server
			sugarizer.modules.server.getUser(null, sugarizer.modules.user.getServerURL()).then((user) => {
				let data = {
					"token": {
						"x_key": sugarizer.modules.server.getToken().x_key,
						"access_token": sugarizer.modules.server.getToken().access_token,
					},
					...user
				}
				data = convertFields(data);
				let server = sugarizer.modules.settings.getUser().server;
				sugarizer.modules.server.getServerInformation(server ? server.url : '').then((server) => {
					data.server = server;
					sugarizer.modules.settings.setUser(data);
					resolve(data);
				});
			}, (error) => {
				reject(error);
			});
		});
	}
	
	// Update user information
	user.update = function(data) {
		return new Promise((resolve, reject) => {
			// In the app, set the user locally except if the user is connected to a server
			if (sugarizer.getClientType() === sugarizer.constant.appType && !sugarizer.modules.user.isConnected()) {
				sugarizer.modules.settings.setUser(data);
				resolve(sugarizer.modules.settings.getUser());
				return;
			}

			// Update user on the server
			sugarizer.modules.server.putUser(null, data).then((user) => {
				resolve(user);
			}, (error) => {
				reject(error);
			});
		});
	}

	return user;
});