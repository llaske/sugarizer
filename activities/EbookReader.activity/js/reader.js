// E-book Reader component
var EbookReader = {
	template: '<div id="area" style="background-color: white"></div>',
	data: function() {
		return {
			rendition: null
		};
	},
	methods: {
		computeScreenSize: function() {
			var canvas = document.getElementById("canvas") || document.getElementById("body");
			var canvas_height = canvas.offsetHeight;
			var canvas_width = canvas.offsetWidth;
			return { width: canvas_width, height: canvas_height };
		},

		render: function(book, location) {
			if (this.rendition) {
				this.rendition.clear();
				this.rendition.destroy();
			}
			var options = this.computeScreenSize();
			this.rendition = book.renderTo("area", options);
			this.rendition.display(location);
		},

		nextPage: function() {
			if (this.rendition != null) {
				this.rendition.next();
			}
		},

		previousPage: function() {
			if (this.rendition != null) {
				this.rendition.prev();
			}
		},

		getLocation: function() {
			return this.rendition.currentLocation().start.cfi;
		}
	}
};
