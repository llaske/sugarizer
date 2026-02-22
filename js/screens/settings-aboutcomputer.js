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
					<div class="computer-content">
						<div class="settings-warningbox" v-show='showReinitWarn'>
							<div class="warningbox-title">{{ $t('Warning') }}</div>
							<div class="warningbox-message">{{ $t('ChangesRequireRestart') }}</div>
							<icon-button 
								id="warning-cancel-btn"
								class="warningbox-cancel-button"
								svgfile="icons/dialog-cancel.svg"
								:size="20"
								:color="1024"
								:text="$t('CancelChanges')"
								@click="showReinitWarn = false"
							></icon-button>
							<icon-button
								id="app-restar-btn"
								class="warningbox-refresh-button"
								svgfile="icons/system-restart.svg"
								:size="20"
								:color="1024"
								:text="$t('RestartNow')"
								@click="reinit"
							></icon-button>
						</div>
						<div class="computer-software">{{$t('Software')}}</div>
						<div class="computer-sugarizer" >Sugarizer:</div>
						<div class="computer-value" @click="updateClickCount">{{sugarizerVersion}}</div>
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
						<div v-if="clickCount <= 0">
							<input class="computer-reinit" type="checkbox" v-model="isChecked">
							<span class="computer-value">{{$t('ReinitJournalAndSettings')}}</span><br/>
							<div class="computer-value" style="opacity: .7" v-show="isChecked">
								<icon id="warn-icon" class="computer-value" svgfile="./icons/emblem-warning.svg" :size="14" isNative="true" />
								<span>{{ $t('AllDataWillBeLost') }}</span>
							</div>
						</div>
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
		icon: Icon,
		'icon-button': IconButton,
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
			clickCount: 3,
			isChecked: false,
			showReinitWarn: false,
		}
	},

	async mounted() {
		let bytes = await sugarizer.modules.journal.getSize();
		let formatted = sugarizer.modules.i18next.getFormattedSize(bytes);
		this.Storage = this.$t("StorageSize", {used: bytes, formatted: formatted});
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
			if (this.isChecked)
				this.showReinitWarn = true;
			else
				this.close('about_my_computer');
		},

		onContributorsLinkClick() {
			window.open(this.constant.contributorslink, '_blank');
		},

		async reinit() {
			await sugarizer.modules.settings.reinitialize(true);
			sugarizer.reload();
		},
		updateClickCount() {
			this.clickCount--;
			if (this.clickCount > 0) {
				sugarizer.modules.humane.log(this.$t("ClickMore"));
			}
		},
	}

};

if (typeof module !== 'undefined') module.exports = { AboutComputer }
