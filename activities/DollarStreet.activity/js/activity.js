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
	data: {},
	methods: {
		dollarStreetConnected: function() {
			console.log("Dollar Street API connected");
			document.getElementById("spinner").style.visibility = "hidden";
		},

		dollarStreetError: function() {
			console.log("Dollar Street API Error !");
			document.getElementById("spinner").style.visibility = "hidden";
			document.getElementById("cloudwarning").style.visibility = "visible";
		}
	}
});
