define(["i18next.min"], function (i18next){
    const l10N = {};

    l10N.initLang = () => {
        i18next.init({
            lng: "en",
            debug: true,
            fallbackLng: "en",
            resources: {}
        }).then((t) => {
            l10N.switchTo("en");
        });

        i18next.on("languageChanged", (lng) => {
            console.log("Language changed to " + lng);
            l10N.updateContent();
        });
    }

    l10N.updateContent = () => {
        document.getElementById("ByUser").innerHTML = i18next.t("ByUser", { user: "Vinayak" });
        document.getElementById("TutoActivityTurtleBlocksJSactivity").innerHTML = i18next.t("TutoActivityTurtleBlocksJSactivity");
        document.getElementById("TutoOfflineContent").innerHTML = i18next.t("TutoOfflineContent");
        document.getElementById("LicenseTerms").innerHTML = i18next.t("LicenseTerms");
        document.getElementById("MISSING-TEXT").innerHTML = i18next.t("MISSING-TEXT");
    }

    l10N.loadLanguage = (lng) => {
        return new Promise((resolve, reject) => {
            axios.get("./locales/" + lng + ".json").then((response) => {
                resolve(response.data);
            }, (error) => {
                reject(error);
            });
        });
    }

    l10N.switchTo = (lng) => {
        if (!i18next.hasResourceBundle(lng, "translation")) {
            console.log("Loading " + lng + " language");
            l10N.loadLanguage(lng).then((locales) => {
                i18next.addResourceBundle(lng, "translation", locales);
                i18next.changeLanguage(lng);
            }, () => {
                i18next.changeLanguage(lng); // fallback to default language
            });
        }
        else {
            i18next.changeLanguage(lng);
        }
    }

    return l10N;
});

