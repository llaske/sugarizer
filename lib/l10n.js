let l10ndefine = function (i18next, axios) {
	const l10n = {language: {direction: "ltr"}};

	l10n.init = async (lang) => {
		await i18next.init({
			lng: lang,
			fallbackLng: "en",
			resources: {}
		}).then(() => {
			l10n.language.direction = i18next.dir();
			l10n.switchTo(lang);
		});
	};

	l10n.get = (key, parameter) => {
		return i18next.t(key, parameter);
	};

	l10n.loadLanguageResource = (lang) => {
		return new Promise((resolve, reject) => {
			// In web, load language file from server
			if (typeof module === 'undefined') {
				axios.get("./locales/" + lang + ".json").then((response) => {
					resolve(response.data);
				}).catch((error) => {
					console.log("Failed to load " + lang + " language: " + error);
					resolve(null); // Resolve with null to indicate failure
				});
			} else {
				// In node, load language file from disk
				const fs = require('fs');
				const electron = require('electron');
				fs.readFile(electron.app.getAppPath()+"/locales/" + lang + ".json", (err, data) => {
					if (err) {
						console.log("Failed to load " + lang + " language: " + err);
						resolve(null); // Resolve with null to indicate failure
					} else {
						resolve(JSON.parse(data));
					}
				});
			}
		});
	};

	l10n.switchTo = (lang) => {
		if (!i18next.hasResourceBundle(lang, "translation")) {
			console.log("Loading " + lang + " language");
			l10n.loadLanguageResource(lang).then((locales) => {
				if (locales !== null) {
					i18next.addResourceBundle(lang, "translation", locales);
					i18next.changeLanguage(lang);
					triggerLocalizedEvent();
				} else {
					l10n.init("en");
				}
			});
		} else {
			i18next.changeLanguage(lang);
			triggerLocalizedEvent();
		}
	};


	function triggerLocalizedEvent() {
		if (typeof module === 'undefined') {
			const event = new Event("localized");
			window.dispatchEvent(event);
		}
	};

	return l10n;
}

if (typeof module !== 'undefined') {
	let i18next = require('i18next');
	let axios = require('axios');
	module.exports = l10ndefine(i18next, axios);
} else {
	define(['i18next.min', 'axios.min'], l10ndefine);
}
