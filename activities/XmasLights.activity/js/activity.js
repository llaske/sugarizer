// Rebase require directory
requirejs.config({
	baseUrl: "lib",
	paths: {
		activity: "../js"
	}
});

// Initial templates
const templates = [
	{name: "Colors", image:"colors.png", icons: [], colors: [-1], size: 80, blink: 1500,  message: {content: "", color: "#ff0000", size: 60, weight: "bold", style: "normal"}},
	{name: "Blue Moon", image:"bluemoon.png", icons: ["org.sugarlabs.Falabracman", "org.sugarlabs.moon"], colors: [124, 120, 122, 123, 121], size: 60, blink: 1000,  message: {content: "Blue Moon", color: "#00008b", size: 100, weight: "normal", style: "italic"}},
	{name: "Merry Christmas", image:"merrychristmas.png", icons: ["org.olpcfrance.XmasLights"], colors: [83, 82, 256, 23, 22, 256], size: 60, blink: 1000,  message: {content: "Merry\nChristmas", color: "#ff0000", size: 80, weight: "bold", style: "normal"}},
	{name: "Happy New Year", image:"happynewyear.png", icons: ["com.homegrownapps.xoeditor"], colors: [], size: 60, blink: 1000,  message: {content: "Happy\nNew Year!", color: "#000000", size: 80, weight: "normal", style: "normal"}}
];
const initTemplate = 0;
const initIcons = templates[initTemplate].icons;
const initColors = templates[initTemplate].colors;
const initSize = templates[initTemplate].size;
const initBlinkTime = templates[initTemplate].blink;
const initMessageContent = templates[initTemplate].message.content;
const initMessageColor = templates[initTemplate].message.color;
const initMessageSize = templates[initTemplate].message.size;
const initMessageWeight = templates[initTemplate].message.weight;
const initMessageStyle = templates[initTemplate].message.style;
const minSize = 30;
const maxSize = 90;
const viewGrid = 1;
const viewDetail = 2;
const displayDebug = false;

// Vue main app
var app = new Vue({
	el: '#app',
	data: {
		currentView: viewGrid,
		activitiesIcons: [],
		randomIcon: null,
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
		message: "",
		messageStyle: {
			color: initMessageColor,
			fontWeight: initMessageWeight,
			fontStyle: initMessageStyle,
			size: initMessageSize
		},
		interval: null,
		paused: false,
		SugarL10n: null,
		SugarPresence: null,
		l10n: {
			stringUnfullscreen: "",
			stringFullscreen: "",
			stringSettings: "",
			stringSpeed: "",
			stringZoom: "",
			stringTemplates: "",
			stringText: "",
			stringPlay: "",
			stringPause: "",
			stringEmptyIcon: "",
			stringEmptyColor: "",
			stringDragIcons: "",
			stringDragColors: "",
			stringTutoGridWelcomeTitle: "",
			stringTutoGridWelcomeContent: "",
			stringTutoGridBoardTitle: "",
			stringTutoGridBoardContent: "",
			stringTutoGridTemplateButtonTitle: "",
			stringTutoGridTemplateButtonContent: "",
			stringTutoGridPlayButtonTitle: "",
			stringTutoGridPlayButtonContent: "",
			stringTutoGridSettingsButtonTitle: "",
			stringTutoGridSettingsButtonContent: "",
			stringTutoGridSpeedButtonTitle: "",
			stringTutoGridSpeedButtonContent: "",
			stringTutoGridTextButtonTitle: "",
			stringTutoGridTextButtonContent: "",
			stringTutoGridZoomButtonTitle: "",
			stringTutoGridZoomButtonContent: "",
			stringTutoGridNetworkButtonTitle: "",
			stringTutoGridNetworkButtonContent: "",
			stringTutoDetailWelcomeTitle: "",
			stringTutoDetailWelcomeContent: "",
			stringTutoDetailDropIconTitle: "",
			stringTutoDetailDropIconContent: "",
			stringTutoDetailDragIconTitle: "",
			stringTutoDetailDragIconContent: "",
			stringTutoDetailDeleteIconTitle: "",
			stringTutoDetailDeleteIconContent: "",
			stringTutoDetailDropColorTitle: "",
			stringTutoDetailDropColorContent: "",
			stringTutoDetailDragColorTitle: "",
			stringTutoDetailDragColorContent: "",
			stringTutoDetailDeleteColorTitle: "",
			stringTutoDetailDeleteColorContent: "",
			stringTutoDetailGridButtonTitle: "",
			stringTutoDetailGridButtonContent: ""
		}
	},

	mounted() {
		this.SugarL10n = this.$refs.SugarL10n;
		this.SugarPresence = this.$refs.SugarPresence;
	},

	created() {
		let vm = this;

		// Resize dynamically grid
		let message = document.getElementById("message");
		var computeHeight = function() {
			let available = (document.getElementById("body").offsetHeight-(vm.$refs.SugarToolbar&&vm.$refs.SugarToolbar.isHidden()?0:55));
			let grid = document.getElementById("grid");
			let detail = document.getElementById("detail");
			if (detail) { detail.style.height = available+"px"; }
			if (!grid) { return }
			grid.style.height = available+"px";
			if (Object.keys(vm.activitiesIcons).length > 0) {
				vm.generateGrid();
				vm.blink();
			}
		}
		computeHeight();
		window.addEventListener("resize", computeHeight);
	},

	methods: {
		// initialize
		initialize: function() {
			let vm = this;
			return new Promise(function(resolve, reject) {
				let content = [];

				// Load activities list
				_loadActivities().then(function(activities) {
					// Load an convert to pure SVG each icon
					activities.push({directory:"activities/XmasLights.activity",icon:"icons/color.svg",id:"color"});
					activities.push({directory:"icons",icon:"activity-journal.svg",id:"journal"});
					activities.push({directory:"icons",icon:"emblem-favorite.svg",id:"favorite"});
					activities.push({directory:"icons",icon:"network-wireless-connected-100.svg",id:"server"});
					activities.push({directory:"icons",icon:"cloud-settings.svg",id:"cloud"});
					let len = activities.length;
					for (let i = 0 ; i < len ; i++) {
						let activity = activities[i];
						_loadIcon("../../"+activity.directory+"/"+activity.icon).then(function(svg) {
							content[activity.id] = svg;
							if (Object.keys(content).length == len) {
								let keys = [...Object.keys(content)];
								keys.sort();
								keys.forEach(function(id) {
									vm.activitiesIcons[id] = content[id];
									if (Object.keys(vm.activitiesIcons).length == len) {
										resolve();
									}
								});
							}
						});
					}
				});
				_loadIcon("../../activities/XmasLights.activity/icons/random.svg").then(function(svg) {
					vm.randomIcon = svg;
				});
			});
		},

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
			let keys =  Object.keys(vm.activitiesIcons);
			let count = total/keys.length;
			for (var i = 0 ; i < count ; i++) {
				keys.forEach(function(id) {
					let index = vm.gridContent.length;
					let current = (vm.pattern.length==0?id:vm.pattern[index%vm.pattern.length]);
					let svg = vm.activitiesIcons[current == "random" ? keys[Math.floor(Math.random()*keys.length)]:current];
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
			if (vm.interval) {
				clearInterval(vm.interval);
				vm.interval = null;
			}
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
						svg: (vm.pattern[i] == "random" ? vm.randomIcon : vm.activitiesIcons[vm.pattern[i]]),
						color: 512,
						size: 40
					});
				}
				vm.detailContent.dropColors = [];
				for (let i = 0 ; i < vm.colors.length ; i++) {
					vm.detailContent.dropColors.push({
						id: "pc"+_getCount(),
						name: i,
						svg: (vm.colors[i] == -1 ? vm.randomIcon : vm.activitiesIcons["color"]),
						color: vm.colors[i],
						size: 40
					})
				}
				// Initialize drag zone with all activities/colors
				vm.detailContent.dragIcons = [];
				vm.detailContent.dragIcons.push({
					id: "gi"+_getCount(),
					name: "random",
					svg: vm.randomIcon,
					color: 512,
					size: 40
				});
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
				vm.detailContent.dragColors.push({
					id: "gc"+_getCount(),
					name: "random",
					svg: vm.randomIcon,
					color: 512,
					size: 40
				});
				for (let i = 0 ; i < 180 ; i++) {
					vm.detailContent.dragColors.push({
						id: "gc"+_getCount(),
						name: i,
						svg: vm.activitiesIcons["color"],
						color: i,
						size: 40
					});
				}
				vm.detailContent.dragColors.push({id:"gc"+_getCount(), name:256, svg:vm.activitiesIcons["color"], color:256, size:40});
				vm.detailContent.dragColors.push({id:"gc"+_getCount(), name:512, svg:vm.activitiesIcons["color"], color:512, size:40});
			} else {
				// Update patterns
				vm.pattern = [];
				for (let i = 0 ; i < vm.detailContent.dropIcons.length ; i++) {
					vm.pattern.push(vm.detailContent.dropIcons[i].name);
				}
				vm.colors = [];
				for (let i = 0 ; i < vm.detailContent.dropColors.length ; i++) {
					let item = vm.detailContent.dropColors[i];
					vm.colors.push(item.name == "random" ? -1 : item.color);
				}
				vm.generateGrid();
				vm.sendUpdateToNetwork();
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
			if (!event.target.classList.contains('scrollable')) {
				event.preventDefault();
			}
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

		// Delete all patterns
		onDeleteIconClicked: function() {
			this.detailContent.dropIcons = [];
		},
		onDeleteColorClicked: function() {
			this.detailContent.dropColors = [];
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
				vm.sendUpdateToNetwork();
			}
		},

		// Handle text change
		onTextChanged: function(event) {
			let vm = this;
			vm.message = event.detail.value;
			vm.messageStyle.color = event.detail.color;
			vm.messageStyle.fontWeight = event.detail.fontWeight;
			vm.messageStyle.fontStyle = event.detail.fontStyle;
			vm.messageStyle.size = event.detail.size;
			vm.sendUpdateToNetwork();
		},

		// Handle speed change
		onSpeedChanged: function(event) {
			let vm = this;
			vm.blinkTime = 500+(event.detail.speed*10);
			vm.blink();
			vm.sendUpdateToNetwork();
		},

		//  Handle fullscreen/unfullscreen
		fullscreen: function () {
			this.$refs.SugarToolbar.hide();
			this.generateGrid();
		},

		unfullscreen: function () {
			this.$refs.SugarToolbar.show();
			this.generateGrid();
		},

		// Stop the activity
		onStop: function () {
			let vm = this;
			let context = {
				pattern: vm.pattern,
				colors: vm.colors,
				size: vm.size,
				blinkTime: vm.blinkTime,
				message: vm.message,
				messageStyle: vm.messageStyle
			};
			vm.$refs.SugarJournal.saveData(context);
		},

		// Template selected in the popup menu
		onTemplateSelected: function(event) {
			let vm = this;
			let template = event.detail.value;
			vm.pattern = template.icons;
			vm.colors = template.colors;
			vm.size = template.size;
			vm.blinkTime = template.blink;
			vm.message = template.message.content;
			vm.messageStyle.color = template.message.color;
			vm.messageStyle.fontWeight = template.message.weight;
			vm.messageStyle.fontStyle = template.message.style;
			vm.messageStyle.size = template.message.size;
			vm.generateGrid();
			vm.blink();
			vm.sendUpdateToNetwork();
		},

		// Load activity context
		onJournalDataLoaded: function(data, metadata) {
			let vm = this;
			vm.pattern = data.pattern;
			vm.colors = data.colors;
			vm.size = data.size;
			vm.blinkTime = data.blinkTime;
			vm.messageStyle = data.messageStyle;
			vm.initialize().then(function() {
				document.getElementById("spinner").style.visibility = "hidden";
				vm.message = data.message;
				vm.generateGrid();
				vm.blink();
			});
		},

		onJournalNewInstance: function() {
			let vm = this;
			vm.initialize().then(function() {
				document.getElementById("spinner").style.visibility = "hidden";
				vm.message = initMessageContent;
				vm.generateGrid();
				vm.blink();
			});
		},

		onJournalSharedInstance: function() {
			let vm = this;
			vm.initialize().then(function() {
				document.getElementById("spinner").style.visibility = "hidden";
			});
		},

		// Handle network events
		onNetworkDataReceived: function(msg) {
			let vm = this;
			vm.pattern = msg.pattern;
			vm.colors = msg.colors;
			vm.size = msg.size;
			vm.blinkTime = msg.blinkTime;
			vm.messageStyle = msg.messageStyle;
			vm.message = msg.message;
			vm.generateGrid();
			vm.blink();
		},

		onNetworkUserChanged: function(msg) {
			if (this.SugarPresence.isHost) {
				this.sendUpdateToNetwork();
			}
		},

		sendUpdateToNetwork: function() {
			let vm = this;
			if (!vm.SugarPresence.isShared()) {
				return;
			}
			let message = {
				user: vm.SugarPresence.getUserInfo(),
				pattern: vm.pattern,
				colors: vm.colors,
				size: vm.size,
				blinkTime: vm.blinkTime,
				message: vm.message,
				messageStyle: vm.messageStyle
			};
			this.SugarPresence.sendMessage(message);
		},

		// Tutorial
		onHelp: function() {
			let vm = this;
			let steps = [];
			if (vm.currentView == viewGrid) {
				steps = steps.concat([
					{
						element: "",
						orphan: true,
						placement: "bottom",
						title: vm.l10n.stringTutoGridWelcomeTitle,
						content: vm.l10n.stringTutoGridWelcomeContent
					},
					{
						element: "#grid",
						placement: "top",
						title: vm.l10n.stringTutoGridBoardTitle,
						content: vm.l10n.stringTutoGridBoardContent
					},
					{
						element: "#list-button",
						placement: "bottom",
						title: vm.l10n.stringTutoGridTemplateButtonTitle,
						content: vm.l10n.stringTutoGridTemplateButtonContent
					},
					{
						element: "#playpause-button",
						placement: "bottom",
						title: vm.l10n.stringTutoGridPlayButtonTitle,
						content: vm.l10n.stringTutoGridPlayButtonContent
					},
					{
						element: "#settings-button",
						placement: "bottom",
						title: vm.l10n.stringTutoGridSettingsButtonTitle,
						content: vm.l10n.stringTutoGridSettingsButtonContent
					},
					{
						element: "#speed-button",
						placement: "bottom",
						title: vm.l10n.stringTutoGridSpeedButtonTitle,
						content: vm.l10n.stringTutoGridSpeedButtonContent
					},
					{
						element: "#text-button",
						placement: "bottom",
						title: vm.l10n.stringTutoGridTextButtonTitle,
						content: vm.l10n.stringTutoGridTextButtonContent
					},
					{
						element: "#zoom-button",
						placement: "bottom",
						title: vm.l10n.stringTutoGridZoomButtonTitle,
						content: vm.l10n.stringTutoGridZoomButtonContent
					},
					{
						element: "#network-button",
						placement: "bottom",
						title: vm.l10n.stringTutoGridNetworkButtonTitle,
						content: vm.l10n.stringTutoGridNetworkButtonContent
					}
				]);
			} else {
				steps = steps.concat([
					{
						element: "",
						orphan: true,
						placement: "bottom",
						title: vm.l10n.stringTutoDetailWelcomeTitle,
						content: vm.l10n.stringTutoDetailWelcomeContent
					},
					{
						element: "#drop-icons-zone",
						placement: "right",
						title: vm.l10n.stringTutoDetailDropIconTitle,
						content: vm.l10n.stringTutoDetailDropIconContent
					},
					{
						element: "#drag-icons-zone",
						placement: "top",
						title: vm.l10n.stringTutoDetailDragIconTitle,
						content: vm.l10n.stringTutoDetailDragIconContent
					},
					{
						element: "#delete-icons-button",
						placement: "bottom",
						title: vm.l10n.stringTutoDetailDeleteIconTitle,
						content: vm.l10n.stringTutoDetailDeleteIconContent
					},
					{
						element: "#drop-colors-zone",
						placement: "left",
						title: vm.l10n.stringTutoDetailDropColorTitle,
						content: vm.l10n.stringTutoDetailDropColorContent
					},
					{
						element: "#drag-colors-zone",
						placement: "top",
						title: vm.l10n.stringTutoDetailDragColorTitle,
						content: vm.l10n.stringTutoDetailDragColorContent
					},
					{
						element: "#delete-colors-button",
						placement: "left",
						title: vm.l10n.stringTutoDetailDeleteColorTitle,
						content: vm.l10n.stringTutoDetailDeleteColorContent
					},
					{
						element: "#settings-button",
						placement: "bottom",
						title: vm.l10n.stringTutoDetailGridButtonTitle,
						content: vm.l10n.stringTutoDetailGridButtonContent
					}
				]);
			}

			this.$refs.SugarTutorial.show(steps);
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
