define(['i18next.min', 'axios.min'], function (i18next, axios) {
    const l10n = {};
    let initialized = false;

    l10n.init = async (lang) => {
        await i18next.init({
            lng: lang,
            debug: true,
            fallbackLng: "en",
            resources: {}
        }).then(() => {
            l10n.switchTo(lang);
        });
    };

    l10n.get = (key) => {
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
                    l10n.init("en");
                }
                i18next.changeLanguage(lang);
                initialized = true;
                triggerLocalizedEvent();
            });
        } else {
            i18next.changeLanguage(lang);
            initialized = true;
            triggerLocalizedEvent();
        }
    };


    function triggerLocalizedEvent() {
        const event = new Event("localized");
        window.dispatchEvent(event);
    };

    return l10n;
});