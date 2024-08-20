define(["lib/i18next.min.js", "lib/i18next-vue.js"], function (
	i18next,
	I18NextVue
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
			localStorage.getItem("sugar_settings")
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
						}
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
								"Failed to load any language, including the fallback 'english'"
							);
						}
					}
				});
		});
	};

	useI18n = (app) => {
		app.use(I18NextVue, { i18next });
	};

	timestampToElapsedString = function (
		timestamp,
		maxlevel,
		issmall,
		ago_string = "Ago"
	) {
		const units = [
			{ name: "Years", factor: 356 * 24 * 60 * 60 },
			{ name: "Months", factor: 30 * 24 * 60 * 60 },
			{ name: "Weeks", factor: 7 * 24 * 60 * 60 },
			{ name: "Days", factor: 24 * 60 * 60 },
			{ name: "Hours", factor: 60 * 60 },
			{ name: "Minutes", factor: 60 },
		];
		var suffix = issmall ? "_short" : "";
		var levels = 0;
		var time_period = "";
		var elapsed_seconds = (new Date().getTime() - timestamp) / 1000;
		for (var i = 0; i < units.length; i++) {
			var factor = units[i].factor;

			var elapsed_units = Math.floor(elapsed_seconds / factor);
			if (elapsed_units > 0) {
				if (levels > 0) time_period += ",";

				time_period +=
					" " +
					elapsed_units +
					" " +
					(elapsed_units == 1
						? i18next.t(units[i].name + "_one" + suffix)
						: i18next.t(units[i].name + "_other" + suffix));

				elapsed_seconds -= elapsed_units * factor;
			}

			if (time_period != "") levels += 1;

			if (levels == maxlevel) break;
		}

		if (levels == 0) {
			return i18next.t("Seconds" + ago_string + suffix);
		}

		return i18next.t(ago_string + suffix, { time: time_period });
	};

	getFormattedSize = function (bytes) {
		if (bytes === undefined) return "-";
		var formatted = "";
		if (bytes > 1048576) {
			formated =
				(bytes / 1024 / 1024).toFixed() +
				" " +
				i18next.t("ShortForMegabytes");
		} else if (bytes > 1024) {
			formated =
				(bytes / 1024).toFixed() + " " + i18next.t("ShortForKilobytes");
		} else if (bytes == 0) {
			formated = "-";
		} else {
			formated = bytes + " " + i18next.t("ShortForBytes");
		}
		return formated;
	};

	return {
		init,
		useI18n,
		language,
		timestampToElapsedString,
		getFormattedSize,
		t: i18next.t.bind(i18next),
	};
});
