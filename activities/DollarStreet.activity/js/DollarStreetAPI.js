// Dollar Street API encapsulation

// API urls and routes
const dsUrl = "https://ds-dev.dollarstreet.org/dollar-street/v1/";
const dsApi = "https://api.dollarstreet.org/v1/";
const dsLanguages = "languagesList";
const dsLanguage = "language?lang=";
const dsStreetSettings = "street-settings";
const dsRegions = "countries-filter?thing=Families&countries=World&regions=World&lang=";
const dsThings = "things-filter?thing=Families&countries=World&regions=World&lang=";
const dsItems = "things?countries=World&regions=World&lang=";
const dsFamilies = "search/families?show=places&pageSize=1000&topic=families&lng=";

// Main component
Vue.component("dollarstreet-api", {
	name: "DollarStreetAPI",
	data: function() {
		return {
			language: "en",
			l10n: {},
			streetSettings: {},
			regions: [],
			things: [],
			familyThing: {}
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
						vm.familyThing = results[3].thing;
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
		},

		// Find a thing by id
		getThingById: function(id) {
			let vm = this;
			for (let i = 0 ; i < vm.things.length ; i++) {
				let current = vm.things[i];
				if (current._id == id) {
					return current;
				}
			}
			return null;
		},

		// Get family thing
		getFamily: function() {
			return this.familyThing;
		},

		// Get street places
		getStreetPlaces: function() {
			return _dsAPISearch(dsFamilies+this.language);
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

// Do a GET call to a search route
function _dsAPISearch(route) {
	return new Promise(function(resolve, reject) {
		axios.get(dsApi+route).then(function(response) {
			resolve(response.data.hits["4"]);
		}).catch(function(error) {
			reject(error);
		});
	});
}
