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
const dsFamilies = "search/families?show=places&pageSize=1000&lng=";

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
			popularThings: [],
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
						// Retrieve all data sets
						vm.l10n = results[0];
						vm.streetSettings = results[1];
						vm.regions = results[2];
						vm.things = results[3].otherThings;
						vm.familyThing = results[3].thing;
						vm.popularThings = results[3].popularThings;

						// Load icons for things
						let iconsLoad = [];
						for (let i = 0 ; i < vm.things.length ; i++) {
							let thing = vm.things[i];
							iconsLoad.push(_loadIcon(thing.icon));
						}
						Promise.all(iconsLoad).then(function (results) {
							for (let i = 0 ; i < vm.things.length ; i++) {
								vm.things[i].svg = results[i];
							}
							vm.$emit("initialized");
						});
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

		// Get popular things
		getPopularThings: function() {
			return this.popularThings;
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
		getThingByTopic: function(rawtopic) {
			let vm = this;
			let topic = rawtopic.toLowerCase().replace(" ","-");
			for (let i = 0 ; i < vm.things.length ; i++) {
				let current = vm.things[i];
				if (current.originPlural.toLowerCase().replace(" ","-") == topic) {
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
		getStreetPlaces: function(topic="families", regions=null) {
			let vm = this;
			return new Promise(function(resolve, reject) {
				let region = regions ? "&regions=" + regions : "";
				axios.get(dsApi+dsFamilies+vm.language+"&topic="+topic+region).then(function(response) {
					let initialStreets = response.data.hits["4"];
					let streets = [];
					for (let i = 0 ; i < initialStreets.length ; i++) {
						let place = initialStreets[i];
						if (!place.media_type || place.media_type != "video") {
							streets.push(place);
						}
					}
					resolve(streets);
				}).catch(function(error) {
					reject(error);
				});
			});
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

// Load thing SVG and change default color
function _loadIcon(url) {
	return new Promise(function(resolve, reject) {
		axios.get("https:"+url).then(function(response) {
			resolve(response.data.replace(/#2C4351/g, "#FFFFFF"));
		}).catch(function(error) {
			reject(error);
 		});
	});
}
