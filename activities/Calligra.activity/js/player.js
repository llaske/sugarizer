// Player component
var Player = {
	template: `
		<div>
			<div id="back" class="editor-goback" v-on:click="goBack()"></div>
			<img id="miniletter" class="editor-miniletter" v-bind:src="item.image" v-bind:style="{visibility:item.image?'visible':'hidden'}"></img>
			<div id="miniword" class="editor-miniword" v-bind:style="computeStyle()">{{item.text}}</div>
			<div id="area" class="editor-area">
				<canvas id="letter"></canvas>
			</div>
			<button id="player-restart" class="player-restart"></button>
			<button id="player-next-letter" class="player-next" v-on:click="nextItem()"></button>
			<div id="cursor" class="player-cursor"></div>
			<div id="debugpos" class="player-debug-position">X: 0 / Y: 0</div>
			<div id="debugtarget" class="player-debug-target">CX: 0 / CY: 0</div>
		</div>`,
	props: ['item'],
	data: function() {
		return {
			size: -1,
			imageSize: -1,
			fontSize: 6,
			zoom: -1,
			starts: [],
			current: { start: -1, stroke: -1, strokes: [], index: -1, cursor: {x: 0, y: 0}, timeout: null },
			zoomMult: 1,
			computed: false,
			mode: '',
			drawing: false,
			debug: false,
			precision: 5,
			angleTolerance: 0.7,
			isText: false
		}
	},
	methods: {
		computeSize: function() {
			// Compute optimal size for letter
			var vm = this;
			var body = document.getElementById("canvas") || document.getElementById("body");
			var body_height = body.offsetHeight-100;
			var body_width = body.offsetWidth-50;
			var size = { width: body_width, height: body_height };
			vm.size = Math.min(size.width, size.height);
			var letter = document.getElementById("letter");
			vm.isText = vm.item.text;
			letter.width = vm.isText ? vm.size*1.5 : vm.size;
			letter.height = vm.size;
			letter.style.marginLeft = (vm.isText ? 0 : (size.width-vm.size)/2-50) + "px";
			if (vm.isText && !vm.computed) {
				// Compute optimal font size to fill the word rectangle
				var rect = {width: 100, height: 100};
				var overflow = false;
				var opt = 6;
				for (var i = opt ; i<300 && !overflow ; i++) {
					let size = getTextSize(this.item.text, i+"px Arial"); // HACK: Should be Graphecrit but can't wait to load it
					overflow = size.width > rect.width || 2*size.height > rect.height;
					if (!overflow) { opt = i }
				}
				vm.fontSize = opt;
				let fontZoom = (opt-50)/64; // 50px is the standard size
				vm.zoomMult = 1+fontZoom;
				vm.computed = true;
			}
			vm.zoom = (vm.size/vm.imageSize)*vm.zoomMult;
			vm.size *= vm.zoomMult;

			// Draw
			this.draw();
		},

		computeStyle: function() {
			var style = {};
			style.visibility = this.item.text?'visible':'hidden';
			style.fontSize = this.fontSize+'px';
			return style;
		},

		init: function() {
			var vm =this;
			vm.computed = false;
			vm.initComponent(function() {
				vm.onLoad();
				vm.startDemoMode();
			});
		},

		initComponent: function(then) {
			var vm = this;
			if (vm.item.image) {
				// Add start points for the item
				vm.starts = [];
				for (var i = 0 ; i < vm.item.starts.length ; i++) {
					vm.starts.push(vm.item.starts[i]);
				}

				// Load item image
				var imageObj = new Image();
				imageObj.onload = function() {
					vm.imageSize = imageObj.width;
					if (then) {
						let images = [];
						images.push({image:imageObj, x: 0, y: 0});
						then(images);
					}
				};
				imageObj.src = vm.item.image;
			} else if (vm.item.text) {
				// Identify items for each letter
				var items = [];
				for (let i = 0 ; i < vm.item.text.length ; i++) {
					var letter = vm.item.text[i];
					var needlow = (letter=='b'||letter=='o'||letter=='v'||letter=='w')&&(i!=vm.item.text.length-1);
					var needhigh = (letter=='e')&&(i!=0);
					for (let j = 0 ; j < app.currentLibrary.length ; j++ ) {
						for (let k = 0 ; k < app.currentLibrary[j].images.length ; k++) {
							var item = app.currentLibrary[j].images[k];
							if (letter == item.letter && (!needlow || item.low) && (!needhigh || item.high)) {
								items.push(item);
								break;
							}
						}
					}
				}

				// Add start point for each letter
				vm.starts = [];
				let minmax = [];
				for (let i = 0 ; i < items.length ; i++) {
					// Compute real size of letter using leftmost and rightmost point
					let newMax = 0;
					let newMin = Number.MAX_VALUE;
					for (let j = 0 ; j < items[i].starts.length ; j++) {
						let start = items[i].starts[j];
						newMax = Math.max(start.x, newMax);
						newMin = Math.min(start.x, newMin);
						for (var k = 0 ; k < start.path.length ; k++) {;
							newMax = Math.max(start.path[k].x, newMax);
							newMin = Math.min(start.path[k].x, newMin);
						}
					}
					if (items[i].letter == 'j' && i > 0) {
						newMin = Math.min(items[i].starts[0].x); // For letter j the minim is start of letter because leg is before
					}
					minmax.push({max: newMax, min:newMin});
				}
				let shift = 0;
				let shifts = [];
				let points = [];
				for (let i = 0 ; i < items.length ; i++) {
					// Add each letter starting point shifted depending previous letter
					let localshift = 3-minmax[i].min;
					shift += (i == 0 ? 0 : minmax[i-1].max-minmax[i-1].min);
					shifts.push(shift+localshift);
					for (let j = 0 ; j < items[i].starts.length ; j++) {
						let start = JSON.parse(JSON.stringify(items[i].starts[j])); // HACK: Duplicate objects and arrays
						start.x += shift+localshift;
						for (var k = 0 ; k < start.path.length ; k++) {
							start.path[k].x += shift+localshift;
						}
						if ((items[i].letter == 'i' || items[i].letter == 'j') && j == items[i].starts.length-1) {
							points.push(start); // Add point for i and j at end
						} else {
							vm.starts.push(start);
						}
					}
				}
				if (points.length > 0) {
					Array.prototype.push.apply(vm.starts, points);
				}

				// Load all images
				let waitfor = items.length;
				let images = [];
				for (let i = 0 ; i < items.length ; i++) {
					let imageObj = new Image();
					images.push({image:imageObj, x:shifts[i], y: 0});
					imageObj.onload = function() {
						if (--waitfor == 0) {
							vm.imageSize = imageObj.width;
							then(images)
						}
					};
					imageObj.src = items[i].image;
				}
			}
		},

		initEvent: function() {
			// Restart button
			var vm = this;
			var restart = document.getElementById("player-restart");
			restart.addEventListener("click", function(e) {
				vm.startDemoMode();
			});

			// Debug information
			if (vm.debug) {
				document.getElementById("debugpos").style.visibility = "visible";
				document.getElementById("debugtarget").style.visibility = "visible";
			}

			// Register mouse/touch on letter event
			var downEvent = "mousedown";
			var moveEvent = "mousemove"
			var upEvent = "mouseup";
			var touchScreen = ('ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0);;
			if (touchScreen) {
				downEvent = "touchstart";
				moveEvent = "touchmove";
				upEvent = "touchend";
			}
			var cursor = document.getElementById("cursor");
			cursor.addEventListener(moveEvent, function(e) {
				e.preventDefault();
				if (vm.mode != 'input' || !vm.drawing) {
					return;
				}
				if (touchScreen) {
					e = e.touches[0];
					vm.precision = 8000 / window.innerHeight; // Precision depend of screen size
					vm.angleTolerance = 1.4;
				}
				var x = Math.floor((e.clientX-letter.getBoundingClientRect().left)/vm.zoom);
				var y = Math.floor((e.clientY-letter.getBoundingClientRect().top)/vm.zoom);
				vm.handleMouseMove(x, y);
			});
			cursor.addEventListener(downEvent, function(e) {
				e.preventDefault();
				vm.drawing = (vm.mode == 'input');
			});
			cursor.addEventListener(upEvent, function(e) {
				e.preventDefault();
				vm.drawing = false;
			});

			var letter = document.getElementById("letter");
			letter.addEventListener(downEvent, function(e) {
				e.preventDefault();
				vm.drawing = (vm.mode == 'input');
			});
			letter.addEventListener(upEvent, function(e) {
				e.preventDefault();
				vm.drawing = false;
			});
			letter.addEventListener(moveEvent, function(e) {
				e.preventDefault();
				if (vm.mode != 'input' || !vm.drawing) {
					return;
				}
				if (touchScreen) {
					e = e.touches[0];
				}
				var x = Math.floor((e.clientX-letter.getBoundingClientRect().left)/vm.zoom);
				var y = Math.floor((e.clientY-letter.getBoundingClientRect().top)/vm.zoom);
				vm.handleMouseMove(x, y);
			});
		},

		draw: function() {
			// Draw board
			var vm = this;
			var letter = document.getElementById("letter");
			var context = letter.getContext('2d');
			context.clearRect(0, 0, vm.zoom*(vm.isText?letter.width:vm.imageSize), vm.size);
			vm.initComponent(function(images) {
				// Draw lines
				vm.drawLines();

				// Draw letters images
				if (images) {
					for (let i = 0 ; i < images.length ; i++) {
						let image = images[i];
						if (vm.isText) {
							context.drawImage(image.image, vm.zoom*image.x, vm.zoom*image.y, vm.size, vm.size);
						} else {
							context.drawImage(image.image, 0, 0, vm.size, vm.size);
						}
					}
				}

				// Draw current drawing
				if (vm.mode == 'input' && vm.current.strokes.length) {
					vm.drawStoke();
				}
			});
		},

		drawLines: function() {
			if (app.$refs.toolbar.$refs.lines.isActive) {
				var vm = this;
				var letter = document.getElementById("letter");
				var context = letter.getContext('2d');
				context.strokeStyle = "lightgray";
				context.lineWidth = 3;
				var linesY = [8, 85, 122, 202];
				for (var i = 0 ; i < linesY.length ; i++) {
					context.beginPath();
					context.moveTo(vm.zoom*0, vm.zoom*linesY[i]);
					context.lineTo(vm.zoom*(vm.isText?letter.width:vm.imageSize),vm.zoom*linesY[i]);
					context.stroke();
				}
			}
		},

		drawStoke: function() {
			// Draw user stroke
			var vm = this;
			var letter = document.getElementById("letter");
			var context = letter.getContext('2d');
			context.strokeStyle = app.color.stroke;
			context.lineWidth = 10;
			context.lineCap = "round";
			context.lineJoin = "round";
			for (var i = 0 ; i < vm.current.strokes.length ; i++) {
				context.beginPath();
				for (var j = 0 ; j < vm.current.strokes[i].length ; j++) {
					context.lineTo(vm.zoom*vm.current.strokes[i][j].x, vm.zoom*vm.current.strokes[i][j].y);
				}
				context.stroke();
			}
		},

		moveCursor: function(e) {
			var vm = this;
			var cursor = document.getElementById("cursor");
			if (!cursor) {
				return;
			}
			cursor.style.left = (e.x+letter.getBoundingClientRect().left-23)+"px";
			cursor.style.top = (e.y)+"px";
			vm.current.cursor = {x: e.x, y: e.y};
		},

		setCursorVisibility: function(visible) {
			var cursor = document.getElementById("cursor");
			if (!cursor) {
				return;
			}
			cursor.style.visibility = visible?"visible":"hidden";
		},

		handleMouseMove: function(x, y) {
			var vm = this;
			var target = (vm.starts[vm.current.start].path.length?vm.starts[vm.current.start].path[vm.current.index]:vm.starts[vm.current.start]);
			if (vm.debug) {
				document.getElementById("debugpos").innerText = "X: "+x+" / Y: "+y;
				document.getElementById("debugtarget").innerText = "CX: "+target.x+" / CY: "+target.y;
			}
			vm.moveCursor({x:vm.zoom*target.x, y: vm.zoom*target.y});
			var distance = Math.sqrt(Math.pow(x-target.x,2)+Math.pow(y-target.y,2));
			var ptarget = vm.current.index > 0 ? vm.starts[vm.current.start].path[vm.current.index-1] : target;
			var vtotarget = {x:x-ptarget.x, y:y-ptarget.y};
			var vtoprev = {x:target.x-ptarget.x, y:target.y-ptarget.y};
			var diff = Math.abs(Math.atan(vtoprev.y/vtoprev.x)-Math.atan(vtotarget.y/vtotarget.x));
			if (distance <= vm.precision && (diff < vm.angleTolerance || Number.isNaN(diff)) ) {
				vm.current.strokes[vm.current.start].push({x: target.x, y: target.y});
				vm.drawStoke();
				vm.current.index++;
				if (vm.current.index >= vm.starts[vm.current.start].path.length) {
					vm.current.start++;
					vm.current.index = 0;
					if (vm.current.start >= vm.starts.length) {
						vm.mode = 'end';
						vm.setCursorVisibility(false);
						setTimeout(function(){
							confetti({
								particleCount: 200,
								spread: 70,
								origin: { y: 0.6 }
							  });
						 }, 500);

					} else {
						var lines = [{x: vm.starts[vm.current.start].x, y:vm.starts[vm.current.start].y}];
						vm.moveCursor({x: vm.zoom*lines[0].x, y: vm.zoom*lines[0].y});
						vm.current.strokes.push(lines);
						vm.drawStoke();
					}
				}
			}
		},

		startDemoMode: function() {
			var vm = this;
			var timeout = 70/(vm.isText?vm.item.text.length:1);
			vm.mode = 'show';
			var step = function() {
				// Draw a segment of path
				if (!vm.current || !vm.current.strokes || !vm.current.strokes[vm.current.start] || !vm.current.strokes[vm.current.start][vm.current.stroke]) { return; }
				var line = vm.current.strokes[vm.current.start][vm.current.stroke];
				var letter = document.getElementById("letter");
				if (!letter) {
					return;
				}
				var context = letter.getContext('2d');
				context.beginPath();
				context.strokeStyle = app.color.stroke;
				context.lineWidth = 10;
				context.lineCap = "round";
				context.lineJoin = "round";
				context.moveTo(vm.zoom*line.x0, vm.zoom*line.y0);
				context.lineTo(vm.zoom*line.x1, vm.zoom*line.y1);
				context.stroke();
				vm.moveCursor({x: vm.zoom*line.x1, y: vm.zoom*line.y1});
				vm.current.stroke++;
				if (vm.current.stroke >= vm.current.strokes[vm.current.start].length) {
					vm.current.start++;
					vm.current.stroke = 0;
					if (vm.current.start < vm.current.strokes.length) {
						vm.current.timeout = setTimeout(function() { // Pause on each start
							vm.current.timeout = setTimeout(step, timeout);
						}, timeout*3);
					} else {
						vm.current.timeout = setTimeout(function() {
							// End of draw, start input mode
							vm.startInputMode();
							vm.current.timeout = null;
						}, timeout*10);
					}
				} else {
					vm.current.timeout = setTimeout(step, timeout);
				}
			}
			if (vm.starts && vm.starts[0].path.length) {
				// Clear stroke before draw
				vm.draw();

				// Create lines set to draw letter
				vm.current.start = 0;
				vm.current.stroke = 0;
				vm.current.strokes = [];
				for (var i = 0 ; i < vm.starts.length ; i++) {
					if (!vm.starts[i].path) {
						continue;
					}
					var lines = [];
					var path = vm.starts[i].path;
					if (!vm.starts[i].path.length) {
						lines.push({x0: vm.starts[i].x, y0: vm.starts[i].y, x1: vm.starts[i].x, y1: vm.starts[i].y})
					} else {
						lines.push({x0: vm.starts[i].x, y0: vm.starts[i].y, x1: path[0].x, y1: path[0].y})
					}
					for (var j = 0 ; j < path.length ; j++) {
						if (j+1 < path.length) {
							lines.push({x0: path[j].x, y0: path[j].y, x1: path[j+1].x, y1: path[j+1].y});
						}
					}
					vm.current.strokes.push(lines);
				}
				var line = vm.current.strokes[vm.current.start][vm.current.stroke];
				vm.moveCursor({x: vm.zoom*line.x0, y: vm.zoom*line.y0});
				vm.setCursorVisibility(true);
				vm.current.timeout = setTimeout(step, 100);
			}
		},

		startInputMode: function() {
			var vm = this;
			vm.mode = 'input';
			vm.current.start = 0;
			vm.current.stroke = 0;
			vm.current.index = 0;
			vm.current.strokes = [];
			if (vm.starts && vm.starts.length) {
				var lines = [{x: vm.starts[0].x, y:vm.starts[0].y}];
				vm.moveCursor({x: vm.zoom*lines[0].x, y: vm.zoom*lines[0].y});
				vm.setCursorVisibility(true)
				vm.current.strokes.push(lines);
			}
			vm.draw();
		},

		onLoad: function() {
			this.computeSize();
			this.initEvent();

			// Colorize cursor
			requirejs(["sugar-web/graphics/icon"], function(iconlib) {
				iconlib.colorize(document.getElementById("cursor"), app.color, function() {
				});
			});
		},

		doZoom: function(level) {
			var vm = this;
			var zoomMult = 1;
			var cursor = {x:vm.current.cursor.x/vm.zoom, y:vm.current.cursor.y/vm.zoom};
			switch(level.zoom) {
				case 0:
					zoomMult = 0.9;
					break;
				case 1:
					vm.zoomMult = 1;
					break;
				case 2:
					zoomMult *= 1.1;
					break;
			}
			vm.zoomMult *= zoomMult;
			vm.computeSize();
			vm.moveCursor({x:vm.zoom*cursor.x, y:vm.zoom*cursor.y});
		},

		doFullscreen: function(full) {
			var vm = this;
			var cursor = {x:vm.current.cursor.x/vm.zoom, y:vm.current.cursor.y/vm.zoom};
			vm.computeSize();
			vm.moveCursor({x:vm.zoom*cursor.x, y:vm.zoom*cursor.y});
		},

		goBack: function() {
			app.displayTemplateView();
		},
		nextItem: function () {
			var vm = this;
			vm.item = app.nextItem(vm.item);
			vm.init();
		}
	},

	mounted: function() {
		var vm = this;
		vm.init();
	},

	beforeDestroy: function() {
		var vm = this;
		if (vm.current.timeout) {
			clearTimeout(vm.current.timeout);
		}
	}
};
