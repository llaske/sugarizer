define(['i18next.min', 'axios.min'], function (i18next, axios) {
    const l10n = {};
    let initialized = false;

    l10n.init = async (lang) => {
        await i18next.init({
            lng: lang,
            debug: true,
            fallbackLng: "en",
            resources: {}
        }).then((t) => {
            l10n.switchTo(lang);
        });
    };

    l10n.get = async (key) => {
        if (!initialized) {
            await new Promise((resolve) => {
                const checkInitialization = setInterval(() => {
                    if (initialized) {
                        clearInterval(checkInitialization);
                        resolve();
                    }
                }, 100); // Adjust the interval duration as needed
            });
        }
        return i18next.t(key);
    };

    l10n.loadLanguageResource = (lang) => {
        return new Promise((resolve, reject) => {
            axios.get("./locales/" + lang + ".json").then((response) => {
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
                } else {
                    console.log("Language file not found. Falling back to 'en' language.");
                    lng = "en"; // Fall back to "en" language
                    l10n.loadLanguageResource(lang).then((locales) => {
                        i18next.addResourceBundle(lang, "translation", locales);
                    });
                }
                i18next.changeLanguage(lang);
                initialized = true;
            });
        } else {
            i18next.changeLanguage(lang);
            initialized = true;

        }
    };

    return l10n;
});
