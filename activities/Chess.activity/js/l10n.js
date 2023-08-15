// Localization component
var Localization = {
	template: '<div/>',	
	data: function () {
		return {
			l10n: null,
			code: null,
			dictionary: null,
			units: [
				{ name: 'Years', factor: 356 * 24 * 60 * 60 },
				{ name: 'Months', factor: 30 * 24 * 60 * 60 },
				{ name: 'Weeks', factor: 7 * 24 * 60 * 60 },
				{ name: 'Days', factor: 24 * 60 * 60 },
				{ name: 'Hours', factor: 60 * 60 },
				{ name: 'Minutes', factor: 60 }
			],
		};
	},
	mounted: function () {
		const vm = this;
		requirejs(['sugar-web/env'], function (env) {
			env.getEnvironment((err, environment) => {
				// Get default language
				const defaultLanguage =
					typeof chrome !== 'undefined' &&
					chrome.app &&
					chrome.app.runtime
					? chrome.i18n.getUILanguage()
					: navigator.language;
				const language = environment.user
					? environment.user.language
					: defaultLanguage;

				vm.loadLanguageFile(language);
			});
		});
	},
	
	methods: {
		loadLanguageFile: function (language) {
			const vm = this;
			requirejs(['lib/i18next.min.js', 'lib/axios.min.js'], function (i18next, axios) {
				axios.get(`./locales/${language}.json`).then((response) => {
					i18next.init(
						{
							lng: language,
							fallbackLng: 'en',
							debug: false,
							resources: {
								[language]: {
									translation: response.data
								}
							},
						},
						() => {
							vm.l10n = i18next;
							vm.code = i18next.language;
							vm.dictionary = i18next.getResourceBundle(i18next.language, 'translation');
							vm.$emit('localized');
							vm.subscribeLanguageChange();
						}
					);
				}).catch((error) => {
					vm.loadLanguageFile('en'); // Load default language
					console.log(error);
				});
			});
		},

		subscribeLanguageChange: function () {
			const vm = this;
			requirejs(['lib/i18next.min.js'], function (i18next) {
				i18next.on('languageChanged', (lng) => {
					vm.code = lng;
					vm.dictionary = i18next.getResourceBundle(lng, 'translation'); // Update dictionary with new language
					vm.$emit('localized');
				});
			});
		},

		// Get a string with parameter
		get: function (str, params) {
			let out = '';

			if (!this.dictionary) {
				out = str;
			} else {
				out = this.dictionary[str] || str;
			}

			// Check params
			if (params) {
				let paramsInString = out.match(/{{\s*[\w\.]+\s*}}/g);
				for (let i in paramsInString) {
					let param = paramsInString[i].match(/[\w\.]+/)[0];
					if (params[param]) {
						out = out.replace(paramsInString[i], params[param]);
					}
				}
			}
			return out;
		},

		// Get values for a set of strings on the form of {stringKey1: '', stringKey2: '', ...}
		localize: function (strings) {
			const vm = this;
			Object.keys(strings).forEach((key, index) => {
				strings[key] = vm.get(key.substr(6));
			});
		},

		// Convert a UNIX timestamp to Sugarizer time elapsed string
		localizeTimestamp: function (timestamp) {
			const maxlevel = 2;
			const levels = 0;
			let time_period = '';
			let elapsed_seconds = (Date.now() - timestamp) / 1000;
			for (let i = 0; i < this.units.length; i++) {
				let factor = this.units[i].factor;

				let elapsed_units = Math.floor(elapsed_seconds / factor);
				if (elapsed_units > 0) {
					if (levels > 0)
						time_period += ',';

					time_period += ' ' + elapsed_units + " " + (elapsed_units == 1 ? this.get(this.units[i].name + "_one") : this.get(this.units[i].name + "_other"));

					elapsed_seconds -= elapsed_units * factor;
				}

				if (time_period != '')
					levels += 1;

				if (levels == maxlevel)
					break;
			}

			if (levels == 0) {
				return this.get('SecondsAgo');
			}

			return this.get('Ago', { time: time_period });
		},
	},
};