// Editor component
var Editor = {
	template: `
		<div>
			<div id="back" class="editor-goback" v-on:click="goBack()"></div>
			<img id="miniletter" class="editor-miniletter" v-bind:src="item.image" v-on:load="onLoad()"></img>
			<div id="area" class="editor-area">
				<canvas id="letter"></canvas>
			</div>
		</div>`,
	props: ['item'],
	methods: {
		fitSize: function() {
			var body = document.getElementById("canvas") || document.getElementById("body");
			var body_height = body.offsetHeight-50;
			var body_width = body.offsetWidth-50;
			var size = { width: body_width, height: body_height };
			var lettersize = Math.min(size.width, size.height);
			var letter = document.getElementById("letter");
			letter.width = lettersize;
			letter.height = lettersize;
			letter.style.marginLeft = (size.width-lettersize)/2-50 + "px";
			var context = letter.getContext('2d');
			var imageObj = new Image();
			imageObj.onload = function() {
				context.drawImage(imageObj, 0, 0, lettersize, lettersize);
			};
			imageObj.src = this.item.image;
			//console.log("ratio="+lettersize/document.getElementById("miniletter").naturalWidth);
		},

		onLoad: function() {
			this.fitSize();
		},

		goBack: function() {
			app.displayTemplateView();
		}
	}
};
