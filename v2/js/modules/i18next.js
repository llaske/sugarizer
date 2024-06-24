define(["lib/i18next.min.js", "lib/i18next-vue.js"], function (
	i18next,
	I18NextVue,
) {
	let langString =
		typeof chrome != "undefined" && chrome.app && chrome.app.runtime
			? chrome.i18n.getUILanguage()
			: navigator.language;
	if (
		localStorage.getItem("sugar_settings") !== null &&
		localStorage.getItem("sugar_settings") !== undefined &&
		localStorage.getItem("sugar_settings") !== "{}"
	) {
		const language = JSON.parse(
			localStorage.getItem("sugar_settings"),
		).language;
		if (language !== null && language !== undefined) {
			langString = language;
		}
	}
	let language = langString.split("-")[0];
	let triedFallback = false;

	const init = async function () {
		return new Promise(function (resolve, reject) {
			axios
				.get(`./locales/${language}.json`)
				.then((response) => {
					i18next.init(
						{
							lng: language,
							resources: {
								[language]: {
									translation: response.data,
								},
							},
						},
						() => {
							resolve();
						},
					);
				})
				.catch((error) => {
					if (error.response.status == 404) {
						if (!triedFallback) {
							console.error("Cannnot load language", language);
							language = "en";
							triedFallback = true;
							init();
						} else {
							console.error(
								"Failed to load any language, including the fallback 'english'",
							);
						}
					}
				});
		});
	};

	useI18n = (app) => {
		app.use(I18NextVue, { i18next });
	};

	return { init, useI18n, language };
});
