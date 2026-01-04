
// Interface to User
define([], function() {

	var user = {};

	// Convert user fields to math local storage format in v1
	let convertFields = function(user) {
		user.colorvalue = user.color;
		user.color = sugarizer.modules.xocolor.findIndex(user.colorvalue);
		user.privateJournal = user.private_journal;
		user.sharedJournal = user.shared_journal;
		delete user.private_journal;
		delete user.shared_journal;
		user.activities = sugarizer.modules.activities.get();
		user.networkId = user._id;
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

	// Get server information
	user.getServerInformation = function() {
		let settings = sugarizer.modules.settings.getUser();
		return settings && settings.server ? settings.server : null;
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
	user.signup = async function(baseurl, name, password, color) {
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

		await sugarizer.modules.activities
			.load()
			.catch((e) => console.error(e));
		signupData.favorites = sugarizer.modules.activities.getFavoritesName();
		signupData.activities = sugarizer.modules.activities.get();

		// In the app, create the user locally
		if (sugarizer.getClientType() === sugarizer.constant.appType && (!baseurl || baseurl.length === 0)) {
			signupData.colorvalue = signupData.color;
			signupData.color = sugarizer.modules.xocolor.findIndex(signupData.colorvalue);
			signupData.options = {stats: false, sync: false};
			signupData.server = {url: ""};
			sugarizer.modules.settings.setUser(signupData);
			return;
		}

		// Create user on the server
		const user = await sugarizer.modules.server
			.postUser(signupData, baseurl)
			.catch((e) => console.error(e));
		return user;
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
					connected: true,
					...response.user,
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
	user.update = function(data, dataLocal = null) {
		return new Promise((resolve, reject) => {
			// update the user locally
			sugarizer.modules.settings.setUser(dataLocal ? dataLocal : data);

			// Update user on the server
			if (sugarizer.modules.user.isConnected()) {
				sugarizer.modules.server.putUser(null, data, sugarizer.modules.user.getServerURL()).then((user) => {
					sugarizer.modules.settings.setUser(data);
					resolve(user);
				}, (error) => {
					reject(error);
				});
			} else {
				resolve(sugarizer.modules.settings.getUser());
			}
		});
	}

	// Logout user
	user.logout = function() {
		return new Promise((resolve, reject) => {
			if (sugarizer.getClientType() === sugarizer.constant.webAppType || !sugarizer.modules.user.isConnected()) {
				resolve();
				return;
			}

			// Remove server url settings
			let data = sugarizer.modules.settings.getUser();
			data.server = {url: ""};
			data.token = undefined;
			sugarizer.modules.settings.setUser(data);
			resolve();
		});
	}

	return user;
});
