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
						<div class="computer-value" >{{constant.sugarizerVersion}}</div>
						<div class="computer-line" ></div>
						<div class="computer-clienttype" >{{SugarL10n ? SugarL10n.get('ClientType') : ''}}</div>
						<div class="computer-value" >{{getClientName()}}</div>
						<div class="computer-line" ></div>
						<div class="computer-browser" >{{SugarL10n ? SugarL10n.get('Browser') : ''}}</div>
						<div class="computer-value" >{{getBrowserName()}}</div>
						<div class="computer-line" ></div>
						<div class="computer-browserversion" >{{SugarL10n ? SugarL10n.get('BrowserVersion') : ''}}</div>
						<div class="computer-value" >{{getBrowserVersion()}}</div>
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
				sugarizerVersion: '1.7.0',
				webAppType: 0,
				appType: 1,
				noServerMode: false,
				contributorslink: 'https://github.com/llaske/sugarizer/blob/dev/docs/credits.md',
			},
			userAgent: navigator.userAgent,
			Storage: "null",
			platform: {
				ios: /(iPhone|iPad|iPod)/.test(navigator.userAgent),
				android: (navigator.userAgent.indexOf("Android") != -1),
				firefox: (navigator.userAgent.indexOf("Firefox") != -1),
				chrome: (navigator.userAgent.indexOf("Chrome") != -1),
				safari: (navigator.userAgent.indexOf("Safari") != -1),
				windows: (navigator.platform.indexOf("Win") != -1),
				macos: (navigator.platform.indexOf("Mac") != -1),
				unix: (navigator.platform.indexOf("X11") != -1),
				linux: (navigator.platform.indexOf("Linux") != -1),
				electron: (navigator.userAgent.indexOf("Electron") != -1),
				touch: ('ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0),
				androidChrome: /Android .* Chrome\/(\d+)[.\d]+/.test(navigator.userAgent)
			},
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

		// Get client type
		getClientType() {
			return (document.location.protocol.slice(0, 4) == "http" && !this.constant.noServerMode) ? this.constant.webAppType : this.constant.appType;
		},

		getClientName() {
			return this.getClientType() == this.constant.webAppType ? "Web App" : "App";
		},

		// Get browser name
		getBrowserName() {
			if (this.platform.android) return "Android";
			else if (this.platform.ios) return "iOS";
			else if (this.platform.chrome) return "Chrome";
			else if (this.platform.firefox) return "Firefox";
			else if (this.platform.safari) return "Safari";
			return "Unknown";
		},

		// Get browser version
		getBrowserVersion() {
			let browserAgent = navigator.userAgent;
			let browserVersion = '' + parseFloat(navigator.appVersion);
			let browserMajorVersion = parseInt(navigator.appVersion, 10);
			let Offset, OffsetVersion, ix;
			if ((OffsetVersion = browserAgent.indexOf("Chrome")) != -1) {
				browserVersion = browserAgent.substring(OffsetVersion + 7);
			} else if ((OffsetVersion = browserAgent.indexOf("Firefox")) != -1) {
				browserName = "Firefox";
				browserVersion = browserAgent.substring(OffsetVersion + 8);
			} else if ((OffsetVersion = browserAgent.indexOf("Safari")) != -1) {
				browserName = "Safari";
				browserVersion = browserAgent.substring(OffsetVersion + 7);
				if ((OffsetVersion = browserAgent.indexOf("Version")) != -1)
					browserVersion = browserAgent.substring(OffsetVersion + 8);
			} else if ((Offset = browserAgent.lastIndexOf(' ') + 1) < (OffsetVersion = browserAgent.lastIndexOf('/'))) {
				browserName = browserAgent.substring(Offset, OffsetVersion);
				browserVersion = browserAgent.substring(OffsetVersion + 1);
				if (browserName.toLowerCase() == browserName.toUpperCase()) {
					browserName = navigator.appName;
				}
			}
			if ((ix = browserVersion.indexOf(";")) != -1) {
				browserVersion = browserVersion.substring(0, ix);
			}
			if ((ix = browserVersion.indexOf(" ")) != -1) {
				browserVersion = browserVersion.substring(0, ix);
			}
			browserMajorVersion = parseInt('' + browserVersion, 10);
			if (isNaN(browserMajorVersion)) {
				browserVersion = '' + parseFloat(navigator.appVersion);
				browserMajorVersion = parseInt(navigator.appVersion, 10);
			}
			return browserVersion;
		},

		onContributorsLinkClick() {
			window.open(this.constant.contributorslink, '_blank');
		}

	}

};

if (typeof module !== 'undefined') module.exports = { AboutComputer }