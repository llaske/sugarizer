define(['i18next.min', 'axios.min'], function (i18next, axios) {
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

    l10n.updateDocument = () => {
        const elements = document.getElementsByTagName("*");
        for (let i = 0; i < elements.length; i++) {
            const element = elements[i];
            const key = element.getAttribute("data-i18n");
            //handle innerHTML
            if (key !== null && i18next.exists(key)) {
                element.innerHTML = i18next.t(key);
            }
            //handle tooltips
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