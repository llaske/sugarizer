/* @ AboutMyServer
 @desc This is the subcomponent of the settings component */

const AboutMyServer = {
	name: 'AboutMyServer',
	template: ` 
				<dialog-box 
						ref="aboutMyServerModal"
						iconData="./icons/cloud-settings.svg"
						isNative="true"
						:titleData="SugarL10n ? SugarL10n.get('Server') : ''"
						ok-button="true"
						cancel-button="true"
						v-on:on-cancel="close('aboutMyServerModal')"
						v-on:on-ok="close('aboutMyServerModal')"
				>
					<div class="settings-subscreen column firstscreen_text">
						<div class="aboutserver-subbox aboutserver-checkbox">
							<input class="aboutserver-subbox" type="checkbox" checked disabled>
							<div class="aboutserver-rightitem">{{SugarL10n ? SugarL10n.get('ConnectedToServer') : ''}}</div>
						</div>
						<div class="aboutserver-subbox" id="aboutserver-serverurl">
							<div class="aboutserver-leftitem">{{SugarL10n ? SugarL10n.get('ServerUrl') : ''}}</div>
							<div class="aboutserver-rightitem"><input class="input_field" type="text" :value="details.serverAddress" disabled></div>
						</div>
						<div class="aboutserver-subbox">
							<div class="aboutserver-leftitem">{{SugarL10n ? SugarL10n.get('ServerName') : ''}}</div>
							<div class="aboutserver-rightitem">{{details.serverName}}</div>
						</div>
						<div class="aboutserver-subbox">
							<div class="aboutserver-leftitem">{{SugarL10n ? SugarL10n.get('Description') + ':' : ''}}</div>
							<div class="aboutserver-rightitem">{{details.Description}}</div>
						</div>
						<div class="aboutserver-subbox">
							<div class="aboutserver-leftitem">{{SugarL10n ? SugarL10n.get('UserId') : ''}}</div>
							<div class="aboutserver-rightitem"><input class="aboutserver-username" type="text" :value="details.username" disabled></div>
						</div>
					</div>
				</dialog-box> 
	`,
	components: {
		'dialog-box': Dialog,
	},

	props: ['SugarL10n'],

	emits: ['close'],

	data() {
		return {
			details: {
				serverAddress: "",
				serverName: "",
				Description: "",
				username: "",
			}
		}
	},

	async mounted() {
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
			const response = await axios.get('/api');
			
			this.details.serverAddress = response.request.responseURL.slice(0, -4);
			this.details.serverName = response.data.name;
			this.details.Description = response.data.description;
		},

		async getUserName() {
			const token = await JSON.parse(localStorage.getItem("sugar_settings")).token;
			const response = await axios.get('/api/v1/users/' + token.x_key, {
				headers: {
					'x-key': token.x_key,
					'x-access-token': token.access_token,
				},
			});

			this.details.username = response.data.name;
		},

	}

};

if (typeof module !== 'undefined') module.exports = { AboutMyServer }