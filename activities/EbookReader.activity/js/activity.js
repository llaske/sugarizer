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

		// Handle previous/next page
		document.getElementById("next-button").addEventListener("click", function() {
			reader.nextPage();
		});
		document.getElementById("previous-button").addEventListener("click", function() {
			reader.previousPage();
		});

		// Handle full screen
		var vm = this;
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
	}
});
