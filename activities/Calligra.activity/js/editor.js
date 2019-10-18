// Editor component
var Editor = {
	template: `
		<div>
			<div id="back" class="editor-goback" v-on:click="goBack()"></div>
			<div id="area" class="editor-area">
				<img id="letter" class="" v-bind:src="item.image"></img>
			</div>
		</div>`,
	props: ['item'],
	methods: {
		fitSize: function() {
			var canvas = document.getElementById("canvas") || document.getElementById("body");
			var canvas_height = canvas.offsetHeight-50;
			var canvas_width = canvas.offsetWidth-50;
			var size = { width: canvas_width, height: canvas_height };
			var lettersize = Math.min(size.width, size.height);
			var letter = document.getElementById("letter");
			letter.style.width = lettersize + "px";
			letter.style.marginLeft = (size.width-lettersize-50)/2 + "px";
		},

		goBack: function() {
			app.displayTemplateView();
		}
	},

	mounted: function() {
		this.fitSize();
	}
};
