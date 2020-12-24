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
const initColorsSequences = [[], [-1], [22, 47, 65], [256, 100], [256, 256, 256, 47, 256, 256, 256, 47, 256, 256, 256, 47, 256, 256, 256, 47], [22]];
const initColors = initColorsSequences[4];
const initSize = 60;
const blinkTime = 1000;
const messageContent = "Merry<br/>Christmas!";
const messageColor = "black";
const messageSize = "80pt";

// Vue main app
var app = new Vue({
	el: '#app',
	data: {
		activitiesIcons: [],
		gridContent: [],
		interval: null
	},

	created() {
		let vm = this;

		// Load activities list
		_loadActivities().then(function(activities) {
			// Load an convert to pure SVG each icon
			let len = activities.length;
			for (let i = 0 ; i < len ; i++) {
				let activity = activities[i];
				_loadAndConvertIcon("../../"+activity.directory+"/"+activity.icon).then(function(svg) {
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
			document.getElementById("grid").style.height = (document.getElementById("body").offsetHeight-55)+"px";
			if (messageContent.length) {
				message.innerHTML = messageContent;
				message.style.color = messageColor;
				message.style.fontSize = messageSize;
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
		// Generate a grid using icons and colors sequence
		generateGrid: function() {
			let vm = this;
			vm.gridContent = [];
			let height = document.getElementById("body").offsetHeight-55;
			let width = document.getElementById("body").offsetWidth;
			let total = Math.floor((1.0*height)/initSize)*Math.floor((1.0*width)/initSize);
			let count = total/Object.keys(vm.activitiesIcons).length;
			for (var i = 0 ; i < count ; i++) {
				Object.keys(vm.activitiesIcons).forEach(function(id) {
					let index = vm.gridContent.length;
					let current = (initIcons.length==0?id:initIcons[index%initIcons.length]);
					let svg = vm.activitiesIcons[current];
					let color = (initColors.length==0?index%180:initColors[index%initColors.length]);
					if (color == -1) { color = Math.floor(Math.random()*180) }
					let size = initSize;
					vm.gridContent.push({
						name: id,
						svg: svg,
						color: color,
						size: size,
						step: (initColors.length==0?0:index%initColors.length)
					});
				});
			}
		},

		// Blink icons
		blink: function() {
			let vm = this;
			vm.interval = setInterval(function() {
				for (let i = 0 ; i < vm.gridContent.length ; i++) {
					let newColor;
					if (initColors.length == 0) {
						newColor = (vm.gridContent[i].color+1)%180;
					} else {
						vm.gridContent[i].step = (vm.gridContent[i].step + 1)%initColors.length;
						newColor = initColors[vm.gridContent[i].step];
					}
					if (newColor == -1) { newColor = Math.floor(Math.random()*180) }
					vm.gridContent[i].color = newColor;
				}
			}, blinkTime);
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

// Need to create an unique id for each embedded SVG
let idCount = 1;

// Load icon and convert it to a pure SVG (remove Sugar stuff)
function _loadAndConvertIcon(url) {
	return new Promise(function(resolve, reject) {
		axios.get(url).then(function(response) {
			// Remove ENTITY HEADER
			let read = response.data;
			var buf = read.replace(/<!DOCTYPE[\s\S.]*\]>/g,"");

			// Replace &fill_color; and &stroke_color;
			buf = buf.replace(/&stroke_color;/g,"var(--stroke-color)");
			buf = buf.replace(/&fill_color;/g,"var(--fill-color)");

			// Add symbol and /symbol
			buf = buf.replace(/(<svg[^>]*>)/g,'$1<symbol id="icon'+idCount+'">');
			buf = buf.replace(/(<\/svg>)/g,'</symbol><use xlink:href="#icon'+idCount+'" href="#icon'+idCount+'"/>$1');
			idCount++;

			resolve(buf);
		}).catch(function(error) {
			reject(error);
 		});
	});
}
