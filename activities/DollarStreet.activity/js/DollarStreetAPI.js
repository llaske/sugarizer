// Dollar Street API encapsulation

// API urls and routes
const dsUrl = "https://ds-dev.dollarstreet.org/dollar-street/v1/";
const dsLanguages = "languagesList";
const dsLanguage = "language?lang=";
const dsStreetSettings = "street-settings";
const dsRegions = "countries-filter?thing=Families&countries=World&regions=World&lang=";
const dsThings = "things-filter?thing=Families&countries=World&regions=World&lang=";

// Main component
Vue.component("dollarstreet-api", {
	name: "DollarStreetAPI",
	data: function() {
		return {
			language: "en",
			l10n: {},
			streetSettings: {},
			regions: [],
			things: []
		}
	},

	mounted() {
		let vm = this;

		// Find matching language
		_dsAPIGet(dsLanguages).then(function(result) {
			requirejs(["sugar-web/env"], function(env) {
				env.getEnvironment(function(err, environment) {
					// Set language
					var defaultLanguage = navigator.language;
					var language = environment.user ? environment.user.language : defaultLanguage;
					for (let i = 0 ; i < result.length ; i++) {
						if (result[i].code.indexOf(language) == 0) {
							vm.language = result[i].code;
							break;
						}
					}

					// Initialize data set
					Promise.all([
						_dsAPIGet(dsLanguage+vm.language),
						_dsAPIGet(dsStreetSettings),
						_dsAPIGet(dsRegions+vm.language),
						_dsAPIGet(dsThings+vm.language),
					]).then(function (results) {
						vm.l10n = results[0];
						vm.streetSettings = results[1];
						vm.regions = results[2];
						vm.things = results[3].otherThings;
						vm.$emit("initialized");
 					}).catch(function(error) {
						vm.$emit("error");
					});
				});
			});
		}).catch(function(error) {
			vm.$emit("error");
		})
	},

	methods: {
		// Get a localized string by id
		getL10n: function(id) {
			return this.l10n[id];
		},

		// Get regions
		getRegions: function() {
			return this.regions;
		},

		// Get things
		getThings: function() {
			return this.things;
		}
	}
});

// Do a GET call to a route
function _dsAPIGet(route) {
	return new Promise(function(resolve, reject) {
		axios.get(dsUrl+route).then(function(response) {
			resolve(response.data.data);
		}).catch(function(error) {
			reject(error);
		});
	});
}
