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

		function deserializeStrokes(serializedStrokes, instantFill) {
			if (!serializedStrokes || !Array.isArray(serializedStrokes)) return;
			var oldStrokes = strokes || [];
			strokes = [];
			for (var i = 0; i < serializedStrokes.length; i++) {
				var strokeData = serializedStrokes[i];
				var pathData = Array.isArray(strokeData) ? strokeData : strokeData.path;
				var fillColor = Array.isArray(strokeData) ? null : strokeData.fillColor;
				var stroke = [];
				for (var j = 0; j < pathData.length; j++) {
					var dotIndex = pathData[j];
					if (dotIndex >= 0 && dotIndex < dots.length) {
						var d = dots[dotIndex];
						stroke.push(d);
						if (instantFill) {
							d.r = 0;
							d.targetR = 0;
						}
					}
				}
				if (stroke.length > 0) {
					stroke.fillColor = fillColor;
					if (instantFill) {
						stroke.fillProgress = 1500;
					} else {
						var oldStroke = null;
						for (var k = 0; k < oldStrokes.length; k++) {
							if (oldStrokes[k].length === stroke.length) {
								var match = true;
								for (var m = 0; m < stroke.length; m++) {
									if (oldStrokes[k][m] !== stroke[m]) {
										match = false;
										break;
									}
								}
								if (match) {
									oldStroke = oldStrokes[k];
									break;
								}
							}
						}
						if (oldStroke && oldStroke.fillProgress !== undefined) {
							stroke.fillProgress = oldStroke.fillProgress;
							stroke.hasSnappedFillProgress = oldStroke.hasSnappedFillProgress;
						}
					}
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
					deserializeStrokes(msg.content.data.strokes, true);
					break;
				case 'update':
					deserializeStrokes(msg.content.data.strokes, false);
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
							deserializeStrokes(parsed.strokes, true);
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
		var isEraseMode = false;
		var isDrawing = false;
		var strokes = [];
		var currentStroke = null;
		var eraseStroke = null;
		var shrinkingFills = [];
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

		function getDistance(x1, y1, x2, y2) {
			return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
		}

		function drawPath(ctx, points) {
			ctx.beginPath();
			ctx.moveTo(points[0].baseX, points[0].baseY);
			for (var j = 1; j < points.length; j++) {
				ctx.lineTo(points[j].baseX, points[j].baseY);
			}
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

		function addPointToStroke(mx, my, isErase) {
			var activeStroke = isErase ? eraseStroke : currentStroke;
			if (!activeStroke) return;

			var minDist = Infinity;
			var nearestDot = null;
			for (var i = 0; i < dots.length; i++) {
				var dist = getDistance(mx, my, dots[i].baseX, dots[i].baseY);
				if (dist < minDist) {
					minDist = dist;
					nearestDot = dots[i];
				}
			}

			// Snap threshold
			if (nearestDot && minDist < 27.5) {
				if (activeStroke.length > 0) {
					var lastPt = activeStroke[activeStroke.length - 1];
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
								var latestDot = activeStroke[activeStroke.length - 1];
								if (latestDot !== dots[j]) {
									if (!isErase) {
										var path = findShortestPath(latestDot, dots[j], strokes);
										activeStroke.push(dots[j]);
										if (path && path.length >= 3) {
											var cycleStroke = path.slice();
											cycleStroke.push(path[0]);
											cycleStroke.fillColor = activeStroke.fillColor;
											strokes.push(cycleStroke);
										}
									} else {
										activeStroke.push(dots[j]);
									}
								}
								break;
							}
						}
					}
					if (!isErase) broadcastUpdate();
					return;
				}

				activeStroke.push(nearestDot);
				if (!isErase) broadcastUpdate();
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

			// Calculate z-order hierarchy for nested shapes
			for (var i = 0; i < strokes.length; i++) {
				var stroke = strokes[i];
				stroke.originalIndex = i;
				stroke.level = 0;
				stroke.isClosed = (stroke.length > 2 && stroke[0] === stroke[stroke.length - 1]);
				
				if ((stroke.isClosed || stroke.fillProgress > 0) && stroke.fillColor) {
					for (var o = 0; o < i; o++) {
						var olderStroke = strokes[o];
						if ((olderStroke.isClosed || olderStroke.fillProgress > 0) && olderStroke.fillColor) {
							var completelyInsideThis = true;
							for (var v = 0; v < stroke.length; v++) {
								var dot = stroke[v];
								var dotIsInside = false;
								var ptX = dot.baseX, ptY = dot.baseY;
								for (var k = 0, l = olderStroke.length - 1; k < olderStroke.length; l = k++) {
									var xi = olderStroke[k].baseX, yi = olderStroke[k].baseY;
									var xj = olderStroke[l].baseX, yj = olderStroke[l].baseY;
									var intersect = ((yi > ptY) != (yj > ptY)) && (ptX < (xj - xi) * (ptY - yi) / (yj - yi) + xi);
									if (intersect) dotIsInside = !dotIsInside;
								}
								if (!dotIsInside && olderStroke.indexOf(dot) === -1) {
									completelyInsideThis = false;
									break;
								}
							}
							if (completelyInsideThis) {
								stroke.level = Math.max(stroke.level, olderStroke.level + 1);
							}
						}
					}
				}
			}

			// Combine and Sort strokes for FILL DRAWING (ascending level, then descending index)
			var fillItems = [];
			for (var i = 0; i < strokes.length; i++) {
				fillItems.push({ type: 'stroke', data: strokes[i], level: strokes[i].level || 0, originalIndex: strokes[i].originalIndex || 0 });
			}
			for (var i = 0; i < shrinkingFills.length; i++) {
				fillItems.push({ type: 'shrinking', data: shrinkingFills[i], level: shrinkingFills[i].level || 0, originalIndex: shrinkingFills[i].originalIndex || 0 });
			}
			fillItems.sort(function(a, b) {
				if (a.level !== b.level) {
					return a.level - b.level;
				}
				return b.originalIndex - a.originalIndex;
			});

			// DRAW FILLS AND UPDATE DOTS
			for (var i = 0; i < fillItems.length; i++) {
				var item = fillItems[i];
				
				if (item.type === 'shrinking') {
					var fill = item.data;
					fill.progress = Math.max(0, fill.progress - 4);
					
					if (fill.progress > 0) {
						ctx.save();
						drawPath(ctx, fill.points);
						ctx.clip(); // Restrict filling to ORIGINAL drawn shape

						ctx.beginPath();
						ctx.arc(fill.closePt.baseX, fill.closePt.baseY, fill.progress, 0, Math.PI * 2);
						ctx.fillStyle = fill.color;
						ctx.fill();

						ctx.restore();
					} else {
						var idx = shrinkingFills.indexOf(fill);
						if (idx !== -1) {
							shrinkingFills.splice(idx, 1);
						}
					}
					continue;
				}

				var stroke = item.data;
				if (stroke.length < 2) continue;

				if ((stroke.isClosed || stroke.fillProgress > 0) && stroke.fillColor) {
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
							var shouldDarken = true;
							if (!stroke.isClosed) {
								var closePt = stroke[stroke.length - 1];
								if (getDistance(ptX, ptY, closePt.baseX, closePt.baseY) > stroke.fillProgress) {
									shouldDarken = false;
								}
							}
							if (shouldDarken) dots[d].insideClosedStroke = stroke;
						}
					}

					if (stroke.isClosed) {
						if (stroke.fillProgress === undefined) stroke.fillProgress = 0;
						if (stroke.fillProgress < 1500) {
							stroke.fillProgress += 4;
						}

						drawPath(ctx, stroke);

						if (stroke.fillProgress >= 1500) {
							ctx.fillStyle = stroke.fillColor;
							ctx.fill();
						} else if (stroke.fillProgress > 0) {
							ctx.save();
							ctx.clip();

							var closePt = stroke[stroke.length - 1];
							ctx.beginPath();
							ctx.arc(closePt.baseX, closePt.baseY, stroke.fillProgress, 0, Math.PI * 2);
							ctx.fillStyle = stroke.fillColor;
							ctx.fill();
							ctx.restore();
						}
					} else {
						// Shrinking
						if (stroke.fillProgress > 0) {
							var closePt = stroke[stroke.length - 1];
							if (!stroke.hasSnappedFillProgress) {
								var maxDist = 0;
								for (var k = 0; k < stroke.length; k++) {
									var d = Math.sqrt(Math.pow(stroke[k].baseX - closePt.baseX, 2) + Math.pow(stroke[k].baseY - closePt.baseY, 2));
									if (d > maxDist) maxDist = d;
								}
								stroke.fillProgress = Math.min(stroke.fillProgress, maxDist);
								stroke.hasSnappedFillProgress = true;
							}

							stroke.fillProgress = Math.max(0, stroke.fillProgress - 4);

							ctx.save();
							ctx.beginPath();
							ctx.moveTo(stroke[0].baseX, stroke[0].baseY);
							for (var j = 1; j < stroke.length; j++) {
								ctx.lineTo(stroke[j].baseX, stroke[j].baseY);
							}
							ctx.clip(); // Restrict filling to inside the drawn shape

							var closePt = stroke[stroke.length - 1];
							ctx.beginPath();
							ctx.arc(closePt.baseX, closePt.baseY, stroke.fillProgress, 0, Math.PI * 2);
							ctx.fillStyle = stroke.fillColor;
							ctx.fill();

							ctx.restore();
						}
					}
				} else if (!stroke.isClosed) {
					stroke.fillProgress = 0;
				}
			}

			// DRAW LINES
			for (var i = 0; i < strokes.length; i++) {
				var stroke = strokes[i];
				if (stroke.length < 2) continue;
				drawPath(ctx, stroke);
				ctx.strokeStyle = '#282828';
				ctx.lineWidth = 8;
				ctx.lineCap = 'round';
				ctx.lineJoin = 'round';
				ctx.stroke();
			}

			// DRAW ERASE STROKE
			if (isEraseMode && isDrawing && eraseStroke && eraseStroke.length > 0) {
				drawPath(ctx, eraseStroke);
				ctx.strokeStyle = '#a0a0a0';
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
						if (boundaryStroke.fillProgress >= getDistance(dot.baseX, dot.baseY, closePt.baseX, closePt.baseY)) {
							dotRenderColor = '#282828';
						}
					}
				}

				if (!isOnBoundary && dot.insideClosedStroke && dot.insideClosedStroke.fillColor) {
					dotRenderColor = darkenColor(dot.insideClosedStroke.fillColor, 0.4);
				}

				if (isEraseMode && isDrawing && eraseStroke && eraseStroke.indexOf(dot) !== -1) {
					dotRenderColor = '#a0a0a0';
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
			if (isDrawMode) return;
			isDrawMode = true;
			isEraseMode = false;
			this.classList.add("active");
			document.getElementById("eraser-button").classList.remove("active");
		});

		// Handle eraser button
		document.getElementById("eraser-button").addEventListener('click', function () {
			if (isEraseMode) return;
			isEraseMode = true;
			isDrawMode = false;
			this.classList.add("active");
			document.getElementById("draw-button").classList.remove("active");
		});

		function distToSegment(px, py, vx, vy, wx, wy) {
			var l2 = (wx - vx) * (wx - vx) + (wy - vy) * (wy - vy);
			if (l2 === 0) return Math.sqrt((px - vx) * (px - vx) + (py - vy) * (py - vy));
			var t = ((px - vx) * (wx - vx) + (py - vy) * (wy - vy)) / l2;
			t = Math.max(0, Math.min(1, t));
			var projX = vx + t * (wx - vx);
			var projY = vy + t * (wy - vy);
			return Math.sqrt((px - projX) * (px - projX) + (py - projY) * (py - projY));
		}

		function eraseAtPoint(mx, my) {
			if (!isEraseMode) return;
			var eraseRadius = 15;
			var changed = false;

			for (var i = strokes.length - 1; i >= 0; i--) {
				var stroke = strokes[i];
				if (stroke.length < 2) continue;

				var hitIndex = -1;
				for (var j = 0; j < stroke.length - 1; j++) {
					var p1 = stroke[j];
					var p2 = stroke[j + 1];
					var dist = distToSegment(mx, my, p1.baseX, p1.baseY, p2.baseX, p2.baseY);
					
					if (dist < eraseRadius && getDistance(mx, my, p1.baseX, p1.baseY) > 15 && getDistance(mx, my, p2.baseX, p2.baseY) > 15) {
						hitIndex = j;
						break;
					}
				}

				if (hitIndex !== -1) {
					var wasClosed = stroke.isClosed;
					var splitStroke1, splitStroke2;
					
					if (wasClosed) {
						var maxDist = 0;
						var closePt = stroke[stroke.length - 1];
						for (var k = 0; k < stroke.length; k++) {
							var d = getDistance(stroke[k].baseX, stroke[k].baseY, closePt.baseX, closePt.baseY);
							if (d > maxDist) maxDist = d;
						}
						
						shrinkingFills.push({
							points: stroke.slice(),
							closePt: closePt,
							progress: Math.min(stroke.fillProgress, maxDist),
							color: stroke.fillColor,
							level: stroke.level || 0,
							originalIndex: stroke.originalIndex || 0
						});

						var newStroke = stroke.slice(hitIndex + 1, -1).concat(stroke.slice(0, hitIndex + 1));
						strokes.splice(i, 1, newStroke);
					} else {
						splitStroke1 = stroke.slice(0, hitIndex + 1);
						splitStroke2 = stroke.slice(hitIndex + 1);
						
						var newStrokes = [];
						if (splitStroke1.length > 1) {
							newStrokes.push(splitStroke1);
						}
						if (splitStroke2.length > 1) {
							newStrokes.push(splitStroke2);
						}
						
						strokes.splice(i, 1, ...newStrokes);
					}
					changed = true;
				}
			}
			return changed;
		}

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

		function handleInputStart(x, y) {
			isDrawing = true;
			prevMouseX = mouseX = x;
			prevMouseY = mouseY = y;
			if (isDrawMode) {
				currentStroke = [];
				currentStroke.fillColor = currentFillColor;
				strokes.push(currentStroke);
				addPointToStroke(x, y, false);
			} else if (isEraseMode) {
				eraseStroke = [];
				addPointToStroke(x, y, true);
			}
		}

		function handleInputMove(x, y) {
			if (isDrawing && (isDrawMode || isEraseMode)) {
				var isErase = isEraseMode;
				if (prevMouseX !== -1000) {
					var dx = x - prevMouseX;
					var dy = y - prevMouseY;
					var dist = getDistance(x, y, prevMouseX, prevMouseY);
					var steps = Math.ceil(dist / 5);
					for (var i = 1; i <= steps; i++) {
						addPointToStroke(prevMouseX + dx * (i / steps), prevMouseY + dy * (i / steps), isErase);
					}
				} else {
					addPointToStroke(x, y, isErase);
				}
			}
			mouseX = prevMouseX = x;
			mouseY = prevMouseY = y;
		}

		function handleInputEnd() {
			if (isDrawing) {
				isDrawing = false;
				if (isEraseMode && eraseStroke) {
					for (var i = 0; i < eraseStroke.length - 1; i++) {
						var d1 = eraseStroke[i], d2 = eraseStroke[i + 1];
						eraseAtPoint((d1.baseX + d2.baseX) / 2, (d1.baseY + d2.baseY) / 2);
					}
					eraseStroke = null;
				}
				broadcastUpdate();
			}
			mouseX = mouseY = prevMouseX = prevMouseY = -1000;
		}

		canvas.addEventListener('mousedown', function (e) {
			var rect = canvas.getBoundingClientRect();
			handleInputStart((e.clientX - rect.left) / zoom, (e.clientY - rect.top) / zoom);
		});
		canvas.addEventListener('mousemove', function (e) {
			var rect = canvas.getBoundingClientRect();
			handleInputMove((e.clientX - rect.left) / zoom, (e.clientY - rect.top) / zoom);
		});
		canvas.addEventListener('mouseup', handleInputEnd);
		canvas.addEventListener('mouseout', handleInputEnd);

		canvas.addEventListener('touchstart', function (e) {
			if (e.touches.length > 0) {
				var rect = canvas.getBoundingClientRect();
				handleInputStart((e.touches[0].clientX - rect.left) / zoom, (e.touches[0].clientY - rect.top) / zoom);
			}
		});

		canvas.addEventListener('touchmove', function (e) {
			if (e.touches.length > 0) {
				var rect = canvas.getBoundingClientRect();
				handleInputMove((e.touches[0].clientX - rect.left) / zoom, (e.touches[0].clientY - rect.top) / zoom);
			}
		});
		canvas.addEventListener('touchend', handleInputEnd);

		// Handle localized event
		window.addEventListener("localized", function () {
			document.getElementById("activity-button").title = l10n.get("ConnectTheDots");
			document.getElementById("network-button").title = l10n.get("Network");
			document.getElementById("fullscreen-button").title = l10n.get("Fullscreen");
			document.getElementById("unfullscreen-button").title = l10n.get("Unfullscreen");
			document.getElementById("help-button").title = l10n.get("Tutorial");
			document.getElementById("stop-button").title = l10n.get("Stop");
			document.getElementById("draw-button").title = l10n.get("Draw");
			document.getElementById("eraser-button").title = l10n.get("Erase");
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
