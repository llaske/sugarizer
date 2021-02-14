// Rebase require directory
requirejs.config({
	baseUrl: "lib",
	paths: {
		activity: "../js"
	}
});

// Constants
const viewList = 1;
const viewDetail = 2;

// Vue main app
var app = new Vue({
	el: '#app',
	components: {
		'street-place': StreetPlace,
		'family-detail': Family
	},
	data: {
		places: [],
		currentView: viewList,
		currentPlace: null,
		currentThing: "families",
		currentRegion: null,
		currentMinIncome: 0,
		currentMaxIncome: 0,
		placeSize: 2,
		timerId: null,
		timerData: null,
		scroll: {top: 0, left: 0},
		SugarL10n: null,
		l10n: {
			stringIncomePalette: '',
			stringWorldButton: '',
			stringFamilyButton: '',
			stringThingsButton: '',
			stringClose: '',
			stringImageExported: '',
			stringNoDescription: ''
		}
	},
	created() {
		let vm = this;
		vm.computeSize();
		window.addEventListener("resize", vm.computeSize);
	},
	mounted: function() {
		this.SugarL10n = this.$refs.SugarL10n;
	},
	updated: function() {
		this.updateVisibility();
	},
	methods: {
		// Handles localized event
		localized: function() {
			this.SugarL10n.localize(this.l10n);
		},

		//  Handle fullscreen/unfullscreen
		fullscreen: function() {
			this.$refs.SugarToolbar.hide();
			this.computeSize();
		},

		unfullscreen: function() {
			this.$refs.SugarToolbar.show();
			this.computeSize();
		},

		// Display a category of things
		displayThings: function() {
			let vm = this;
			vm.places = [];
			document.getElementById("spinner").style.visibility = "visible";
			vm.$refs.api.getStreetPlaces(vm.currentThing, vm.currentRegion, vm.currentMinIncome, vm.currentMaxIncome).then(function(response) {
				document.getElementById("spinner").style.visibility = "hidden";
				vm.places = response;
			});
		},

		// Button family clicked
		familyClicked: function() {
			let vm = this;
			vm.currentThing = "families";
			vm.displayThings();
		},

		// Thing selected
		onThingSelected: function(event) {
			let vm = this;
			let thing = event.detail.value;
			let thingName = vm.$refs.api.encodeTopic(thing.originPlural);
			vm.currentThing = thingName;
			vm.displayThings();
		},

		// Recompute visibility when scrolled
		onScrolled: function() {
			this.updateVisibility();
		},

		// Region changed
		onRegionSelected: function(event) {
			let vm = this;
			vm.currentRegion = event.detail.value;
			vm.displayThings();
		},

		// Income range selected
		onIncomeChanged: function(event) {
			let vm = this;
			if (vm.timerId) {
				clearTimeout(vm.timerId);
			}
			vm.timerId = setTimeout(function() {
				vm.currentMinIncome = event.detail.min;
				vm.currentMaxIncome = event.detail.max;
				vm.displayThings();
				vm.timerId = null;
			}, 1000);
		},

		// Place clicked
		onPlaceClicked: function(place) {
			let vm = this;
			vm.currentView = viewDetail;
			vm.currentPlace = place;
			let scroll = document.getElementById("content");
			vm.scroll = {left: scroll.scrollLeft, top: scroll.scrollTop};
		},

		// Back button on family clicked, go back to list
		onBackClicked: function(place) {
			let vm = this;
			vm.currentView = viewList;
			vm.currentPlace = null;
			setTimeout(function() {
				let scroll = document.getElementById("content");
				scroll.scrollLeft = vm.scroll.left;
				scroll.scrollTop = vm.scroll.top;
			}, 500);
		},

		// Stop the activity
		onStop: function () {
			let vm = this;
			let context = {
				currentMinIncome: vm.currentMinIncome,
				currentMaxIncome: vm.currentMaxIncome,
				currentThing: vm.currentThing,
				currentRegion: vm.currentRegion
			};
			vm.$refs.SugarJournal.saveData(context);
		},

		// Load activity context
		onJournalDataLoaded: function(data, metadata) {
			let vm = this;
			this.$refs.api.initialize().then(function() {
				console.log("Dollar Street API connected");
				let settings = vm.$refs.api.getStreetSettings();
				vm.currentMinIncome = data.currentMinIncome;
				vm.currentMaxIncome = data.currentMaxIncome;
				vm.currentThing = data.currentThing;
				vm.currentRegion = data.currentRegion;
				vm.displayThings();
				vm.updateVisibility();
			}).catch(function() {
				console.log("Dollar Street API Error !");
				document.getElementById("spinner").style.visibility = "hidden";
				document.getElementById("cloudwarning").style.visibility = "visible";
			});
		},

		onJournalNewInstance: function() {
			let vm = this;
			this.$refs.api.initialize().then(function() {
				console.log("Dollar Street API connected");
				let settings = vm.$refs.api.getStreetSettings();
				vm.currentMinIncome = settings.poor;
				vm.currentMaxIncome = settings.rich;
				vm.displayThings();
				vm.updateVisibility();
			}).catch(function() {
				console.log("Dollar Street API Error !");
				document.getElementById("spinner").style.visibility = "hidden";
				document.getElementById("cloudwarning").style.visibility = "visible";
			});
		},

		// Update screen visibility
		updateVisibility: function() {
			let vm = this;
			if (vm.currentView == viewDetail) {
				return;
			}
			for (let i = 0 ; i < vm.places.length ; i++) {
				let place = vm.$refs.places[i];
				if (place.isVisible()) {
					place.visible = true;
				}
			}
		},

		// Resize dynamically content
		computeSize: function() {
			let vm = this;
			let body = document.getElementById("body");
			let available = (body.offsetHeight-(vm.$refs.SugarToolbar&&vm.$refs.SugarToolbar.isHidden()?0:55));
			let content = document.getElementById("content");
			content.style.height = available+"px";
			if (vm.currentView==viewList) {
				vm.placeSize = (body.offsetWidth < 700 || body.offsetHeight < 700) ? 1 : 2;
				for (let i = 0 ; i < vm.places.length ; i++) {
					let place = vm.$refs.places[i];
					place.size = vm.placeSize;
					if (place.isVisible()) {
						place.visible = true;
					}
				}
			} else {
				this.$refs.family.computeSize();
			}
		}
	}
});
