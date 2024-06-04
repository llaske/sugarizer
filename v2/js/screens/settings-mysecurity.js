/* @ MySecurity
 @desc This is the subcomponent of the settings component */

const MySecurity = {
	name: 'MySecurity',
	template: ` 
				<dialog-box 
						ref="security"
						iconData="./icons/login-icon.svg"
						isNative="true"
						:titleData="$t('MySecurity')"
						cancel-button="true"
						v-on:on-cancel="close('security')"
				>
					<div class="computer-content" >
						<div v-if="step === 0">
							<div class="security-message" >{{$t('SecurityMessage')}}</div>
							<password-box class="security-password" ref="password" @passwordSet="login"/>
							<icon-button 
								id="next-btn"
								svgfile="./icons/go-right.svg"
								class="security-rightbutton"
								:size="28"
								:color="1024"
								:x="0"
								:y="0"
								:text="$t('Next')"
								@click="login"
							></icon-button>
							<div class="security-warning" v-if="warning.show">
								{{ warning.text }}
							</div>
						</div>
						<div v-if="step === 1">
							<div class="security-message" >{{$t('SecurityMessageNew', {"min": 4})}}</div>
							<password-box class="security-password" ref="newpassword" @passwordSet="updatePassword"/>
							<icon-button 
								id="next-btn"
								svgfile="./icons/go-right.svg"
								class="security-rightbutton"
								:size="28"
								:color="1024"
								:x="0"
								:y="0"
								:text="$t('Done')"
								@click="updatePassword"
							></icon-button>
						</div>
						<div v-if="step === 2">
							<div class="security-message" >{{$t('SecurityMessageDone')}}</div>
						</div>
					</div>			
				</dialog-box> 
	`,
	components: {
		'dialog-box': Dialog,
		'password-box': Password,
		'icon-button': IconButton,
	},

	props: ['username'],

	emits: ['close'],

	data() {
		return {
			warning: {
				show: false,
				text: "xxx"
			},
			step: 0,
		}
	},

	mounted() {
		// Hack to focus on password field initially
		setInterval(() => {
			if (this.$refs.password) {
				this.$refs.password.$refs.password.focus();
				clearInterval();
			}
		}, 1000);
	},

	methods: {

		close(ref) {
			this.$refs[ref].showDialog = false;
			this.$emit('close', null);
		},

		openModal(ref) {
			this.$refs[ref].showDialog = true;
		},

		login() {
			const password = this.$refs.password.passwordText;

			sugarizer.modules.user.login(null, this.username, password).then((user) => {
				this.step++;
				this.$nextTick(() => {
					this.$refs.newpassword.$refs.password.focus();
				});
			}, (error) => {
				if (error === 1) {
					this.warning.show = true;
					this.warning.text = this.$t('InvalidPassword');
				} else {
					console.log(error);
				}
			});
		},

		updatePassword() {
			const password = this.$refs.newpassword.passwordText;

			if (password.length < 4) {
				return;
			}

			sugarizer.modules.user.update({ password: password }).then((user) => {
				this.step++;
			}).catch((error) => {
				if (error === 1) {
					this.warning.show = true;
					this.warning.text = this.$t('InvalidPassword');
				} else {
					console.log(error);
				}
			});
		},

		onContributorsLinkClick() {
			window.open(this.constant.contributorslink, '_blank');
		}
	}

};

if (typeof module !== 'undefined') module.exports = { MySecurity }
