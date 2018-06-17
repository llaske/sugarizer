// E-book Reader component
var EbookReader = {
	template: `
		<div>
			<div id="left" class="reader-left" v-on:click="previousPage()"></div>
			<div id="area" class="reader-area"></div>
			<div id="right" class="reader-right" v-on:click="nextPage()"></div>
		</div>`,
	data: function() {
		return {
			rendition: null
		};
	},
	methods: {
		computeScreenSize: function() {
			var canvas = document.getElementById("canvas") || document.getElementById("body");
			var canvas_height = canvas.offsetHeight;
			var canvas_width = canvas.offsetWidth-100;
			return { width: canvas_width, height: canvas_height };
		},

		render: function(book, location) {
			if (this.rendition) {
				this.rendition.clear();
				this.rendition.destroy();
			}
			var options = this.computeScreenSize();
			document.getElementById("left").style.height = options.height + "px";
			document.getElementById("right").style.height = options.height + "px";
			this.rendition = book.renderTo("area", options);
			this.rendition.display(location);
		},

		nextPage: function() {
			if (this.rendition != null) {
				var vm = this;
				var location = vm.getLocation();
				vm.rendition.next().then(function() {},
					function() {vm.rendition.display(location)}
				);
				document.getElementById("right").classList.add("reader-right-sel");
				setTimeout(function() {
					document.getElementById("right").classList.remove("reader-right-sel");
				}, 100);
			}
		},

		previousPage: function() {
			if (this.rendition != null) {
				var vm = this;
				var location = vm.getLocation();
				vm.rendition.prev().then(function() {},
					function() {vm.rendition.display(location)}
				);;
				document.getElementById("left").classList.add("reader-left-sel");
				setTimeout(function() {
					document.getElementById("left").classList.remove("reader-left-sel");
				}, 100);
			}
		},

		getLocation: function() {
			return this.rendition.currentLocation().start.cfi;
		}
	}
};
