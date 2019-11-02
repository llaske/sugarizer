// Editor component
var Editor = {
	template: `
		<div>
			<div id="back" class="editor-goback" v-on:click="goBack()"></div>
			<img id="miniletter" class="editor-miniletter" v-bind:src="item.image"></img>
			<div id="area" class="editor-area">
				<canvas id="letter"></canvas>
			</div>
			<button id="editor-add" class="editor-add"></button>
			<button id="editor-remove" class="editor-remove"></button>
			<div class="editor-start"></div>
			<button id="editor-addpath" class="editor-addpath"></button>
			<button id="editor-removepath" class="editor-removepath"></button>
			<div class="editor-path"></div>
		</div>`,
	props: ['item'],
	data: function() {
		return {
			size: -1,
			imageSize: -1,
			zoom: -1,
			current: -1,
			keyboardEvent: null
		}
	},
	methods: {
		computeSize: function() {
			// Compute optimal size for letter
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
			vm.zoom = vm.size/vm.imageSize;

			// Draw
			this.draw();
		},

		initEvent: function() {
			// Register click/touch on letter event
			var vm = this;
			var clickEvent = "click";
			var touchScreen = ("ontouchstart" in document.documentElement);
			if (touchScreen) {
				clickEvent = "touchend";
			}
			var letter = document.getElementById("letter");
			letter.addEventListener(clickEvent, function(e) {
				var x = Math.floor((e.clientX-letter.getBoundingClientRect().left)/vm.zoom);
				var y = Math.floor((e.clientY-letter.getBoundingClientRect().top)/vm.zoom);
				if (vm.current != -1) {
					var point = vm.item.starts[vm.current];
					if (!point.path || !point.path.length) {
						point.x = x;
						point.y = y;
					} else {
						var pathpoint = point.path[point.path.length-1];
						pathpoint.x = x;
						pathpoint.y = y;
					}
					vm.draw();
				}
			});

			// Register button events
			document.getElementById("editor-add").addEventListener("click", function() {
				if (!vm.item.starts) {
					vm.item.starts = [];
				}
				var len = vm.item.starts.length;
				vm.item.starts.push({x: 5+5*len, y: 5+5*len, path:[]});
				vm.draw();
			});
			document.getElementById("editor-remove").addEventListener("click", function() {
				vm.item.starts.pop();
				vm.draw();
			});
			document.getElementById("editor-addpath").addEventListener("click", function() {
				var start = vm.item.starts[vm.current];
				if (!start.path) {
					start.path = [];
				}
				var len = start.path.length;
				start.path.push({x: 5+5*len, y: 5+5*len});
				vm.draw();
			});
			document.getElementById("editor-removepath").addEventListener("click", function() {
				var start = vm.item.starts[vm.current];
				start.path.pop();
				vm.draw();
			});

			// Register keyboard event
			vm.keyboardEvent = function(e) {
				if (vm.current != -1) {
					var point = vm.item.starts[vm.current];
					if (point.path && point.path.length) {
						point = point.path[point.path.length-1];
					}
					if (e.keyCode == '38') {
						point.y--;
					} else if (e.keyCode == '40') {
						point.y++;
					}
					else if (e.keyCode == '37') {
						point.x--;
					}
					else if (e.keyCode == '39') {
						point.x++;
					} else if (e.keyCode == '80') {
						document.getElementById("editor-addpath").click();
					}
					vm.draw();
				}
			}
			document.addEventListener("keydown", vm.keyboardEvent);
		},

		draw: function() {
			// Draw board
			var vm = this;
			var letter = document.getElementById("letter");
			var context = letter.getContext('2d');
			context.clearRect(0, 0, vm.size, vm.size);
			var imageObj = new Image();
			imageObj.onload = function() {
				// Draw letter
				context.drawImage(imageObj, 0, 0, vm.size, vm.size);

				// Draw start points
				if (vm.item.starts && vm.item.starts.length) {
					document.getElementById("editor-remove").disabled = false;
					document.getElementById("editor-addpath").disabled = false;
					vm.item.starts.forEach(function(startpoint, i) {
						context.beginPath();
						context.arc(startpoint.x*vm.zoom, startpoint.y*vm.zoom, 2*vm.zoom, 0, 2 * Math.PI);
						context.fillStyle = "red";
						context.fill();
						vm.current = i;
						document.getElementById("editor-removepath").disabled = !(startpoint.path&&startpoint.path.length);

						// Draw path points
						if (startpoint.path && startpoint.path.length) {
							startpoint.path.forEach(function(pathpoint) {
								context.beginPath();
								context.arc(pathpoint.x*vm.zoom, pathpoint.y*vm.zoom, 1*vm.zoom, 0, 2 * Math.PI);
								context.fillStyle = "yellow";
								context.fill();
							})
						}
					});
				} else {
					document.getElementById("editor-remove").disabled = true;
					document.getElementById("editor-addpath").disabled = true;
					document.getElementById("editor-removepath").disabled = true;
				}
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
	},

	mounted: function() {
		var vm = this;
		var imageObj = new Image();
		imageObj.onload = function() {
			vm.imageSize = imageObj.width;

			vm.onLoad();
		};
		imageObj.src = vm.item.image;
	},

	beforeDestroy: function() {
		document.removeEventListener("keydown", this.keyboardEvent);
	}
};
