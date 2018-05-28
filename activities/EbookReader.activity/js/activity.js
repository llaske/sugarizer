define(["sugar-web/activity/activity"], function (activity) {

	// Manipulate the DOM only when it is ready.
	require(['domReady!'], function (doc) {

		// Initialize the activity.
		activity.setup();

		// Compute screen size
		var fitToScreen = function() {
			var canvas = document.getElementById("canvas") || document.getElementById("body");
			var canvas_height = canvas.offsetHeight;
			var canvas_width = canvas.offsetWidth;

			return { width: canvas_width, height: canvas_height };
		}

		// Read e-book
		var book = ePub("books/pg36780-images.epub");

		// Render it
		var options = fitToScreen();
		options.method = "continuous";
		options.flow = "paginated";
		var rendition =
			book.renderTo("area", fitToScreen());
		rendition.display();

		// Handle previous/next pge
		document.getElementById("next-button").addEventListener("click", function() {
			rendition.next();
		});
		document.getElementById("previous-button").addEventListener("click", function() {
			rendition.prev();
			console.log(rendition.currentLocation())
		});

		// Handle resize
		var timer = null;
		window.addEventListener("resize", function() {
			if (timer) {
				window.clearTimeout(timer);
			}
			timer = window.setTimeout(function() {
				rendition.clear();
				rendition.destroy();
				rendition = book.renderTo("area", fitToScreen());
				rendition.display();
			}, 500);
		});
	});

});
