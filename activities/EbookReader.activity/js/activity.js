// Rebase require directory
requirejs.config({
	baseUrl: "lib"
});


// Vue main app
var app = new Vue({
	el: '#app',
	components: { 'ebook-reader': EbookReader, 'library-viewer': LibraryViewer },
	data: {
		currentBook: null,
		currentLocation: null,
		currentView: EbookReader
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
		this.currentLocation = null;

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
			if (vm.currentView === EbookReader) {
				vm.$children[0].nextPage();
			}
		});
		document.getElementById("previous-button").addEventListener("click", function() {
			if (vm.currentView === EbookReader) {
				vm.$children[0].previousPage();
			}
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
			if (vm.currentView === EbookReader) {
				var reader = vm.$children[0];
				if (timer) {
					window.clearTimeout(timer);
				}
				timer = window.setTimeout(function() {
					vm.currentLocation = reader.getLocation();
					reader.render(vm.currentBook, vm.currentLocation);
				}, 500);
			}
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

		// Handle library button
		document.getElementById("library-button").addEventListener("click", function() {
			vm.switchView();
		});
	},
	updated: function() {
		if (this.currentView === EbookReader) {
			this.$children[0].render(this.currentBook, this.currentLocation);
		}
	},
	methods: {
		switchView: function() {
			if (this.currentView === EbookReader) {
				this.currentLocation = this.$children[0].getLocation();
				this.currentView = LibraryViewer;
			} else {
				this.currentView = EbookReader;
			}
		}
	}
});
