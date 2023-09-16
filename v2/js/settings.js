/* @ Settings
 @desc This is the settings component */

const Settings = {
	name: 'Settings',
	template: ` 
					<dialog-box 
						ref="settingModal"
						search-field="true"
						:searchPlaceholder = "SugarL10n != null ? SugarL10n.get('SearchSettings') : ''"
						ok-button="false" 
						cancel-button="true"
						v-on:search-input="searchSettingsBox" 
						v-on:on-cancel="closeSettings('settingModal')"
					>
						<div class="dialog-items">
							<div v-bind:class="(filtersettings.find(v => (localizedL10n.stringAboutMe).includes(v))) ? '' :'dialog-item-disable'">
								<div >
									<icon id="31" svgfile="icons/owner-icon.svg" :color="buddycolor" size="72" @click="openModal('aboutMeModal')"
								></icon></div>
								<div class="dialog-item-text">{{localizedL10n.stringAboutMe}}</div>
							</div>
							<div v-bind:class="(filtersettings.find(v => (localizedL10n.stringAboutMyComputer).includes(v))) ? '' :'dialog-item-disable'">
								<div v-on:click="openModal('aboutmycomputerModal')">
									<icon id="32" svgfile="icons/module-about_my_computer.svg" color="256" size="72" is-native="true" @click="openModal('aboutmycomputerModal')"
								></icon></div>
								<div class="dialog-item-text">{{localizedL10n.stringAboutMyComputer}}</div>
							</div>
							<div v-bind:class="(filtersettings.find(v => (localizedL10n.stringServer).includes(v))) ? '' :'dialog-item-disable'">
								<div >
									<icon id="33" svgfile="icons/cloud-settings.svg" color="256" size="72" is-native="true" @click="openModal('aboutmyserverModal')"
								></icon></div>
								<div class="dialog-item-text">{{localizedL10n.stringServer}}</div>
							</div>
							<div v-bind:class="(filtersettings.find(v => (localizedL10n.stringMyPrivacy).includes(v))) ? '' :'dialog-item-disable'">
								<div >
									<icon id="34" svgfile="icons/login-icon.svg" color="256" size="72" is-native="true" @click="openModal('myprivacyModal')"
								></icon></div>
								<div class="dialog-item-text">{{localizedL10n.stringMyPrivacy}}</div>
							</div>
							<div v-bind:class="(filtersettings.find(v => (localizedL10n.stringMySecurity).includes(v))) ? '' :'dialog-item-disable'">
								<div >
									<icon id="35" svgfile="icons/privacy.svg" color="256" size="72" is-native="true" @click="openModal('mysecurityModal')"
								></icon></div>
								<div class="dialog-item-text">{{localizedL10n.stringMySecurity}}</div>
							</div>
							<div v-bind:class="(filtersettings.find(v => (localizedL10n.stringLanguage).includes(v))) ? '' :'dialog-item-disable'">
								<div >
									<icon id="36" svgfile="icons/module-language.svg" color="256" size="72" is-native="true" @click="openModal('languageModal')"
								></icon></div>
								<div class="dialog-item-text">{{localizedL10n.stringLanguage}}</div>
							</div>
						</div>
					</dialog-box> 
					<about-me ref="aboutMeModal" v-if="subscreen === 'aboutMeModal'" :buddycolor="buddycolor" :username="username" :SugarL10n="SugarL10n" @close="setSubScreen(value)"></about-me>
	`,

	components: {
		'dialog-box': Dialog,
		'icon': Icon,
		'about-me': AboutMe,
	},

	props: ['buddycolor', 'username', 'SugarL10n'],

	data() {
		return {
			filtersettings: null,
			subscreen: null,
			l10n: {
				stringSearchSettings: '',
				stringAboutMe: '',
				stringAboutMyComputer: '',
				stringServer: '',
				stringMyPrivacy: '',
				stringMySecurity: '',
				stringLanguage: '',
			}
		}
	},

	computed: {
		localizedL10n() {
			const localizedL10n = { ...this.l10n };
			this.SugarL10n.localize(localizedL10n);
			return localizedL10n;
		},
		settingsData() {
			if (this.SugarL10n == null) return [];
			const data = [this.SugarL10n.get('AboutMe'), this.SugarL10n.get('AboutMyComputer'), this.SugarL10n.get('Server'), this.SugarL10n.get('MyPrivacy'), this.SugarL10n.get('MySecurity'), this.SugarL10n.get('Language')];
			return data;
		}
	},
	
	mounted() {
		this.filtersettings = this.settingsData;
	},

	watch: {
		settingsData(val) {
			if (val.length > 0) {
				this.filtersettings = this.settingsData;
			}
		}
	},

	methods: {
		searchSettingsBox(input) {
			this.filtersettings = this.settingsData.filter((setting) => {
				return setting.toUpperCase().includes(input.toUpperCase())
			})
		},

		closeSettings(ref) {
			this.$refs[ref].showDialog = false;
			this.$emit('close-settings');
		},

		async openModal(ref) {
			this.subscreen = ref;
			await this.$nextTick();
			this.$refs[ref].$refs[ref].showDialog = true;
		},

		openSettingsModal(ref) {
			this.$refs[ref].showDialog = true;
		},

		setSubScreen(value) {
			this.subscreen = value;
		}
	},

};

if (typeof module !== 'undefined') module.exports = { Settings }