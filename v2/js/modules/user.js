
// Interface to User
define([], function() {

	var user = {};

	// Check if user exists on the server
	user.checkIfExists = function(baseurl, name) {
		return new Promise((resolve, reject) => {
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
			}

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
				const data = {
					"token": {
						"x_key": response.user._id,
						"access_token": response.token,
					},
					...response.user
				}
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
			sugarizer.modules.server.getUser().then((user) => {
				const data = {
					"token": {
						"x_key": sugarizer.modules.server.getToken().x_key,
						"access_token": sugarizer.modules.server.getToken().access_token,
					},
					...user
				}
				sugarizer.modules.settings.setUser(data);
				resolve(user);
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