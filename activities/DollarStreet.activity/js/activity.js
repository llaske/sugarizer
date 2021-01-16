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
		dollarStreetConnected: function() {
			let vm = this;
			console.log("Dollar Street API connected");
			document.getElementById("spinner").style.visibility = "hidden";
			vm.$refs.api.getStreetPlaces().then(function(response) {
				vm.places = response;
				console.log(response[0])
			});
		},

		dollarStreetError: function() {
			console.log("Dollar Street API Error !");
			document.getElementById("spinner").style.visibility = "hidden";
			document.getElementById("cloudwarning").style.visibility = "visible";
		}
	}
});
