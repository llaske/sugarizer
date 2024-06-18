/* @ Settings
 @desc This is the settings component */

const Settings = {
	name: 'Settings',
	template: ` 
					<dialog-box 
						ref="settingModal"
						search-field="true"
						:searchPlaceholder = "$t('SearchSettings')"
						ok-button="false" 
						cancel-button="true"
						v-on:search-input="searchSettingsBox" 
						v-on:on-cancel="closeSettings('settingModal')"
					>
						<div class="dialog-items">
							<div v-bind:class="(filtersettings.find(v => $t('AboutMe').includes(v))) ? '' :'dialog-item-disable'">
								<div >
									<icon id="31" svgfile="icons/owner-icon.svg" :color="buddycolor" :size="constant.sizeSettings" @click="openModal('about_me')"
								></icon></div>
								<div class="dialog-item-text">{{$t('AboutMe')}}</div>
							</div>
							<div v-bind:class="(filtersettings.find(v => $t('AboutMyComputer').includes(v))) ? '' :'dialog-item-disable'">
								<div v-on:click="openModal('about_my_computer')">
									<icon id="32" svgfile="icons/module-about_my_computer.svg" :color="256" :size="constant.sizeSettings" is-native="true" @click="openModal('about_my_computer')"
								></icon></div>
								<div class="dialog-item-text">{{$t('AboutMyComputer')}}</div>
							</div>
							<div v-bind:class="(filtersettings.find(v => $t('Server').includes(v))) ? '' :'dialog-item-disable'">
								<div >
									<icon id="33" svgfile="icons/cloud-settings.svg" :color="256" :size="constant.sizeSettings" is-native="true" @click="openModal('about_my_server')"
								></icon></div>
								<div class="dialog-item-text">{{$t('Server')}}</div>
							</div>
							<div v-bind:class="(filtersettings.find(v => $t('MySecurity').includes(v))) ? '' :'dialog-item-disable'" v-if="connected">
								<div >
									<icon id="34" svgfile="icons/login-icon.svg" :color="256" :size="constant.sizeSettings" is-native="true" @click="openModal('security')"
								></icon></div>
								<div class="dialog-item-text">{{$t('MySecurity')}}</div>
							</div>
							<div v-bind:class="(filtersettings.find(v => $t('MyPrivacy').includes(v))) ? '' :'dialog-item-disable'">
								<div >
									<icon id="35" svgfile="icons/privacy.svg" :color="256" :size="constant.sizeSettings" is-native="true" @click="openModal('privacy')"
								></icon></div>
								<div class="dialog-item-text">{{$t('MyPrivacy')}}</div>
							</div>
							<div v-bind:class="(filtersettings.find(v => $t('Language').includes(v))) ? '' :'dialog-item-disable'">
								<div >
									<icon id="36" svgfile="icons/module-language.svg" :color="256" :size="constant.sizeSettings" is-native="true" @click="openModal('language')"
								></icon></div>
								<div class="dialog-item-text">{{$t('Language')}}</div>
							</div>
						</div>
					</dialog-box> 
					<about-me ref="about_me" v-if="subscreen === 'about_me'" :buddycolor="buddycolor" :username="username" @close="setSubScreen(value)"></about-me>
					<about-computer ref="about_my_computer" v-if="subscreen === 'about_my_computer'" @close="setSubScreen(value)"></about-computer>
					<aboutmyserver ref="about_my_server" v-if="subscreen === 'about_my_server'" @close="setSubScreen(value)"></aboutmyserver>
					<mysecurity ref="security" v-if="subscreen === 'security'" :username="username" @close="setSubScreen(value)"></mysecurity>
					<myprivacy ref="privacy" v-if="subscreen === 'privacy'" @close="setSubScreen(value)"></myprivacy>
					<languagebox ref="language" v-if="subscreen === 'language'" @close="setSubScreen(value)"></languagebox>
	`,

	components: {
		'dialog-box': Dialog,
		'icon': Icon,
		'about-me': AboutMe,
		'about-computer': AboutComputer,
		"aboutmyserver": AboutMyServer,
		'mysecurity': MySecurity,
		'myprivacy': MyPrivacy,
		'languagebox': LanguageBox,
	},

	props: ['buddycolor', 'username'],

	data() {
		return {
			filtersettings: null,
			subscreen: null,
			connected: sugarizer.modules.user.isConnected(),
			constant: {
				sizeSettings: 70,
			}
		}
	},

	created() {
		this.settingsData = [this.$t('AboutMe'), this.$t('AboutMyComputer'), this.$t('Server'), this.$t('MyPrivacy'), this.$t('MySecurity'), this.$t('Language')];
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
			sugarizer.modules.stats.trace('my_settings', 'search', 'q='+input, null);
			this.filtersettings = this.settingsData.filter((setting) => {
				return setting.toUpperCase().includes(input.toUpperCase())
			})
		},

		closeSettings(ref) {
			this.$refs[ref].showDialog = false;
			this.$emit('close-settings');
		},

		async openModal(ref, showSettings = true) {
			this.showSettings = showSettings;
			sugarizer.modules.stats.trace('my_settings', 'click', ref, null);
			this.subscreen = ref;
			await this.$nextTick();
			this.$refs[ref].$refs[ref].showDialog = true;
			this.$refs.settingModal.showDialog = false;
		},

		openSettingsModal(ref) {
			this.$refs[ref].showDialog = true;
		},

		setSubScreen(value) {
			if (this.showSettings)
				this.$refs.settingModal.showDialog = true;
			this.subscreen = value;
		}
	},

};

if (typeof module !== 'undefined') module.exports = { Settings }
