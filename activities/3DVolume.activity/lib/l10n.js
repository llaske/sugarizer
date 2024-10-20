define(['lib/i18next.min.js', 'lib/axios.min.js'], function (i18next, axios) {
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

	l10n.get = (key, parameter, resource) => {
		if (resource !== undefined) {
			i18next.setDefaultNamespace(resource);
		} else {
			i18next.setDefaultNamespace("translation");
		}
		return i18next.t(key, parameter);
	};

	l10n.loadLanguageResource = (lang) => {
		return new Promise((resolve, reject) => {
			let prefix = "locales/";
			if (location.protocol === "file:") {
				prefix = "locales/";
			}
			axios.get(prefix + lang + ".json").then((response) => {
				resolve(response.data);
			}).catch((error) => {
				console.log("Failed to load " + lang + " language: " + error);
				resolve(null); // Resolve with null to indicate failure
			});
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

	l10n.loadExternalResource = (name, url) => {
		return new Promise((resolve, reject) => {
			axios.get(url+"/" + i18next.language + ".json").then((response) => {
				i18next.addResourceBundle(i18next.language, name, response.data);
				resolve(response.data);
			}).catch((error) => {
				console.log("Failed to load " + url + "/" + i18next.language + ".json " + error);
				resolve(null);
			});
		});
	};

	l10n.getLanguage = () => {
		return i18next.language;
	};

	l10n.updateDocument = () => {
		const elements = document.getElementsByTagName("*");
		for (let i = 0; i < elements.length; i++) {
			const element = elements[i];
			const key = element.getAttribute("data-i18n");
			if (key !== null && i18next.exists(key)) {
				element.innerHTML = i18next.t(key);
			}
			if (key !== null && i18next.exists(key+".title")) {
				element.setAttribute('title', i18next.t(key+".title"));
			}
		}
	};
	  
	function triggerLocalizedEvent() {
		const event = new Event("localized");
		window.dispatchEvent(event);
	};

	return l10n;
});