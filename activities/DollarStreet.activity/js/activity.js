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
		places: []
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
	methods: {
		// Dollar Street API events
		dollarStreetConnected: function() {
			let vm = this;
			console.log("Dollar Street API connected");
			vm.displayFamily();
		},

		dollarStreetError: function() {
			console.log("Dollar Street API Error !");
			document.getElementById("spinner").style.visibility = "hidden";
			document.getElementById("cloudwarning").style.visibility = "visible";
		},

		// Display families
		displayFamily: function() {
			let vm = this;
			vm.places = [];
			document.getElementById("spinner").style.visibility = "visible"
			vm.$refs.api.getStreetPlaces().then(function(response) {
				document.getElementById("spinner").style.visibility = "hidden";
				vm.places = response;
			});
		},

		// Display a category of things
		displayThings: function(thing) {
			let vm = this;
			vm.places = [];
			document.getElementById("spinner").style.visibility = "visible"
			vm.$refs.api.getStreetPlaces(thing).then(function(response) {
				document.getElementById("spinner").style.visibility = "hidden";
				vm.places = response;
			});
		},

		// Button family clicked
		familyClicked: function() {
			let vm = this;
			if (document.getElementById("family-button").classList.contains("active")) {
				return;
			}
			document.getElementById("family-button").classList.add("active");
			document.getElementById("things-button").classList.remove("active");
			vm.displayFamily();
		},

		// Button things clicked
		thingsClicked: function() {
			let vm = this;
			if (document.getElementById("things-button").classList.contains("active")) {
				return;
			}
			document.getElementById("family-button").classList.remove("active");
			document.getElementById("things-button").classList.add("active");
			let thing = vm.$refs.api.getPopularThings()[0];
			let thingName = thing.originPlural.toLowerCase().replace(" ","-");
			vm.displayThings(thingName);
		}
	}
});
