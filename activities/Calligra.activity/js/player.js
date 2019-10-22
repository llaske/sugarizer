// Player component
var Player = {
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
			zoom: -1,
			current: { start: -1, track: -1, tracks: [] }
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
			vm.zoom = vm.size/document.getElementById("miniletter").naturalWidth;

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
			});
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
		var timeout = 70;
		var step = function() {
			// Draw a segment of path
			var line = vm.current.tracks[vm.current.start][vm.current.track];
			var letter = document.getElementById("letter");
			if (!letter) {
				return;
			}
			var context = letter.getContext('2d');
			context.beginPath();
			context.strokeStyle = app.color.stroke;
			context.lineWidth = 10;
			context.lineCap = "round";
			context.moveTo(vm.zoom*line.x0, vm.zoom*line.y0);
			context.lineTo(vm.zoom*line.x1, vm.zoom*line.y1);
			context.stroke();
			vm.current.track++;
			if (vm.current.track >= vm.current.tracks[vm.current.start].length) {
				vm.current.start++;
				vm.current.track = 0;
				if (vm.current.start < vm.current.tracks.length) {
					setTimeout(step, timeout);
				}
			} else {
				setTimeout(step, timeout);
			}
		}
		if (vm.item.starts) {
			// Create lines set to draw letter
			vm.current.start = 0;
			vm.current.track = 0;
			vm.current.tracks = [];
			for (var i = 0 ; i < vm.item.starts.length ; i++) {
				if (!vm.item.starts[i].path) {
					continue;
				}
				var lines = [];
				var path = vm.item.starts[i].path;
				if (!vm.item.starts[i].path.length) {
					lines.push({x0: vm.item.starts[i].x, y0: vm.item.starts[i].y, x1: vm.item.starts[i].x, y1: vm.item.starts[i].y})
				} else {
					lines.push({x0: vm.item.starts[i].x, y0: vm.item.starts[i].y, x1: path[0].x, y1: path[0].y})
				}
				for (var j = 0 ; j < path.length ; j++) {
					if (j+1 < path.length) {
						lines.push({x0: path[j].x, y0: path[j].y, x1: path[j+1].x, y1: path[j+1].y});
					}
				}
				vm.current.tracks.push(lines);
			}
			setTimeout(step, timeout);
		}
	}
};
