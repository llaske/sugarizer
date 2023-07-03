/**
 * @module FirstScreen
 * @desc This is the login screen component
 */

const LoginScreen = {
	name: 'LoginScreen',
	template: `<div class="loginscreen">
                    <form>
                        <div id="loginscreen_server" class="column" v-show="index.currentIndex === 0">
                            <div class="firstscreen_text">Server Address:</div>
                            <input ref="serverAddress" type="text" class="input_field" v-model="details.serverAddress">
                        </div>
                        <div id="loginscreen_name" class="column" v-show="index.currentIndex === 1">
                            <div class="firstscreen_text">Name:</div>
                            <input ref="nameInput" type="text" class="input_field" v-model="details.name">
                        </div>
                        <div id="loginscreen_password" class="column" v-show="index.currentIndex === 2">
                            <div class="firstscreen_text">Your Images:</div>
                            <password ref="passwordInput" ></password>
                        </div>
                        <div id="loginscreen_iconchoice" class="column" v-show="index.currentIndex === 3" >
                            <div class="firstscreen_text">Click to change color:</div>
                            <icon
                                ref="buddyIcon" 
                                id="buddy_icon"
                                svgfile="/icons/owner-icon.svg"
                                :color="Math.floor(Math.random() * 180)"
                                size="125"
                                x="0"
                                is-native="true"
                                @click="changeColor()"
                                v-model="details.color"
                            ></icon>
                        </div>
                        <div id="loginscreen_privacy" class="column" v-show="index.currentIndex === 4">
                            <icon 
                                id="privacy-icon"
                                svgfile="./icons/cookie.svg"
                                size="55"
                                color="256"
                                x="0"
                                y="0"
                                isNative="true"
                            ></icon>
                            <div class="login-policytext" id="loginscreen_cookietext">
                            We need <strong>cookies</strong> to keep your Sugarizer session information. <br>Please type the <strong>Accept</strong> button to consent to this use.
                            </div>
                            <div class="login-policytext" id="loginscreen_policytext">
                            For more information you can read our <a target="_blank" href="https://sugarizer.org/policy.html?lang=en">privacy policy</a>.
                            </div>
                        </div>
                    </form>
                </div>
                <div class="loginscreen_warning" v-if="warning.show">
                    <icon 
                        id="warning-icon"
                        svgfile="./icons/emblem-warning.svg"
                        size="35"
                        color="256"
                        x="0"
                        y="0"
                        isNative="true"
                    ></icon>
                    <span id="warning_text">{{ warning.text }}</span>
                </div>

                <div class="loginscreen_buttons">
                    <br>
                    <div class="ls_left_btn">
                        <icon-button 
                            id="back-btn"
                            text="back"
                            svgfile="./icons/go-left.svg"
                            size="28"
                            color="1024"
                            x="0"
                            y="0" 
                            @click="prevItem" 
                        ></icon-button>
                    </div>
                    <div class="ls_right_btn" v-if="index.currentIndex !== index.maxIndex">
                        <icon-button 
                            id="next-btn"
                            text="next"
                            svgfile="./icons/go-right.svg"
                            size="28"
                            color="1024"
                            x="0"
                            y="0" 
                            @click="nextItem" 
                        ></icon-button>
                    </div>
                    <div class="ls_right_btn" v-if="index.currentIndex === index.maxIndex">
                        <icon-button 
                            id="next-btn"
                            text="done"
                            svgfile="./icons/go-right.svg"
                            size="28"
                            color="1024"
                            x="0"
                            y="0" 
                            type="submit"
                            @click="makeLoginRequest()" 
                        ></icon-button>
                    </div>
                </div>`,
	components: {
		"password": Password,
		"icon-button": IconButton,
		"icon": Icon,
	},

	props: {
		userType: {
			isLogin: Boolean,
			isNewuser: Boolean,
			isPrevUser: Object,
		}
	},

	data() {
		return {
			warning: {
				show: false,
				text: '',
			},
			index: {
				minIndex: 0,
				currentIndex: 0,
				maxIndex: 3,
			},
			details: {
				serverAddress: '',
				name: '',
				password: '',
				color: null,
			},
		}
	},

	emits: ['propModified', 'updateIsFirstScreen'],

	watch: {
		userType: {
			deep: true,
			handler(val) {
				this.checkMethodType();
				console.log(val);
				console.log(this.index);
			}
		}
	},

	methods: {
		changeColor() {
			this.$refs.buddyIcon.colorData = Math.floor(Math.random() * 180);
		},

		checkMethodType() {
			if (this.userType.isLogin) {
				this.index.currentIndex = 0;
				this.index.minIndex = 0;
				this.index.maxIndex = 2;
			} else if (this.userType.isNewuser) {
				this.index.currentIndex = 0;
				this.index.minIndex = 0;
				this.index.maxIndex = 4;
			} else if (this.userType.isPrevUser !== null) {
				this.index.currentIndex = 2;
				this.index.minIndex = 2;
				this.index.maxIndex = 2;
			}
		},

		prevItem() {
			if (this.index.currentIndex > this.index.minIndex) {
				this.index.currentIndex--;
			} else if (this.index.currentIndex === this.index.minIndex) {
				this.$emit('propModified', false);
			}
			this.warning.show = false;
		},

		async nextItem() {
			this.warning.show = false;

			if (this.index.currentIndex < this.index.maxIndex) {
				if (this.index.currentIndex === 0) {
					console.log(this.details.serverAddress);
					this.index.currentIndex++;
				}

				else if (this.index.currentIndex === 1) {
					console.log(this.details.name);
					const userexists = await this.checkifUserExists(this.details.serverAddress, this.details.name);
					console.log(userexists);
					console.log(this.userType.isNewuser);
					console.log(this.userType.isLogin);
					if (this.userType.isNewuser && !userexists) {
						this.index.currentIndex++;
					} else if (this.userType.isNewuser && userexists) {
						this.warning.show = true;
						this.warning.text = "User already exists";
					} else if (this.userType.isLogin && userexists) {
						this.index.currentIndex++;
					} else if (this.userType.isLogin && !userexists) {
						this.warning.show = true;
						this.warning.text = "User does not exist";
					}
				}
				else if (this.index.currentIndex === 2) {
					console.log(this.details.password);
					this.index.currentIndex++;
				}
				else if (this.index.currentIndex === 3) {
					this.index.currentIndex++;
				}
				else {
					this.index.currentIndex++;
				}
			}
		},

		checkifUserExists(baseurl, name) {
			return new Promise((resolve, reject) => {
				const data = {
					name: name,
					role: "student",
					beforeSignup: "true"
				};

				axios.post(`${baseurl}/auth/signup`, JSON.stringify({ user: JSON.stringify(data) }), {
					headers: {
						'Content-Type': 'application/json; charset=UTF-8'
					}
				}).then((response) => {
					resolve(response.data.exists);
				}).catch((error) => {
					if (error.response && error.response.status === 401) {
						resolve(error.response.data.exists);
					} else {
						reject(error);
					}
				});
			});
		},

		signup(baseurl, name, password, color) {
			const signupData = {
				"name": `${name}`,
				"password": `${password}`,
				"color": {
					"stroke": `${color.stroke}`,
					"fill": `${color.fill}`,
				},
				"role": "student",
			}
			console.log(signupData);

			axios.post(`${baseurl}/auth/signup`, JSON.stringify({ user: JSON.stringify(signupData) }), {
				headers: {
					'Content-Type': 'application/json; charset=UTF-8'
				}
			}).then((response) => {
				console.log(response);
				this.login(baseurl, name, password);
			}).catch((error) => {
				console.log(error);
			});
		},

		login(baseurl, name, password) {
			const loginData = {
				"name": `${name}`,
				"password": `${password}`,
			}
			axios.post(`${baseurl}/auth/login`, { user: JSON.stringify(loginData) }, {
				headers: {
					'Content-Type': 'application/json; charset=UTF-8'
				}
			}).then((response) => {
				const data = {
					"token": {
						"x_key": response.data.user._id,
						"access_token": response.data.token,
					},
				}
				localStorage.setItem('sugar_settings', JSON.stringify(data));
				this.$emit('updateIsFirstScreen', false);
				console.log(response);
			}).catch((error) => {
				if (error.response && error.response.status === 401) {
					console.log(error.response.data);
					this.warning.show = true;
					this.warning.text = "Invalid username or images";
				} else {
					console.log(error);
				}
			});
		},

		makeLoginRequest() {
			if (this.userType.isNewuser) {
				const colorNumber = this.$refs.buddyIcon.colorData;

				requirejs(['lib/xocolor.js'], (xocolor) => {
					console.log(xocolor);
					console.log(this.details.color);
					this.details.color = xocolor.colors[colorNumber];
					console.log(this.details.color);

					this.details.password = this.$refs.passwordInput.passwordText;
					this.signup(this.details.serverAddress, this.details.name, this.details.password, this.details.color);
				});
			}

			if (this.userType.isLogin) {
				console.log(this.details.serverAddress)
				console.log(this.details.name)
				this.details.password = this.$refs.passwordInput.passwordText;

				this.login(this.details.serverAddress, this.details.name, this.details.password);
			}

			if (this.userType.isPrevUser !== null) {
				this.details.serverAddress = this.userType.isPrevUser.url;
				this.details.name = this.userType.isPrevUser.name;
				this.details.password = this.$refs.passwordInput.passwordText;

				this.login(this.details.serverAddress, this.details.name, this.details.password);
			}
		}
	},
};

if (typeof module !== 'undefined') module.exports = { LoginScreen }