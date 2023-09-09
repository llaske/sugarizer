/* @ Settings
 @desc This is the settings component */

const Settings = {
	name: 'Settings',
	template: ` 
					<dialog-box 
						ref="settingModal"
						search-field="true"
						ok-button="false" 
						cancel-button="true"
						v-on:search-input="searchSettingsBox" 
						v-on:on-cancel="closeSettings('settingModal')"
					>
						<div class="dialog-items">
							<div v-bind:class="(filtersettings.find(v => ('About me').includes(v))) ? '' :'dialog-item-disable'">
								<div >
									<icon id="31" svgfile="icons/owner-icon.svg" :color="buddycolor" size="72" @click="openModal('aboutMeModal')"
								></icon></div>
								<div class="dialog-item-text">About me</div>
							</div>
							<div v-bind:class="(filtersettings.find(v => ('About my computer').includes(v))) ? '' :'dialog-item-disable'">
								<div v-on:click="openModal('aboutmycomputerModal')">
									<icon id="32" svgfile="icons/module-about_my_computer.svg" color="256" size="72" is-native="true" @click="openModal('aboutmycomputerModal')"
								></icon></div>
								<div class="dialog-item-text">About my computer</div>
							</div>
							<div v-bind:class="(filtersettings.find(v => ('About my server').includes(v))) ? '' :'dialog-item-disable'">
								<div >
									<icon id="33" svgfile="icons/cloud-settings.svg" color="256" size="72" is-native="true" @click="openModal('aboutmyserverModal')"
								></icon></div>
								<div class="dialog-item-text">About my server</div>
							</div>
							<div v-bind:class="(filtersettings.find(v => ('My privacy').includes(v))) ? '' :'dialog-item-disable'">
								<div >
									<icon id="34" svgfile="icons/login-icon.svg" color="256" size="72" is-native="true" @click="openModal('myprivacyModal')"
								></icon></div>
								<div class="dialog-item-text">My privacy</div>
							</div>
							<div v-bind:class="(filtersettings.find(v => ('My security').includes(v))) ? '' :'dialog-item-disable'">
								<div >
									<icon id="35" svgfile="icons/privacy.svg" color="256" size="72" is-native="true" @click="openModal('mysecurityModal')"
								></icon></div>
								<div class="dialog-item-text">My security</div>
							</div>
							<div v-bind:class="(filtersettings.find(v => ('Language').includes(v))) ? '' :'dialog-item-disable'">
								<div >
									<icon id="36" svgfile="icons/module-language.svg" color="256" size="72" is-native="true" @click="openModal('languageModal')"
								></icon></div>
								<div class="dialog-item-text">Language</div>
							</div>
						</div>
					</dialog-box> 
					<about-me ref="aboutMeModal" v-if="subscreen === 'aboutMeModal'" :buddycolor="buddycolor" :username="username" @close="setSubScreen(value)"></about-me>
	`,	

	components: {
		'dialog-box': Dialog,
		'icon': Icon,
		'about-me': AboutMe,
	},

	props: ['buddycolor', 'username'],

	data() {
		return {
			settingsData: ['About me', 'About my computer', 'About my server', 'My privacy', 'My security', 'Language'],
			filtersettings: null,
			subscreen: null,
		}
	},

	mounted() {
		this.filtersettings = this.settingsData;
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