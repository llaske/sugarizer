define(["sugar-web/activity/activity", "sugar-web/env", "l10n", "sugar-web/graphics/presencepalette", "sugar-web/datastore", "tutorial"], function (activity, env, l10n, presencepalette, datastore, tutorial) {

	requirejs(['domReady!'], function (doc) {

		activity.setup();

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
		// network & datastore
		function serializeStrokes() {
			var serializedStrokes = [];
			for (var i = 0; i < strokes.length; i++) {
				var stroke = [];
				for (var j = 0; j < strokes[i].length; j++) {
					stroke.push(dots.indexOf(strokes[i][j]));
				}
				serializedStrokes.push(stroke);
			}
			return serializedStrokes;
		}

		function deserializeStrokes(serializedStrokes) {
			if (!serializedStrokes || !Array.isArray(serializedStrokes)) return;
			strokes = [];
			for (var i = 0; i < serializedStrokes.length; i++) {
				var strokeData = serializedStrokes[i];
				var stroke = [];
				for (var j = 0; j < strokeData.length; j++) {
					var dotIndex = strokeData[j];
					if (dotIndex >= 0 && dotIndex < dots.length) {
						stroke.push(dots[dotIndex]);
					}
				}
				if (stroke.length > 0) strokes.push(stroke);
			}
		}

		function broadcastUpdate() {
			if (presence) {
				presence.sendMessage(presence.getSharedInfo().id, {
					user: presence.getUserInfo(),
					content: {
						action: 'update',
						data: { strokes: serializeStrokes() }
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
					deserializeStrokes(msg.content.data.strokes);
					break;
				case 'update':
					deserializeStrokes(msg.content.data.strokes);
					break;
			}
		};

		// Handle user join/leave
		var onNetworkUserChanged = function (msg) {
			if (isHost) {
				presence.sendMessage(presence.getSharedInfo().id, {
					user: presence.getUserInfo(),
					content: {
						action: 'init',
						data: {
							strokes: serializeStrokes()
						}
					}
				});
			}
			console.log("User " + msg.user.name + " " + (msg.move == 1 ? "join" : "leave"));
		};

		// Set language from environment
		var currentenv;
		env.getEnvironment(function (err, environment) {
			currentenv = environment;

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
							deserializeStrokes(parsed.strokes);
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


			var jsonData = JSON.stringify({
				strokes: serializeStrokes()
			});
			activity.getDatastoreObject().setDataAsText(jsonData);
			activity.getDatastoreObject().save(function (error) {
				if (error === null) {
					console.log("write done.");
				} else {
					console.log("write failed.");
				}
			});
		});

		// Dot Grid
		var canvas = document.getElementById('gridCanvas');
		var ctx = canvas.getContext('2d');
		var mouseX = -1000;
		var mouseY = -1000;
		var prevMouseX = -1000;
		var prevMouseY = -1000;
		var spacing = 55;
		var baseRadius = 4;
		var maxRadius = 9;
		var influenceRadius = 92;
		var dotColor = '#a0a0a0';
		var zoom = 1;
		var isDrawMode = true;
		var isDrawing = false;
		var strokes = [];
		var currentStroke = null;
		var dots = [];

		// Fixed internal resolution (like GridPaint)
		var CANVAS_WIDTH = 900;
		var CANVAS_HEIGHT = 748;
		canvas.width = CANVAS_WIDTH;
		canvas.height = CANVAS_HEIGHT;

		function resize() {
			var container = document.getElementById('canvas');
			var isFullscreen = document.getElementById("unfullscreen-button").style.visibility === "visible";
			var availableHeight = document.body.clientHeight - (isFullscreen ? 0 : 55);
			var availableWidth = container.clientWidth;

			// Scale to fit available height
			zoom = availableHeight / CANVAS_HEIGHT;

			// Get actual device pixel ratio for high-DPI screens
			var dpr = window.devicePixelRatio || 1;

			// Update actual physical pixels to be ultra-high-definition
			canvas.width = (CANVAS_WIDTH * zoom) * dpr;
			canvas.height = (CANVAS_HEIGHT * zoom) * dpr;

			// Set CSS size (scales visually while keeping the element size correct)
			canvas.style.width = (CANVAS_WIDTH * zoom) + "px";
			canvas.style.height = (CANVAS_HEIGHT * zoom) + "px";
			ctx.scale(zoom * dpr, zoom * dpr);

			// Center the canvas horizontally
			var leftMargin = (availableWidth - CANVAS_WIDTH * zoom) / 2;
			canvas.style.marginLeft = leftMargin + "px";
			canvas.style.marginTop = "0px";
		}

		function addPointToStroke(mx, my) {
			if (!isDrawMode || !currentStroke) return;

			var minDist = Infinity;
			var nearestDot = null;
			for (var i = 0; i < dots.length; i++) {
				var dx = mx - dots[i].baseX;
				var dy = my - dots[i].baseY;
				var dist = Math.sqrt(dx * dx + dy * dy);
				if (dist < minDist) {
					minDist = dist;
					nearestDot = dots[i];
				}
			}

			// Snap threshold
			if (nearestDot && minDist < 27.5) {
				if (currentStroke.length > 0) {
					var lastPt = currentStroke[currentStroke.length - 1];
					if (lastPt === nearestDot) {
						return;
					}

					var dxGrid = Math.round((nearestDot.baseX - lastPt.baseX) / spacing);
					var dyGrid = Math.round((nearestDot.baseY - lastPt.baseY) / spacing);
					var absDx = Math.abs(dxGrid);
					var absDy = Math.abs(dyGrid);

					// Check if it's a straight or diagonal line
					if (absDx !== 0 && absDy !== 0 && absDx !== absDy) {
						return;
					}

					// Auto-fill any skipped intermediate dots
					var steps = Math.max(absDx, absDy);
					for (var i = 1; i <= steps; i++) {
						var interpX = lastPt.baseX + (dxGrid * spacing) * (i / steps);
						var interpY = lastPt.baseY + (dyGrid * spacing) * (i / steps);

						for (var j = 0; j < dots.length; j++) {
							if (Math.abs(interpX - dots[j].baseX) < 1 && Math.abs(interpY - dots[j].baseY) < 1) {
								var latestDot = currentStroke[currentStroke.length - 1];
								if (latestDot !== dots[j]) {
									currentStroke.push(dots[j]);
								}
								break;
							}
						}
					}
					broadcastUpdate();
					return;
				}

				currentStroke.push(nearestDot);
				broadcastUpdate();
			}
		}

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

		function draw() {
			ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

			var completedDots = new Set();
			for (var i = 0; i < strokes.length; i++) {
				if (isDrawing && strokes[i] === currentStroke) {
					continue;
				}
				for (var j = 0; j < strokes[i].length; j++) {
					completedDots.add(strokes[i][j]);
				}
			}

			if (isDrawing && currentStroke) {
				for (var j = 0; j < currentStroke.length; j++) {
					completedDots.delete(currentStroke[j]);
				}
			}

			// Draw all lines first
			for (var i = 0; i < strokes.length; i++) {
				var stroke = strokes[i];
				if (stroke.length < 2) continue;
				ctx.beginPath();
				ctx.moveTo(stroke[0].baseX, stroke[0].baseY);
				for (var j = 1; j < stroke.length; j++) {
					ctx.lineTo(stroke[j].baseX, stroke[j].baseY);
				}
				ctx.strokeStyle = '#282828';
				ctx.lineWidth = 8;
				ctx.lineCap = 'round';
				ctx.lineJoin = 'round';
				ctx.stroke();
			}

			for (var i = 0; i < dots.length; i++) {
				var dot = dots[i];

				var dx = mouseX - dot.baseX;
				var dy = mouseY - dot.baseY;
				var dist = Math.max(Math.abs(dx), Math.abs(dy));
				var angle = Math.atan2(dy, dx);

				// 8-pointed star without shrinking nearby dots
				var dirInfluence = influenceRadius * (1.3 + 0.5 * Math.cos(angle * 8));
				var isInfluenced = dist < dirInfluence;

				if (completedDots.has(dot) && !(isDrawing && isInfluenced)) {
					dot.targetR = 0;
				} else {
					if (isInfluenced) {
						var t = 1 - (dist / dirInfluence);
						// Increase slightly when little far, more rapidly when close
						t = Math.pow(t, 1.5);
						dot.targetR = dot.baseR + (maxRadius - dot.baseR) * t;
					} else {
						dot.targetR = dot.baseR;
					}
				}

				// Smooth easing
				if (dot.targetR > dot.r) {
					dot.r += (dot.targetR - dot.r) * 0.5; // Grow fast
				} else {
					dot.r += (dot.targetR - dot.r) * 0.02; // Shrink
				}

				if (completedDots.has(dot) && dot.r <= 0.2) {
					continue;
				}

				if (dot.r < 0.1) {
					continue;
				}

				ctx.beginPath();
				ctx.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2);
				ctx.fillStyle = dot.color;
				ctx.fill();
			}
			requestAnimationFrame(draw);
		}

		// Handle click on help-button
		document.getElementById("help-button").addEventListener('click', function (e) {
			tutorial.start();
		});

		// Handle draw button
		document.getElementById("draw-button").addEventListener('click', function () {
			isDrawMode = !isDrawMode;
			if (isDrawMode) {
				this.classList.add("active");
			} else {
				this.classList.remove("active");
			}
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

		// Mouse/Touch handling
		window.addEventListener('resize', resize);

		canvas.addEventListener('mousedown', function (e) {
			isDrawing = true;
			var rect = canvas.getBoundingClientRect();
			mouseX = (e.clientX - rect.left) / zoom;
			mouseY = (e.clientY - rect.top) / zoom;
			prevMouseX = mouseX;
			prevMouseY = mouseY;
			if (isDrawMode) {
				currentStroke = [];
				strokes.push(currentStroke);
				addPointToStroke(mouseX, mouseY);
			}
		});
		canvas.addEventListener('mouseup', function () {
			if (isDrawing) {
				isDrawing = false;
				broadcastUpdate();
			}
			mouseX = -1000;
			mouseY = -1000;
			prevMouseX = -1000;
			prevMouseY = -1000;
		});
		canvas.addEventListener('touchstart', function (e) {
			isDrawing = true;
			if (e.touches.length > 0) {
				var rect = canvas.getBoundingClientRect();
				mouseX = (e.touches[0].clientX - rect.left) / zoom;
				mouseY = (e.touches[0].clientY - rect.top) / zoom;
				prevMouseX = mouseX;
				prevMouseY = mouseY;
			}
			if (isDrawMode) {
				currentStroke = [];
				strokes.push(currentStroke);
				addPointToStroke(mouseX, mouseY);
			}
		});

		canvas.addEventListener('mousemove', function (e) {
			var rect = canvas.getBoundingClientRect();
			var newMouseX = (e.clientX - rect.left) / zoom;
			var newMouseY = (e.clientY - rect.top) / zoom;

			if (isDrawing && isDrawMode) {
				if (prevMouseX !== -1000) {
					var dx = newMouseX - prevMouseX;
					var dy = newMouseY - prevMouseY;
					var dist = Math.sqrt(dx * dx + dy * dy);
					var steps = Math.ceil(dist / 5);
					for (var i = 1; i <= steps; i++) {
						var interpX = prevMouseX + dx * (i / steps);
						var interpY = prevMouseY + dy * (i / steps);
						addPointToStroke(interpX, interpY);
					}
				} else {
					addPointToStroke(newMouseX, newMouseY);
				}
			}

			mouseX = newMouseX;
			mouseY = newMouseY;
			prevMouseX = newMouseX;
			prevMouseY = newMouseY;
		});
		canvas.addEventListener('touchmove', function (e) {
			if (e.touches.length > 0) {
				var rect = canvas.getBoundingClientRect();
				var newMouseX = (e.touches[0].clientX - rect.left) / zoom;
				var newMouseY = (e.touches[0].clientY - rect.top) / zoom;

				if (isDrawing && isDrawMode) {
					if (prevMouseX !== -1000) {
						var dx = newMouseX - prevMouseX;
						var dy = newMouseY - prevMouseY;
						var dist = Math.sqrt(dx * dx + dy * dy);
						var steps = Math.ceil(dist / 5);
						for (var i = 1; i <= steps; i++) {
							var interpX = prevMouseX + dx * (i / steps);
							var interpY = prevMouseY + dy * (i / steps);
							addPointToStroke(interpX, interpY);
						}
					} else {
						addPointToStroke(newMouseX, newMouseY);
					}
				}

				mouseX = newMouseX;
				mouseY = newMouseY;
				prevMouseX = newMouseX;
				prevMouseY = newMouseY;
			}
		});
		canvas.addEventListener('mouseout', function () {
			mouseX = -1000;
			mouseY = -1000;
			prevMouseX = -1000;
			prevMouseY = -1000;
			if (isDrawing) {
				isDrawing = false;
				broadcastUpdate();
			}
		});
		canvas.addEventListener('touchend', function () {
			mouseX = -1000;
			mouseY = -1000;
			prevMouseX = -1000;
			prevMouseY = -1000;
			if (isDrawing) {
				isDrawing = false;
				broadcastUpdate();
			}
		});

		// Handle localized event
		window.addEventListener("localized", function () {
			document.getElementById("activity-button").title = l10n.get("ConnectTheDots");
			document.getElementById("network-button").title = l10n.get("Network");
			document.getElementById("fullscreen-button").title = l10n.get("Fullscreen");
			document.getElementById("unfullscreen-button").title = l10n.get("Unfullscreen");
			document.getElementById("help-button").title = l10n.get("Tutorial");
			document.getElementById("stop-button").title = l10n.get("Stop");
			document.getElementById("draw-button").title = l10n.get("Draw");
		});

		initDots();
		resize();
		// Set default draw mode UI
		document.getElementById("draw-button").classList.add('active');

		// Start render loop
		requestAnimationFrame(draw);
	});
});
