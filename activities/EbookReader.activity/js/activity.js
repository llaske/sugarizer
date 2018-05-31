// Rebase require directory
requirejs.config({
	baseUrl: "lib"
});


// E-book Reader component
var EbookReader = {
	template: '<div id="area" style="background-color: white"></div>'
};

// Vue main app
var app = new Vue({
	el: '#app',
	components: { 'ebook-reader': EbookReader },
	created: function() {
		// Init Sugarizer
		require(["sugar-web/activity/activity"], function (activity) {
			// Initialize the activity.
			activity.setup();

			// Compute screen size
			var fitToScreen = function() {
				var canvas = document.getElementById("canvas") || document.getElementById("body");
				var canvas_height = canvas.offsetHeight;
				var canvas_width = canvas.offsetWidth;
				return { width: canvas_width, height: canvas_height };
			}

			// Render book
			var rendition = null;
			var renderBook = function(target) {
				if (rendition) {
					rendition.clear();
					rendition.destroy();
				}
				var options = fitToScreen();
				rendition = book.renderTo("area", options);
				rendition.display(target);
			}

			// Read e-book
			var book = ePub("books/pg36780-images.epub");

			// Render it
			renderBook();

			// Handle previous/next pge
			document.getElementById("next-button").addEventListener("click", function() {
				rendition.next();
			});
			document.getElementById("previous-button").addEventListener("click", function() {
				rendition.prev();
			});

			// Handle resize
			var timer = null;
			window.addEventListener("resize", function() {
				if (timer) {
					window.clearTimeout(timer);
				}
				timer = window.setTimeout(function() {
					renderBook(rendition.currentLocation().start.cfi);
				}, 500);
			});
		});
	}
});
