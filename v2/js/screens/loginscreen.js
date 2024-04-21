/**
 * @module LoginScreen
 * @desc This is the login screen component
 */

const LoginScreen = {
	name: 'LoginScreen',
	template: `
	<div class="loginscreen">
	<div class="loginscreen_help">
		<icon 
			 id="help-icon"
			 svgfile="./icons/help.svg"
			 :size="50"
			 :x="0"
			 :y="0"
			 :color="256"
			 isNative="true"
		 ></icon>
	</div>
	<form>
		<div id="loginscreen_server" class="column" v-show="index.currentIndex === 0">
			<div class="firstscreen_text" id="serverurl">{{l10n.stringServerUrl}}</div>
			<input ref="serverAddress" name="server" type="text" class="input_field" v-model="details.serverAddress" @keyup="handleEnterKey">
		</div>
		<div id="loginscreen_name" class="column" v-show="index.currentIndex === 1">
			<div class="firstscreen_text" id="name">{{l10n.stringName}}</div>
			<input ref="nameInput" type="text" name="name" class="input_field" v-model="details.name" @keyup="handleEnterKey">
		</div>
		<div id="loginscreen_password" class="column" v-show="index.currentIndex === 2">
		<div ref="pwdText" class="firstscreen_text" id="pass_text" v-html="l10n.stringPasswordLink"></div>
		<password ref="passwordInput" @passwordSet="handlePasswordSet"></password>
		</div>
		<div id="loginscreen_iconchoice" class="column" v-show="index.currentIndex === 3">
			<div class="firstscreen_text" id="buddyicon_text">{{l10n.stringClickToColor}}</div>
			<icon 
				 ref="buddyIcon"
				 id="buddy_icon"
				 svgfile="./icons/owner-icon.svg"
				 :color="details.color"
				 :size="125"
				 :x="0"
				 @click="changeColor()"
				 v-model="details.color"
			></icon>
		</div>
		<div id="loginscreen_privacy" class="column" v-show="index.currentIndex === 4">
			<icon 
				 id="privacy-icon"
				 svgfile="./icons/cookie.svg"
				 :size="55"
				 :color="256"
				 :x="0"
				 :y="0"
				 isNative="true"
			></icon>
			<div class="login-policytext" id="loginscreen_cookietext" v-html="l10n.stringCookieConsent"></div>
			<div ref="policytext" class="login-policytext" id="loginscreen_policytext" v-html="l10n.stringPolicyLink"></div>
		</div>
	</form>
</div>
<div class="loginscreen_warning" v-if="warning.show">
	<icon 
		 id="warning-icon"
		 svgfile="./icons/emblem-warning.svg"
		 :size="35"
		 :color="256"
		 :x="0"
		 :y="0"
		 isNative="true"
	  ></icon>
	<span id="warning_text">{{ warning.text }}</span>
</div>
<div class="loginscreen_buttons">
	<br>
	<div class="ls_left_btn">
		<icon-button
			 id="back-btn"
			 svgfile="./icons/go-left.svg"
			 class="ls_icon_btn"
			 :size="28"
			 :color="1024"
			 :x="0"
			 :y="0"
			 :text="l10n.stringBack"
			 @click="prevItem"
			></icon-button>
	</div>
	<div class="ls_right_btn">
		<icon-button
			id="next-btn"
			svgfile="./icons/go-right.svg"
			class="ls_icon_btn"
			size="28"
			color="1024"
			x="0"
			y="0"
			:text="index.currentIndex === index.maxIndex ? l10n.stringDone : l10n.stringNext"
			type="submit"
			@click="index.currentIndex === index.maxIndex ? makeLoginRequest() : nextItem()"
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
		},
	},

	data() {
		return {
			warning: {
				show: false,
				text: '',
			},
			index: {
				minIndex: 0,
				currentIndex: null,
				maxIndex: 3,
			},
			details: {
				serverAddress: '',
				name: '',
				password: '',
				color: Math.floor(Math.random() * 180),
			},
			l10n: {
				stringServerUrl: '',
				stringName: '',
				stringChoosePassword: '',
				stringClickToColor: '',
				stringCookieConsent: '',
				stringPolicyLink: '',
				stringBack: '',
				stringNext: '',
				stringDone: '',
				stringUserAlreadyExist: '',
				stringInvalidUser: '',
				stringUserLoginInvalid: '',
				stringErrorLoadingRemote: '',
			},
			l10nRef: null,
			consentNeed: false,
			consentPolicy: '',
		}
	},

	emits: ['propModified', 'updateIsFirstScreen'],

	created: function () {
		window.addEventListener('localized', (e) => {
			e.detail.l10n.localize(this.l10n);
			this.l10nRef = e.detail.l10n;
		}, { once: true });

		if (sugarizer.getClientType() === sugarizer.constant.webAppType) {
			this.details.serverAddress = sugarizer.modules.server.getServerUrl();
		}
	},

	watch: {
		userType: {
			deep: true,
			handler(val) {
				this.checkMethodType();
			}
		},

		'index.currentIndex': function (val) {
			if (val === 0) {
				this.$nextTick(() => {
					this.$refs.serverAddress.focus();
				});
			} else if (val === 1) {
				this.$nextTick(() => {
					this.$refs.nameInput.focus();
				});
			} else if (val === 2) {
				this.$nextTick(() => {
					this.$refs.passwordInput.$refs.password.focus();
				});
			}
		}
	},

	methods: {
		changeColor() {
			this.details.color = sugarizer.modules.xocolor.next(this.$refs.buddyIcon.colorData);
		},

		checkMethodType() {
			if (this.userType.isLogin) {
				this.index.currentIndex = (sugarizer.getClientType() === sugarizer.constant.appType ? 0 : 1);
				this.index.minIndex = 1;
				this.index.maxIndex = 2;
			} else if (this.userType.isNewuser) {
				this.index.currentIndex = 1;
				this.index.minIndex = 1;
				this.index.maxIndex = (sugarizer.getClientType() === sugarizer.constant.appType ? 3 : 4);
			} else if (this.userType.isPrevUser !== null) {
				if (this.userType.isPrevUser.url == '' && sugarizer.getClientType() === sugarizer.constant.appType) {
					this.details.color = this.userType.isPrevUser.color;
					sugarizer.modules.user.signup(this.userType.isPrevUser.url, this.userType.isPrevUser.name, '', sugarizer.modules.xocolor.get(this.details.color)).then((user) => {
						this.login(this.userType.isPrevUser.url, this.userType.isPrevUser.name, '');
					}, (error) => {
						console.log(error);
					});
					return;
				}
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
				if (this.index.currentIndex === 0 && this.details.serverAddress.length > 0) { // server address
					await sugarizer.modules.server.getServerInformation(this.details.serverAddress).then((info) => {
						this.index.currentIndex++;
					}, (error) => {
						console.log(error);
						this.warning.show = true;
						this.warning.text = this.l10n.stringErrorLoadingRemote;
					});
				}

				else if (this.index.currentIndex === 1 && this.details.name.length > 0) { // name
					if (sugarizer.getClientType() === sugarizer.constant.webAppType || this.details.serverAddress.length > 0) {
						const info = await sugarizer.modules.server.getServerInformation(this.details.serverAddress);
						this.consentNeed = info.options['consent-need'];
						this.consentPolicy = info.options['policy-url'];
						this.$refs.policytext.innerHTML = this.l10nRef.get('PolicyLink', { url: this.consentPolicy });
						const minPasswordSize = info.options['min-password-size'];
						this.$refs.pwdText.innerHTML = this.l10nRef.get('ChoosePassword', { min: minPasswordSize });
					}
					const userexists = await sugarizer.modules.user.checkIfExists(this.details.serverAddress, this.details.name);
					if (this.userType.isNewuser && !userexists) {
						this.index.currentIndex++;
						if (this.details.serverAddress.length == 0) {
							this.index.currentIndex++;
						} else if (!this.consentNeed) {
							this.index.maxIndex = 3;
						}
					} else if (this.userType.isNewuser && userexists) {
						this.warning.show = true;
						this.warning.text = this.l10n.stringUserAlreadyExist;
					} else if (this.userType.isLogin && userexists) {
						this.index.currentIndex++;
					} else if (this.userType.isLogin && !userexists) {
						this.warning.show = true;
						this.warning.text = this.l10n.stringInvalidUser;
					}
				}
				else if (this.index.currentIndex === 2) { // password
					this.details.password = this.$refs.passwordInput.passwordText;
					const info = await sugarizer.modules.server.getServerInformation(this.details.serverAddress);
					const minPasswordSize = info.options['min-password-size'];
					if (this.details.password.length >= minPasswordSize) {
						this.index.currentIndex++;
					}
				}
				else if (this.index.currentIndex === 3) { // icon
					this.index.currentIndex++;
				}
				else if (this.index.currentIndex === 4) { // privacy
					this.index.currentIndex++;
				}
			}
		},

		handleEnterKey(event) {
			if (event.key === 'Enter') {
				this.nextItem();
			}
		},

		handlePasswordSet(password) {
			if (this.index.maxIndex === 4 || (this.index.maxIndex === 3 && this.details.name.length > 0 && !this.consentNeed)) {
				this.nextItem();
			}
			else if (this.index.maxIndex === 2) {
				this.makeLoginRequest();
			}
		},

		login(baseurl, name, password) {
			if (sugarizer.getClientType() === sugarizer.constant.appType && this.details.serverAddress.length == 0) {
				app.updateFavicon();
				sugarizer.modules.history.addUser({ name: name, color: this.details.color, server: { url: baseurl } });
				this.$emit('updateIsFirstScreen', false);
				return;
			}
			sugarizer.modules.user.login(baseurl, name, password).then((user) => {
				app.updateFavicon();
				sugarizer.modules.history.addUser({ name: user.name, color: user.color, server: { url: baseurl } });
				this.$emit('updateIsFirstScreen', false);
			}, (error) => {
				if (error === 1) {
					this.warning.show = true;
					this.warning.text = this.l10n.stringUserLoginInvalid;
				} else {
					console.log(error);
				}
			});
		},

		makeLoginRequest() {
			if (this.userType.isNewuser) {
				const colorNumber = this.$refs.buddyIcon.colorData;

				this.details.password = this.$refs.passwordInput.passwordText;
				sugarizer.modules.user.signup(this.details.serverAddress, this.details.name, this.details.password, sugarizer.modules.xocolor.get(colorNumber)).then((user) => {
					this.login(this.details.serverAddress, this.details.name, this.details.password);
				}, (error) => {
					console.log(error);
				});
			}

			if (this.userType.isLogin) {
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

