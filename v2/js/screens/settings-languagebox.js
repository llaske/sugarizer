/* @ LanguageBox
 @desc This is the subcomponent of the settings component */

const LanguageBox = {
	name: 'LanguageBox',
	template: ` 
				<dialog-box 
						ref="language"
						iconData="./icons/module-language.svg"
						isNative="true"
						:titleData="SugarL10n ? SugarL10n.get('Language') : ''"
						ok-button="true"
						cancel-button="true"
						v-on:on-cancel="close('language')"
						v-on:on-ok="okClicked"
				>
					<div class="settings-subscreen aboutme-box">
						<div class="firstscreen_text">{{SugarL10n ? SugarL10n.get('ChooseLanguage') : ''}}</div>
						<div
						ref="languageButton"
						id="language-btn"
						@click="showPopupFunction($event)"
						v-on:mouseleave="removePopupFunction($event)">
						{{SugarL10n ? languages[languageCode][0] + " (" + SugarL10n.get(languages[languageCode][1]) + ")" : ''}}
						<img src="./icons/control-popup-arrow.svg" class="arrow-down" />
						</div>
					</div>
				</dialog-box> 
				<popup 
					ref="popup"
					v-bind:item="popup"
					v-on:mouseleave="removePopupFunction($event)"
					v-on:itemis-clicked="itemisClicked($event)"
				></popup>
	`,
	components: {
		'dialog-box': Dialog,
		'icon-button': IconButton,
		'popup': Popup,
	},

	props: ['SugarL10n'],

	emits: ['close'],

	data() {
		return {
			popup: null, //singular popup data
			popupData: null,
			languages: {
				"en": ["English", "English"],
				"es": ["Español", "Spanish"],
				"fr": ["Français", "French"],
				"de": ["Deutsch", "German"],
				"pt": ["Português", "Portuguese"],
				"ar": ["عربي", "Arabic"],
				"ja": ["日本語", "Japanese"],
				"pl": ["Polski", "Polish"],
				"ibo": ["Igbo", "Igbo"],
				"yor": ["Yorùbá", "Yoruba"],
			},
			languageCode: this.SugarL10n ? this.SugarL10n.language : 'en',
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

		getPopupData() {
			this.popupData = {
				"language-btn": {
					id: "lng",
					icon: {},
					name: "Choose Language",
					itemList: Object.entries(this.languages).map(([key, value]) => {
						return {
							id: key,
							name: `${value[0]} (${this.SugarL10n.get(value[1])})`,
							icon: {id: key},
						}
					})
				},
			}
		},
		

		showPopupFunction(e) {
			let itemId;

			const button = this.$refs.languageButton;

			// Get the position of the button relative to the document
			const rect = button.getBoundingClientRect();

			const x = rect.left + 20;
			const y = rect.top;

			itemId = e.target.id;

			this.getPopupData();
			let obj = JSON.parse(JSON.stringify(this.popupData))
			console.log(this.SugarL10n.language);
			this.popup = obj[itemId];
			this.$refs.popup.show(x, y);
		},

		removePopupFunction(e) {
			if (!this.$refs.popup.isCursorInside(e.clientX, e.clientY)) {
				this.$refs.popup.hide();
			}
		},

		itemisClicked(e) {
			const languages = this.languages;
			for (const key in languages) {
				if (key === e.slice(4)) {
					this.languageCode = key;
					break;
				}
			}
			this.$refs.popup.hide();
		},

		async updateLanguage() {
			sugarizer.modules.user.update({ language: this.languageCode }).then(() => {
				sugarizer.reload();
			});
		},

		okClicked() {
			this.updateLanguage();
			sugarizer.modules.stats.trace('my_settings_language', 'change', 'language', null);
			this.close('language');
		}

	}

};

if (typeof module !== 'undefined') module.exports = { LanguageBox }