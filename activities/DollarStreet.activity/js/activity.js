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
		currentRegion: null
	},
	created() {
		let vm = this;

		// Resize dynamically content
		var computeHeight = function() {
			let available = (document.getElementById("body").offsetHeight-(vm.$refs.SugarToolbar&&vm.$refs.SugarToolbar.isHidden()?0:55));
			let content = document.getElementById("content");
			content.style.height = available+"px";
		}
		computeHeight();
		window.addEventListener("resize", computeHeight);
	},
	mounted: function() {
		this.updateVisibility();
	},
	updated: function() {
		this.updateVisibility();
	},
	methods: {
		// Dollar Street API events
		dollarStreetConnected: function() {
			let vm = this;
			console.log("Dollar Street API connected");
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
			document.getElementById("spinner").style.visibility = "visible"
			vm.$refs.api.getStreetPlaces(vm.currentThing, vm.currentRegion).then(function(response) {
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
			let thingName = thing.originPlural.toLowerCase().replace(" ","-");
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

		// Update screen visibility
		updateVisibility: function() {
			let vm = this;
			for (let i = 0 ; i < vm.places.length ; i++) {
				let place = vm.$refs.places[i];
				if (place.isVisible()) {
					place.visible = true;
				}
			}
		}
	}
});
