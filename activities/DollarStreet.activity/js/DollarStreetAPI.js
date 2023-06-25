// Dollar Street API encapsulation

// API urls and routes
const dsApi = "https://api.dollarstreet.org/v1/";
const dsLanguages = "data/languages.json";
const dsStreetSettings = "data/street-settings.json";
const dsThings = "data/things.json";
const dsFamilies = "search/families?featuredOnly=false&pageSize=1000&lng=";

// Main component
Vue.component("dollarstreet-api", {
	name: "DollarStreetAPI",
	data: function() {
		return {
			language: "en",
			streetSettings: {},
			things: [],
			popularThings: [],
			familyThing: {}
		}
	},

	methods: {
		// Initialize
		initialize: function() {
			let vm = this;

			return new Promise(function(resolve, reject) {
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
								_dsAPIGet(dsStreetSettings),
								_dsAPIGet(dsThings),
							]).then(function (results) {
								// Retrieve all data sets
								vm.streetSettings = results[0];
								vm.things = results[1].otherThings;
								vm.familyThing = results[1].thing;
								vm.popularThings = results[1].popularThings;

								// Load icons for things
								let iconsLoad = [];
								for (let i = 0 ; i < vm.things.length ; i++) {
									let thing = vm.things[i];
									iconsLoad.push(_loadIcon(thing.originPlural));
								}
								Promise.all(iconsLoad).then(function (results) {
									for (let i = 0 ; i < vm.things.length ; i++) {
										vm.things[i].svg = results[i];
									}
									resolve();
								});
							}).catch(function(error) {
								reject();
							});
						});
					});
				}).catch(function(error) {
					reject();
				});
			});
		},

		// Encode topic value
		encodeTopic: function(rawtopic) {
			return rawtopic.toLowerCase().replace(/ /g,"-").replace(/,/g,"");
		},

		// Get things
		getThings: function() {
			return this.things;
		},

		// Get popular things
		getPopularThings: function() {
			return this.popularThings;
		},

		// Get street settings
		getStreetSettings: function() {
			return this.streetSettings;
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
			let topic = vm.encodeTopic(rawtopic);
			for (let i = 0 ; i < vm.things.length ; i++) {
				let current = vm.things[i];
				if (vm.encodeTopic(current.originPlural) == topic) {
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
		getStreetPlaces: function(topic="families", regions=null, imin=0, imax=0) {
			let vm = this;
			let language = vm.language;
			return new Promise(function(resolve, reject) {
				let region = regions ? "&regions=" + regions : "";
				let min = imin ? "&min=" + imin : "";
				let max = imax ? "&max=" + imax : "";
				axios.get(dsApi+dsFamilies+language+"&topic="+topic+region+min+max).then(function(response) {
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
		},

		// Get things for a place
		getThingsForPlace: function(place) {
			let vm = this;

			// HACK: Retrieve each things for this place because direct route don't work due to CORS
			let placeId = place.place.id;
			let placeIncome = Math.floor(place.place.income);
			let region = "&regions=" + place.region.id;
			let min = "&min=" + (placeIncome-1);
			let max = "&max=" + (placeIncome+1);
			let promises = [];
			for (let j = 0 ; j < vm.things.length ; j++) {
				let topic = vm.encodeTopic(vm.things[j].originPlural);
				promises.push(new Promise(function(resolve, reject) {
					axios.get(dsApi+dsFamilies+vm.language+"&topic="+topic+region+min+max).then(function(response) {
						let initialStreets = response.data.hits["4"];
						let streets = [];
						for (let i = 0 ; i < initialStreets.length ; i++) {
							let street = initialStreets[i];
							if (street.place.id == placeId && (!street.media_type || street.media_type != "video")) {
								streets.push(street);
							}
						}
						resolve(streets);
					}).catch(function(error) {
						reject(error);
					});
				}));
			}

			// Return all results
			return new Promise(function(resolve, reject) {
					Promise.all(promises).then(function(results) {
						let things = [];
						for (let i = 0 ; i < results.length ; i++) {
							let result = results[i];
							for (let j = 0 ; j < result.length ; j++) {
								things.push(result[j]);
							}
						}
						resolve(things);
					}).catch(function(error) {
						reject(error);
					});
			}).catch(function(error) {
				reject(error);
			});
		}
	}
});

// Do a GET call to a route
function _dsAPIGet(route) {
	return new Promise(function(resolve, reject) {
		axios.get(route).then(function(response) {
			resolve(response.data);
		}).catch(function(error) {
			reject(error);
		});
	});
}

// Load thing SVG and change default color
function _loadIcon(url) {
	return new Promise(function(resolve, reject) {
		axios.get("icons/"+url+".svg").then(function(response) {
			resolve(response.data);
		}).catch(function(error) {
			reject(error);
 		});
	});
}
