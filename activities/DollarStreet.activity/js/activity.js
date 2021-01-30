// Rebase require directory
requirejs.config({
	baseUrl: "lib",
	paths: {
		activity: "../js"
	}
});

// Vue main app
var app = new Vue({
	el: '#app',
	components: {
		'street-place': StreetPlace
	},
	data: {
		places: [],
		currentThing: "families",
		currentRegion: null,
		currentMinIncome: 0,
		currentMaxIncome: 0,
		timerId: null,
		timerData: null,
		SugarL10n: null,
		l10n: {
			stringIncomePalette: '',
			stringWorldButton: '',
			stringFamilyButton: '',
			stringThingsButton: ''
		}
	},
	created() {
		let vm = this;
		vm.computeHeight();
		window.addEventListener("resize", vm.computeHeight);
	},
	mounted: function() {
		this.SugarL10n = this.$refs.SugarL10n;
		this.updateVisibility();
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
			this.computeHeight();
		},

		unfullscreen: function() {
			this.$refs.SugarToolbar.show();
			this.computeHeight();
		},

		// Dollar Street API events
		dollarStreetConnected: function() {
			let vm = this;
			console.log("Dollar Street API connected");
			let settings = vm.$refs.api.getStreetSettings();
			vm.currentMinIncome = settings.poor;
			vm.currentMaxIncome = settings.rich;
			vm.displayThings();
		},

		dollarStreetError: function() {
			console.log("Dollar Street API Error !");
			document.getElementById("spinner").style.visibility = "hidden";
			document.getElementById("cloudwarning").style.visibility = "visible";
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
		onPlaceClicked(place) {
			let vm = this;
			vm.$refs.api.getThingsForPlace(place).then(function(things) {
				console.log(things);
			});
		},

		// Update screen visibility
		updateVisibility: function() {
			let vm = this;
			for (let i = 0 ; i < vm.places.length ; i++) {
				let place = vm.$refs.places[i];
				if (place.isVisible()) {
					place.visible = true;
				}
			}
		},

		// Resize dynamically content
		computeHeight: function() {
			let vm = this;
			let available = (document.getElementById("body").offsetHeight-(vm.$refs.SugarToolbar&&vm.$refs.SugarToolbar.isHidden()?0:55));
			let content = document.getElementById("content");
			content.style.height = available+"px";
		}
	}
});
