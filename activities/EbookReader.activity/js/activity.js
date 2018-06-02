// Rebase require directory
requirejs.config({
	baseUrl: "lib"
});


// Vue main app
var app = new Vue({
	el: '#app',
	components: { 'ebook-reader': EbookReader },
	data: {
		currentBook: null
	},
	created: function() {
		require(["sugar-web/activity/activity", "sugar-web/env"], function(activity, env) {
			// Initialize Sugarizer
			activity.setup();
		});
	},
	mounted: function() {
		// Load book
		var vm = this;
		this.currentBook = ePub("books/pg36780-images.epub");

		// Render e-book
		var reader = this.$children[0];
		require(["sugar-web/activity/activity", "sugar-web/env"], function(activity, env) {
			// Load last location from Journal
			env.getEnvironment(function(err, environment) {
				if (environment.objectId) {
					activity.getDatastoreObject().loadAsText(function(error, metadata, data) {
						if (error==null && data!=null) {
							// Render at last position
							reader.render(vm.currentBook, JSON.parse(data));
						}
					});
				} else {
					// Render from the beginning
					reader.render(vm.currentBook);
				}
			});
		});

		// Handle previous/next page
		document.getElementById("next-button").addEventListener("click", function() {
			reader.nextPage();
		});
		document.getElementById("previous-button").addEventListener("click", function() {
			reader.previousPage();
		});

		// Handle full screen
		document.getElementById("fullscreen-button").addEventListener('click', function() {
			document.getElementById("main-toolbar").style.opacity = 0;
			document.getElementById("canvas").style.top = "0px";
			document.getElementById("unfullscreen-button").style.visibility = "visible";
			reader.render(vm.currentBook, reader.getLocation());
		});
		document.getElementById("unfullscreen-button").addEventListener('click', function() {
			document.getElementById("main-toolbar").style.opacity = 1;
			document.getElementById("canvas").style.top = "55px";
			document.getElementById("unfullscreen-button").style.visibility = "hidden";
			reader.render(vm.currentBook, reader.getLocation());
		});

		// Handle resize
		var timer = null;
		window.addEventListener("resize", function() {
			if (timer) {
				window.clearTimeout(timer);
			}
			timer = window.setTimeout(function() {
				reader.render(vm.currentBook, reader.getLocation());
			}, 500);
		});

		// Save current location in Journal on Stop
		document.getElementById("stop-button").addEventListener('click', function(event) {
			require(["sugar-web/activity/activity"], function(activity) {
				console.log("writing...");
				var jsonData = JSON.stringify(reader.getLocation());
				activity.getDatastoreObject().setDataAsText(jsonData);
				activity.getDatastoreObject().save(function(error) {
					if (error === null) {
						console.log("write done.");
					} else {
						console.log("write failed.");
					}
				});
			});
		});
	}
});
