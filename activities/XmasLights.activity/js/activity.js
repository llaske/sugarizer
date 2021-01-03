// Rebase require directory
requirejs.config({
	baseUrl: "lib",
	paths: {
		activity: "../js"
	}
});

// Initial sequence
// -- [] to iterate on existing icons
// -- ["id1", "id2"]
const initIconsSequences = [[], ["org.sugarlabs.Falabracman"], ["com.homegrownapps.reflection", "org.sugarlabs.FractionBounce"]]
const initIcons = initIconsSequences[1];
// -- [] to iterate on all colors
// -- [color1, color2] use -1 for random color
const initColorsSequences = [[], [-1], [22, 47, 65], [256, 100], [256, 256, 256, 47, 256, 256, 256, 47, 256, 256, 256, 47, 256, 256, 256, 47], [65]];
const initColors = initColorsSequences[2];
const initSize = 60;
const minSize = 30;
const maxSize = 90;
const initBlinkTime = 1000;
const initMessageContent = "Merry\nChristmas!";
const initMessageColor = "#000000";
const initMessageSize = 80;
const viewGrid = 1;
const viewDetail = 2;
const displayDebug = false;

// Vue main app
var app = new Vue({
	el: '#app',
	data: {
		currentView: viewGrid,
		activitiesIcons: [],
		gridContent: [],
		pattern: initIcons,
		colors: initColors,
		detailContent: {
			dropIcons: [],
			dragIcons: [],
			dropColors: [],
			dragColors: []
		},
		draggedItem: null,
		size: initSize,
		blinkTime: initBlinkTime,
		message: initMessageContent,
		messageStyle: {
			color: initMessageColor,
			fontWeight: 'normal',
			fontStyle: 'normal',
			size: initMessageSize
		},
		interval: null,
		paused: false,
		SugarL10n: null,
		l10n: {
			stringUnfullscreen: "",
			stringFullscreen: "",
			stringSettings: "",
			stringSpeed: "",
			stringZoom: "",
			stringText: "",
			stringPlay: "",
			stringPause: "",
			stringDragIcons: "",
			stringDragColors: ""
		}
	},

	mounted() {
		this.SugarL10n = this.$refs.SugarL10n;
	},

	created() {
		let vm = this;

		// Load activities list
		_loadActivities().then(function(activities) {
			// Load an convert to pure SVG each icon
			activities.push({directory:"activities/XmasLights.activity",icon:"icons/color.svg",id:"color"});
			let len = activities.length;
			for (let i = 0 ; i < len ; i++) {
				let activity = activities[i];
				_loadIcon("../../"+activity.directory+"/"+activity.icon).then(function(svg) {
					vm.activitiesIcons[activity.id] = svg;
					if (Object.keys(vm.activitiesIcons).length == len) {
						vm.generateGrid();
						vm.blink();
					}
				});
			}
		});

		// Resize dynamically grid
		let message = document.getElementById("message");
		var computeHeight = function() {
			let available = (document.getElementById("body").offsetHeight-(vm.$refs.SugarToolbar&&vm.$refs.SugarToolbar.isHidden()?0:55));
			let grid = document.getElementById("grid");
			let detail = document.getElementById("detail");
			if (detail) { detail.style.height = available+"px"; }
			if (!grid) { return }
			grid.style.height = available+"px";
			if (vm.message.length) {
				message.innerText = vm.message;
				message.style.color = vm.messageStyle.color;
				message.style.fontWeight = vm.messageStyle.fontWeight;
				message.style.fontStyle = vm.messageStyle.fontStyle;
				message.style.fontSize = vm.messageStyle.size+"pt";
				message.style.visibility = "visible";
			}
			if (Object.keys(vm.activitiesIcons).length > 0) {
				if (vm.interval) {
					clearInterval(vm.interval);
					vm.interval = null;
				}
				vm.generateGrid();
				vm.blink();
			}
		}
		computeHeight();
		window.addEventListener("resize", computeHeight);
	},

	methods: {
		// Localize strings
		localized: function() {
			let vm = this;
			vm.SugarL10n.localize(vm.l10n);
		},

		// Generate a grid using icons and colors sequence
		generateGrid: function() {
			let vm = this;
			vm.gridContent = [];
			let height = document.getElementById("body").offsetHeight-(vm.$refs.SugarToolbar.isHidden()?0:55);
			let width = document.getElementById("body").offsetWidth;
			let total = Math.floor((1.0*height)/vm.size)*Math.floor((1.0*width)/vm.size);
			let count = total/Object.keys(vm.activitiesIcons).length;
			for (var i = 0 ; i < count ; i++) {
				Object.keys(vm.activitiesIcons).forEach(function(id) {
					let index = vm.gridContent.length;
					let current = (vm.pattern.length==0?id:vm.pattern[index%vm.pattern.length]);
					let svg = vm.activitiesIcons[current];
					let color = (vm.colors.length==0?index%180:vm.colors[index%vm.colors.length]);
					if (color == -1) { color = Math.floor(Math.random()*180) }
					let size = vm.size;
					vm.gridContent.push({
						name: id,
						svg: svg,
						color: color,
						size: size,
						step: (vm.colors.length==0?0:index%vm.colors.length)
					});
				});
			}
		},

		// Blink icons
		blink: function() {
			let vm = this;
			vm.interval = setInterval(function() {
				if (vm.paused) {
					return;
				}
				for (let i = 0 ; i < vm.gridContent.length ; i++) {
					let newColor;
					if (vm.colors.length == 0) {
						newColor = (vm.gridContent[i].color+1)%180;
					} else {
						vm.gridContent[i].step = (vm.gridContent[i].step + 1)%vm.colors.length;
						newColor = vm.colors[vm.gridContent[i].step];
					}
					if (newColor == -1) { newColor = Math.floor(Math.random()*180) }
					vm.gridContent[i].color = newColor;
				}
			}, vm.blinkTime);
		},

		// Click on play/pause button
		onPlayPause: function() {
			let vm = this;
			vm.paused = !vm.paused;
			document.getElementById("playpause-button").style.backgroundImage = (vm.paused ? "url(icons/play.svg)" : "url(icons/pause.svg)");
			document.getElementById("playpause-button").title = (vm.paused ? vm.l10n.stringPlay : vm.l10n.stringPause);
		},

		// Click on settings button
		onSettingsClicked: function() {
			let vm = this;
			vm.currentView = (vm.currentView == viewGrid ? viewDetail : viewGrid);
			if (vm.currentView == viewDetail) {
				// Initialize drop zone with current patterns
				vm.detailContent.dropIcons = [];
				for (let i = 0 ; i < vm.pattern.length ; i++) {
					vm.detailContent.dropIcons.push({
						id: "pi"+_getCount(),
						name: vm.pattern[i],
						svg: vm.activitiesIcons[vm.pattern[i]],
						color: 512,
						size: 40
					});
				}
				vm.detailContent.dropColors = [];
				for (let i = 0 ; i < vm.colors.length ; i++) {
					vm.detailContent.dropColors.push({
						id: "pc"+_getCount(),
						name: i,
						svg: vm.activitiesIcons["color"],
						color: vm.colors[i],
						size: 40
					})
				}
				// Initialize drag zone with all activities/colors
				vm.detailContent.dragIcons = [];
				let keys = Object.keys(vm.activitiesIcons);
				for (let i = 0 ; i < keys.length ; i++) {
					vm.detailContent.dragIcons.push({
						id: "gi"+_getCount(),
						name: keys[i],
						svg: vm.activitiesIcons[keys[i]],
						color: 512,
						size: 40
					});
				}
				vm.detailContent.dragColors = [];
				for (let i = 0 ; i < 180 ; i++) {
					vm.detailContent.dragColors.push({
						id: "gc"+_getCount(),
						name: i,
						svg: vm.activitiesIcons["color"],
						color: i,
						size: 40
					})
				}
			} else {
				// Update patterns
				vm.pattern = [];
				for (let i = 0 ; i < vm.detailContent.dropIcons.length ; i++) {
					vm.pattern.push(vm.detailContent.dropIcons[i].name);
				}
				vm.colors = [];
				for (let i = 0 ; i < vm.detailContent.dropColors.length ; i++) {
					vm.colors.push(vm.detailContent.dropColors[i].color);
				}
				vm.generateGrid();
			}
		},

		// Handle drag&drop
		onMouseDown: function(event) {
			let vm = this;
			let dragged = null;
			if (event.type.indexOf("touch")!=-1) { event = event.changedTouches[0]; }
			let item = document.elementFromPoint(event.clientX, event.clientY);
			while (item && !dragged) {
				// Find id of icon dragged
				if (item.className == "padded-icon") {
					dragged = item.id;
				}
				item = item.parentNode;
			}
			if (!dragged) { return }
			doLog("drag icon "+dragged);
			vm.draggedItem = dragged;
			vm.$refs.detail.className = "grabbing";
		},
		onMouseMove: function(event) {
		},
		onMouseUp: function(event) {
			let vm = this;
			if (!vm.draggedItem) {
				doLog("nothing to drop")
				return;
			}
			if (event.type.indexOf("touch")!=-1) { event = event.changedTouches[0]; }
			let dropped = null;
			let droppedZone = null;
			let item = document.elementFromPoint(event.clientX, event.clientY);
			while (item && !dropped && !droppedZone) {
				// Find id of icon/zone where is dropped
				if (item.className == "padded-icon") {
					dropped = item.id;
				} else if (item.id == "drop-icons-zone") {
					droppedZone = "pi";
				} else if (item.id == "drag-icons-zone") {
					droppedZone = "gi";
				} else if (item.id == "drop-colors-zone") {
					droppedZone = "pc";
				} else if (item.id == "drag-colors-zone") {
					droppedZone = "gc";
				}
				item = item.parentNode;
			}
			if (dropped) {
				if (vm.draggedItem[1] != dropped[1]) {
					doLog("dropped on the wrong icon");
				} else {
					doLog("dropped on icon "+dropped);
					let dragset = (vm.draggedItem[1] == "i" ? vm.detailContent.dragIcons : vm.detailContent.dragColors);
					let dropset = (vm.draggedItem[1] == "i" ? vm.detailContent.dropIcons : vm.detailContent.dropColors);
					if (vm.draggedItem[0]=="p" && dropped[0]=="g") {
						// Remove one item from the pattern
						let index = _findItemById(dropset, vm.draggedItem);
						dropset.splice(index, 1);
					} else if (vm.draggedItem[0]=="g" && dropped[0]=="p") {
						// Add one item after an existing item in the pattern
						let after = _findItemById(dropset, dropped);
						let index = _findItemById(dragset, vm.draggedItem);
						dropset.splice(after, 0, {
							id: "p"+vm.draggedItem[1]+_getCount(),
							name: dragset[index].name,
							svg: dragset[index].svg,
							color: dragset[index].color,
							size: 40
						});
					} else if (vm.draggedItem[0]=="p" && dropped[0]=="p" && vm.dragged != dropped) {
						// Reorder the pattern
						let before = _findItemById(dropset, vm.draggedItem);
						let item = dropset[before];
						dropset.splice(before, 1);
						let after = _findItemById(dropset, dropped);
						dropset.splice(after, 0, item);
					}
				}
			} else if (droppedZone) {
				if (vm.draggedItem[1] != droppedZone[1]) {
					doLog("dropped in the wrong zone");
				} else {
					doLog("dropped in "+droppedZone+" zone");
					let dragset = (vm.draggedItem[1] == "i" ? vm.detailContent.dragIcons : vm.detailContent.dragColors);
					let dropset = (vm.draggedItem[1] == "i" ? vm.detailContent.dropIcons : vm.detailContent.dropColors);
					if (vm.draggedItem[0]=="g" && droppedZone[0] == "p") {
						// Add one item at the end of the pattern
						let index = _findItemById(dragset, vm.draggedItem)
						dropset.push({
							id: "p"+vm.draggedItem[1]+_getCount(),
							name: dragset[index].name,
							svg: dragset[index].svg,
							color: dragset[index].color,
							size: 40
						});
					} else if (vm.draggedItem[0]=="p" && droppedZone[0] == "g") {
						// Remove one item from the pattern
						let index = _findItemById(dropset, vm.draggedItem);
						dropset.splice(index, 1);
					}
				}
			} else {
				doLog("dropped outside");
			}
			vm.draggedItem = null;
			vm.$refs.detail.className = "grab";
		},

		// Handle zoom change
		onZoomChanged: function(event) {
			let vm = this;
			let zoom = event.detail.zoom;
			let oldSize = vm.size;
			let newSize = oldSize;
			if (zoom == 2) {
				newSize = initSize;
			} else if (zoom == 0) {
				newSize = Math.max(minSize, oldSize-10);
			} else if (zoom == 1) {
				newSize = Math.min(maxSize, oldSize+10);
			}
			if (newSize != oldSize) {
				vm.size = newSize;
				vm.generateGrid();
			}
		},

		// Handle text change
		onTextChanged: function(event) {
			let vm = this;
			let message = document.getElementById("message");
			message.innerText = vm.message = event.detail.value;
			message.style.color = vm.messageStyle.color = event.detail.color;
			message.style.fontWeight = vm.messageStyle.fontWeight = event.detail.fontWeight;
			message.style.fontStyle = vm.messageStyle.fontStyle = event.detail.fontStyle;
			vm.messageStyle.size = event.detail.size;
			message.style.fontSize = vm.messageStyle.size+"pt";
		},

		// Handle speed change
		onSpeedChanged: function(event) {
			let vm = this;
			if (vm.interval) {
				clearInterval(vm.interval);
				vm.interval = null;
			}
			vm.blinkTime = 500+(event.detail.speed*10);
			vm.blink();
		},

		//  Handle fullscreen/unfullscreen
		fullscreen: function () {
			this.$refs.SugarToolbar.hide();
			this.generateGrid();
		},

		unfullscreen: function () {
			this.$refs.SugarToolbar.show();
			this.generateGrid();
		}
	}
});

// Load activities
function _loadActivities() {
	return new Promise(function(resolve, reject) {
		axios.get('../../activities.json').then(function(response) {
			resolve(response.data);
		}).catch(function(error) {
			reject(error);
 		});
	});
}

// Compute an unique count
let idCount = 1;
function _getCount() {
	return idCount++;
}

// Find item by id
function _findItemById(items, id) {
	for (let i = 0 ; i < items.length ; i++) {
		if (items[i].id == id) {
			return i;
		}
	}
	return -1;
}

// Load icon
function _loadIcon(url) {
	return new Promise(function(resolve, reject) {
		axios.get(url).then(function(response) {
			resolve(response.data);
		}).catch(function(error) {
			reject(error);
 		});
	});
}

// Log
function doLog(msg) {
	if (displayDebug) { console.log(msg); }
}
