define(["sugar-web/activity/activity", "sugar-web/env", "l10n", "sugar-web/graphics/presencepalette", "sugar-web/datastore", "tutorial", "activity/palettes/color-palette"], function (activity, env, l10n, presencepalette, datastore, tutorial, colorpalette) {

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

		function darkenColor(colorStr, percent) {
			var r = 0, g = 0, b = 0;
			if (colorStr.indexOf('rgb') !== -1) {
				var parts = colorStr.split("(")[1].split(")")[0].split(",");
				r = parseInt(parts[0]);
				g = parseInt(parts[1]);
				b = parseInt(parts[2]);
			} else if (colorStr[0] === '#') {
				var num = parseInt(colorStr.slice(1), 16);
				r = (num >> 16) & 255;
				g = (num >> 8) & 255;
				b = num & 255;
			} else {
				return colorStr;
			}
			r = Math.floor(r * (1 - percent));
			g = Math.floor(g * (1 - percent));
			b = Math.floor(b * (1 - percent));
			return "rgb(" + r + "," + g + "," + b + ")";
		}

		// network & datastore
		function serializeStrokes() {
			var serializedStrokes = [];
			for (var i = 0; i < strokes.length; i++) {
				var stroke = [];
				for (var j = 0; j < strokes[i].length; j++) {
					stroke.push(dots.indexOf(strokes[i][j]));
				}
				serializedStrokes.push({ path: stroke, fillColor: strokes[i].fillColor });
			}
			return serializedStrokes;
		}

		function deserializeStrokes(serializedStrokes) {
			if (!serializedStrokes || !Array.isArray(serializedStrokes)) return;
			strokes = [];
			for (var i = 0; i < serializedStrokes.length; i++) {
				var strokeData = serializedStrokes[i];
				var pathData = Array.isArray(strokeData) ? strokeData : strokeData.path;
				var fillColor = Array.isArray(strokeData) ? null : strokeData.fillColor;
				var stroke = [];
				for (var j = 0; j < pathData.length; j++) {
					var dotIndex = pathData[j];
					if (dotIndex >= 0 && dotIndex < dots.length) {
						stroke.push(dots[dotIndex]);
					}
				}
				if (stroke.length > 0) {
					stroke.fillColor = fillColor;
					strokes.push(stroke);
				}
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
		});
		colorPaletteFill.setColor(0);

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

		function findShortestPath(startDot, endDot, allStrokes) {
			if (startDot === endDot) return [startDot];
			var adj = new Map();
			for (var i = 0; i < allStrokes.length; i++) {
				var s = allStrokes[i];
				for (var j = 0; j < s.length - 1; j++) {
					var u = s[j], v = s[j + 1];
					if (!adj.has(u)) adj.set(u, new Set());
					if (!adj.has(v)) adj.set(v, new Set());
					adj.get(u).add(v);
					adj.get(v).add(u);
				}
			}

			var queue = [[startDot]];
			var visited = new Set([startDot]);

			while (queue.length > 0) {
				var path = queue.shift();
				var node = path[path.length - 1];

				var neighbors = adj.get(node);
				if (!neighbors) continue;
				for (var neighbor of neighbors) {
					if (neighbor === endDot) {
						var finalPath = path.slice();
						finalPath.push(neighbor);
						return finalPath;
					}
					if (!visited.has(neighbor)) {
						visited.add(neighbor);
						var newPath = path.slice();
						newPath.push(neighbor);
						queue.push(newPath);
					}
				}
			}
			return null;
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
									var path = findShortestPath(latestDot, dots[j], strokes);
									currentStroke.push(dots[j]);
									if (path && path.length >= 3) {
										var cycleStroke = path.slice();
										cycleStroke.push(path[0]);
										cycleStroke.fillColor = currentStroke.fillColor;
										strokes.push(cycleStroke);
									}
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

			for (var i = 0; i < dots.length; i++) {
				dots[i].insideClosedStroke = null;
			}

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

				var isClosed = (stroke.length > 2 && stroke[0] === stroke[stroke.length - 1]);

				if (isClosed && stroke.fillColor) {
					for (var d = 0; d < dots.length; d++) {
						var ptX = dots[d].baseX;
						var ptY = dots[d].baseY;
						var isInside = false;
						for (var k = 0, l = stroke.length - 1; k < stroke.length; l = k++) {
							var xi = stroke[k].baseX, yi = stroke[k].baseY;
							var xj = stroke[l].baseX, yj = stroke[l].baseY;
							var intersect = ((yi > ptY) != (yj > ptY)) && (ptX < (xj - xi) * (ptY - yi) / (yj - yi) + xi);
							if (intersect) isInside = !isInside;
						}
						if (isInside) {
							dots[d].insideClosedStroke = stroke;
						}
					}
				}

				if (!isClosed) {
					stroke.fillProgress = 0;
				} else if (stroke.fillColor) {
					if (stroke.fillProgress === undefined) stroke.fillProgress = 0;

					if (stroke.fillProgress < 1500) {
						stroke.fillProgress += 5; // 5 pixels per frame for a slower, smoother fill
					}

					if (stroke.fillProgress >= 1500) {
						ctx.fillStyle = stroke.fillColor;
						ctx.fill();
					} else if (stroke.fillProgress > 0) {
						ctx.save();
						ctx.clip(); // Restrict filling to inside the drawn shape

						var closePt = stroke[stroke.length - 1];
						ctx.beginPath();
						ctx.arc(closePt.baseX, closePt.baseY, stroke.fillProgress, 0, Math.PI * 2);
						ctx.fillStyle = stroke.fillColor;
						ctx.fill();

						ctx.restore();

						// Recreate path since arc() wiped it out, needed for stroke() below
						ctx.beginPath();
						ctx.moveTo(stroke[0].baseX, stroke[0].baseY);
						for (var j = 1; j < stroke.length; j++) {
							ctx.lineTo(stroke[j].baseX, stroke[j].baseY);
						}
					}
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

				var dotRenderColor = dot.color;
				var isOnBoundary = false;
				var boundaryStroke = null;

				if (isDrawing && currentStroke && currentStroke.indexOf(dot) !== -1 && currentStroke.fillColor) {
					dotRenderColor = currentStroke.fillColor;
				}

				for (var s = strokes.length - 1; s >= 0; s--) {
					if (strokes[s].indexOf(dot) !== -1) {
						isOnBoundary = true;
						boundaryStroke = strokes[s];
						break;
					}
				}

				if (isOnBoundary && boundaryStroke && boundaryStroke !== currentStroke) {
					var isClosed = (boundaryStroke.length > 2 && boundaryStroke[0] === boundaryStroke[boundaryStroke.length - 1]);
					if (isClosed) {
						var closePt = boundaryStroke[boundaryStroke.length - 1];
						var distToClosePt = Math.sqrt(Math.pow(dot.baseX - closePt.baseX, 2) + Math.pow(dot.baseY - closePt.baseY, 2));
						if (boundaryStroke.fillProgress >= distToClosePt) {
							dotRenderColor = '#282828';
						}
					}
				}

				if (!isOnBoundary && dot.insideClosedStroke && dot.insideClosedStroke.fillColor) {
					dotRenderColor = darkenColor(dot.insideClosedStroke.fillColor, 0.4);
				}

				ctx.beginPath();
				ctx.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2);
				ctx.fillStyle = dotRenderColor;
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

		// Handle clear button
		document.getElementById("clear-button").addEventListener('click', function () {
			strokes = [];
			currentStroke = null;
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
				currentStroke.fillColor = currentFillColor;
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
				currentStroke.fillColor = currentFillColor;
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
			document.getElementById("clear-button").title = l10n.get("Clear");
		});

		initDots();
		resize();
		// Set default draw mode UI
		document.getElementById("draw-button").classList.add('active');

		// Start render loop
		requestAnimationFrame(draw);
	});
});
