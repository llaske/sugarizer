/* @ MyPrivacy
 @desc This is the subcomponent of the settings component */

const MyPrivacy = {
	name: 'MyPrivacy',
	template: ` 
				<dialog-box 
					ref="myprivacyModal"
					iconData="./icons/privacy.svg"
					isNative="true"
					:titleData="SugarL10n ? SugarL10n.get('MyPrivacy') : ''"
					ok-button="true"
					cancel-button="true"
					v-on:on-cancel="close('myprivacyModal')"
					v-on:on-ok="okClicked"
					>
					<div class="computer-content">
						<div class="settings-warningbox" v-show="warning.show">
							<div class="warningbox-title" id="desktop_dialogSettings2_dialogPrivacy_warningbox_warningtitle">Warning</div>
							<div class="warningbox-message" id="desktop_dialogSettings2_dialogPrivacy_warningbox_warningmessage">Changes require restart</div>
							<icon-button 
								id="myprivacy-cancel-btn"
								class="warningbox-cancel-button"
								svgfile="icons/dialog-cancel.svg"
								size="20"
								color="1024"
								:text="SugarL10n ? SugarL10n.get('CancelChanges') : ''"
								@click="close('myprivacyModal')"
							></icon-button>								
							<icon-button
								id="myprivacy-restar-btn"
								class="warningbox-refresh-button"
								svgfile="icons/system-restart.svg"
								size="20"
								color="1024"
								:text="SugarL10n ? SugarL10n.get('RestartNow') : ''"
								@click="deleteAccount"
							></icon-button>
						</div>
						<input class="toggle privacy-statscheckbox" type="checkbox" v-model="checkbox.stats">
						<div class="privacy-statsmessage">Do not send to the server statistics about my usage of the app</div>
						<div id="desktop_dialogSettings_dialogPrivacy_control"></div>
						<input class="toggle privacy-synccheckbox" type="checkbox" v-model="checkbox.sync">
						<div class="privacy-syncmessage">Do not synchronize my local journal with the server</div>
						<div id="desktop_dialogSettings_dialogPrivacy_control2"></div>
						<input ref="deletecheckbox" class="enyo-input toggle privacy-removecheckbox" type="checkbox" v-model="checkbox.delete">
						<div class="privacy-removemessage">Display delete account features</div>
						<div v-show="checkbox.delete">
							<div class="privacy-removeremotebutton">
							<icon-button
								id="myprivacy-delete-btn"
								svgfile="icons/cloud-settings.svg"
								isNative="true"
								size="28"
								color="256"
								:text="SugarL10n ? SugarL10n.get('PrivacyRemoveRemote') : ''"
								@click="showWarning"
							></icon-button>
							</div>
						</div>
						<div class="security-warning" v-if="warning.show">
							{{ warning.text }}
						</div>
					</div>
				</dialog-box>

	`,
	components: {
		'dialog-box': Dialog,
		'icon-button': IconButton,
	},

	props: ['SugarL10n', 'username'],

	emits: ['close'],

	data() {
		return {
			warning: {
				show: false,
				text: "xxx"
			},
			step: 0,
			checkbox: {
				stats: false,
				sync: false,
				delete: false,
			},
		}
	},

	mounted() {
		this.getUserDetails();
	},

	methods: {

		close(ref) {
			this.$refs[ref].showDialog = false;
			this.$emit('close', null);
		},

		openModal(ref) {
			this.$refs[ref].showDialog = true;
		},

		okClicked() {
			this.close('mysecurityModal');
		},

		onContributorsLinkClick() {
			window.open(this.constant.contributorslink, '_blank');
		},

		getUserDetails() {
			const token = localStorage.getItem('sugar_settings') ? JSON.parse(localStorage.getItem('sugar_settings')).token : null;

			axios.get('/api/v1/users/' + token.x_key, {
				headers: {
					'x-key': token.x_key,
					'x-access-token': token.access_token,
				},
			})
				.then((response) => {
					this.checkbox.stats = !response.data.options.stats;
					this.checkbox.sync = !response.data.options.sync;
				})
				.catch((error) => {
					console.log(error);
				});
		},

		async okClicked() {
			await this.updateOptions();
			this.close('myprivacyModal');
		},

		updateOptions() {
			const token = JSON.parse(localStorage.getItem("sugar_settings")).token;
			const options = {
				stats: !this.checkbox.stats,
				sync: !this.checkbox.sync,
			}

			axios.put('/api/v1/users/' + token.x_key, ({
				"user": JSON.stringify({ options: options }),
			}), {
				headers: {
					'x-key': token.x_key,
					'x-access-token': token.access_token,
				},
			});
		},

		showWarning() {
			this.warning.show = true;
			this.warning.text = this.SugarL10n ? this.SugarL10n.get('AllDataWillBeLost') : "Are you sure you want to delete your account? This action cannot be undone.";
			this.$refs.deletecheckbox.disabled = true;
		},

		deleteAccount() {
			const token = JSON.parse(localStorage.getItem("sugar_settings")).token;
			axios.delete('/api/v1/users/' + token.x_key, {
				headers: {
					'x-key': token.x_key,
					'x-access-token': token.access_token,
				},
			})
				.then((response) => {
					localStorage.removeItem('sugar_settings');
					window.location.reload();
				})
				.catch((error) => {
					console.log(error);
				});
		}
	}

};

if (typeof module !== 'undefined') module.exports = { MyPrivacy }