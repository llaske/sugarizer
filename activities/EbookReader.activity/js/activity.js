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
		currentView: EbookReader,
		timer: null
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

		// Handle resize
		window.addEventListener("resize", function() {
			vm.onResize();
		});

		// Handle unfull screen buttons (b)
		document.getElementById("unfullscreen-button").addEventListener('click', function() {
			vm.unfullscreen();
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
		},

		fullscreen: function() {
			document.getElementById("main-toolbar").style.opacity = 0;
			document.getElementById("canvas").style.top = "0px";
			document.getElementById("unfullscreen-button").style.visibility = "visible";
			if (this.currentView === EbookReader) {
				var reader = this.$children[0];
				reader.render(this.currentBook, reader.getLocation());
			}
		},
		unfullscreen: function() {
			document.getElementById("main-toolbar").style.opacity = 1;
			document.getElementById("canvas").style.top = "55px";
			document.getElementById("unfullscreen-button").style.visibility = "hidden";
			if (this.currentView === EbookReader) {
				var reader = this.$children[0];
				reader.render(this.currentBook, reader.getLocation());
			}
		},

		onNext: function() {
			if (this.currentView === EbookReader) {
				this.$children[0].nextPage();
			}
		},
		onPrevious: function() {
			if (this.currentView === EbookReader) {
				this.$children[0].previousPage();
			}
		},

		onResize: function() {
			var vm = this;
			if (vm.currentView === EbookReader) {
				var reader = vm.$children[0];
				if (this.timer) {
					window.clearTimeout(this.timer);
				}
				this.timer = window.setTimeout(function() {
					vm.currentLocation = reader.getLocation();
					reader.render(vm.currentBook, vm.currentLocation);
					this.timer = null;
				}, 500);
			}
		},

		onStop: function() {
			// Save current location in Journal on Stop
			if (this.currentView === EbookReader) {
				var reader = this.$children[0];
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
			}
		}
	}
});
