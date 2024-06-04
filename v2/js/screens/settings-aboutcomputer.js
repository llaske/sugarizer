/* @ AboutMyComputer
 @desc This is the subcomponent of the settings component */

const AboutComputer = {
	name: 'AboutComputer',
	template: ` 
				<dialog-box 
						ref="about_my_computer"
						iconData="./icons/module-about_my_computer.svg"
						isNative="true"
						:titleData="$t('AboutMyComputer')"
						ok-button="true"
						cancel-button="true"
						v-on:on-cancel="close('about_my_computer')"
						v-on:on-ok="okClicked"
				>
					<div class="computer-content" >
						<div class="computer-software" >{{$t('Software')}}</div>
						<div class="computer-sugarizer" >Sugarizer:</div>
						<div class="computer-value" >{{sugarizerVersion}}</div>
						<div class="computer-line" ></div>
						<div class="computer-clienttype" >{{$t('ClientType')}}</div>
						<div class="computer-value" >{{clientName}}</div>
						<div class="computer-line" ></div>
						<div class="computer-browser" >{{$t('Browser')}}</div>
						<div class="computer-value" >{{browserName}}</div>
						<div class="computer-line" ></div>
						<div class="computer-browserversion" >{{$t('BrowserVersion')}}</div>
						<div class="computer-value" >{{browserVersion}}</div>
						<div class="computer-line" ></div>
						<div class="computer-useragent" >{{$t('UserAgent')}}</div>
						<div class="computer-value" >{{userAgent}}</div>
						<div class="computer-storage" >{{$t('Storage')}}</div>
						<div class="computer-value" >{{Storage}}</div>
						<div class="computer-line" ></div>							
						<div class="computer-line" ></div>
						<div class="computer-copyright" >{{$t('Copyright')}}</div>
						<div class="computer-contributor" >© 2013-2023 Lionel Laské, Sugar Labs Inc and&nbsp;</div>
						<div class="computer-contributor-link" @click="onContributorsLinkClick">contributors</div>
						<div class="computer-licence" >{{$t('LicenseTerms')}}</div>
						<div class="computer-licence" >{{$t('LicenseTermsPlus')}}</div>
					</div>			
				</dialog-box> 
	`,
	components: {
		'dialog-box': Dialog,
	},

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

	methods: {

		close(ref) {
			this.$refs[ref].showDialog = false;
			this.$emit('close', null);
		},

		openModal(ref) {
			this.$refs[ref].showDialog = true;
		},

		okClicked() {
			this.close('about_my_computer');
		},

		onContributorsLinkClick() {
			window.open(this.constant.contributorslink, '_blank');
		}

	}

};

if (typeof module !== 'undefined') module.exports = { AboutComputer }
