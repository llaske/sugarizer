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
		// Init Sugarizer
		require(["sugar-web/activity/activity"], function (activity) {
			activity.setup();
		});
	},
	mounted: function() {
		// Load book
		this.currentBook = ePub("books/pg36780-images.epub");

		// Render e-book
		var reader = this.$children[0];
		reader.render(this.currentBook);

		// Handle previous/next pge
		document.getElementById("next-button").addEventListener("click", function() {
			reader.nextPage();
		});
		document.getElementById("previous-button").addEventListener("click", function() {
			reader.previousPage();
		});

		// Handle resize
		var timer = null;
		var vm = this;
		window.addEventListener("resize", function() {
			if (timer) {
				window.clearTimeout(timer);
			}
			timer = window.setTimeout(function() {
				reader.render(vm.currentBook, reader.getLocation());
			}, 500);
		});
	}
});
