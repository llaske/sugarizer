define(["sugar-web/activity/activity", "sugar-web/env", "l10n", "sugar-web/graphics/presencepalette", "sugar-web/datastore", "tutorial", "activity/palettes/color-palette", "activity/modes/draw-mode", "sugar-web/graphics/menupalette", "activity/modes/number-mode"], function (activity, env, l10n, presencepalette, datastore, tutorial, colorpalette, drawMode, menupalette, numberMode) {

	requirejs(['domReady!'], function (doc) {

		activity.setup();

		var currentMode = drawMode;
		var canvas = document.getElementById('gridCanvas');
		var ctx = canvas ? canvas.getContext('2d') : null;
		var CANVAS_WIDTH = 900;
		var CANVAS_HEIGHT = 748;
		var spacing = 55;
		var baseRadius = 4;
		var maxRadius = 9;
		var influenceRadius = 92;
		var dotColor = '#a0a0a0';
		var zoom = 1;
		var mouseX = -1000;
		var mouseY = -1000;
		var prevMouseX = -1000;
		var prevMouseY = -1000;
		var dots = [];
		var buddyStroke = '#005fe4';
		var buddyFill = '#ff2b34';

		function initDots() {
			dots = [];
			var cols = 15;
			var rows = 13;
			var offsetX = (CANVAS_WIDTH - (cols - 1) * spacing) / 2;
			var offsetY = (CANVAS_HEIGHT - (rows - 1) * spacing) / 2;

			for (var i = 0; i < cols; i++) {
				for (var j = 0; j < rows; j++) {
					var dotX = offsetX + i * spacing;
					var dotY = offsetY + j * spacing;
					dots.push({
						col: i,
						row: j,
						baseX: dotX,
						baseY: dotY,
						x: dotX,
						y: dotY,
						baseR: baseRadius,
						r: baseRadius,
						targetR: baseRadius,
						color: dotColor
					});
				}
			}
		}

		function resize() {
			var container = document.getElementById('canvas');
			if (!container || !canvas) return;
			var isFullscreen = document.getElementById("unfullscreen-button").style.visibility === "visible";
			var availableHeight = window.innerHeight - (isFullscreen ? 0 : 55);
			var availableWidth = window.innerWidth;
			if (availableHeight <= 0 || availableWidth <= 0) return;

			container.style.top = (isFullscreen ? 0 : 55) + "px";
			container.style.width = availableWidth + "px";
			container.style.height = availableHeight + "px";

			zoom = availableHeight / CANVAS_HEIGHT;
			var dpr = window.devicePixelRatio || 1;

			canvas.width = (CANVAS_WIDTH * zoom) * dpr;
			canvas.height = (CANVAS_HEIGHT * zoom) * dpr;

			canvas.style.width = (CANVAS_WIDTH * zoom) + "px";
			canvas.style.height = (CANVAS_HEIGHT * zoom) + "px";
			if (ctx) {
				ctx.setTransform(1, 0, 0, 1, 0, 0);
				ctx.scale(zoom * dpr, zoom * dpr);
			}

			canvas.style.margin = "auto";

			if (currentMode && typeof currentMode.resize === 'function') {
				currentMode.resize();
			}
		}

		if (canvas) {
			window.addEventListener('resize', resize);
			var endTouch = function (e) {
				if (e && e.target === canvas && e.cancelable) e.preventDefault();
				if (currentMode && typeof currentMode.onMouseUp === 'function') currentMode.onMouseUp();
				mouseX = -1000;
				mouseY = -1000;
				prevMouseX = -1000;
				prevMouseY = -1000;
			};

			window.addEventListener('mouseup', function () {
				if (currentMode && typeof currentMode.onMouseUp === 'function') currentMode.onMouseUp();
				mouseX = -1000;
				mouseY = -1000;
				prevMouseX = -1000;
				prevMouseY = -1000;
			});
			window.addEventListener('touchend', endTouch, { passive: false });
			window.addEventListener('touchcancel', endTouch, { passive: false });

			canvas.addEventListener('mousedown', function (e) {
				var rect = canvas.getBoundingClientRect();
				mouseX = (e.clientX - rect.left) / zoom;
				mouseY = (e.clientY - rect.top) / zoom;
				prevMouseX = mouseX;
				prevMouseY = mouseY;
				if (currentMode && typeof currentMode.onMouseDown === 'function') {
					currentMode.onMouseDown(mouseX, mouseY);
				}
			});
			canvas.addEventListener('mouseup', function () {
				if (currentMode && typeof currentMode.onMouseUp === 'function') currentMode.onMouseUp();
				mouseX = -1000;
				mouseY = -1000;
				prevMouseX = -1000;
				prevMouseY = -1000;
			});
			canvas.addEventListener('touchstart', function (e) {
				if (e && e.cancelable) e.preventDefault();
				if (e.touches.length > 0) {
					var rect = canvas.getBoundingClientRect();
					mouseX = (e.touches[0].clientX - rect.left) / zoom;
					mouseY = (e.touches[0].clientY - rect.top) / zoom;
					prevMouseX = mouseX;
					prevMouseY = mouseY;
					if (currentMode && typeof currentMode.onMouseDown === 'function') {
						currentMode.onMouseDown(mouseX, mouseY);
					}
				}
			}, { passive: false });
			canvas.addEventListener('mousemove', function (e) {
				var rect = canvas.getBoundingClientRect();
				var newMouseX = (e.clientX - rect.left) / zoom;
				var newMouseY = (e.clientY - rect.top) / zoom;
				if (currentMode && typeof currentMode.onMouseMove === 'function') {
					currentMode.onMouseMove(newMouseX, newMouseY, prevMouseX, prevMouseY);
				}
				mouseX = newMouseX;
				mouseY = newMouseY;
				prevMouseX = newMouseX;
				prevMouseY = newMouseY;
			});
			canvas.addEventListener('touchmove', function (e) {
				if (e && e.cancelable) e.preventDefault();
				if (e.touches.length > 0) {
					var rect = canvas.getBoundingClientRect();
					var newMouseX = (e.touches[0].clientX - rect.left) / zoom;
					var newMouseY = (e.touches[0].clientY - rect.top) / zoom;
					if (currentMode && typeof currentMode.onMouseMove === 'function') {
						currentMode.onMouseMove(newMouseX, newMouseY, prevMouseX, prevMouseY);
					}
					mouseX = newMouseX;
					mouseY = newMouseY;
					prevMouseX = newMouseX;
					prevMouseY = newMouseY;
				}
			}, { passive: false });
			canvas.addEventListener('mouseout', function () {
				if (currentMode && typeof currentMode.onMouseUp === 'function') currentMode.onMouseUp();
				mouseX = -1000;
				mouseY = -1000;
				prevMouseX = -1000;
				prevMouseY = -1000;
			});
		}

		function renderLoop() {
			if (!ctx) return;
			ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

			if (currentMode && typeof currentMode.drawBehindDots === 'function') {
				currentMode.drawBehindDots(ctx);
			}

			for (var i = 0; i < dots.length; i++) {
				var dot = dots[i];

				var dx = mouseX - dot.baseX;
				var dy = mouseY - dot.baseY;
				var dist = Math.max(Math.abs(dx), Math.abs(dy));
				var angle = Math.atan2(dy, dx);

				var dirInfluence = influenceRadius * (1.3 + 0.5 * Math.cos(angle * 8));
				var isInfluenced = dist < dirInfluence;

				var isCompleted = currentMode && typeof currentMode.isDotCompleted === 'function' && currentMode.isDotCompleted(dot);
				var isDrawingActive = currentMode && typeof currentMode.isDrawingActive === 'function' && currentMode.isDrawingActive();

				if (isCompleted && !(isDrawingActive && isInfluenced)) {
					dot.targetR = 0;
				} else {
					if (isInfluenced) {
						var t = 1 - (dist / dirInfluence);
						t = Math.pow(t, 1.5);
						dot.targetR = dot.baseR + (maxRadius - dot.baseR) * t;
					} else {
						dot.targetR = dot.baseR;
					}
				}

				if (dot.targetR > dot.r) {
					dot.r += (dot.targetR - dot.r) * 0.5;
				} else {
					dot.r += (dot.targetR - dot.r) * 0.02;
				}

				if (isCompleted && dot.r <= 0.2) {
					continue;
				}

				if (dot.r < 0.1) {
					continue;
				}

				var dotRenderColor = dot.color;
				if (currentMode && typeof currentMode.getDotColor === 'function') {
					var modeColor = currentMode.getDotColor(dot);
					if (modeColor) dotRenderColor = modeColor;
				}

				ctx.beginPath();
				ctx.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2);
				ctx.fillStyle = dotRenderColor;
				ctx.fill();
			}

			if (currentMode && typeof currentMode.drawFrontDots === 'function') {
				currentMode.drawFrontDots(ctx);
			}

			requestAnimationFrame(renderLoop);
		}

		// Link presence palette to network button
		var presence = null;
		var isHost = false;
		var palette = new presencepalette.PresencePalette(document.getElementById("network-button"), undefined);

		// Handle sharing
		palette.addEventListener('shared', function () {
			palette.popDown();
			console.log("Want to share");
			activity.getPresenceObject(function (error, network) {
				if (error) {
					console.log("Sharing error");
					return;
				}
				presence = network;
				network.createSharedActivity('org.sugarlabs.ConnectTheDots', function (groupId) {
					console.log("Activity shared");
					isHost = true;
				});
				network.onDataReceived(onNetworkDataReceived);
				network.onSharedActivityUserChanged(onNetworkUserChanged);
			});
		});

		function broadcastUpdate() {
			if (presence && currentMode && typeof currentMode.serialize === 'function') {
				presence.sendMessage(presence.getSharedInfo().id, {
					user: presence.getUserInfo(),
					content: {
						action: 'update',
						data: currentMode.serialize()
					}
				});
			}
		}

		// Handle incoming data from network
		var onNetworkDataReceived = function (msg) {
			if (presence.getUserInfo().networkId === msg.user.networkId) {
				return;
			}
			switch (msg.content.action) {
				case 'init':
					if (currentMode && typeof currentMode.deserialize === 'function') {
						currentMode.deserialize(msg.content.data.strokes, msg.content.data.figures);
					}
					break;
				case 'update':
					if (currentMode && typeof currentMode.deserialize === 'function') {
						currentMode.deserialize(msg.content.data.strokes, msg.content.data.figures, true);
					}
					break;
				case 'clear':
					if (currentMode && typeof currentMode.clear === 'function') {
						currentMode.clear();
					}
					break;
			}
		};

		// Handle user join/leave
		var onNetworkUserChanged = function (msg) {
			if (isHost && currentMode && typeof currentMode.serialize === 'function') {
				presence.sendMessage(presence.getSharedInfo().id, {
					user: presence.getUserInfo(),
					content: {
						action: 'init',
						data: currentMode.serialize()
					}
				});
			}
			console.log("User " + msg.user.name + " " + (msg.move == 1 ? "join" : "leave"));
		};

		// Set language from environment
		var currentenv;
		env.getEnvironment(function (err, environment) {
			currentenv = environment;
			if (environment && environment.user && environment.user.colorvalue) {
				buddyStroke = environment.user.colorvalue.stroke || buddyStroke;
				buddyFill = environment.user.colorvalue.fill || buddyFill;
				if (numberMode && typeof numberMode.setBuddyColors === 'function') {
					numberMode.setBuddyColors(buddyStroke, buddyFill);
				}
			}

			// Set current language
			var defaultLanguage = (typeof chrome != 'undefined' && chrome.app && chrome.app.runtime) ? chrome.i18n.getUILanguage() : navigator.language;
			var language = environment.user ? environment.user.language : defaultLanguage;
			l10n.init(language);

			// Load from datastore
			if (!environment.objectId) {
				console.log("New instance");
			} else {
				activity.getDatastoreObject().loadAsText(function (error, metadata, data) {
					if (error == null && data != null) {
						console.log("Loaded instance");
						try {
							var parsed = JSON.parse(data);
							if (currentMode && typeof currentMode.deserialize === 'function') {
								currentMode.deserialize(parsed.strokes, parsed.figures);
							}
						} catch (e) {
							console.log("Error loading instance", e);
						}
					}
				});
			}

			// Handle shared instances (joining)
			if (environment.sharedId) {
				console.log("Shared instance");
				activity.getPresenceObject(function (error, network) {
					presence = network;
					network.onDataReceived(onNetworkDataReceived);
					network.onSharedActivityUserChanged(onNetworkUserChanged);
				});
			}
		});

		// Save in Journal on Stop
		document.getElementById("stop-button").addEventListener('click', function (event) {
			console.log("writing...");

			var jsonData = (currentMode && typeof currentMode.serialize === 'function') ? JSON.stringify(currentMode.serialize()) : "{}";
			activity.getDatastoreObject().setDataAsText(jsonData);
			activity.getDatastoreObject().save(function (error) {
				if (error === null) {
					console.log("write done.");
				} else {
					console.log("write failed.");
				}
			});
		});

		// Mode palette
		var menuData = [
			{
				icon: true,
				id: "mode-draw",
				label: l10n.get("DrawMode") || "Draw Mode"
			},
			{
				icon: true,
				id: "mode-number",
				label: l10n.get("NumberMode") || "Number Mode"
			}
		];
		var modeButton = document.getElementById('mode-button');
		var modePalette = new menupalette.MenuPalette(modeButton, undefined, menuData);
		var modeInvoker = modePalette.getPalette().querySelector('.palette-invoker');

		var libraryMenuData = [
			{ id: "lib-basic-shapes", label: l10n.get("BasicShapes") || "Basic Shapes" },
			{ id: "lib-objects", label: l10n.get("Objects") || "Objects" }
		];
		var libraryButton = document.getElementById('library-button');
		var libraryPalette = new menupalette.MenuPalette(libraryButton, undefined, libraryMenuData);

		function switchMode(newMode, iconName) {
			if (currentMode === newMode) return;
			if (currentMode && typeof currentMode.stopDrawing === 'function') {
				currentMode.stopDrawing();
			}
			currentMode = newMode;

			modeButton.style.backgroundImage = "url('icons/" + iconName + ".svg')";
			if (modeInvoker) {
				modeInvoker.style.backgroundImage = "url('icons/" + iconName + ".svg')";
			}

			if (newMode === numberMode) {
				document.getElementById('colors-button-fill').style.display = 'none';
				if (colorPaletteFill) colorPaletteFill.popDown();
				document.getElementById('draw-button').style.display = 'none';
				document.getElementById('erase-button').style.display = 'none';
				document.getElementById('clear-button').style.display = 'none';
				document.getElementById('library-button').style.display = '';
				var vBtn = document.getElementById('view-button');
				if (vBtn) vBtn.style.display = '';
				var cBtn = document.getElementById('create-category-button');
				if (cBtn) cBtn.style.display = (numberMode.getView && numberMode.getView() === 'setting') ? '' : 'none';
				numberMode.showGallery('basic-shapes', l10n);
			} else {
				document.getElementById('colors-button-fill').style.display = '';
				document.getElementById('draw-button').style.display = '';
				document.getElementById('erase-button').style.display = '';
				document.getElementById('clear-button').style.display = '';
				document.getElementById('library-button').style.display = 'none';
				var vBtn = document.getElementById('view-button');
				if (vBtn) vBtn.style.display = 'none';
				var cBtn = document.getElementById('create-category-button');
				if (cBtn) cBtn.style.display = 'none';
				if (libraryPalette) libraryPalette.popDown();
				var gallery = document.getElementById('library-gallery');
				if (gallery) gallery.style.display = 'none';
				if (newMode && typeof newMode.setTool === 'function') {
					newMode.setTool('draw');
				}
				document.getElementById('draw-button').classList.add('active');
				document.getElementById('erase-button').classList.remove('active');
			}

			broadcastUpdate();
		}

		modePalette.addEventListener('selectItem', function (e) {
			var targetButton = e.detail.target;
			while (targetButton && targetButton.tagName !== 'BUTTON' && targetButton.parentElement) {
				targetButton = targetButton.parentElement;
			}
			var selectedId = targetButton ? targetButton.id : '';
			if (selectedId === 'mode-number') {
				switchMode(numberMode, 'mode-number');
			} else if (selectedId === 'mode-draw') {
				switchMode(drawMode, 'mode-draw');
			}
		});

		libraryPalette.addEventListener('selectItem', function (e) {
			var targetButton = e.detail.target;
			while (targetButton && targetButton.tagName !== 'BUTTON' && targetButton.parentElement) {
				targetButton = targetButton.parentElement;
			}
			var selectedId = targetButton ? targetButton.id : '';
			if (selectedId === 'lib-basic-shapes') {
				numberMode.showGallery('basic-shapes', l10n);
			} else if (selectedId === 'lib-objects') {
				numberMode.showGallery('objects', l10n);
			}
		});

		libraryButton.addEventListener('click', function () {
			var gallery = document.getElementById('library-gallery');
			if (gallery && gallery.style.display === 'none' && currentMode === numberMode) {
				numberMode.showGallery('basic-shapes', l10n);
			}
		});

		var viewButton = document.getElementById('view-button');
		var createCategoryButton = document.getElementById('create-category-button');
		if (viewButton) {
			viewButton.addEventListener('click', function () {
				if (currentMode === numberMode && typeof numberMode.toggleView === 'function') {
					numberMode.toggleView();
				}
			});
		}
		if (createCategoryButton) {
			createCategoryButton.addEventListener('click', function (e) {
				e.stopPropagation();
			});
		}

		// Color palette (Fill Color)
		var currentFillColor = '#ed2529';
		var colorsButtonFill = document.getElementById('colors-button-fill');
		var colorPaletteFill = new colorpalette.ColorPalette(colorsButtonFill, undefined, "fill");
		var colorInvokerFill = colorPaletteFill.getPalette().querySelector('.palette-invoker');
		colorPaletteFill.addEventListener('colorChange', function (e) {
			currentFillColor = e.detail.color;
			colorsButtonFill.style.backgroundColor = e.detail.color;
			if (colorInvokerFill) {
				colorInvokerFill.style.backgroundColor = e.detail.color;
			}
			if (currentMode && typeof currentMode.setFillColor === 'function') {
				currentMode.setFillColor(e.detail.color);
			}
		});
		colorPaletteFill.setColor(0);

		// Handle click on help-button
		document.getElementById("help-button").addEventListener('click', function (e) {
			tutorial.start();
		});

		// Handle draw button
		document.getElementById("draw-button").addEventListener('click', function () {
			if (currentMode && typeof currentMode.setTool === 'function') {
				currentMode.setTool('draw');
			}
			this.classList.add("active");
			document.getElementById("erase-button").classList.remove("active");
		});

		// Handle erase button
		document.getElementById("erase-button").addEventListener('click', function () {
			if (currentMode && typeof currentMode.setTool === 'function') {
				currentMode.setTool('erase');
			}
			this.classList.add("active");
			document.getElementById("draw-button").classList.remove("active");
		});

		// Handle clear button
		document.getElementById("clear-button").addEventListener('click', function () {
			if (currentMode && typeof currentMode.clear === 'function') {
				currentMode.clear();
			}
			if (presence) {
				presence.sendMessage(presence.getSharedInfo().id, {
					user: presence.getUserInfo(),
					content: {
						action: 'clear'
					}
				});
			}
			broadcastUpdate();
		});

		// Fullscreen
		document.getElementById("fullscreen-button").addEventListener('click', function () {
			document.getElementById("main-toolbar").style.display = "none";
			document.getElementById("canvas").style.top = "0px";
			document.getElementById("canvas").style.height = "100vh";
			document.getElementById("unfullscreen-button").style.visibility = "visible";
			resize();
		});
		document.getElementById("unfullscreen-button").addEventListener('click', function () {
			document.getElementById("main-toolbar").style.display = "";
			document.getElementById("canvas").style.top = "55px";
			document.getElementById("canvas").style.height = "calc(100vh - 55px)";
			document.getElementById("unfullscreen-button").style.visibility = "hidden";
			resize();
		});

		// Handle localized event
		window.addEventListener("localized", function () {
			document.getElementById("activity-button").title = l10n.get("ConnectTheDots");
			document.getElementById("network-button").title = l10n.get("Network");
			document.getElementById("mode-button").title = l10n.get("Mode") || "Mode";
			document.getElementById("library-button").title = l10n.get("Library") || "Library";
			if (document.getElementById("view-button")) {
				var isSettingMode = (typeof numberMode !== 'undefined' && numberMode.getView && numberMode.getView() === 'setting');
				document.getElementById("view-button").title = isSettingMode ? (l10n.get("Play") || "Play") : (l10n.get("View") || "View");
			}
			if (document.getElementById("create-category-button")) document.getElementById("create-category-button").title = l10n.get("NewCategory") || "New Category";
			var modeDrawElem = document.getElementById("mode-draw");
			if (modeDrawElem) modeDrawElem.innerHTML = '<span></span>' + (l10n.get("DrawMode") || "Draw Mode");
			var modeNumElem = document.getElementById("mode-number");
			if (modeNumElem) modeNumElem.innerHTML = '<span></span>' + (l10n.get("NumberMode") || "Number Mode");
			var libBasicElem = document.getElementById("lib-basic-shapes");
			if (libBasicElem) libBasicElem.innerHTML = l10n.get("BasicShapes") || "Basic Shapes";
			var libObjElem = document.getElementById("lib-objects");
			if (libObjElem) libObjElem.innerHTML = l10n.get("Objects") || "Objects";
			document.getElementById("fullscreen-button").title = l10n.get("Fullscreen");
			document.getElementById("unfullscreen-button").title = l10n.get("Unfullscreen");
			document.getElementById("help-button").title = l10n.get("Tutorial");
			document.getElementById("stop-button").title = l10n.get("Stop");
			document.getElementById("draw-button").title = l10n.get("Draw");
			document.getElementById("erase-button").title = l10n.get("Erase") || "Erase";
			document.getElementById("clear-button").title = l10n.get("Clear");
		});

		// Initialize Shared Grid and Modes
		initDots();
		resize();
		requestAnimationFrame(renderLoop);
		drawMode.init(dots, broadcastUpdate, currentFillColor);
		numberMode.init(dots, broadcastUpdate, currentFillColor);
		if (typeof numberMode.setBuddyColors === 'function') {
			numberMode.setBuddyColors(buddyStroke, buddyFill);
		}
		if (currentMode && typeof currentMode.setTool === 'function') {
			currentMode.setTool('draw');
		}
		modeButton.style.backgroundImage = "url('icons/mode-draw.svg')";
		if (modeInvoker) {
			modeInvoker.style.backgroundImage = "url('icons/mode-draw.svg')";
		}
		document.getElementById("draw-button").classList.add('active');
		document.getElementById("erase-button").classList.remove('active');
	});
});