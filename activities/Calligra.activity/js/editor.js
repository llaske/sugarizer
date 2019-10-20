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
	data: function() {
		return {
			size: -1,
			zoom: -1
		}
	},
	methods: {
		computeSize: function() {
			var vm = this;
			var body = document.getElementById("canvas") || document.getElementById("body");
			var body_height = body.offsetHeight-50;
			var body_width = body.offsetWidth-50;
			var size = { width: body_width, height: body_height };
			vm.size = Math.min(size.width, size.height);
			var letter = document.getElementById("letter");
			letter.width = vm.size;
			letter.height = vm.size;
			letter.style.marginLeft = (size.width-vm.size)/2-50 + "px";
			vm.zoom = vm.size/document.getElementById("miniletter").naturalWidth;
			this.draw();
		},

		initEvent: function() {
			var vm = this;
			var clickEvent = "click";
			var touchScreen = ("ontouchstart" in document.documentElement);
			if (touchScreen) {
				clickEvent = "touchend";
			}
			var letter = document.getElementById("letter");
			letter.addEventListener(clickEvent, function(e) {
				var x = (e.clientX-letter.getBoundingClientRect().left)/vm.zoom;
				var y = (e.clientY-letter.getBoundingClientRect().top)/vm.zoom;
				console.log(x+","+y);
			});
		},

		draw: function() {
			var vm = this;
			var letter = document.getElementById("letter");
			var context = letter.getContext('2d');
			var imageObj = new Image();
			imageObj.onload = function() {
				context.drawImage(imageObj, 0, 0, vm.size, vm.size);
			};
			imageObj.src = vm.item.image;
		},

		onLoad: function() {
			this.computeSize();
			this.initEvent();
		},

		goBack: function() {
			app.displayTemplateView();
		}
	}
};
