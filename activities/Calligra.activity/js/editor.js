// Editor component
var Editor = {
	template: `
		<div>
			<div id="area" class="editor-area"></div>
		</div>`,
	data: function() {
		return {
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
			var options = this.computeScreenSize();
			document.getElementById("left").style.height = options.height + "px";
			document.getElementById("right").style.height = options.height + "px";
		}
	}
};
