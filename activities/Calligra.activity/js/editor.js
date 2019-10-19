// Editor component
var Editor = {
	template: `
		<div>
			<div id="back" class="editor-goback" v-on:click="goBack()"></div>
			<img id="miniletter" class="editor-miniletter" v-bind:src="item.image" v-on:load="onLoad()"></img>
			<div id="area" class="editor-area">
				<img id="letter" v-bind:src="item.image"></img>
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
			letter.style.marginLeft = (size.width-lettersize)/2-50 + "px";
			//console.log("ratio="+lettersize/letter.naturalWidth);
		},

		onLoad: function() {
			this.fitSize();
		},

		goBack: function() {
			app.displayTemplateView();
		}
	}
};
