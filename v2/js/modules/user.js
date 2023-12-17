
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

	// Check if user exists
	user.checkIfExists = function(baseurl, name) {
		return new Promise((resolve, reject) => {
			// In the app, only one user can be created
			if (sugarizer.getClientType() === sugarizer.constant.appType) {
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
					reject(false);
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
			}

			// In the app, create the user locally
			if (sugarizer.getClientType() === sugarizer.constant.appType) {
				sugarizer.modules.settings.setUser(signupData);
				resolve(signupData);
				return;
			}

			// Create user on the server
			sugarizer.modules.server.postUser(signupData).then((user) => {
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
				sugarizer.modules.settings.setUser(data);
				resolve(data);
			}, (error) => {
				reject(error);
			});
		});
	}

	// Get user information
	user.get = function() {
		return new Promise((resolve, reject) => {
			// In the app, get the user locally
			if (sugarizer.getClientType() === sugarizer.constant.appType) {
				resolve(sugarizer.modules.settings.getUser());
				return;
			}

			// Get user from the server
			sugarizer.modules.server.getUser().then((user) => {
				let data = {
					"token": {
						"x_key": sugarizer.modules.server.getToken().x_key,
						"access_token": sugarizer.modules.server.getToken().access_token,
					},
					...user
				}
				data = convertFields(data);
				sugarizer.modules.settings.setUser(data);
				resolve(data);
			}, (error) => {
				reject(error);
			});
		});
	}
	
	// Update user information
	user.update = function(data) {
		return new Promise((resolve, reject) => {
			sugarizer.modules.server.putUser(null, data).then((user) => {
				resolve(user);
			}, (error) => {
				reject(error);
			});
		});
	}

	return user;
});