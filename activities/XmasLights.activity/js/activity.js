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
const initIcons = initIconsSequences[0];
// -- [] to iterate on all colors
// -- [color1, color2] use -1 for random color
const initColorsSequences = [[], [-1], [22, 47, 65], [256, 100]];
const initColors = initColorsSequences[1];
const blinkTime = 1000;

// Vue main app
var app = new Vue({
	el: '#app',
	data: {
		activitiesIcons: [],
		gridContent: []
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
		var computeHeight = function() {
			document.getElementById("grid").style.height = (document.getElementById("body").offsetHeight-55)+"px";
		}
		computeHeight();
		window.addEventListener("resize", computeHeight);
	},

	methods: {
		// Generate a grid using icons and colors sequence
		generateGrid: function() {
			let vm = this;
			for (let i = 0 ; i < 4 ; i++) {
				Object.keys(vm.activitiesIcons).forEach(function(id) {
					let index = vm.gridContent.length;
					let current = (initIcons.length==0?id:initIcons[index%initIcons.length]);
					let svg = vm.activitiesIcons[current];
					let color = (initColors.length==0?index%180:initColors[index%initColors.length]);
					if (color == -1) { color = Math.floor(Math.random()*180) }
					let size = 60;
					vm.gridContent.push({
						name: id,
						svg: svg,
						color: color,
						size: size
					});
				});
			}
		},

		// Blink icons
		blink: function() {
			let vm = this;
			setInterval(function() {
				for (let i = 0 ; i < vm.gridContent.length ; i++) {
					let color = vm.gridContent[i].color;
					let newColor = (initColors.length == 0 ? (color+1)%180 : initColors[(initColors.indexOf(color)+1)%initColors.length]);
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

// Need to create an unique id for each SVG
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
