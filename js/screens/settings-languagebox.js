/* @ LanguageBox
 @desc This is the subcomponent of the settings component */

const LanguageBox = {
	name: 'LanguageBox',
	template: ` 
				<dialog-box 
						ref="language"
						iconData="./icons/module-language.svg"
						isNative="true"
						:titleData="$t('Language')"
						ok-button="true"
						cancel-button="true"
						v-on:on-cancel="close('language')"
						v-on:on-ok="okClicked"
				>
					<div class="settings-subscreen aboutme-box">
						<div class="firstscreen_text">{{$t('ChooseLanguage')}}</div>
						<div
							ref="languageButton"
							id="language-btn"
							@click="showPopupFunction($event)"
							v-on:mouseleave="removePopupFunction($event)"
						>
							{{languages[languageCode][0] + " (" + $t(languages[languageCode][1]) + ")"}}
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
			languageCode: "",
		}
	},

	created() {
		this.languageCode = this.$i18next.language;
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
					icon: {id:"en"},
					name: "English (" + this.$t("English") + ")",
					itemList: Object.entries(this.languages).slice(1).map(([key, value]) => {
						return {
							id: key,
							name: `${value[0]} (${this.$t(value[1])})`,
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
