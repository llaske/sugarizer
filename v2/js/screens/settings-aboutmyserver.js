/* @ AboutMyServer
 @desc This is the subcomponent of the settings component */

const AboutMyServer = {
	name: 'AboutMyServer',
	template: ` 
				<dialog-box 
						ref="about_my_server"
						iconData="./icons/cloud-settings.svg"
						isNative="true"
						:titleData="$t('Server')"
						ok-button="true"
						cancel-button="true"
						v-on:on-cancel="close('about_my_server')"
						v-on:on-ok="close('about_my_server')"
				>
					<div class="settings-subscreen column firstscreen_text">
						<div class="aboutserver-subbox aboutserver-checkbox">
							<input class="aboutserver-subbox" type="checkbox" :checked="details.serverAddress != ''" :disabled="disabled" @click="toggleConnect">
							<div class="aboutserver-rightitem">{{$t('ConnectedToServer')}}</div>
						</div>
						<div class="aboutserver-subbox" id="aboutserver-serverurl" v-if='connected && connectingStep < 2'>
							<div class="aboutserver-leftitem">{{$t('ServerUrl')}}</div>
							<div class="aboutserver-rightitem"><input ref="serverAddress" class="input_field" type="text" v-model="details.serverAddress" :disabled="!connectingStep" @keyup="handleEnterKey"></div>
						</div>
						<div class="aboutserver-subbox" v-if='connected && !connectingStep'>
							<div class="aboutserver-leftitem">{{$t('ServerName')}}</div>
							<div class="aboutserver-rightitem">{{details.serverName}}</div>
						</div>
						<div class="aboutserver-subbox" v-if='connected && !connectingStep'>
							<div class="aboutserver-leftitem">{{$t('Description') + ':'}}</div>
							<div class="aboutserver-rightitem">{{details.Description}}</div>
						</div>
						<div class="aboutserver-subbox" v-if='connected && !connectingStep'>
							<div class="aboutserver-leftitem">{{$t('UserId')}}</div>
							<div class="aboutserver-rightitem"><input class="aboutserver-username" type="text" :value="details.username" disabled></div>
						</div>
						<div class="aboutserver-subbox" v-show="connectingStep === 2">
							<div class="aboutserver-passwordtext" id="pass_text" v-show="connectingStep === 2">{{$t((!createAccount?'Password':'SecurityMessageNew'),{min: passwordSize})}}</div>
						</div>
						<div class="aboutserver-subbox aboutserver-password" v-show="connectingStep === 2">
							<password ref="passwordInput" @passwordSet="handlePasswordSet"></password>
						</div>
						<div class="aboutserver-subbox" id="aboutserver-warning" v-if='warning.show'>
							<span id="warning_text">{{ warning.text }}</span>
						</div>
						<div class="aboutserver-privacybox" id="aboutserver-privacy" v-show="connectingStep == 3">
							<icon 
								id="privacy-icon"
								svgfile="./icons/cookie.svg"
								:size="55"
								:color="256"
								:x="0"
								:y="0"
								isNative="true"
							></icon>
							<div class="aboutserver-policytext" id="loginscreen_cookietext" v-html="$t('CookieConsent')"></div>
							<div ref="policytext" class="aboutserver-policytext" id="loginscreen_policytext" v-html="$t('PolicyLink')"></div>
						</div>
						<div class="ls_right_btn aboutserver-nextbutton" v-if='connectingStep > 0'>
							<icon-button 
								ref="nextButton"
								id="next-btn"
								svgfile="./icons/go-right.svg"
								class="ls_icon_btn"
								:size="28"
								:color="1024"
								:x="0"
								:y="0"
								:text="$t('Next')"
								@click="nextStep"
							></icon-button>
						</div>
					</div>
					<div v-if="isLoading" class="loading-spinner">
						<img src="./images/spinner-light.gif">
					</div>
				</dialog-box> 
	`,
	components: {
		'dialog-box': Dialog,
		"password": Password,
		'icon-button': IconButton,
		'icon': Icon,
	},

	emits: ['close'],

	data() {
		return {
			details: {
				serverAddress: "",
				serverName: "",
				Description: "",
				username: "",
				color: 0,
			}, 
			disabled: sugarizer.getClientType() == sugarizer.constant.webAppType,
			connected: sugarizer.modules.user.isConnected(),
			connectingStep: 0,
			warning: {
				show: !sugarizer.modules.user.isConnected(),
				text: '',
			},
			passwordSize: 0,
			consentNeed: false,
			consentPolicy: '',
			createAccount: true,
			isLoading: false,
		}
	},

	async mounted() {
		this.warning.text = this.$t('PleaseConnectMessage');
		await this.getServerDetails();
		await this.getUserName();
	},

	methods: {

		close(ref) {
			this.$refs[ref].showDialog = false;
			this.$emit('close', null);
		},

		openModal(ref) {
			this.$refs[ref].showDialog = true;
		},

		async getServerDetails() {
			this.disabled = sugarizer.modules.user.isConnected();
			if (!sugarizer.modules.user.isConnected()) {
				return;
			}
			const server = await sugarizer.modules.server.getServerInformation(sugarizer.modules.user.getServerURL());		
			this.details.serverAddress = sugarizer.modules.server.getServer();
			this.details.serverName = server.name;
			this.details.Description = server.description;
		},

		async getUserName() {
			const user = await sugarizer.modules.user.get();
			this.details.username = user.name;
			this.details.color = user.colorvalue;
		},

		toggleConnect() {
			this.connected = true;
			this.disabled = true;
			this.details.serverAddress = "https://server.sugarizer.org";
			this.$nextTick(() => {
				this.$refs.serverAddress.focus();
			})
			this.connectingStep++;
			this.warning.show = false;
		},

		handleEnterKey(event) {
			if (event.key === 'Enter') {
				this.nextStep();
			}
		},

		handlePasswordSet(password) {
			this.nextStep();
		},

		async nextStep() {
			this.isLoading = true;
			if (this.connectingStep == 1) {
				await this.checkServer();
			} else if (this.connectingStep == 2) {
				await this.createOrLogin();
			} else if (this.connectingStep == 3) {
				await this.signup();
			}
			this.isLoading = false;
		},

		async checkServer() {
			await this.withErrHandling(async () => {
				const info = await sugarizer.modules.server.getServerInformation(this.details.serverAddress);
				this.warning.show = false;
				this.passwordSize = info.options["min-password-size"];
				this.consentNeed = info.options['consent-need'];
				this.consentPolicy = info.options['policy-url'];
				await this.withErrHandling(async () => {
					const exists = await sugarizer.modules.user.checkIfExists(this.details.serverAddress, this.details.username)
					this.createAccount = !exists;
					if (exists || !this.consentNeed) {
						this.$refs.nextButton.textData = this.$t('Done');
					}
					this.connectingStep++;
					this.$nextTick(() => {
						this.$refs.passwordInput.$refs.password.focus();
					});
				})
			}, this.$t('ErrorLoadingRemote'))
		},

		async createOrLogin() {
			// Validate password size
			let pass = this.$refs.passwordInput.passwordText;
			if (pass.length == 0 || pass.length < this.passwordSize) {
				return;
			}

			// Don't create account if already exists
			if (!this.createAccount) {
				// Yes, just login
				await this.withErrHandling(async () => {
					const user = await sugarizer.modules.user.login(this.details.serverAddress, this.details.username, pass)
					sugarizer.modules.history.addUser({ name: this.details.username, color: user.color, server: { url: this.details.serverAddress } });
					sugarizer.reload();
				})
			} else {
				// Ask for consent if needed
				if (this.consentNeed) {
					this.$refs.policytext.innerHTML = this.$t('PolicyLink', { url: this.consentPolicy });
					this.$refs.nextButton.iconData = "./icons/accept.svg";
					this.$refs.nextButton.textData = this.$t('Accept');
					this.connectingStep++;
					return;
				}

				// Create a new user
				await this.signup();
			}
		},

		async signup() {
			await this.withErrHandling(async () => {
				const user = await sugarizer.modules.user.signup(this.details.serverAddress, this.details.username, this.$refs.passwordInput.passwordText, this.details.color)
				await this.withErrHandling(async () => {
					const user = await sugarizer.modules.user.login(this.details.serverAddress, this.details.username, this.$refs.passwordInput.passwordText);
					sugarizer.modules.history.addUser({ name: this.details.username, color: user.color, server: { url: this.details.serverAddress } });
					sugarizer.reload();
				});
			});
		},

		async withErrHandling(func, warning) {
			try {
				await func();
			} catch (error) {
				this.warning.show = true;
				this.warning.text = warning ? warning : this.$t('ServerError', {code: error});
			}
		},
	}
};

if (typeof module !== 'undefined') module.exports = { AboutMyServer }
