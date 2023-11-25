/* @ AboutMyComputer
 @desc This is the subcomponent of the settings component */

const AboutComputer = {
	name: 'AboutComputer',
	template: ` 
				<dialog-box 
						ref="aboutComputerModal"
						iconData="./icons/module-about_my_computer.svg"
						isNative="true"
						:titleData="SugarL10n ? SugarL10n.get('AboutMyComputer') : ''"
						ok-button="true"
						cancel-button="true"
						v-on:on-cancel="close('aboutComputerModal')"
						v-on:on-ok="okClicked"
				>
					<div class="computer-content" >
						<div class="computer-software" >{{SugarL10n ? SugarL10n.get('Software') : ''}}</div>
						<div class="computer-sugarizer" >Sugarizer:</div>
						<div class="computer-value" >{{sugarizerVersion}}</div>
						<div class="computer-line" ></div>
						<div class="computer-clienttype" >{{SugarL10n ? SugarL10n.get('ClientType') : ''}}</div>
						<div class="computer-value" >{{clientName}}</div>
						<div class="computer-line" ></div>
						<div class="computer-browser" >{{SugarL10n ? SugarL10n.get('Browser') : ''}}</div>
						<div class="computer-value" >{{browserName}}</div>
						<div class="computer-line" ></div>
						<div class="computer-browserversion" >{{SugarL10n ? SugarL10n.get('BrowserVersion') : ''}}</div>
						<div class="computer-value" >{{browserVersion}}</div>
						<div class="computer-line" ></div>
						<div class="computer-useragent" >{{SugarL10n ? SugarL10n.get('UserAgent') : ''}}</div>
						<div class="computer-value" >{{userAgent}}</div>
						<div class="computer-storage" >{{SugarL10n ? SugarL10n.get('Storage') : ''}}</div>
						<div class="computer-value" >{{Storage}}</div>
						<div class="computer-line" ></div>							
						<div class="computer-line" ></div>
						<div class="computer-copyright" >{{SugarL10n ? SugarL10n.get('Copyright') : ''}}</div>
						<div class="computer-contributor" >© 2013-2023 Lionel Laské, Sugar Labs Inc and&nbsp;</div>
						<div class="computer-contributor-link" @click="onContributorsLinkClick">contributors</div>
						<div class="computer-licence" >{{SugarL10n ? SugarL10n.get('LicenseTerms') : ''}}</div>
						<div class="computer-licence" >{{SugarL10n ? SugarL10n.get('LicenseTermsPlus') : ''}}</div>
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
			constant: {
				contributorslink: 'https://github.com/llaske/sugarizer/blob/dev/docs/credits.md',
			},
			Storage: "null",
			sugarizerVersion: sugarizer.getVersion(),
			clientName: sugarizer.getClientName(),
			browserName: sugarizer.getBrowserName(),
			browserVersion: sugarizer.getBrowserVersion(),
			userAgent: navigator.userAgent,
		}
	},

	mounted() {
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
			this.close('aboutComputerModal');
		},

		onContributorsLinkClick() {
			window.open(this.constant.contributorslink, '_blank');
		}

	}

};

if (typeof module !== 'undefined') module.exports = { AboutComputer }